import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { IProductQueryParams, IProductRes, IProductsRes } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'product';

  getAllProducts(params?: IProductQueryParams): Observable<IProductsRes> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<IProductsRes>(this.apiUrl, { params: httpParams });
  }

  getProductById(id: string): Observable<IProductRes> {
    return this.http.get<IProductRes>(`${this.apiUrl}/${id}`);
  }


  createProduct(formData: FormData): Observable<IProductRes> {
    return this.http.post<IProductRes>(this.apiUrl, formData);
  }

  updateProduct(id: string, formData: FormData): Observable<IProductRes> {
    return this.http.put<IProductRes>(`${this.apiUrl}/${id}`, formData);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

