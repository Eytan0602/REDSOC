import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // Obtener datos del usuario logueado
  getMe(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/auth/me`, this.getHeaders());
  }

  // Actualizar perfil
  updateProfile(data: { name: string; bio: string; avatar: string }): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/users/profile`, data, this.getHeaders());
  }

  // Cambiar contraseña
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(
      `${this.API_URL}/users/password`,
      { currentPassword, newPassword },
      this.getHeaders()
    );
  }

  // Cambiar username
  changeUsername(newUsername: string): Observable<any> {
    return this.http.put<any>(
      `${this.API_URL}/users/username`,
      { newUsername },
      this.getHeaders()
    );
  }

  // Obtener perfil de otro usuario por id
  getUser(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.API_URL}/users/${id}`, headers);
  }

  followUser(id: number): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/follow/${id}`, {}, this.getHeaders());
  }

  unfollowUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/follow/${id}`, this.getHeaders());
  }

  getFollowers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/users/${id}/followers`);
  }

  getFollowing(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/users/${id}/following`);
  }
}