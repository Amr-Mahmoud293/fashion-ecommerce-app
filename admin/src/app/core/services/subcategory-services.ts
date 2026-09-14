import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { ISubcategoryRes, ISubcategoriesRes } from '../models/subcategory.model';

@Injectable({
  providedIn: 'root',
})
export class SubcategoryServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'subcategory';

  getAllSubcategories(): Observable<ISubcategoriesRes> {
    return this.http.get<ISubcategoriesRes>(this.apiUrl);
  }

  getSubcategoryById(id: string): Observable<ISubcategoryRes> {
    return this.http.get<ISubcategoryRes>(`${this.apiUrl}/${id}`);
  }

  createSubCategory(data: { name: string; category: string; slug?: string }): Observable<ISubcategoryRes> {
    return this.http.post<ISubcategoryRes>(this.apiUrl, data);
  }

  updateSubCategory(id: string, data: { name?: string; category?: string; slug?: string }): Observable<ISubcategoryRes> {
    return this.http.put<ISubcategoryRes>(`${this.apiUrl}/${id}`, data);
  }

  deleteSubCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
