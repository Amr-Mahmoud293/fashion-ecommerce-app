import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProduct } from '../../../core/models/product.model';
import { environment } from '../../../../environments/env';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input({ required: true }) product!: IProduct;
  @Output() edit = new EventEmitter<IProduct>();
  @Output() delete = new EventEmitter<string>();

  readonly staticURL = environment.staticURL;

  onEdit(): void {
    this.edit.emit(this.product);
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete "${this.product.name}"?`)) {
      this.delete.emit(this.product._id);
    }
  }
}

