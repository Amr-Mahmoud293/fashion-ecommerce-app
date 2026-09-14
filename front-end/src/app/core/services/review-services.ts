import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import {
  ICreateReviewPayload,
  IReviewQueryParams,
  IReviewRes,
  IReviewsRes,
  IUpdateReviewPayload,
} from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'reviews';

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

  getReviews(params?: IReviewQueryParams): Observable<IReviewsRes> {
    return this.getActiveReviews(params);
  }

  getMyReview(): Observable<IReviewRes> {
    return this.http.get<IReviewRes>(`${this.apiUrl}/my-review`);
  }

  addReview(payload: ICreateReviewPayload): Observable<IReviewRes> {
    return this.http.post<IReviewRes>(`${this.apiUrl}/my-review`, payload);
  }

  createMyReview(payload: ICreateReviewPayload): Observable<IReviewRes> {
    return this.addReview(payload);
  }

  updateMyReview(payload: IUpdateReviewPayload): Observable<IReviewRes> {
    return this.http.put<IReviewRes>(`${this.apiUrl}/my-review`, payload);
  }

  deleteMyReview(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/my-review`);
  }

  getReviewById(id: string): Observable<IReviewRes> {
    return this.http.get<IReviewRes>(`${this.apiUrl}/${id}`);
  }

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
}
