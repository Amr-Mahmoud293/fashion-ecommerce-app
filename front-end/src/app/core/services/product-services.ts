import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/env';
import { IProductQueryParams, IProductRes, IProducts, IProductsRes } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductServices {
  constructor(private _HttpClient: HttpClient) { }
  private apiUrl = environment.apiURL + 'product';

  getAllProducts(params?: IProductQueryParams) {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this._HttpClient.get<IProductsRes>(this.apiUrl, { params: httpParams });
  }

  getProductById(id: string) {
    return this._HttpClient.get<IProductRes>(`${this.apiUrl}/${id}`);
  }

  getProductBySlug(categorySlug: string, productSlug: string) {
    return this._HttpClient.get<IProductRes>(`${this.apiUrl}/${categorySlug}/${productSlug}`);
  }

  getRelatedProducts(id: string) {
    return this._HttpClient.get<IProducts>(`${this.apiUrl}/related/${id}`);
  }
}
