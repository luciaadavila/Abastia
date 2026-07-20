import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'accessToken';

  constructor(private readonly http: HttpClient) {}

  register(data: RegisterData): Observable<unknown> {
    return this.http.post(`${this.authUrl}/register`, data);
  }

  login(data: LoginData): Observable<unknown> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, data).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.access_token);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(this.tokenKey) != null;
  }
}
