import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-dark-card border-r border-dark-border p-6">
      <nav class="space-y-2">
        <a routerLink="/" routerLinkActive="bg-dark-hover text-primary" [routerLinkActiveOptions]="{exact: true}"
           class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-text hover:bg-dark-hover hover:text-white transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="font-medium">Inicio</span>
        </a>

        <a routerLink="/projects" routerLinkActive="bg-dark-hover text-primary"
           class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-text hover:bg-dark-hover hover:text-white transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span class="font-medium">Proyectos</span>
        </a>

        <!-- Mensajes con indicador de no leídos -->
        @if (authService.isAuthenticated()) {
          <a routerLink="/messages" routerLinkActive="bg-dark-hover text-primary"
             class="flex items-center justify-between px-4 py-3 rounded-lg text-gray-text hover:bg-dark-hover hover:text-white transition group">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                @if (unreadCount > 0) {
                  <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark-card animate-pulse"></span>
                }
              </div>
              <span class="font-medium">Mensajes</span>
            </div>
            @if (unreadCount > 0) {
              <span class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>
            }
          </a>
        }

        

        <a routerLink="/about" routerLinkActive="bg-dark-hover text-primary"
           class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-text hover:bg-dark-hover hover:text-white transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-medium">Acerca de</span>
        </a>

        @if (authService.isAuthenticated()) {
          <a routerLink="/settings" routerLinkActive="bg-dark-hover text-primary"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-text hover:bg-dark-hover hover:text-white transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="font-medium">Configuración</span>
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  messageService = inject(MessageService);
  
  unreadCount = 0;
  private pollSubscription?: Subscription;

  ngOnInit() {
    // Solo cargar contador si está autenticado
    if (this.authService.isAuthenticated()) {
      this.checkUnreadMessages();
      
      // Actualizar cada 10 segundos
      this.pollSubscription = interval(10000)
        .pipe(switchMap(() => this.messageService.getUnreadCount()))
        .subscribe({
          next: (data) => {
            this.unreadCount = data.count || 0;
            console.log('📬 Mensajes no leídos:', this.unreadCount);
          },
          error: (err) => console.error('Error polling unread messages:', err)
        });
    }
  }

  ngOnDestroy() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  checkUnreadMessages() {
    this.messageService.getUnreadCount().subscribe({
      next: (data) => {
        this.unreadCount = data.count || 0;
        console.log('📬 Mensajes no leídos (inicial):', this.unreadCount);
      },
      error: (err) => console.error('Error checking unread messages:', err)
    });
  }
}