import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut,
  Auth,
  UserCredential
} from 'firebase/auth';
import { firebaseConfig } from '../firebase.config';

export interface User {
  id: string;
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
  posts?: any[];
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:3000/api';
  private auth: Auth;
  
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    
    this.checkAuth();
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

  checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  // ==================== LOGIN/REGISTER TRADICIONAL ====================

  register(name: string, username: string, password: string) {
    return this.http.post<any>(`${this.API_URL}/auth/register`, { name, username, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.API_URL}/auth/login`, { username, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  // ==================== LOGOUT ACTUALIZADO ====================

async logout(): Promise<void> {
  try {
    await signOut(this.auth);
    localStorage.clear();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    
    // Cerrar sesiones de proveedores automáticamente
    window.open('https://accounts.google.com/logout', '_blank', 'width=1,height=1');
    window.open('https://github.com/logout', '_blank', 'width=1,height=1');
    
    setTimeout(() => {
      this.router.navigate(['/']);
      window.location.reload();
    }, 500);
    
  } catch (error) {
    console.error('Error:', error);
    localStorage.clear();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
    window.location.reload();
  }
}

  loadCurrentUser() {
    const headers = this.getHeaders();
    this.http.get<User>(`${this.API_URL}/auth/me`, headers).subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.logout();
      }
    });
  }

  // Método helper para actualizar el usuario actual
  updateCurrentUser(userData: Partial<User>) {
    const current = this.currentUser();
    if (current) {
      this.currentUser.set({ ...current, ...userData });
    }
  }

  // ==================== LOGIN CON GOOGLE ====================

  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      // Forzar selección de cuenta
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result: UserCredential = await signInWithPopup(this.auth, provider);
      const user = result.user;
      
      if (!user) {
        throw new Error('No se pudo obtener información del usuario');
      }

      // Obtener el token de Firebase
      const firebaseToken = await user.getIdToken();
      
      // Enviar al backend para crear/obtener usuario
      const response = await this.http.post<any>(
        `${this.API_URL}/auth/google`,
        { 
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL
        }
      ).toPromise();

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        
        const userData = {
          ...response.user,
          id: response.user.id || response.user.uid
        };
        
        this.currentUser.set(userData);
        this.isAuthenticated.set(true);
        this.router.navigate(['/']);
      }
    } catch (error: any) {
      console.error('Error en login con Google:', error);
      
      // Mensajes de error más específicos
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Ventana de autenticación cerrada');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Autenticación cancelada');
      } else {
        throw new Error(error.message || 'Error al iniciar sesión con Google');
      }
    }
  }

  // ==================== LOGIN CON GITHUB ====================

  async loginWithGitHub(): Promise<void> {
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('read:user');
      provider.addScope('user:email');
      // Forzar selección de cuenta
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result: UserCredential = await signInWithPopup(this.auth, provider);
      const user = result.user;
      
      if (!user) {
        throw new Error('No se pudo obtener información del usuario');
      }

      // Obtener el token de Firebase
      const firebaseToken = await user.getIdToken();
      
      // Enviar al backend para crear/obtener usuario
      const response = await this.http.post<any>(
        `${this.API_URL}/auth/github`,
        { 
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL
        }
      ).toPromise();

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
        this.router.navigate(['/']);
      }
    } catch (error: any) {
      console.error('Error en login con GitHub:', error);
      
      // Mensajes de error más específicos
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Ventana de autenticación cerrada');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Autenticación cancelada');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('Ya existe una cuenta con este email usando otro método');
      } else {
        throw new Error(error.message || 'Error al iniciar sesión con GitHub');
      }
    }
  }
}