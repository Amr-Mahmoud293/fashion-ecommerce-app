import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProduct } from '../../../core/models/product.model';
import { ProductCard } from '../product-card/product-card';
import { environment } from '../../../../environments/env';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnChanges {
  @Input({ required: true }) products: IProduct[] = [];
  @Input() total = 0;
  @Input() page = 1;
  @Input() limit = 10;
  @Input() totalPages = 1;
  @Input() isLoading = false;

  @Output() editProduct = new EventEmitter<IProduct>();
  @Output() deleteProduct = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  viewMode: 'table' | 'grid' = 'table';
  readonly staticURL = environment.staticURL;
  pages: number[] = [];

  ngOnChanges(): void {
    this.updatePages();
  }

  setViewMode(mode: 'table' | 'grid'): void {
    this.viewMode = mode;
  }

  onEdit(product: IProduct): void {
    this.editProduct.emit(product);
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.deleteProduct.emit(id);
    }
  }

  onPageSelect(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.page) {
      this.pageChange.emit(newPage);
    }
  }

  private updatePages(): void {
    const list: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      list.push(i);
    }
    this.pages = list;
  }
}
