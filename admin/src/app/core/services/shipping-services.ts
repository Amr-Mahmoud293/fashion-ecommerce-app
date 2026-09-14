import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { IShippingRes, ISingleShippingRes } from '../models/shipping.model';

@Injectable({
  providedIn: 'root',
})
export class ShippingServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'shipping';

  getShippingOptions(): Observable<IShippingRes> {
    return this.http.get<IShippingRes>(this.apiUrl);
  }

  createShippingOption(data: { city: string; cost: number }): Observable<ISingleShippingRes> {
    return this.http.post<ISingleShippingRes>(this.apiUrl, data);
  }

  updateShippingOption(id: string, data: { city: string; cost: number }): Observable<ISingleShippingRes> {
    return this.http.put<ISingleShippingRes>(`${this.apiUrl}/${id}`, data);
  }

  deleteShippingOption(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

