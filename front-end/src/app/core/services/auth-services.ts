import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/env';
import { IAuthRes, ILoginData, IRegisterData, ITokenPayload } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root',
})

export class AuthServices {
  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }
  private userData = new BehaviorSubject<string | null>(null);
  private apiUrl = environment.apiURL + 'auth';
  private tokenKey = 'token';

  login(data: ILoginData) {
    return this.http.post<IAuthRes>(`${this.apiUrl}/login`, data).pipe(tap(data => {
      const decode = this.decodeToken(data.token);
      if (decode) {
        this.userData.next(decode.name);
        this.saveToken(data.token);
      }
    }));
  }

  register(data: IRegisterData) {
    return this.http.post<IAuthRes>(`${this.apiUrl}/signup`, data).pipe(tap(data => {
      const decode = this.decodeToken(data.token);
      if (decode) {
        this.userData.next(decode.name);
        this.saveToken(data.token);
        this.router.navigate(['/home']);
      }
    }));
  }

  logout() {
    this.deleteToken();
    this.userData.next(null);
    this.router.navigate(['/login']);
  }

  isLogin() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      const decode = this.decodeToken(token);
      if (decode) {
        return true;
      }
    }
    return false;
  }

  checkToken() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      const decode = this.decodeToken(token);
      if (decode) {
        this.userData.next(decode.name);
      }
      else {
        this.logout();
      }
    }
  }

  getUserData() {
    return this.userData.asObservable();
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  private saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  private decodeToken(token: string): ITokenPayload | null {
    try {
      const decodedToken = jwtDecode<ITokenPayload>(token);
      if (decodedToken) {
        const expData = decodedToken.exp * 1000;
        if (expData > Date.now()) {
          return decodedToken;
        }
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  private deleteToken() {
    localStorage.removeItem(this.tokenKey);
  }

}
