import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { ISalesReportRes } from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'report';

  getSalesReports(params?: { startDate?: string; endDate?: string }): Observable<ISalesReportRes> {
    let httpParams = new HttpParams();
    if (params?.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params?.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    return this.http.get<ISalesReportRes>(`${this.apiUrl}/sales`, { params: httpParams });
  }
}
