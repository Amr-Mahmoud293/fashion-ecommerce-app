import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import {
  IReviewQueryParams,
  IReviewRes,
  IReviewsRes,
} from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'reviews';

  getAllReviews(params?: IReviewQueryParams): Observable<IReviewsRes> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<IReviewsRes>(this.apiUrl, { params: httpParams });
  }

  getActiveReviews(params?: IReviewQueryParams): Observable<IReviewsRes> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<IReviewsRes>(`${this.apiUrl}/active`, { params: httpParams });
  }

  getReviewById(id: string): Observable<IReviewRes> {
    return this.http.get<IReviewRes>(`${this.apiUrl}/${id}`);
  }

  updateReviewStatus(id: string, isApproved: boolean): Observable<IReviewRes> {
    return this.http.put<IReviewRes>(`${this.apiUrl}/${id}`, { isApproved });
  }

  deleteReview(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
