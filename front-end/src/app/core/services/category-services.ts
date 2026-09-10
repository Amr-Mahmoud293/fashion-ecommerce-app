import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/env';
import { ICategoriesRes, ICategoryRes } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryServices {
  constructor(private _HttpClient: HttpClient) { }
  private apiUrl = environment.apiURL + 'category';

  getAllCategories() {
    return this._HttpClient.get<ICategoriesRes>(this.apiUrl);
  }

  getCategoryById(id: string) {
    return this._HttpClient.get<ICategoryRes>(`${this.apiUrl}/${id}`);
  }
}