import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { ICreateOrderPayload, IOrderRes, IOrdersRes } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'purchase';

  placeOrder(payload: ICreateOrderPayload): Observable<IOrderRes> {
    return this.http.post<IOrderRes>(`${this.apiUrl}/my-purchases`, payload);
  }

  getMyPurchases(): Observable<IOrdersRes> {
    return this.http.get<IOrdersRes>(`${this.apiUrl}/my-purchases`);
  }

  getPurchaseById(orderId: string): Observable<IOrderRes> {
    return this.http.get<IOrderRes>(`${this.apiUrl}/my-purchases/${orderId}`);
  }

  cancelPurchase(orderId: string): Observable<IOrderRes> {
    return this.http.put<IOrderRes>(`${this.apiUrl}/my-purchases/${orderId}`, {});
  }
}
