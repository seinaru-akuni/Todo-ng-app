import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoginDto, RegisterDto, UserProfile} from '../models/auth.model';
import { Observable, tap, switchMap, map } from 'rxjs';
import { TaskService } from './task';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private taskService = inject(TaskService);
  private baseUrl = `${environment.apiUrl}/auth`;

  
  currentUser = signal<UserProfile | null>(null);
  
  isAuthenticated = computed(() => this.currentUser() !== null);

  login(data: LoginDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data, { withCredentials: true }).pipe(
      switchMap((loginResponse: any) => {
        return this.checkAuth().pipe(
          map(() => loginResponse)
        );
      })
    );
  }

  checkAuth(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`, { withCredentials: true })
      .pipe(
        tap({
          next: (user) => this.currentUser.set(user),
          error: () => this.currentUser.set(null) // Якщо 401 (не авторизовано) скидаємо в null
        })
      );
  }


  register(data: RegisterDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data, { 
      withCredentials: true 
    });
  }


  verifyEmail(email: string, code: string, newPassword?: string, confirmNewPassword?: string): Observable<any> {
    const payload = { 
      email, 
      code, 
      newPassword: newPassword || "", 
      confirmNewPassword: confirmNewPassword || "" 
    };

    return this.http.post(`${this.baseUrl}/verify-email`, payload, {
      withCredentials: true 
    });
  }


  getMe(): Observable<UserProfile> {

    return this.http.get<UserProfile>(`${this.baseUrl}/me`, {
      withCredentials: true
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email }, {
      withCredentials: true
    });
  }


  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.currentUser.set(null);
          this.taskService.tasks.set([]); // ЧИСТИМО СПИСОК У ПАМ'ЯТІ
        })
      );
  }
}