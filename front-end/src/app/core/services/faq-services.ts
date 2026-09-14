import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { IFaqQueryParams, IFaqRes, IFaqsRes } from '../models/faq.model';

@Injectable({
  providedIn: 'root',
})
export class FaqServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'faq';

  getAllFaqs(params?: IFaqQueryParams): Observable<IFaqsRes> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<IFaqsRes>(this.apiUrl, { params: httpParams });
  }

  getFaqById(id: string): Observable<IFaqRes> {
    return this.http.get<IFaqRes>(`${this.apiUrl}/${id}`);
  }
}
