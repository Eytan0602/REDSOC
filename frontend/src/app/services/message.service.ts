import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private API_URL = 'http://localhost:3000/api';
  
  // Signal para almacenar el ID del usuario con quien chatear
  private targetUserId = signal<number | null>(null);
  
  // BehaviorSubject para el contador de mensajes no leídos (compartido entre componentes)
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener o crear conversación
  getOrCreateConversation(otherUserId: number): Observable<any> {
    return this.http.post(
      `${this.API_URL}/conversations`,
      { otherUserId },
      { headers: this.getHeaders() }
    );
  }

  // Obtener todas las conversaciones
  getConversations(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API_URL}/conversations`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener mensajes de una conversación
  getMessages(conversationId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API_URL}/conversations/${conversationId}/messages`,
      { headers: this.getHeaders() }
    );
  }

  // Enviar mensaje
  sendMessage(conversationId: number, receiverId: number, content: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/messages`,
      { conversationId, receiverId, content },
      { headers: this.getHeaders() }
    );
  }

  // Obtener contador de mensajes no leídos
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.API_URL}/messages/unread/count`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        this.unreadCountSubject.next(response.count);
      })
    );
  }

  // Actualizar manualmente el contador
  refreshUnreadCount() {
    this.getUnreadCount().subscribe({
      next: () => console.log('📬 Contador actualizado'),
      error: (err) => console.error('Error al actualizar contador:', err)
    });
  }

  // Obtener el valor actual del contador (síncrono)
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  // Iniciar chat con un usuario (desde el perfil)
  startChatWith(userId: number) {
    this.targetUserId.set(userId);
    this.router.navigate(['/messages']);
  }

  // Obtener el usuario objetivo y limpiar
  getAndClearTargetUser(): number | null {
    const userId = this.targetUserId();
    this.targetUserId.set(null);
    return userId;
  }
}