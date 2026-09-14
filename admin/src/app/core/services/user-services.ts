import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { IUser, IUsersRes } from '../models/user.model';

export interface IUserProfileRes {
  message: string;
  data: IUser;
}

@Injectable({
  providedIn: 'root',
})
export class UserServices {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + 'users';

  getAllUsers(params?: { page?: number; limit?: number; sort?: string; order?: string }): Observable<IUsersRes> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<IUsersRes>(this.apiUrl, { params: httpParams });
  }

  getMyProfile(): Observable<IUserProfileRes> {
    return this.http.get<IUserProfileRes>(`${this.apiUrl}/my-profile`);
  }

  updateMyProfile(payload: Partial<IUser>): Observable<IUserProfileRes> {
    return this.http.put<IUserProfileRes>(`${this.apiUrl}/my-profile`, payload);
  }

  updateUserByAdmin(id: string, payload: { status?: 'active' | 'blocked'; role?: 'admin' | 'user' }): Observable<IUserProfileRes> {
    return this.http.put<IUserProfileRes>(`${this.apiUrl}/${id}`, payload);
  }

  deleteUserByAdmin(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}


