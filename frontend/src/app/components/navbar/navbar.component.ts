import { Component, inject, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <nav class="bg-dark-card border-b border-dark-border sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 bg-gradient-to-r from-primary via-primary-dark to-primary-light rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              DevFolio
            </span>
          </a>

          <!-- Barra de Búsqueda (Desktop) -->
          <div class="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div class="relative w-full">
              <input type="text" 
                     [(ngModel)]="searchQuery"
                     (input)="onSearchChange()"
                     placeholder="Buscar usuarios, posts, proyectos..."
                     class="w-full px-4 py-2 pl-10 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <!-- Dropdown de resultados -->
              @if (showDropdown && searchResults.length > 0) {
                <div class="absolute mt-2 w-full bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  <div *ngFor="let user of searchResults" 
                       (click)="goToProfile(user)"
                       class="flex items-center space-x-3 p-3 hover:bg-dark-hover cursor-pointer transition">
                    <img [src]="user.avatar" class="w-10 h-10 rounded-full border border-primary/30">
                    <div>
                      <p class="text-white font-medium">{{ user.name }}</p>
                      <p class="text-gray-secondary text-sm">@{{ user.username }}</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Right Side -->
          <div class="flex items-center space-x-4">
            @if (authService.isAuthenticated()) {
              <!-- Búsqueda Mobile -->
              <button (click)="showMobileSearch = !showMobileSearch"
                      class="md:hidden p-2 text-gray-text hover:text-primary rounded-lg hover:bg-dark-hover transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <!-- Notificaciones -->
              <div class="relative">
                <button (click)="toggleNotifications()"
                        class="p-2 text-gray-text hover:text-primary rounded-lg hover:bg-dark-hover transition relative">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  @if (notificationService.unreadCount() > 0) {
                    <span class="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
                    </span>
                  }
                </button>

                <!-- Dropdown de Notificaciones -->
                @if (showNotifications) {
                  <div class="absolute right-0 mt-2 w-96 bg-dark-card rounded-2xl border border-dark-border shadow-2xl overflow-hidden z-50"
                       (click)="$event.stopPropagation()">
                    <div class="p-4 border-b border-dark-border flex items-center justify-between">
                      <h3 class="text-white font-bold text-lg">Notificaciones</h3>
                      @if (notificationService.notifications().length > 0) {
                        <button (click)="markAllAsRead()"
                                class="text-xs text-primary hover:text-primary-light transition">
                          Marcar todas como leídas
                        </button>
                      }
                    </div>
                    <div class="max-h-96 overflow-y-auto">
                      @if (notificationService.notifications().length > 0) {
                        @for (notif of notificationService.notifications(); track notif.id) {
                          <div (click)="handleNotificationClick(notif)"
                               [class.bg-primary/5]="!notif.is_read"
                               class="p-4 border-b border-dark-border hover:bg-dark-hover transition cursor-pointer">
                            <div class="flex items-start space-x-3">
                              @if (notif.actor_avatar && notif.actor_avatar.startsWith('http')) {
                                <img [src]="notif.actor_avatar" alt="{{ notif.actor_name }}"
                                     class="w-10 h-10 rounded-full border-2 border-primary/30">
                              } @else {
                                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold">
                                  {{ notif.actor_avatar || notif.actor_name.charAt(0).toUpperCase() }}
                                </div>
                              }
                              <div class="flex-1 min-w-0">
                                <p class="text-white text-sm">{{ notif.message }}</p>
                                <p class="text-gray-secondary text-xs mt-1">{{ formatDate(notif.created_at) }}</p>
                              </div>
                              @if (!notif.is_read) {
                                <div class="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                              }
                            </div>
                          </div>
                        }
                      } @else {
                        <div class="p-8 text-center">
                          <svg class="w-16 h-16 mx-auto mb-4 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <p class="text-gray-text">No tienes notificaciones</p>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Perfil -->
              <a routerLink="/profile" 
                 class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-dark-hover hover:bg-dark-border transition group">
                @if (currentUserAvatar() && isHttpUrl(currentUserAvatar()!)) {
                  <img [src]="currentUserAvatar()" 
                       [alt]="currentUserName()"
                       class="w-8 h-8 rounded-full border-2 border-primary/30 object-cover group-hover:border-primary transition">
                } @else {
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-semibold group-hover:ring-2 group-hover:ring-primary transition">
                    {{ currentUserAvatar() || getInitial(currentUserName()) }}
                  </div>
                }
                <span class="text-sm text-white hidden sm:block group-hover:text-primary transition">
                  {{ currentUsername() }}
                </span>
              </a>

              <!-- Logout -->
              <button (click)="authService.logout()"
                      class="px-4 py-2 text-gray-text hover:text-red-500 transition flex items-center space-x-2"
                      title="Cerrar sesión">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden lg:block">Salir</span>
              </button>
            } @else {
              <button (click)="openAuthModal()"
                      class="px-6 py-2 bg-gradient-to-r from-primary to-primary-light rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition duration-200 flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Iniciar Sesión</span>
              </button>
            }
          </div>
        </div>

        <!-- Búsqueda Mobile -->
        @if (showMobileSearch) {
          <div class="md:hidden pb-4">
            <div class="relative">
              <input type="text" 
                     [(ngModel)]="searchQuery"
                     (input)="onSearchChange()"
                     placeholder="Buscar..."
                     class="w-full px-4 py-2 pl-10 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <!-- Dropdown de resultados móvil -->
              @if (showDropdown && searchResults.length > 0) {
                <div class="absolute mt-2 w-full bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  <div *ngFor="let user of searchResults" 
                       (click)="goToProfile(user)"
                       class="flex items-center space-x-3 p-3 hover:bg-dark-hover cursor-pointer transition">
                    <img [src]="user.avatar" class="w-10 h-10 rounded-full border border-primary/30">
                    <div>
                      <p class="text-white font-medium">{{ user.name }}</p>
                      <p class="text-gray-secondary text-sm">@{{ user.username }}</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </nav>

    <!-- Auth Modal - Diseño Profesional -->
    @if (showAuthModal) {
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn" 
           (click)="closeAuthModal()">
        <div class="bg-dark-card rounded-3xl max-w-md w-full border border-dark-border/50 shadow-2xl transform transition-all animate-scaleIn overflow-hidden" 
             (click)="$event.stopPropagation()">
          
          <!-- Header con gradiente -->
          <div class="relative bg-gradient-to-br from-primary/20 via-primary-dark/10 to-transparent p-8 pb-6">
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-primary-light/10 rounded-full blur-2xl"></div>
            
            <div class="relative flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-br from-primary via-primary-dark to-primary-light rounded-xl flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                  <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">
                    {{ isLogin ? 'Bienvenido' : 'Únete a DevFolio' }}
                  </h2>
                  <p class="text-gray-secondary text-sm">
                    {{ isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta profesional' }}
                  </p>
                </div>
              </div>
              <button (click)="closeAuthModal()" 
                      class="text-gray-text hover:text-white hover:bg-white/10 p-2 rounded-lg transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenido del formulario -->
          <div class="p-8 pt-6">
            @if (errorMessage) {
              <div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-3 animate-shake">
                <div class="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-red-500 font-medium text-sm">Error</p>
                  <p class="text-red-400 text-sm mt-0.5">{{ errorMessage }}</p>
                </div>
              </div>
            }
            
            <form (submit)="onSubmitAuth($event)" class="space-y-5">
              @if (!isLogin) {
                <div class="space-y-2">
                  <label class="block text-gray-text text-sm font-medium">
                    Nombre completo
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg class="w-5 h-5 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input type="text" 
                           [(ngModel)]="authForm.name" 
                           name="name" 
                           placeholder="Juan Pérez"
                           required
                           class="w-full pl-12 pr-4 py-3.5 bg-dark-bg/50 border border-dark-border rounded-xl text-white placeholder-gray-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-dark-bg focus:outline-none transition">
                  </div>
                </div>
              }
              
              <div class="space-y-2">
                <label class="block text-gray-text text-sm font-medium">
                  Nombre de usuario
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input type="text" 
                         [(ngModel)]="authForm.username" 
                         name="username" 
                         placeholder="juanperez"
                         required
                         class="w-full pl-12 pr-4 py-3.5 bg-dark-bg/50 border border-dark-border rounded-xl text-white placeholder-gray-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-dark-bg focus:outline-none transition">
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-gray-text text-sm font-medium">
                  Contraseña
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input type="password" 
                         [(ngModel)]="authForm.password" 
                         name="password" 
                         placeholder="••••••••"
                         required
                         class="w-full pl-12 pr-4 py-3.5 bg-dark-bg/50 border border-dark-border rounded-xl text-white placeholder-gray-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-dark-bg focus:outline-none transition">
                </div>
              </div>

              @if (isLogin) {
                <div class="flex items-center justify-between text-sm">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" class="w-4 h-4 rounded border-dark-border bg-dark-bg text-primary focus:ring-2 focus:ring-primary/20">
                    <span class="text-gray-text">Recordarme</span>
                  </label>
                  <button type="button" class="text-primary hover:text-primary-light font-medium transition">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              }
              
              <button type="submit"
                      [disabled]="isSubmitting"
                      class="w-full py-4 bg-gradient-to-r from-primary via-primary-dark to-primary-light rounded-xl text-white font-semibold text-base hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-r from-primary-light to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative flex items-center space-x-2">
                  @if (isSubmitting) {
                    <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Procesando...</span>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span>{{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}</span>
                  }
                </div>
              </button>
            </form>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-dark-border"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-dark-card text-gray-secondary">o continúa con</span>
              </div>
            </div>

            <!-- Social Login -->
            <div class="grid grid-cols-2 gap-3">
              <button type="button" class="flex items-center justify-center space-x-2 px-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl hover:bg-dark-hover hover:border-gray-600 transition group">
                <svg class="w-5 h-5 text-gray-text group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
                <span class="text-gray-text group-hover:text-white font-medium transition">Google</span>
              </button>
              <button type="button" class="flex items-center justify-center space-x-2 px-4 py-3 bg-dark-bg/50 border border-dark-border rounded-xl hover:bg-dark-hover hover:border-gray-600 transition group">
                <svg class="w-5 h-5 text-gray-text group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span class="text-gray-text group-hover:text-white font-medium transition">GitHub</span>
              </button>
            </div>

            <!-- Toggle auth mode -->
            <div class="mt-6 text-center">
              <p class="text-gray-text text-sm">
                {{ isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?' }}
                <button (click)="toggleAuthMode()" 
                        class="text-primary hover:text-primary-light ml-1 font-semibold transition-colors underline-offset-4 hover:underline">
                  {{ isLogin ? 'Regístrate gratis' : 'Inicia sesión' }}
                </button>
              </p>
            </div>

            @if (!isLogin) {
              <p class="mt-4 text-center text-xs text-gray-secondary">
                Al crear una cuenta, aceptas nuestros
                <a href="#" class="text-primary hover:text-primary-light transition">Términos de Servicio</a>
                y
                <a href="#" class="text-primary hover:text-primary-light transition">Política de Privacidad</a>
              </p>
            }
          </div>
        </div>
      </div>
    }

    <!-- Click outside para cerrar notificaciones -->
    @if (showNotifications) {
      <div class="fixed inset-0 z-40" (click)="toggleNotifications()"></div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from { 
        opacity: 0;
        transform: scale(0.95);
      }
      to { 
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
      20%, 40%, 60%, 80% { transform: translateX(8px); }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-scaleIn {
      animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .animate-shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97);
    }

    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-thumb {
      background: #555;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #777;
    }

    /* Smooth focus transitions */
    input:focus {
      transform: translateY(-1px);
    }
  `]
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  http = inject(HttpClient);

  showAuthModal = false;
  showNotifications = false;
  showMobileSearch = false;
  isLogin = true;
  isSubmitting = false;
  errorMessage = '';
  searchQuery = '';
  searchResults: any[] = [];
  showDropdown = false;
  searchTimeout: any;
  
  authForm = { name: '', username: '', password: '' };

  // Computed signals para datos del usuario
  currentUserAvatar = computed(() => this.authService.currentUser()?.avatar);
  currentUserName = computed(() => this.authService.currentUser()?.name || '');
  currentUsername = computed(() => this.authService.currentUser()?.username || '');

  // Effect para detectar cambios en el usuario y recargar si es necesario
  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        console.log('👤 Usuario detectado en navbar:', user);
        console.log('🖼️ Avatar actual:', user.avatar);
      }
    });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.notificationService.loadNotifications();
    }
  }

  isHttpUrl(url: string | undefined): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  onSearchChange() {
    const query = this.searchQuery.trim();
    clearTimeout(this.searchTimeout);

    if (query.length < 2) {
      this.searchResults = [];
      this.showDropdown = false;
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.http.get<any>(`http://localhost:3000/api/search?q=${query}`).subscribe({
        next: (res) => {
          this.searchResults = res.users || [];
          this.showDropdown = true;
        },
        error: (err) => {
          console.error('Error buscando:', err);
          this.showDropdown = false;
        }
      });
    }, 300);
  }

  goToProfile(user: any) {
    this.showDropdown = false;
    this.searchQuery = '';
    this.router.navigate(['/profile', user.id]);
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  handleNotificationClick(notif: any) {
    if (!notif.is_read) {
      this.notificationService.markAsRead(notif.id).subscribe(() => {
        notif.is_read = true;
        this.notificationService.loadNotifications();
      });
    }

    if (notif.post_id) {
      this.router.navigate(['/']);
    } else if (notif.project_id) {
      this.router.navigate(['/projects']);
    } else if (notif.type === 'follow') {
      this.router.navigate(['/profile', notif.actor_id]);
    }

    this.showNotifications = false;
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notificationService.loadNotifications();
    });
  }

  formatDate(date: string): string {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now.getTime() - notifDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return notifDate.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short'
    });
  }

  openAuthModal() {
    this.showAuthModal = true;
    this.errorMessage = '';
  }

  closeAuthModal() {
    this.showAuthModal = false;
    this.errorMessage = '';
    this.authForm = { name: '', username: '', password: '' };
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }

  onSubmitAuth(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.isSubmitting = true;
    
    if (this.isLogin) {
      this.authService.login(this.authForm.username, this.authForm.password).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeAuthModal();
          
          // RECARGAR USUARIO COMPLETO después del login
          this.authService.loadCurrentUser();
          this.notificationService.loadNotifications();
          
          console.log(' Login exitoso');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Error al iniciar sesión';
        }
      });
    } else {
      this.authService.register(this.authForm.name, this.authForm.username, this.authForm.password).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeAuthModal();
          
          this.authService.loadCurrentUser();
          this.notificationService.loadNotifications();
          
          console.log('Registro exitoso');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Error al registrarse';
        }
      });
    }
  }
}