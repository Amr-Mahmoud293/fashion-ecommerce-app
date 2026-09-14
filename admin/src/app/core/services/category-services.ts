import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { ICategoriesRes, ICategoryRes } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'category';

  getAllCategories(): Observable<ICategoriesRes> {
    return this.http.get<ICategoriesRes>(this.apiUrl);
  }

  getCategoryById(id: string): Observable<ICategoryRes> {
    return this.http.get<ICategoryRes>(`${this.apiUrl}/${id}`);
  }

  createCategory(data: { name: string; slug?: string }): Observable<ICategoryRes> {
    return this.http.post<ICategoryRes>(this.apiUrl, data);
  }

  updateCategory(id: string, data: { name: string; slug?: string }): Observable<ICategoryRes> {
    return this.http.put<ICategoryRes>(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}