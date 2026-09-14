import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { IUser } from '../models/user.model';

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

  getMyProfile(): Observable<IUserProfileRes> {
    return this.http.get<IUserProfileRes>(`${this.apiUrl}/my-profile`);
  }

  updateMyProfile(payload: Partial<IUser>): Observable<IUserProfileRes> {
    return this.http.put<IUserProfileRes>(`${this.apiUrl}/my-profile`, payload);
  }
}
