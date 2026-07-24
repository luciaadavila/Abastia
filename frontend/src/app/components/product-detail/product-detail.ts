import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, MatButtonModule, MatChipsModule, MatDividerModule, MatIconModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  product = input<Product | null>(null);
  deleting = input(false);
  editRequested = output<void>();
  deleteRequested = output<void>();
}
