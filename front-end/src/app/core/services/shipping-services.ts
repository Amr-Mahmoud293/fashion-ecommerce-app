import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { IShippingRes } from '../models/shipping.model';

@Injectable({
  providedIn: 'root',
})
export class ShippingServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'shipping';

  getShippingOptions(): Observable<IShippingRes> {
    return this.http.get<IShippingRes>(this.apiUrl);
  }
}
