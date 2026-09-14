import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/env';
import { INotification, INotificationsRes } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'notifications';

  unreadCount = signal<number>(0);

  getAllNotifications(params?: { page?: number; limit?: number }): Observable<INotificationsRes> {
    let httpParams = new HttpParams();
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<INotificationsRes>(this.apiUrl, { params: httpParams }).pipe(
      tap((res) => {
        if (res.unreadCount !== undefined) {
          this.unreadCount.set(res.unreadCount);
        }
      })
    );
  }

  fetchUnreadCount(): void {
    this.getAllNotifications({ page: 1, limit: 1 }).subscribe();
  }

  changeNotificationStatus(id: string, isRead: boolean): Observable<{ message: string; data: INotification }> {
    return this.http.put<{ message: string; data: INotification }>(`${this.apiUrl}/${id}/status`, { isRead }).pipe(
      tap(() => {
        this.unreadCount.update((cnt) => (isRead ? Math.max(0, cnt - 1) : cnt + 1));
      })
    );
  }

  readAllNotifications(): Observable<{ message: string; updatedCount: number }> {
    return this.http.put<{ message: string; updatedCount: number }>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
      })
    );
  }

  deleteNotification(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.fetchUnreadCount();
      })
    );
  }

  deleteAllNotifications(): Observable<{ message: string; updatedCount: number }> {
    return this.http.delete<{ message: string; updatedCount: number }>(`${this.apiUrl}/delete-all`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
      })
    );
  }
}
