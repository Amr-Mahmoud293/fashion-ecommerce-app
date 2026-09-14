import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOrder, OrderStatus } from '../../../core/models/order.model';
import { environment } from '../../../../environments/env';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList implements OnChanges {
  @Input({ required: true }) orders: IOrder[] = [];
  @Input() total = 0;
  @Input() page = 1;
  @Input() limit = 10;
  @Input() totalPages = 1;
  @Input() isLoading = false;

  @Output() viewOrder = new EventEmitter<IOrder>();
  @Output() pageChange = new EventEmitter<number>();

  readonly staticURL = environment.staticURL;
  pages: number[] = [];

  ngOnChanges(): void {
    this.updatePages();
  }

  onView(order: IOrder): void {
    this.viewOrder.emit(order);
  }

  onPageSelect(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.page) {
      this.pageChange.emit(newPage);
    }
  }

  getCustomerName(order: IOrder): string {
    if (typeof order.user === 'object' && order.user !== null) {
      return order.user.name || 'Anonymous';
    }
    return 'Customer';
  }

  getCustomerEmail(order: IOrder): string {
    if (typeof order.user === 'object' && order.user !== null) {
      return order.user.email || '';
    }
    return '';
  }

  getProductCount(order: IOrder): number {
    return order.products ? order.products.length : 0;
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'received':
      case 'paid':
        return 'status-success';
      case 'cancelled':
        return 'status-neutral';
      case 'rejected':
        return 'status-danger';
      default:
        return 'status-neutral';
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
