import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Notification {
  id: number;
  user_id: number;
  type: 'follow' | 'like_post' | 'like_project' | 'comment' | 'repost';
  actor_id: number;
  actor_name: string;
  actor_username: string;
  actor_avatar: string;
  post_id?: number;
  project_id?: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private API_URL = 'http://localhost:3000/api';
  
  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {
    // Polling cada 30 segundos para obtener notificaciones
    interval(30000).pipe(
      switchMap(() => this.getNotifications())
    ).subscribe({
      next: (notifs) => {
        this.notifications.set(notifs);
        this.updateUnreadCount(notifs);
      },
      error: (err) => console.error('Error polling notifications:', err)
    });
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  private updateUnreadCount(notifs: Notification[]) {
    const unread = notifs.filter(n => !n.is_read).length;
    this.unreadCount.set(unread);
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.API_URL}/notifications`, this.getHeaders());
  }

  loadNotifications() {
    this.getNotifications().subscribe({
      next: (notifs) => {
        this.notifications.set(notifs);
        this.updateUnreadCount(notifs);
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put<any>(
      `${this.API_URL}/notifications/${notificationId}/read`,
      {},
      this.getHeaders()
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put<any>(
      `${this.API_URL}/notifications/read-all`,
      {},
      this.getHeaders()
    );
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.API_URL}/notifications/${notificationId}`,
      this.getHeaders()
    );
  }
}