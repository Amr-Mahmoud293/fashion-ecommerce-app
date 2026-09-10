import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/env';
import { ISubcategoryRes, ISubcategoriesRes } from '../models/subcategory.model';

@Injectable({
  providedIn: 'root',
})
export class SubcategoryServices {
  constructor(private _HttpClient: HttpClient) { }
  private apiUrl = environment.apiURL + 'subcategory';

  getAllSubcategories() {
    return this._HttpClient.get<ISubcategoriesRes>(this.apiUrl);
  }

  getSubcategoryById(id: string) {
    return this._HttpClient.get<ISubcategoryRes>(`${this.apiUrl}/${id}`);
  }
}
