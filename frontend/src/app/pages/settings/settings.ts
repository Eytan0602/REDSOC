import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto p-4 lg:p-6 space-y-6">
      <h1 class="text-3xl font-bold text-white mb-6">Configuración</h1>

      <!-- Theme Settings -->
      <div class="bg-dark-card rounded-2xl p-6 border border-dark-border">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span>Apariencia</span>
        </h2>
        <div class="space-y-3">
          <label class="flex items-center justify-between p-4 bg-dark-bg rounded-lg cursor-pointer hover:bg-dark-hover transition"
                 [class.ring-2]="theme === 'dark'" [class.ring-primary]="theme === 'dark'">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div>
                <div class="text-white font-semibold">Tema Oscuro</div>
                <div class="text-gray-secondary text-sm">Diseño optimizado para poca luz</div>
              </div>
            </div>
            <input type="radio" name="theme" value="dark" [(ngModel)]="theme" (change)="saveTheme()"
                   class="w-5 h-5 text-primary">
          </label>

          <label class="flex items-center justify-between p-4 bg-dark-bg rounded-lg cursor-pointer hover:bg-dark-hover transition"
                 [class.ring-2]="theme === 'light'" [class.ring-primary]="theme === 'light'">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <div class="white-smoke font-semibold">Tema Claro</div>
                <div class="text-gray-secondary text-sm">Diseño optimizado para luz brillante</div>
              </div>
            </div>
            <input type="radio" name="theme" value="light" [(ngModel)]="theme" (change)="saveTheme()"
                   class="w-5 h-5 white-smoke">
          </label>
        </div>
        @if (themeChanged) {
          <div class="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Recarga la página para aplicar el tema</span>
          </div>
        }
      </div>

      <!-- Profile Settings -->
      <div class="bg-dark-card rounded-2xl p-6 border border-dark-border">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Perfil</span>
        </h2>
        
        <!-- Avatar Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-text mb-3">Avatar</label>
          <div class="flex items-center space-x-4 mb-3">
            @if (profileData.avatar) {
              <img [src]="profileData.avatar" alt="Avatar" 
                   class="w-20 h-20 rounded-full border-4 border-primary/30">
            } @else {
              <div class="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold text-2xl">
                {{ profileData.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
            }
            <button (click)="showAvatarPicker = !showAvatarPicker"
                    class="px-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-white hover:border-primary transition">
              {{ showAvatarPicker ? 'Ocultar Avatares' : 'Cambiar Avatar' }}
            </button>
          </div>
          
          @if (showAvatarPicker) {
            <div class="space-y-4">
              <!-- Tabs para género -->
              <div class="flex space-x-2">
                <button (click)="avatarGender = 'men'" 
                        [class.bg-primary]="avatarGender === 'men'"
                        [class.text-white]="avatarGender === 'men'"
                        class="flex-1 px-4 py-2 rounded-lg bg-dark-bg text-gray-text hover:bg-primary hover:text-white transition">
                  Hombres
                </button>
                <button (click)="avatarGender = 'women'" 
                        [class.bg-primary]="avatarGender === 'women'"
                        [class.text-white]="avatarGender === 'women'"
                        class="flex-1 px-4 py-2 rounded-lg bg-dark-bg text-gray-text hover:bg-primary hover:text-white transition">
                  Mujeres
                </button>
                <button (click)="avatarGender = 'both'" 
        [class.bg-primary]="avatarGender === 'both'"
        [class.text-white]="avatarGender === 'both'"
        class="flex-1 px-4 py-2 rounded-lg bg-dark-bg text-gray-text hover:bg-primary hover:text-white transition">
  Ambos
</button>
              </div>

              <!-- Grid de avatares -->
              <div class="grid grid-cols-4 gap-3 p-4 bg-dark-bg rounded-lg max-h-96 overflow-y-auto">
                @for (i of getAvatarRange(); track i) {
                  <button (click)="selectAvatar(getAvatarUrl(i))" 
                          [class.ring-4]="profileData.avatar === getAvatarUrl(i)"
                          [class.ring-primary]="profileData.avatar === getAvatarUrl(i)"
                          class="w-full aspect-square rounded-full bg-dark-card hover:scale-110 transition overflow-hidden border-2 border-dark-border hover:border-primary">
                    <img [src]="getAvatarUrl(i)" 
                         alt="Avatar {{ i }}"
                         class="w-full h-full object-cover">
                  </button>
                }
              </div>

              <!-- Botón para generar avatar aleatorio -->
              <button (click)="generateRandomAvatar()"
                      class="w-full px-4 py-2 bg-gradient-to-r from-primary to-primary-light rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Generar Avatar Aleatorio</span>
              </button>
              
              <p class="text-xs text-gray-secondary text-center">
                Fotos generadas por RandomUser API
              </p>
            </div>
          }
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-text mb-2">Nombre</label>
            <input type="text" [(ngModel)]="profileData.name"
                   class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-text mb-2">Biografía</label>
            <textarea [(ngModel)]="profileData.bio" rows="3" maxlength="160"
                      placeholder="Cuéntanos sobre ti..."
                      class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none resize-none"></textarea>
            <div class="text-right text-gray-secondary text-sm mt-1">
              {{ profileData.bio?.length || 0 }}/160
            </div>
          </div>
          <button (click)="saveProfile()" [disabled]="savingProfile"
                  class="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-light rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition disabled:opacity-50">
            {{ savingProfile ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
          @if (profileSaved) {
            <div class="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Perfil actualizado correctamente</span>
            </div>
          }
          @if (profileError) {
            <div class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{{ profileError }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Password Settings -->
      <div class="bg-dark-card rounded-2xl p-6 border border-dark-border">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Seguridad</span>
        </h2>

        <!-- Cambiar Username -->
        <div class="mb-4">
          @if (showUsernameForm) {
            <div class="space-y-4 p-4 bg-dark-bg rounded-lg">
              <div>
                <label class="block text-sm font-medium text-gray-text mb-2">Nuevo username</label>
                <input type="text" [(ngModel)]="newUsername"
                       placeholder="usuario123"
                       class="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none">
                <p class="text-xs text-gray-secondary mt-1">Solo letras, números y guiones bajos (3-20 caracteres)</p>
              </div>
              @if (usernameError) {
                <div class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{{ usernameError }}</span>
                </div>
              }
              @if (usernameSuccess) {
                <div class="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Username actualizado correctamente</span>
                </div>
              }
              <div class="flex space-x-3">
                <button (click)="showUsernameForm = false; newUsername = ''"
                        class="flex-1 px-6 py-3 bg-dark-hover border border-dark-border rounded-lg text-white hover:border-primary transition">
                  Cancelar
                </button>
                <button (click)="changeUsername()" [disabled]="changingUsername"
                        class="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-light rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition disabled:opacity-50">
                  {{ changingUsername ? 'Cambiando...' : 'Cambiar Username' }}
                </button>
              </div>
            </div>
          } @else {
            <button (click)="showUsernameForm = true"
                    class="w-full p-4 bg-dark-bg rounded-lg text-left hover:bg-dark-hover transition flex items-center justify-between">
              <div>
                <span class="text-white">Cambiar username</span>
                <p class="text-gray-secondary text-sm">@{{ authService.currentUser()?.username }}</p>
              </div>
              <svg class="w-5 h-5 text-gray-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          }
        </div>

        <!-- Separador -->
        <div class="border-t border-dark-border my-4"></div>
        
        <!-- Cambiar Contraseña -->
        @if (showPasswordForm) {
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-text mb-2">Contraseña actual</label>
              <input type="password" [(ngModel)]="passwordData.current"
                     class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-text mb-2">Nueva contraseña</label>
              <input type="password" [(ngModel)]="passwordData.new"
                     class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-text mb-2">Confirmar nueva contraseña</label>
              <input type="password" [(ngModel)]="passwordData.confirm"
                     class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none">
            </div>
            @if (passwordError) {
              <div class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{{ passwordError }}</span>
              </div>
            }
            @if (passwordSuccess) {
              <div class="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Contraseña cambiada correctamente</span>
              </div>
            }
            <div class="flex space-x-3">
              <button (click)="showPasswordForm = false"
                      class="flex-1 px-6 py-3 bg-dark-hover border border-dark-border rounded-lg text-white hover:border-primary transition">
                Cancelar
              </button>
              <button (click)="changePassword()" [disabled]="changingPassword"
                      class="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-light rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition disabled:opacity-50">
                {{ changingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
              </button>
            </div>
          </div>
        } @else {
          <button (click)="showPasswordForm = true"
                  class="w-full p-4 bg-dark-bg rounded-lg text-left hover:bg-dark-hover transition flex items-center justify-between">
            <span class="text-white">Cambiar contraseña</span>
            <svg class="w-5 h-5 text-gray-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        }
      </div>

      <!-- Account Settings -->
      <div class="bg-dark-card rounded-2xl p-6 border border-dark-border">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Cuenta</span>
        </h2>
        <div class="space-y-3">
          <button (click)="authService.logout()"
                  class="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 hover:bg-red-500/20 transition flex items-center justify-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);

  avatarGender: 'men' | 'women' | 'both' = 'both';
  theme = localStorage.getItem('theme') || 'dark';
  themeChanged = false;
  showAvatarPicker = false;
  showPasswordForm = false;
  savingProfile = false;
  changingPassword = false;
  profileSaved = false;
  profileError = '';
  passwordError = '';
  passwordSuccess = false;
  showUsernameForm = false;
  
  newUsername = '';
  usernameError = '';
  usernameSuccess = false;
  changingUsername = false;

  profileData = {
    name: '',
    bio: '',
    avatar: ''
  };

  passwordData = {
    current: '',
    new: '',
    confirm: ''
  };

  ngOnInit() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.profileData = {
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || ''
      };
    }
  }

  saveTheme() {
    localStorage.setItem('theme', this.theme);
    this.themeChanged = true;
    
    if (this.theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    
    setTimeout(() => {
      this.themeChanged = false;
      window.location.reload();
    }, 1500);
  }

  selectAvatar(url: string) {
    this.profileData.avatar = url;
    this.showAvatarPicker = false;
  }

  getAvatarRange(): number[] {
    return Array.from({ length: 60 }, (_, i) => i + 1);
  }

  getAvatarUrl(index: number): string {
    if (this.avatarGender === 'both') {
      const gender = index % 2 === 0 ? 'men' : 'women';
      const num = Math.floor(index / 2) % 50;
      return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
    } else {
      return `https://randomuser.me/api/portraits/${this.avatarGender}/${index % 50}.jpg`;
    }
  }

  generateRandomAvatar() {
    const genders = this.avatarGender === 'both' ? ['men', 'women'] : [this.avatarGender];
    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    const randomNum = Math.floor(Math.random() * 50);
    this.profileData.avatar = `https://randomuser.me/api/portraits/${randomGender}/${randomNum}.jpg`;
    this.showAvatarPicker = false;
  }

  saveProfile() {
    this.savingProfile = true;
    this.profileSaved = false;
    this.profileError = '';
    
    console.log('Guardando perfil:', this.profileData);
    
    this.userService.updateProfile(this.profileData).subscribe({
      next: (response: any) => {
        console.log('Perfil guardado:', response);
        this.savingProfile = false;
        this.profileSaved = true;
        
        // Actualizar el usuario actual en AuthService
        this.authService.updateCurrentUser(response.user);
        
        setTimeout(() => this.profileSaved = false, 3000);
      },
      error: (err) => {
        console.error('Error al guardar perfil:', err);
        this.savingProfile = false;
        this.profileError = err.error?.message || 'Error al actualizar perfil';
        setTimeout(() => this.profileError = '', 5000);
      }
    });
  }

  changeUsername() {
    this.usernameError = '';
    this.usernameSuccess = false;

    if (!this.newUsername || this.newUsername.length < 3 || this.newUsername.length > 20) {
      this.usernameError = 'El username debe tener entre 3 y 20 caracteres';
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(this.newUsername)) {
      this.usernameError = 'Solo se permiten letras, números y guiones bajos';
      return;
    }

    this.changingUsername = true;

    this.userService.changeUsername(this.newUsername).subscribe({
      next: (response: any) => {
        console.log('Username cambiado:', response);
        this.changingUsername = false;
        this.usernameSuccess = true;

        // Actualizar usuario en AuthService
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          currentUser.username = this.newUsername;
          this.authService.updateCurrentUser(currentUser);
        }

        setTimeout(() => {
          this.usernameSuccess = false;
          this.showUsernameForm = false;
          this.newUsername = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error al cambiar username:', err);
        this.changingUsername = false;
        this.usernameError = err.error?.message || 'Error al actualizar username';
        setTimeout(() => this.usernameError = '', 5000);
      }
    });
  }

  changePassword() {
    this.passwordError = '';
    this.passwordSuccess = false;

    if (!this.passwordData.current || !this.passwordData.new || !this.passwordData.confirm) {
      this.passwordError = 'Por favor completa todos los campos';
      return;
    }
    
    if (this.passwordData.new !== this.passwordData.confirm) {
      this.passwordError = 'Las contraseñas no coinciden';
      return;
    }
    
    if (this.passwordData.new.length < 6) {
      this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    
    this.changingPassword = true;
    
    console.log('Cambiando contraseña...');
    
    this.userService.changePassword(this.passwordData.current, this.passwordData.new).subscribe({
      next: () => {
        console.log('Contraseña cambiada exitosamente');
        this.changingPassword = false;
        this.passwordSuccess = true;
        this.passwordData = { current: '', new: '', confirm: '' };
        
        setTimeout(() => {
          this.passwordSuccess = false;
          this.showPasswordForm = false;
        }, 3000);
      },
      error: (err) => {
        console.error('Error al cambiar contraseña:', err);
        this.changingPassword = false;
        this.passwordError = err.error?.message || 'Error al cambiar contraseña';
        setTimeout(() => this.passwordError = '', 5000);
      }
    });
  }
}