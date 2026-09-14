import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationServices } from '../../../core/services/notification-services';
import { INotification, NotificationType } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-page',
  imports: [CommonModule],
  templateUrl: './notification-page.html',
  styleUrl: './notification-page.css',
})
export class NotificationPage implements OnInit {
  private notificationService = inject(NotificationServices);

  notifications = signal<INotification[]>([]);
  isLoading = signal<boolean>(false);
  isActionLoading = signal<boolean>(false);
  activeTab = signal<'all' | 'unread' | 'order' | 'review' | 'stock_alert'>('all');

  page = signal<number>(1);
  limit = signal<number>(10);
  total = signal<number>(0);
  totalPages = signal<number>(1);

  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  unreadCount = this.notificationService.unreadCount;

  filteredNotifications = computed(() => {
    const list = this.notifications();
    const tab = this.activeTab();

    if (tab === 'unread') {
      return list.filter((n) => !n.isRead);
    }
    if (tab === 'order' || tab === 'review' || tab === 'stock_alert') {
      return list.filter((n) => n.type === tab);
    }
    return list;
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);

    this.notificationService
      .getAllNotifications({
        page: this.page(),
        limit: this.limit(),
      })
      .subscribe({
        next: (res) => {
          this.notifications.set(res.results || []);
          this.total.set(res.total || 0);
          this.totalPages.set(res.totalPages || 1);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to retrieve notifications.');
        },
      });
  }

  setTab(tab: 'all' | 'unread' | 'order' | 'review' | 'stock_alert'): void {
    this.activeTab.set(tab);
  }

  toggleRead(item: INotification): void {
    const newStatus = !item.isRead;
    this.notificationService.changeNotificationStatus(item._id, newStatus).subscribe({
      next: (res) => {
        this.notifications.update((list) =>
          list.map((n) => (n._id === item._id ? { ...n, isRead: newStatus } : n))
        );
        this.showFeedback(
          'success',
          `Notification marked as ${newStatus ? 'read' : 'unread'}.`
        );
      },
      error: (err) => {
        this.showFeedback('error', err.error?.message || 'Failed to update notification status.');
      },
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount() === 0) return;

    this.isActionLoading.set(true);
    this.notificationService.readAllNotifications().subscribe({
      next: (res) => {
        this.isActionLoading.set(false);
        this.notifications.update((list) =>
          list.map((n) => ({ ...n, isRead: true }))
        );
        this.showFeedback('success', res.message || 'All notifications marked as read.');
      },
      error: (err) => {
        this.isActionLoading.set(false);
        this.showFeedback('error', err.error?.message || 'Failed to mark all as read.');
      },
    });
  }

  deleteItem(id: string): void {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications.update((list) => list.filter((n) => n._id !== id));
        this.total.update((cnt) => Math.max(0, cnt - 1));
        this.showFeedback('success', 'Notification deleted successfully.');
      },
      error: (err) => {
        this.showFeedback('error', err.error?.message || 'Failed to delete notification.');
      },
    });
  }

  deleteAll(): void {
    if (this.notifications().length === 0) return;

    if (!confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      return;
    }

    this.isActionLoading.set(true);
    this.notificationService.deleteAllNotifications().subscribe({
      next: (res) => {
        this.isActionLoading.set(false);
        this.notifications.set([]);
        this.total.set(0);
        this.totalPages.set(1);
        this.showFeedback('success', res.message || 'All notifications deleted successfully.');
      },
      error: (err) => {
        this.isActionLoading.set(false);
        this.showFeedback('error', err.error?.message || 'Failed to delete all notifications.');
      },
    });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages() && newPage !== this.page()) {
      this.page.set(newPage);
      this.loadNotifications();
    }
  }

  private showFeedback(type: 'success' | 'error', text: string): void {
    this.feedback.set({ type, text });
    setTimeout(() => {
      this.feedback.set(null);
    }, 4000);
  }
}
