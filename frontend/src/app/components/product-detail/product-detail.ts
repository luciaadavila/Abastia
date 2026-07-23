import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatChipsModule, MatIcon],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  @Input() product: Product | null = null;
  @Input() deleting = false;

  @Output() editRequested = new EventEmitter<void>();
  @Output() deleteRequested = new EventEmitter<void>();
}
