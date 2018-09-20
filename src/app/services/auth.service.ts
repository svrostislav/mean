import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { log } from 'util';

export interface AuthData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  private isAuthenticated = false;
  private tokenTimer: any;
  private authStatus = new Subject<boolean>();

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) { }

  get authStatus$() {
    return this.authStatus.asObservable();
  }

  getToken() {
    return this.token;
  }

  getAuth() {
    return this.isAuthenticated;
  }

  cretaUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.httpClient.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(response => console.log(response));
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.httpClient.post<{ token: string, expiresIn: number }>('http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        this.token = response.token;
        if (this.token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.authStatus.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          console.log(expirationDate);
          
          this.saveAuthData(this.token, expirationDate);
          this.router.navigate(['/']);
        }
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation)
      return;
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.authStatus.next(true);
      this.setAuthTimer(expiresIn / 1000)
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatus.next(false);
    this.router.navigate(['/']);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    ['token', 'expiration'].forEach(item => localStorage.removeItem(item));
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration')
    if (!token || !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate)
    }
  }
}
