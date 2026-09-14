import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IOrder, IOrderProduct, OrderStatus } from '../../../core/models/order.model';
import { environment } from '../../../../environments/env';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail implements OnChanges {
  @Input() order: IOrder | null = null;
  @Input() isUpdating = false;

  @Output() statusChange = new EventEmitter<{ orderId: string; status: OrderStatus }>();
  @Output() close = new EventEmitter<void>();

  readonly staticURL = environment.staticURL;
  readonly availableStatuses: OrderStatus[] = [
    'pending',
    'processing',
    'shipped',
    'received',
    'paid',
    'cancelled',
    'rejected',
  ];

  selectedStatus: OrderStatus = 'pending';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] && this.order) {
      this.selectedStatus = this.order.status;
    }
  }

  onUpdateStatus(): void {
    if (!this.order || this.selectedStatus === this.order.status || this.isUpdating) {
      return;
    }
    this.statusChange.emit({
      orderId: this.order._id,
      status: this.selectedStatus,
    });
  }

  onClose(): void {
    this.close.emit();
  }

  getCustomerName(): string {
    if (this.order && typeof this.order.user === 'object' && this.order.user !== null) {
      return this.order.user.name || 'Anonymous Customer';
    }
    return 'Customer';
  }

  getCustomerEmail(): string {
    if (this.order && typeof this.order.user === 'object' && this.order.user !== null) {
      return this.order.user.email || 'No email provided';
    }
    return 'N/A';
  }

  getItemName(item: IOrderProduct): string {
    if (typeof item.product === 'object' && item.product !== null) {
      return item.product.name;
    }
    return 'Product Item';
  }

  getItemImage(item: IOrderProduct): string | null {
    if (typeof item.product === 'object' && item.product !== null && item.product.imageURL) {
      return this.staticURL + item.product.imageURL;
    }
    return null;
  }

  getSubtotal(): number {
    if (!this.order?.products) return 0;
    return this.order.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  getStatusClass(status?: OrderStatus): string {
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
}
