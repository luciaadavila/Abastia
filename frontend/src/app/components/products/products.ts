import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  categoryGroups: ProductCategoryGroup[] = [];
  selectedProduct: Product | null = null;

  panelOpen = false;
  panelView: PanelView = 'detail';
  formMode: FormMode = 'create';

  loading = false;
  saving = false;
  deleting = false;

  errorMessage = '';

  get panelTitle(): string {
    if (this.panelView === 'detail') {
      return this.selectedProduct?.nombre ?? 'Detalle del producto';
    }
    return this.formMode === 'create' ? 'Añadir producto' : 'Editar producto';
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  openCreateForm(): void {
    this.selectedProduct = null;
    this.formMode = 'create';
    this.panelView = 'form';
    this.panelOpen = true;
  }

  openProductDetail(product: Product): void {
    this.selectedProduct = product;
    this.formMode = 'create';
    this.panelView = 'detail';
    this.panelOpen = true;

    this.productsService.getProductById(product._id!).subscribe({
      next: (completeProduct: Product) => {
        this.selectedProduct = completeProduct;
      },
      error: () => {
        this.errorMessage = 'No se pudo obtener el detalle del producto';
      },
    });
  }

  openEditForm(): void {
    if (!this.selectedProduct) {
      return;
    }

    this.formMode = 'edit';
    this.panelView = 'form';
  }

  cancelForm(): void {
    if (this.formMode === 'edit' && this.selectedProduct) {
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
    if (!this.selectedProduct) {
      return;
    }

    const confirmed = window.confirm(`¿Quieres eliminar "${this.selectedProduct.nombre}"?`);
    if (!confirmed) {
      return;
    }

    const productId = this.selectedProduct._id;
    this.deleting = true;
    this.productsService
      .deleteProduct(productId!)
      .pipe(
        finalize(() => {
          this.deleting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.products = this.products.filter((product) => productId != product._id);
          this.groupProductsByCategory();

          this.selectedProduct = null;
          this.panelOpen = false;
        },
        error: () => {
          this.errorMessage = 'No se pudo eliminar el producto';
        },
      });
  }

  private loadProducts(): void {
    this.loading = true;

    this.productsService
      .getProducts()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            console.log('Timeout', {
              loading: this.loading,
              products: this.products.length,
              groups: this.categoryGroups.length,
            });
          }, 1000);
        }),
      )
      .subscribe({
        next: (products: Product[]) => {
          this.products = products;
          this.groupProductsByCategory();
        },
        error: () => {
          this.errorMessage = 'No se pudieron cargar los productos';
        },
      });
  }

  private createProduct(productData: Product): void {
    this.saving = true;

    this.productsService
      .createProduct(productData)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe({
        next: (createdProduct: Product) => {
          this.products = [...this.products, createdProduct];
          this.groupProductsByCategory();
          this.selectedProduct = createdProduct;
          this.panelView = 'detail';
        },
        error: () => {
          this.errorMessage = 'No se pudo añadir el producto';
        },
      });
  }

  private updateProduct(productData: Product): void {
    if (!this.selectedProduct) {
      return;
    }

    const productId = this.selectedProduct._id;

    this.saving = true;
    this.errorMessage = '';

    this.productsService
      .updateProduct(productId!, productData)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe({
        next: (updatedProduct: Product) => {
          this.products = this.products.map((product) =>
            product._id === updatedProduct._id ? updatedProduct : product,
          );

          this.groupProductsByCategory();

          this.selectedProduct = updatedProduct;
          this.panelView = 'detail';
        },
        error: () => {
          this.errorMessage = 'No se pudieron guardar los cambios';
        },
      });
  }

  private groupProductsByCategory(): void {
    const categoryMap = new Map<string, Product[]>();

    for (const product of this.products) {
      const category = product.categoria?.trim() || 'Sin categoría';
      const categoryProducts = categoryMap.get(category) ?? [];
      categoryProducts.push(product);
      categoryMap.set(category, categoryProducts);
    }

    this.categoryGroups = Array.from(categoryMap.entries())
      .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
      .map(([categoria, productos]) => ({
        categoria,
        productos: productos.sort((productA, productB) =>
          productA.nombre.localeCompare(productB.nombre),
        ),
      }));
  }
}
