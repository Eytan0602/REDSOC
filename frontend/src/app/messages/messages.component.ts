import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto p-4 lg:p-6">
      <h1 class="text-3xl font-bold text-white mb-6">Mensajes</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Lista de Conversaciones -->
        <div class="lg:col-span-1">
          <div class="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
            <div class="p-4 border-b border-dark-border">
              <h2 class="text-xl font-semibold text-white">Conversaciones</h2>
            </div>
            
            <div class="overflow-y-auto max-h-[600px]">
              @if (loadingConversations) {
                <div class="p-8 flex justify-center">
                  <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              } @else if (conversations.length === 0) {
                <div class="p-8 text-center">
                  <svg class="w-16 h-16 mx-auto mb-4 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p class="text-gray-text">No tienes conversaciones</p>
                  <p class="text-gray-secondary text-sm mt-2">Ve a un perfil y envía un mensaje</p>
                </div>
              } @else {
                @for (conv of conversations; track conv.id) {
                  <button (click)="selectConversation(conv)"
                          [class.bg-dark-hover]="selectedConversation?.id === conv.id"
                          class="w-full p-4 hover:bg-dark-hover transition border-b border-dark-border flex items-start space-x-3 text-left">
                    @if (conv.other_user_avatar && conv.other_user_avatar.startsWith('http')) {
                      <img [src]="conv.other_user_avatar" [alt]="conv.other_user_name" 
                           class="w-12 h-12 rounded-full border-2 border-primary/30 object-cover flex-shrink-0">
                    } @else {
                      <div class="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold flex-shrink-0">
                        {{ conv.other_user_avatar || conv.other_user_name?.charAt(0).toUpperCase() }}
                      </div>
                    }
                    
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-1">
                        <h3 class="text-white font-semibold truncate">{{ conv.other_user_name }}</h3>
                        @if (conv.unread_count > 0) {
                          <span class="bg-primary text-white text-xs font-bold rounded-full px-2 py-1">
                            {{ conv.unread_count }}
                          </span>
                        }
                      </div>
                      <p class="text-gray-secondary text-sm truncate">&#64;{{ conv.other_user_username }}</p>
                      @if (conv.last_message) {
                        <p class="text-gray-text text-sm truncate mt-1">{{ conv.last_message }}</p>
                      }
                    </div>
                  </button>
                }
              }
            </div>
          </div>
        </div>

        <!-- Ventana de Chat -->
        <div class="lg:col-span-2">
          <div class="bg-dark-card rounded-2xl border border-dark-border overflow-hidden h-[600px] flex flex-col">
            @if (selectedConversation) {
              <!-- Header del Chat -->
              <div class="p-4 border-b border-dark-border flex items-center space-x-3">
                <a [routerLink]="['/profile', selectedConversation.other_user_id]">
                  @if (selectedConversation.other_user_avatar && selectedConversation.other_user_avatar.startsWith('http')) {
                    <img [src]="selectedConversation.other_user_avatar" [alt]="selectedConversation.other_user_name" 
                         class="w-10 h-10 rounded-full border-2 border-primary/30 object-cover cursor-pointer hover:ring-2 hover:ring-primary transition">
                  } @else {
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-primary transition">
                      {{ selectedConversation.other_user_avatar || selectedConversation.other_user_name?.charAt(0).toUpperCase() }}
                    </div>
                  }
                </a>
                <div>
                  <a [routerLink]="['/profile', selectedConversation.other_user_id]" class="hover:text-primary transition">
                    <h3 class="text-white font-semibold">{{ selectedConversation.other_user_name }}</h3>
                  </a>
                  <p class="text-gray-secondary text-sm">&#64;{{ selectedConversation.other_user_username }}</p>
                </div>
              </div>

              <!-- Mensajes -->
              <div class="flex-1 overflow-y-auto p-4 space-y-4">
                @if (loadingMessages) {
                  <div class="flex justify-center items-center h-full">
                    <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                } @else if (messages.length === 0) {
                  <div class="flex flex-col items-center justify-center h-full text-center">
                    <svg class="w-16 h-16 mb-4 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p class="text-gray-text">Inicia la conversación</p>
                    <p class="text-gray-secondary text-sm mt-1">Envía el primer mensaje</p>
                  </div>
                } @else {
                  @for (message of messages; track message.id) {
                    <div [class.justify-end]="message.sender_id === currentUserId"
                         class="flex">
                      <div [class.bg-primary]="message.sender_id === currentUserId"
                           [class.bg-dark-hover]="message.sender_id !== currentUserId"
                           [class.text-white]="message.sender_id === currentUserId"
                           [class.text-gray-text]="message.sender_id !== currentUserId"
                           class="max-w-[70%] rounded-2xl px-4 py-3 break-words">
                        @if (message.sender_id !== currentUserId) {
                          <p class="text-xs text-primary font-semibold mb-1">{{ message.sender_name }}</p>
                        }
                        <p class="whitespace-pre-wrap">{{ message.content }}</p>
                        <p [class.text-white/70]="message.sender_id === currentUserId"
                           [class.text-gray-secondary]="message.sender_id !== currentUserId"
                           class="text-xs mt-1">
                          {{ formatMessageTime(message.created_at) }}
                        </p>
                      </div>
                    </div>
                  }
                }
              </div>

              <!-- Input de Mensaje -->
              <div class="p-4 border-t border-dark-border">
                <form (submit)="sendMessage($event)" class="flex space-x-3">
                  <input type="text" 
                         [(ngModel)]="newMessage" 
                         name="message"
                         placeholder="Escribe un mensaje..."
                         class="flex-1 px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none"
                         [disabled]="sendingMessage">
                  <button type="submit"
                          [disabled]="!newMessage.trim() || sendingMessage"
                          class="px-6 py-3 bg-gradient-to-r from-primary to-primary-light rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                    @if (sendingMessage) {
                      <div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    }
                    <span>Enviar</span>
                  </button>
                </form>
              </div>
            } @else {
              <!-- Sin conversación seleccionada -->
              <div class="flex flex-col items-center justify-center h-full text-center p-8">
                <svg class="w-24 h-24 mb-6 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 class="text-xl font-bold text-white mb-2">Selecciona una conversación</h3>
                <p class="text-gray-text">Elige una conversación de la lista o inicia una nueva</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class MessagesComponent implements OnInit {
  messageService = inject(MessageService);
  authService = inject(AuthService);

  conversations: any[] = [];
  selectedConversation: any = null;
  messages: any[] = [];
  newMessage = '';
  currentUserId: string = '';  // ← CAMBIO: string en lugar de number
  
  loadingConversations = false;
  loadingMessages = false;
  sendingMessage = false;

  ngOnInit() {
    this.currentUserId = this.authService.currentUser()?.id || '';  // ← CAMBIO: '' en lugar de 0
    this.loadConversations();
    
    // ⭐ DETECTAR SI VIENE DESDE UN PERFIL
    const targetUserId = this.messageService.getAndClearTargetUser();
    if (targetUserId) {
      console.log('Iniciando chat con usuario:', targetUserId);
      // Crear o buscar la conversación con ese usuario
      this.messageService.getOrCreateConversation(targetUserId).subscribe({
        next: (conversation) => {
          console.log('Conversación creada/encontrada:', conversation);
          // Recargar conversaciones para que aparezca la nueva
          this.loadConversations();
          
          // Seleccionar la conversación después de un pequeño delay
          setTimeout(() => {
            // Buscar la conversación en la lista
            const conv = this.conversations.find(c => 
              c.other_user_id === targetUserId || 
              c.id === conversation.id
            );
            
            if (conv) {
              this.selectConversation(conv);
            } else {
              // Si no está en la lista, crear un objeto temporal
              this.messageService.getOrCreateConversation(targetUserId).subscribe({
                next: (fullConv) => {
                  // Obtener datos del usuario
                  this.selectConversationById(fullConv.id, targetUserId);
                }
              });
            }
          }, 300);
        },
        error: (err) => {
          console.error('Error al crear conversación:', err);
          alert('Error al iniciar la conversación');
        }
      });
    }
  }

  loadConversations() {
    this.loadingConversations = true;
    this.messageService.getConversations().subscribe({
      next: (data) => {
        this.conversations = data;
        this.loadingConversations = false;
        console.log('Conversaciones cargadas:', data);
      },
      error: (err) => {
        console.error('Error al cargar conversaciones:', err);
        this.loadingConversations = false;
      }
    });
  }

  selectConversation(conversation: any) {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
  }

  selectConversationById(conversationId: string, otherUserId: string) {  // ← CAMBIO: parámetros string
    // Recargar conversaciones y seleccionar
    this.messageService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) {
          this.selectConversation(conv);
        }
      }
    });
  }

  loadMessages(conversationId: string) {  // ← CAMBIO: parámetro string
    this.loadingMessages = true;
    this.messages = [];
    
    this.messageService.getMessages(conversationId).subscribe({
      next: (data) => {
        this.messages = data;
        this.loadingMessages = false;
        
        // Scroll al final después de cargar mensajes
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Error al cargar mensajes:', err);
        this.loadingMessages = false;
      }
    });
  }

  sendMessage(event: Event) {
    event.preventDefault();
    
    if (!this.newMessage.trim() || !this.selectedConversation) return;
    
    this.sendingMessage = true;
    const messageContent = this.newMessage;
    this.newMessage = ''; // Limpiar input inmediatamente
    
    this.messageService.sendMessage(
      this.selectedConversation.id,
      this.selectedConversation.other_user_id,
      messageContent
    ).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.sendingMessage = false;
        
        // Actualizar última actividad en la lista
        this.loadConversations();
        
        // Scroll al final
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.newMessage = messageContent; // Restaurar mensaje si falla
        this.sendingMessage = false;
        alert('Error al enviar mensaje');
      }
    });
  }

  scrollToBottom() {
    const chatContainer = document.querySelector('.overflow-y-auto.p-4');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}