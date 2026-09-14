export type NotificationType = 'order' | 'review' | 'stock_alert';

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface INotificationsRes {
  message: string;
  unreadCount: number;
  results: INotification[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
