import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

export interface User {
  id: number;
  email?: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:3000/api';
  
  currentUser = signal<User | null>(null);
  
  // Subject para notificar eventos de autenticación
  private loginEvent$ = new Subject<void>();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario si hay token
    const token = localStorage.getItem('token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  // Observable para suscribirse a eventos de login
  get onLogin$(): Observable<void> {
    return this.loginEvent$.asObservable();
  }

  // FIXED: register ahora acepta name, username, password
  register(name: string, username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/register`, { 
      name, 
      username, 
      password 
    }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.currentUser.set(response.user);
          this.loginEvent$.next();
          console.log('Registro exitoso, evento emitido');
        }
      })
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, { username, password })
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.currentUser.set(response.user);
            
            //  Emitir evento de login
            this.loginEvent$.next();
            console.log(' Login exitoso, evento emitido');
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  loadCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.get<User>(`${this.API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (user) => {
        this.currentUser.set(user);
        console.log('👤 Usuario cargado:', user);
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.logout();
      }
    });
  }

  //  FIXED: Agregado método updateCurrentUser
  updateCurrentUser(user: User) {
    this.currentUser.set(user);
  }

  updateProfile(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.API_URL}/auth/profile`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((response: any) => {
        this.currentUser.set(response.user);
      })
    );
  }
}