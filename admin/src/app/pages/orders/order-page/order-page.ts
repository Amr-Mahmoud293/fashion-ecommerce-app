import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderServices } from '../../../core/services/order-services';
import { IOrder, OrderStatus } from '../../../core/models/order.model';
import { OrderList } from '../order-list/order-list';
import { OrderDetail } from '../order-detail/order-detail';

@Component({
  selector: 'app-order-page',
  imports: [CommonModule, FormsModule, OrderList, OrderDetail],
  templateUrl: './order-page.html',
  styleUrl: './order-page.css',
})
export class OrderPage implements OnInit {
  private orderService = inject(OrderServices);

  orders = signal<IOrder[]>([]);
  total = signal<number>(0);
  page = signal<number>(1);
  limit = signal<number>(10);
  totalPages = signal<number>(1);

  isLoading = signal<boolean>(false);
  isUpdatingStatus = signal<boolean>(false);

  selectedStatusFilter = signal<string>('');
  searchQuery = signal<string>('');

  selectedOrderForDetail = signal<IOrder | null>(null);
  showDetailModal = signal<boolean>(false);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  readonly statusOptions: OrderStatus[] = [
    'pending',
    'processing',
    'shipped',
    'received',
    'paid',
    'cancelled',
    'rejected',
  ];

  filteredOrders = computed(() => {
    let list = this.orders();
    const statusFilter = this.selectedStatusFilter();
    const query = this.searchQuery().toLowerCase().trim();

    if (statusFilter) {
      list = list.filter((ord) => ord.status === statusFilter);
    }

    if (query) {
      list = list.filter((ord) => {
        const orderNumMatch = ord.orderNumber?.toLowerCase().includes(query);
        let customerMatch = false;
        if (typeof ord.user === 'object' && ord.user !== null) {
          const nameMatch = ord.user.name?.toLowerCase().includes(query);
          const emailMatch = ord.user.email?.toLowerCase().includes(query);
          customerMatch = !!(nameMatch || emailMatch);
        }
        return orderNumMatch || customerMatch;
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(pageNumber = this.page()): void {
    this.isLoading.set(true);

    this.orderService.getAllOrders({
      page: pageNumber,
      limit: this.limit(),
      sort: 'createdAt',
      order: 'desc',
    }).subscribe({
      next: (res) => {
        this.orders.set(res.results || []);
        this.total.set(res.total || 0);
        this.page.set(res.page || 1);
        this.totalPages.set(res.totalPages || 1);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showFeedback('error', err.error?.message || 'Failed to load orders.');
      },
    });
  }

  onPageChange(newPage: number): void {
    this.loadOrders(newPage);
  }

  openDetailModal(order: IOrder): void {
    this.selectedOrderForDetail.set(order);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedOrderForDetail.set(null);
  }

  handleStatusUpdate(event: { orderId: string; status: OrderStatus }): void {
    this.isUpdatingStatus.set(true);

    this.orderService.updateOrderStatus(event.orderId, event.status).subscribe({
      next: (res) => {
        this.isUpdatingStatus.set(false);
        const updatedOrder = res.data;

        // Update selected order for modal view
        if (this.selectedOrderForDetail()?._id === event.orderId) {
          this.selectedOrderForDetail.set(updatedOrder);
        }

        // Update order in main list
        this.orders.update((list) =>
          list.map((item) => (item._id === event.orderId ? updatedOrder : item))
        );

        this.showFeedback('success', `Order #${updatedOrder.orderNumber} status updated to "${event.status}"!`);
      },
      error: (err) => {
        this.isUpdatingStatus.set(false);
        this.showFeedback('error', err.error?.message || 'Failed to update order status.');
      },
    });
  }

  onResetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatusFilter.set('');
  }

  private showFeedback(type: 'success' | 'error', text: string): void {
    this.feedback.set({ type, text });
    setTimeout(() => {
      this.feedback.set(null);
    }, 4500);
  }
}
