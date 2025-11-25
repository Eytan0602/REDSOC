import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
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

          <!-- Right Side -->
          <div class="flex items-center space-x-4">
            @if (authService.isAuthenticated()) {
              <!-- Perfil -->
              <a routerLink="/profile" 
                 class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-dark-hover hover:bg-dark-border transition group">
                @if (authService.currentUser()?.avatar?.startsWith('http')) {
                  <img [src]="authService.currentUser()?.avatar" 
                       alt="{{ authService.currentUser()?.name }}"
                       class="w-8 h-8 rounded-full border-2 border-primary/30 object-cover group-hover:border-primary transition">
                } @else {
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-semibold group-hover:ring-2 group-hover:ring-primary transition">
                    {{ authService.currentUser()?.avatar || (authService.currentUser()?.name ? authService.currentUser()!.name.charAt(0).toUpperCase() : '?') }}
                  </div>
                }
                <span class="text-sm text-white hidden sm:block group-hover:text-primary transition">
                  {{ authService.currentUser()?.username }}
                </span>
              </a>

              <!-- Logout -->
              <button (click)="this.authService.logout()"
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
      </div>
    </nav>

    <!-- Auth Modal -->
    @if (showAuthModal) {
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" 
           (click)="closeAuthModal()">
        
        <!-- Animated Background Circles -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-custom"></div>
          <div class="absolute bottom-20 right-20 w-96 h-96 bg-primary-dark/10 rounded-full blur-3xl animate-pulse-custom delay-1000"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl animate-pulse-custom delay-2000"></div>
        </div>

        <!-- Modal Card -->
        <div class="relative bg-dark-card rounded-3xl max-w-md w-full border border-dark-border shadow-2xl transform transition-all animate-scaleIn max-h-[90vh] flex flex-col" 
             (click)="$event.stopPropagation()">
          
          <!-- Close Button -->
          <button (click)="closeAuthModal()" 
                  class="absolute top-6 right-6 text-gray-text hover:text-white transition p-2 hover:bg-dark-hover rounded-lg z-10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Scrollable Content -->
          <div class="overflow-y-auto scrollbar-hide p-8">
          
          <!-- Logo/Brand -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-3 mb-3">
              <div class="w-12 h-12 bg-gradient-to-r from-primary via-primary-dark to-primary-light rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                DevFolio
              </h1>
            </div>
          </div>

          <!-- Header -->
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-white mb-2">
              {{ isLogin ? 'Bienvenido de nuevo' : 'Crear Cuenta' }}
            </h2>
            <p class="text-gray-text text-sm">
              {{ isLogin ? 'Ingresa tus credenciales para continuar' : 'Completa el formulario para registrarte' }}
            </p>
          </div>

          <!-- Error Message -->
          @if (errorMessage) {
            <div class="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 animate-shake">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-red-500 text-sm">{{ errorMessage }}</p>
            </div>
          }
          
          <!-- Form -->
          <form (submit)="onSubmitAuth($event)" class="space-y-5">
            
            <!-- Name Input (Only for Register) -->
            @if (!isLogin) {
              <div>
                <label class="block text-gray-text text-sm font-medium mb-2">Nombre completo</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-secondary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <input type="text" 
                         [(ngModel)]="authForm.name" 
                         name="name" 
                         placeholder="Ej: Juan Pérez"
                         required
                         class="w-full pl-12 pr-4 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-gray-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all">
                </div>
              </div>
            }
            
            <!-- Username Input -->
            <div>
              <label class="block text-gray-text text-sm font-medium mb-2">Usuario</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-secondary">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input type="text" 
                       [(ngModel)]="authForm.username" 
                       name="username" 
                       placeholder="Ej: juanperez"
                       required
                       class="w-full pl-12 pr-4 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-gray-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all">
              </div>
            </div>

            <!-- Password Input -->
            <div>
              <label class="block text-gray-text text-sm font-medium mb-2">Contraseña</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-secondary">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input [type]="showPassword ? 'text' : 'password'"
                       [(ngModel)]="authForm.password" 
                       name="password" 
                       placeholder="••••••••"
                       required
                       class="w-full pl-12 pr-12 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-gray-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all">
                <button type="button"
                        (click)="togglePasswordVisibility()"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-secondary hover:text-white transition-colors">
                  @if (showPassword) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Confirm Password (Only for Register) -->
            @if (!isLogin) {
              <div>
                <label class="block text-gray-text text-sm font-medium mb-2">Confirmar contraseña</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-secondary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input [type]="showConfirmPassword ? 'text' : 'password'"
                         [(ngModel)]="authForm.confirmPassword" 
                         name="confirmPassword" 
                         placeholder="••••••••"
                         required
                         class="w-full pl-12 pr-12 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-gray-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all">
                  <button type="button"
                          (click)="toggleConfirmPasswordVisibility()"
                          class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-secondary hover:text-white transition-colors">
                    @if (showConfirmPassword) {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    }
                  </button>
                </div>
              </div>
            }

            <!-- Remember Me (Only for Login) -->
            @if (isLogin) {
              <div class="flex items-center justify-between text-sm">
                <label class="flex items-center gap-2 text-gray-text cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" class="w-4 h-4 rounded border-dark-border bg-dark-bg text-primary focus:ring-primary focus:ring-offset-0">
                  <span>Recordarme</span>
                </label>
                <a href="#" class="text-primary hover:text-primary-light transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            }

            <!-- Terms & Conditions (Only for Register) -->
            @if (!isLogin) {
              <label class="flex items-start gap-3 text-sm text-gray-text cursor-pointer group">
                <input type="checkbox" 
                       [(ngModel)]="acceptTerms"
                       name="acceptTerms"
                       required
                       class="mt-0.5 w-4 h-4 rounded border-dark-border bg-dark-bg text-primary focus:ring-primary focus:ring-offset-0">
                <span class="group-hover:text-white transition-colors">
                  Acepto los 
                  <a href="#" class="text-primary hover:text-primary-light">Términos y Condiciones</a>
                  y la 
                  <a href="#" class="text-primary hover:text-primary-light">Política de Privacidad</a>
                </span>
              </label>
            }
            
            <!-- Submit Button -->
            <button type="submit"
                    [disabled]="isSubmitting"
                    class="w-full py-4 bg-gradient-to-r from-primary to-primary-light rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2">
              @if (isSubmitting) {
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Procesando...</span>
              } @else {
                @if (isLogin) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                }
                <span>{{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}</span>
              }
            </button>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-dark-border"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-dark-card text-gray-text">{{ isLogin ? 'o continúa con' : 'o regístrate con' }}</span>
              </div>
            </div>

            <!-- Social Login/Register -->
            <div class="grid grid-cols-2 gap-3">
              <!-- BOTÓN GITHUB -->
              <button type="button"
                      (click)="loginWithGitHub()"
                      [disabled]="isSubmitting"
                      class="flex items-center justify-center gap-2 py-3 bg-dark-bg border border-dark-border rounded-xl text-white hover:bg-dark-hover hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span class="text-sm font-medium">GitHub</span>
              </button>

              <!-- BOTÓN GOOGLE -->
              <button type="button"
                      (click)="loginWithGoogle()"
                      [disabled]="isSubmitting"
                      class="flex items-center justify-center gap-2 py-3 bg-dark-bg border border-dark-border rounded-xl text-white hover:bg-dark-hover hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span class="text-sm font-medium">Google</span>
              </button>
            </div>
          </form>

          <!-- Toggle Auth Mode -->
          <div class="mt-6 text-center">
            <p class="text-gray-text text-sm">
              {{ isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?' }}
              <button (click)="toggleAuthMode()" 
                      class="text-primary hover:text-primary-light font-semibold ml-1 transition-colors">
                {{ isLogin ? 'Regístrate gratis' : 'Inicia sesión' }}
              </button>
            </p>
          </div>

          <!-- Footer Info -->
          <div class="text-center mt-4 text-gray-secondary text-xs">
            <p>Al continuar, aceptas nuestros Términos y Política de Privacidad</p>
          </div>
          
          </div>
          <!-- End Scrollable Content -->
        </div>
      </div>
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
        transform: scale(0.9);
      }
      to { 
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes pulse-custom {
      0%, 100% { 
        opacity: 0.3; 
        transform: scale(1); 
      }
      50% { 
        opacity: 0.5; 
        transform: scale(1.05); 
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }

    .animate-scaleIn {
      animation: scaleIn 0.3s ease-out;
    }

    .animate-pulse-custom {
      animation: pulse-custom 4s ease-in-out infinite;
    }

    .animate-shake {
      animation: shake 0.3s ease-in-out;
    }

    .delay-1000 {
      animation-delay: 1s;
    }

    .delay-2000 {
      animation-delay: 2s;
    }

    :host ::ng-deep input {
      transition: all 0.2s;
    }

    :host ::ng-deep input:focus {
      transform: translateY(-1px);
    }

    /* Scrollbar personalizado para navegadores webkit */
    :host ::ng-deep .scrollbar-hide::-webkit-scrollbar {
      width: 6px;
    }

    :host ::ng-deep .scrollbar-hide::-webkit-scrollbar-track {
      background: transparent;
    }

    :host ::ng-deep .scrollbar-hide::-webkit-scrollbar-thumb {
      background: #262626;
      border-radius: 3px;
    }

    :host ::ng-deep .scrollbar-hide::-webkit-scrollbar-thumb:hover {
      background: #404040;
    }

    /* Para Firefox */
    :host ::ng-deep .scrollbar-hide {
      scrollbar-width: thin;
      scrollbar-color: #262626 transparent;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  showAuthModal = false;
  isLogin = true;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  rememberMe = false;
  acceptTerms = false;
  authForm = { 
    name: '', 
    username: '', 
    password: '',
    confirmPassword: ''
  };

  openAuthModal() {
    this.showAuthModal = true;
    this.errorMessage = '';
    this.resetForm();
  }

  closeAuthModal() {
    this.showAuthModal = false;
    this.errorMessage = '';
    this.resetForm();
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    this.resetForm();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetForm() {
    this.authForm = { 
      name: '', 
      username: '', 
      password: '',
      confirmPassword: ''
    };
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.rememberMe = false;
    this.acceptTerms = false;
  }

  onSubmitAuth(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    // Validaciones adicionales para el registro
    if (!this.isLogin) {
      if (this.authForm.password !== this.authForm.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden';
        return;
      }
      if (!this.acceptTerms) {
        this.errorMessage = 'Debes aceptar los términos y condiciones';
        return;
      }
    }
    
    this.isSubmitting = true;
    
    if (this.isLogin) {
      this.authService.login(this.authForm.username, this.authForm.password).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeAuthModal();
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
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Error al registrarse';
        }
      });
    }
  }

  // ==================== MÉTODOS PARA OAUTH ====================
  
  async loginWithGoogle() {
    this.isSubmitting = true;
    this.errorMessage = '';
    
    try {
      await this.authService.loginWithGoogle();
      this.closeAuthModal();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión con Google';
    } finally {
      this.isSubmitting = false;
    }
  }

  async loginWithGitHub() {
    this.isSubmitting = true;
    this.errorMessage = '';
    
    try {
      await this.authService.loginWithGitHub();
      this.closeAuthModal();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión con GitHub';
    } finally {
      this.isSubmitting = false;
    }
  }
}