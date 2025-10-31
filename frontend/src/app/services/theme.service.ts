import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<Theme>('dark');
  
  constructor() {
    this.loadTheme();
    this.applyTheme();
    
    // Escuchar cambios de preferencia del sistema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (this.currentTheme() === 'auto') {
          this.applyTheme();
        }
      });
    }
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    }
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }

  private applyTheme() {
    const theme = this.currentTheme();
    const root = document.documentElement;
    
    // Remover todas las clases de tema
    root.classList.remove('light-theme', 'dark-theme');
    
    if (theme === 'auto') {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      root.classList.add(`${theme}-theme`);
    }
  }

  toggleTheme() {
    const current = this.currentTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  isDark(): boolean {
    const theme = this.currentTheme();
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }
}