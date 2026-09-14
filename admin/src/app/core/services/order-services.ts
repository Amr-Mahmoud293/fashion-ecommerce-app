import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { IOrderRes, IAdminOrdersRes, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'purchase';

  getAllOrders(params?: { page?: number; limit?: number; sort?: string; order?: string }): Observable<IAdminOrdersRes> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<IAdminOrdersRes>(this.apiUrl, { params: httpParams });
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<IOrderRes> {
    return this.http.put<IOrderRes>(`${this.apiUrl}/${orderId}`, { status });
  }
}
