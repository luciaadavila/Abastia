import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Almacenamiento, Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  private readonly fb = inject(FormBuilder);

  product = input<Product | null>(null);

  mode = input<'create' | 'edit'>('create');

  saving = input(false);

  save = output<Product>();

  cancel = output<void>();

  readonly lugaresDisponibles = ['nevera', 'congelador', 'despensa'];

  readonly unidadesMedida = ['uds', 'kg', 'g', 'l', 'ml'];

  productForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],

    marca: [''],

    categoria: ['', [Validators.required]],

    imagen: ['', [Validators.pattern(/^https?:\/\/.+/i)]],

    unidadMedida: ['uds', [Validators.required]],

    lugaresAlmacenamiento: this.fb.array([]),

    lugarPorDefecto: ['despensa', [Validators.required]],

    enDespensa: [false],
  });

  constructor() {
    effect(() => {
      this.product();

      this.loadForm();
    });
  }

  get lugaresAlmacenamiento(): FormArray {
    return this.productForm.get('lugaresAlmacenamiento') as FormArray;
  }

  addStorageLocation(location?: Almacenamiento): void {
    this.lugaresAlmacenamiento.push(this.createStorageLocationGroup(location));
  }

  removeStorageLocation(index: number): void {
    if (this.lugaresAlmacenamiento.length <= 1) {
      return;
    }

    this.lugaresAlmacenamiento.removeAt(index);
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue();

    const product: Product = {
      nombre: formValue.nombre!.trim(),

      marca: formValue.marca?.trim() || undefined,

      categoria: formValue.categoria!.trim(),

      imagen: formValue.imagen?.trim() || undefined,

      unidadMedida: formValue.unidadMedida!,

      lugaresAlmacenamiento: formValue.lugaresAlmacenamiento as Almacenamiento[],

      lugarPorDefecto: formValue.lugarPorDefecto!,

      enDespensa: formValue.enDespensa ?? false,
    };

    this.save.emit(product);
  }

  private loadForm(): void {
    const product = this.product();

    this.lugaresAlmacenamiento.clear();

    this.productForm.reset({
      nombre: product?.nombre ?? '',

      marca: product?.marca ?? '',

      categoria: product?.categoria ?? '',

      imagen: product?.imagen ?? '',

      unidadMedida: product?.unidadMedida ?? 'uds',

      lugarPorDefecto: product?.lugarPorDefecto ?? 'despensa',

      enDespensa: product?.enDespensa ?? false,
    });

    const locations = product?.lugaresAlmacenamiento?.length
      ? product.lugaresAlmacenamiento
      : [
          {
            lugar: 'despensa',
            diasCaducidadEstimados: 7,
          },
        ];

    locations.forEach((location) => {
      this.addStorageLocation(location);
    });
  }

  private createStorageLocationGroup(location?: Almacenamiento): FormGroup {
    return this.fb.group({
      lugar: [location?.lugar ?? 'despensa', [Validators.required]],

      diasCaducidadEstimados: [
        location?.diasCaducidadEstimados ?? 7,
        [Validators.required, Validators.min(0)],
      ],
    });
  }
}
