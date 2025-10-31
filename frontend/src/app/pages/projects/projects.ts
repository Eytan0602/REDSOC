import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Proyectos</h1>
          <p class="text-gray-text">Descubre proyectos increíbles de la comunidad</p>
        </div>
        @if (authService.isAuthenticated()) {
          <button (click)="showCreateModal = true"
                  class="px-6 py-3 bg-gradient-to-r from-primary to-primary-light rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Proyecto</span>
          </button>
        }
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (project of projects; track project.id) {
          <div class="bg-dark-card rounded-2xl border border-dark-border hover:border-primary/50 transition group overflow-hidden">
            <!-- Project Image/Preview -->
            <div class="h-48 bg-gradient-to-br from-primary/30 via-primary-dark/30 to-primary-light/30 flex items-center justify-center">
              <svg class="w-20 h-20 text-white opacity-50 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>

            <div class="p-6">
              <!-- Author -->
              <div class="flex items-center space-x-3 mb-4">
                @if (project.avatar?.startsWith('http')) {
                  <img [src]="project.avatar" alt="{{ project.name }}" 
                       class="w-10 h-10 rounded-full border-2 border-primary/30 object-cover">
                } @else {
                  <div class="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-semibold text-sm">
                    {{ project.avatar || project.name?.charAt(0).toUpperCase() }}
                  </div>
                }
                <div>
                  <div class="text-white font-semibold">{{ project.name }}</div>
                  <div class="text-gray-secondary text-sm">&#64;{{ project.username }}</div>
                </div>
              </div>

              <!-- Project Info -->
              <h3 class="text-xl font-bold text-white mb-2 group-hover:text-primary transition">
                {{ project.title }}
              </h3>
              <p class="text-gray-text text-sm mb-4 line-clamp-3">
                {{ project.description }}
              </p>

              <!-- Technologies -->
              @if (project.technologies) {
                <div class="flex flex-wrap gap-2 mb-4">
                  @for (tech of project.technologies.split(','); track tech) {
                    <span class="px-3 py-1 bg-dark-bg rounded-full text-xs text-primary border border-primary/30">
                      {{ tech.trim() }}
                    </span>
                  }
                </div>
              }

              <!-- Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-dark-border mb-4">
                <div class="flex space-x-4">
                  @if (project.github_url) {
                    <a [href]="project.github_url" target="_blank"
                       class="text-gray-text hover:text-primary transition"
                       title="Ver en GitHub">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  }
                  @if (project.demo_url) {
                    <a [href]="project.demo_url" target="_blank"
                       class="text-gray-text hover:text-primary transition"
                       title="Ver demo">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  }
                </div>
                <div class="flex items-center space-x-4">
                  <button (click)="toggleComments(project.id)"
                          class="flex items-center space-x-2 text-gray-text hover:text-primary transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{{ project.comments_count || 0 }}</span>
                  </button>
                  @if (authService.isAuthenticated()) {
                    <button (click)="toggleLike(project.id)" 
                            [class.text-red-500]="project.userHasLiked"
                            class="flex items-center space-x-2 text-gray-text hover:text-red-500 transition">
                      <svg class="w-5 h-5" [class.fill-current]="project.userHasLiked" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{{ project.likes || 0 }}</span>
                    </button>
                  } @else {
                    <div class="flex items-center space-x-2 text-gray-text">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{{ project.likes || 0 }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Comments Section -->
              @if (expandedProjects.has(project.id)) {
                <div class="mt-4 pt-4 border-t border-dark-border space-y-4">
                  @if (authService.isAuthenticated()) {
                    <div class="flex space-x-3">
                      @if (authService.currentUser()?.avatar?.startsWith('http')) {
                        <img [src]="authService.currentUser()?.avatar" alt="{{ authService.currentUser()?.name }}" 
                             class="w-10 h-10 rounded-full border-2 border-primary/30 object-cover">
                      } @else {
                        <div class="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-semibold text-sm">
                          {{ (authService.currentUser()?.avatar || authService.currentUser()?.name?.charAt(0)?.toUpperCase()) ?? '?' }}
                        </div>
                      }
                      <div class="flex-1 flex space-x-2">
                        <input type="text" 
                               [ngModel]="commentTexts.get(project.id) || ''"
                               (ngModelChange)="commentTexts.set(project.id, $event)"
                               placeholder="Escribe un comentario..."
                               class="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:border-primary focus:outline-none">
                        <button (click)="addComment(project.id)" 
                                [disabled]="!commentTexts.get(project.id)?.trim()"
                                class="px-4 py-2 bg-primary rounded-lg text-white text-sm hover:bg-primary-dark transition disabled:opacity-50">
                          Enviar
                        </button>
                      </div>
                    </div>
                  }
<div class="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">

                    @for (comment of projectComments.get(project.id); track comment.id) {
                      <div class="flex space-x-3 p-3 bg-dark-bg rounded-lg">
                        @if (comment.avatar?.startsWith('http')) {
                          <img [src]="comment.avatar" alt="{{ comment.name }}" 
                               class="w-8 h-8 rounded-full border-2 border-primary/30 object-cover">
                        } @else {
                          <div class="w-8 h-8 rounded-full bg-gradient-to-r from-primary-dark to-primary flex items-center justify-center text-white font-semibold text-xs">
                            {{ comment.avatar || comment.name?.charAt(0).toUpperCase() }}
                          </div>
                        }
                        <div class="flex-1">
                          <div class="flex items-center space-x-2">
                            <span class="text-white font-semibold text-sm">{{ comment.name }}</span>
                            <span class="text-gray-secondary text-xs">{{ formatDate(comment.created_at) }}</span>
                          </div>
                          <p class="text-gray-text text-sm mt-1">{{ comment.text }}</p>
                        </div>
                      </div>
                    } @empty {
                      <p class="text-gray-secondary text-sm text-center py-4">No hay comentarios aún</p>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        } @empty {
          <div class="col-span-full bg-dark-card rounded-2xl p-12 text-center border border-dark-border">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p class="text-gray-text text-lg">No hay proyectos aún</p>
          </div>
        }
      </div>

      <!-- Create Project Modal -->
      @if (showCreateModal) {
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showCreateModal = false">
          <div class="bg-dark-card rounded-2xl p-8 max-w-2xl w-full border border-dark-border max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <h2 class="text-2xl font-bold text-white mb-6">Crear Nuevo Proyecto</h2>
            
            <form (submit)="createProject($event)" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-text mb-2">Título del Proyecto</label>
                <input type="text" [(ngModel)]="newProject.title" name="title" required
                       class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-text mb-2">Descripción</label>
                <textarea [(ngModel)]="newProject.description" name="description" required rows="4"
                          class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none resize-none"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-text mb-2">URL de GitHub</label>
                <input type="url" [(ngModel)]="newProject.github_url" name="github"
                       class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none"
                       placeholder="https://github.com/...">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-text mb-2">URL de Demo</label>
                <input type="url" [(ngModel)]="newProject.demo_url" name="demo"
                       class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none"
                       placeholder="https://...">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-text mb-2">Tecnologías (separadas por comas)</label>
                <input type="text" [(ngModel)]="newProject.technologies" name="technologies"
                       class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none"
                       placeholder="React, Node.js, MongoDB">
              </div>

              <div class="flex space-x-3 pt-4">
                <button type="button" (click)="showCreateModal = false"
                        class="flex-1 px-6 py-3 bg-dark-hover border border-dark-border rounded-lg text-white hover:border-primary transition">
                  Cancelar
                </button>
                <button type="submit"
                        class="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-light rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition">
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ProjectsComponent implements OnInit {
  http = inject(HttpClient);
  authService = inject(AuthService);
  private API_URL = 'http://localhost:3000/api';

  projects: any[] = [];
  showCreateModal = false;
  expandedProjects = new Set<number>();
  projectComments = new Map<number, any[]>();
  commentTexts = new Map<number, string>();
  
  newProject = {
    title: '',
    description: '',
    github_url: '',
    demo_url: '',
    technologies: ''
  };

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    const headers: any = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    this.http.get<any[]>(`${this.API_URL}/projects`, { headers }).subscribe({
      next: (data) => {
        this.projects = data;
      },
      error: (err) => console.error('Error loading projects:', err)
    });
  }

  toggleLike(projectId: number) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    if (project.userHasLiked) {
      // Unlike
      this.http.delete(`${this.API_URL}/projects/${projectId}/like`, { headers }).subscribe({
        next: () => {
          project.userHasLiked = false;
          project.likes = (project.likes || 1) - 1;
        },
        error: (err) => console.error('Error removing like:', err)
      });
    } else {
      // Like
      this.http.post(`${this.API_URL}/projects/${projectId}/like`, {}, { headers }).subscribe({
        next: () => {
          project.userHasLiked = true;
          project.likes = (project.likes || 0) + 1;
        },
        error: (err) => console.error('Error adding like:', err)
      });
    }
  }

  toggleComments(projectId: number) {
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
    } else {
      this.expandedProjects.add(projectId);
      this.loadComments(projectId);
    }
  }

  loadComments(projectId: number) {
    this.http.get<any[]>(`${this.API_URL}/projects/${projectId}/comments`).subscribe({
      next: (comments) => this.projectComments.set(projectId, comments),
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  addComment(projectId: number) {
    const text = this.commentTexts.get(projectId);
    if (!text?.trim()) return;

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post(`${this.API_URL}/projects/${projectId}/comments`, 
      { text }, 
      { headers }
    ).subscribe({
      next: () => {
        this.commentTexts.set(projectId, '');
        this.loadComments(projectId);
        // Actualizar el contador de comentarios
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
          project.comments_count = (project.comments_count || 0) + 1;
        }
      },
      error: (err) => alert(err.error?.message || 'Error al comentar')
    });
  }

  createProject(event: Event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post(`${this.API_URL}/projects`, this.newProject, { headers }).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newProject = { title: '', description: '', github_url: '', demo_url: '', technologies: '' };
        this.loadProjects();
      },
      error: (err) => alert(err.error.message || 'Error al crear proyecto')
    });
  }

  formatDate(date: string): string {
    if (!date) return 'Hace un momento';
    const now = new Date();
    const commentDate = new Date(date);
    const diff = now.getTime() - commentDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return commentDate.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short'
    });
  }
}