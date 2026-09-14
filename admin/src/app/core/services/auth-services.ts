import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/env';
import { IAuthRes, ILoginData, ITokenPayload } from '../models/auth.model'; // تم إزالة IRegisterData
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private userData = new BehaviorSubject<string | null>(null);
  private apiUrl = environment.apiURL + 'auth';
  private tokenKey = 'token';

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  login(data: ILoginData) {
    return this.http.post<IAuthRes>(`${this.apiUrl}/login`, data).pipe(tap(res => {
      const decode = this.decodeToken(res.token);

      if (decode && decode.role === 'admin') {
        this.userData.next(decode.name);
        this.saveToken(res.token);
      } else {
        throw new Error('Unauthorized: Admin access required.');
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
      } else {
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

  isAdmin(): boolean {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      return decoded !== null && decoded.role === 'admin';
    }
    return false;
  }

  getCurrentUser(): ITokenPayload | null {
    const token = this.getToken();
    return token ? this.decodeToken(token) : null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  getUserName(): string {
    const user = this.getCurrentUser();
    return user ? user.name : 'Admin';
  }

  private deleteToken() {
    localStorage.removeItem(this.tokenKey);
  }
}