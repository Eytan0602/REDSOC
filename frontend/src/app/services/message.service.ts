import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private API_URL = 'http://localhost:3000/api';
  
  // Signal para almacenar el ID del usuario con quien chatear
  private targetUserId = signal<string | null>(null);  // ← CAMBIO: string en lugar de number

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener o crear conversación
  getOrCreateConversation(otherUserId: string): Observable<any> {  // ← CAMBIO: parámetro string
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
  getMessages(conversationId: string): Observable<any[]> {  // ← CAMBIO: parámetro string
    return this.http.get<any[]>(
      `${this.API_URL}/conversations/${conversationId}/messages`,
      { headers: this.getHeaders() }
    );
  }

  // Enviar mensaje
  sendMessage(conversationId: string, receiverId: string, content: string): Observable<any> {  // ← CAMBIO: parámetros string
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
    );
  }

  // Iniciar chat con un usuario (desde el perfil)
  startChatWith(userId: string) {  // ← CAMBIO: parámetro string
    this.targetUserId.set(userId);
    this.router.navigate(['/messages']);
  }

  // Obtener el usuario objetivo y limpiar
  getAndClearTargetUser(): string | null {  // ← CAMBIO: retorna string
    const userId = this.targetUserId();
    this.targetUserId.set(null);
    return userId;
  }
  }