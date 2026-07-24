import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../interfaces/product.interface';
import { SidePanel } from '../../shared/components/side-panel/side-panel';
import { ProductDetail } from '../product-detail/product-detail';
import { ProductForm } from '../product-form/product-form';

interface ProductCategoryGroup {
  categoria: string;
  productos: Product[];
}

type PanelView = 'detail' | 'form';
type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    SidePanel,
    ProductDetail,
    ProductForm,
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private readonly productsService = inject(ProductsService);

  products = signal<Product[]>([]);

  categoryGroups = computed<ProductCategoryGroup[]>(() => {
    const categoryMap = new Map<string, Product[]>();

    for (const product of this.products()) {
      const category = product.categoria?.trim() || 'Sin categoría';

      const productsInCategory = categoryMap.get(category) ?? [];
      productsInCategory.push(product);

      categoryMap.set(category, productsInCategory);
    }

    return Array.from(categoryMap.entries())
      .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
      .map(([categoria, productos]) => ({
        categoria,
        productos: productos.sort((productA, productB) =>
          productA.nombre.localeCompare(productB.nombre),
        ),
      }));
  });

  selectedProduct = signal<Product | null>(null);

  panelOpen = false;
  panelView: PanelView = 'detail';
  formMode: FormMode = 'create';

  loading = signal(false);
  saving = signal(false);
  deleting = signal(false);

  errorMessage = '';

  get panelTitle(): string {
    if (this.panelView === 'detail') {
      return this.selectedProduct()?.nombre ?? 'Detalle del producto';
    }

    return this.formMode === 'create' ? 'Añadir producto' : 'Editar producto';
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  openCreateForm(): void {
    this.selectedProduct.set(null);
    this.formMode = 'create';
    this.panelView = 'form';
    this.panelOpen = true;
  }

  openProductDetail(product: Product): void {
    this.selectedProduct.set(product);

    this.formMode = 'create';
    this.panelView = 'detail';
    this.panelOpen = true;

    this.productsService.getProductById(product._id!).subscribe({
      next: (completeProduct) => {
        this.selectedProduct.set(completeProduct);
      },
      error: () => {
        this.errorMessage = 'No se pudo obtener el detalle del producto';
      },
    });
  }

  openEditForm(): void {
    if (!this.selectedProduct()) {
      return;
    }

    this.formMode = 'edit';
    this.panelView = 'form';
  }

  cancelForm(): void {
    if (this.formMode === 'edit' && this.selectedProduct()) {
      this.panelView = 'detail';
      return;
    }

    this.panelOpen = false;
  }

  saveProduct(productData: Product): void {
    if (this.formMode === 'create') {
      this.createProduct(productData);
      return;
    }

    this.updateProduct(productData);
  }

  deleteSelectedProduct(): void {
    const product = this.selectedProduct();

    if (!product) {
      return;
    }

    const confirmed = window.confirm(`¿Quieres eliminar "${product.nombre}"?`);

    if (!confirmed) {
      return;
    }

    const productId = product._id;

    this.deleting.set(true);

    this.productsService
      .deleteProduct(productId!)
      .pipe(
        finalize(() => {
          this.deleting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.products.update((products) =>
            products.filter((product) => product._id !== productId),
          );

          this.selectedProduct.set(null);
          this.panelOpen = false;
        },
        error: () => {
          this.errorMessage = 'No se pudo eliminar el producto';
        },
      });
  }

  private loadProducts(): void {
    this.loading.set(true);

    this.productsService
      .getProducts()
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (products) => {
          this.products.set(products);
        },
        error: () => {
          this.errorMessage = 'No se pudieron cargar los productos';
        },
      });
  }

  private createProduct(productData: Product): void {
    this.saving.set(true);

    this.productsService
      .createProduct(productData)
      .pipe(
        finalize(() => {
          this.saving.set(false);
        }),
      )
      .subscribe({
        next: (createdProduct) => {
          this.products.update((products) => [...products, createdProduct]);

          this.selectedProduct.set(createdProduct);
          this.panelView = 'detail';
        },
        error: () => {
          this.errorMessage = 'No se pudo añadir el producto';
        },
      });
  }

  private updateProduct(productData: Product): void {
    const currentProduct = this.selectedProduct();

    if (!currentProduct) {
      return;
    }

    this.saving.set(true);
    this.errorMessage = '';

    this.productsService
      .updateProduct(currentProduct._id!, productData)
      .pipe(
        finalize(() => {
          this.saving.set(false);
        }),
      )
      .subscribe({
        next: (updatedProduct) => {
          this.products.update((products) =>
            products.map((product) =>
              product._id === updatedProduct._id ? updatedProduct : product,
            ),
          );

          this.selectedProduct.set(updatedProduct);
          this.panelView = 'detail';
        },
        error: () => {
          this.errorMessage = 'No se pudieron guardar los cambios';
        },
      });
  }
}
