import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-dark-bg">
      <!-- Hero Section -->
      <div class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary-dark/5 to-transparent border-b border-dark-border">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjVDRjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDM2YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div class="max-w-7xl mx-auto px-4 lg:px-6 py-12 relative">
          <div class="max-w-3xl">
            <h1 class="text-5xl lg:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-primary-light to-white bg-clip-text text-transparent">
              Bienvenido a DevFolio
            </h1>
            <p class="text-xl text-gray-text mb-6">
              Conecta con desarrolladores, comparte tu conocimiento y construye tu red profesional.
            </p>
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center space-x-2 px-4 py-2 bg-dark-card/50 backdrop-blur-sm rounded-lg border border-dark-border">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="text-gray-text text-sm">+1.2K Desarrolladores</span>
              </div>
              <div class="flex items-center space-x-2 px-4 py-2 bg-dark-card/50 backdrop-blur-sm rounded-lg border border-dark-border">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span class="text-gray-text text-sm">+500 Proyectos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Columna principal -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Crear nuevo post -->
            <div *ngIf="authService.isAuthenticated()" class="bg-dark-card rounded-2xl border border-dark-border shadow-xl">
              <div class="p-6">
                <div class="flex items-start space-x-4">
                  <ng-container *ngIf="authService.currentUser() as user">
                    <ng-container *ngIf="user.avatar?.startsWith('http'); else defaultAvatar">
                      <img [src]="user.avatar" alt="{{ user.name }}" 
                           class="w-12 h-12 rounded-full border-2 border-primary/30 object-cover ring-4 ring-primary/10">
                    </ng-container>
                    <ng-template #defaultAvatar>
                      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-primary/10">
                        {{ user.avatar || getCurrentUserInitial() }}
                      </div>
                    </ng-template>

                    <div class="flex-1">
                      <textarea [(ngModel)]="newPost" placeholder="Comparte algo interesante con la comunidad..."
                                class="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-gray-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition"
                                rows="3"></textarea>
                      <div class="mt-4 flex items-center justify-between">
                        <div class="flex space-x-2">
                          <button class="p-2 text-gray-text hover:text-primary hover:bg-primary/10 rounded-lg transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button class="p-2 text-gray-text hover:text-primary hover:bg-primary/10 rounded-lg transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                        <button (click)="createPost()" [disabled]="!newPost.trim()"
                                class="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Publicar</span>
                        </button>
                      </div>
                    </div>
                  </ng-container>
                </div>
              </div>
            </div>

            <!-- Lista de posts -->
            <div class="space-y-4">
              <ng-container *ngIf="posts.length > 0; else noPosts">
                <div *ngFor="let post of posts; trackBy: trackByPost" 
                     class="bg-dark-card rounded-2xl border border-dark-border hover:border-primary/30 transition-all shadow-lg hover:shadow-xl group">

                  <!-- Indicador de Repost -->
                  <div *ngIf="post.post_type === 'repost'" class="px-6 pt-4 pb-2 flex items-center space-x-2 text-gray-secondary text-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <a [routerLink]="['/profile', post.reposted_by_id]" class="hover:text-primary transition">
                      <span class="font-semibold">{{ post.reposted_by_name }}</span> hizo repost
                    </a>
                  </div>

                  <!-- Header del post -->
                  <div class="p-6" [class.pt-2]="post.post_type === 'repost'">
                    <div class="flex items-start space-x-4 mb-4">
                      <ng-container *ngIf="post.avatar?.startsWith('http'); else defaultPostAvatar">
                        <a [routerLink]="['/profile', post.original_user_id]">
                          <img [src]="post.avatar" alt="{{ post.name }}" 
                               class="w-12 h-12 rounded-full border-2 border-primary/30 object-cover ring-2 ring-primary/10 group-hover:ring-primary/30 transition cursor-pointer">
                        </a>
                      </ng-container>
                      <ng-template #defaultPostAvatar>
                        <a [routerLink]="['/profile', post.original_user_id]">
                          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-primary-light to-primary-dark flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-primary/10 group-hover:ring-primary/30 transition cursor-pointer">
                            {{ post.avatar || getInitial(post.name) }}
                          </div>
                        </a>
                      </ng-template>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2">
                          <a [routerLink]="['/profile', post.original_user_id]" class="hover:text-primary transition">
                            <h3 class="text-white font-semibold truncate group-hover:text-primary transition">
                              {{ post.name || 'Usuario' }}
                            </h3>
                          </a>
                          <svg class="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          <!-- Botón Seguir -->
                          <button *ngIf="authService.isAuthenticated() && !isCurrentUser(post.original_user_id)"
                                  (click)="toggleFollow(post.original_user_id, post)"
                                  [class.bg-dark-hover]="post.isFollowing"
                                  [class.text-gray-text]="post.isFollowing"
                                  class="px-3 py-1 text-xs font-medium rounded-full transition flex items-center space-x-1 bg-primary text-white hover:bg-primary-dark">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path *ngIf="!post.isFollowing" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                              <path *ngIf="post.isFollowing" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{{ post.isFollowing ? 'Siguiendo' : 'Seguir' }}</span>
                          </button>
                        </div>
                        <p class="text-gray-secondary text-sm">&#64;{{ post.username || 'unknown' }} · {{ formatDate(post.created_at) }}</p>
                      </div>
                      <button class="text-gray-text hover:text-white p-2 hover:bg-dark-hover rounded-lg transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>

                    <!-- Contenido del post -->
                    <p class="text-white text-base leading-relaxed mb-4 pl-16">{{ post.content }}</p>

                    <!-- Acciones -->
                    <div class="flex items-center space-x-6 pt-4 border-t border-dark-border pl-16">
                      <button (click)="toggleComments(post.id)"
                              class="flex items-center space-x-2 text-gray-text hover:text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition group/btn">
                        <svg class="w-5 h-5 group-hover/btn:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span class="font-medium">{{ post.comments_count || 0 }}</span>
                      </button>
                      
                      <!-- Repost -->
                      <button (click)="authService.isAuthenticated() ? toggleRepost(post.id) : null"
                              [class.text-green-500]="post.userHasReposted"
                              [class.opacity-50]="!authService.isAuthenticated()"
                              [class.cursor-not-allowed]="!authService.isAuthenticated()"
                              [disabled]="!authService.isAuthenticated()"
                              class="flex items-center space-x-2 text-gray-text hover:text-green-500 hover:bg-green-500/10 px-3 py-2 rounded-lg transition group/btn">
                        <svg class="w-5 h-5 group-hover/btn:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span class="font-medium">{{ post.reposts || 0 }}</span>
                      </button>
                      
                      <!-- Like -->
                      <button (click)="authService.isAuthenticated() ? toggleLike(post.id) : null"
                              [class.text-red-500]="post.userHasLiked"
                              [class.opacity-50]="!authService.isAuthenticated()"
                              [class.cursor-not-allowed]="!authService.isAuthenticated()"
                              [disabled]="!authService.isAuthenticated()"
                              class="flex items-center space-x-2 text-gray-text hover:text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-lg transition group/btn">
                        <svg class="w-5 h-5 group-hover/btn:scale-110 transition" 
                             [class.fill-current]="post.userHasLiked" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span class="font-medium">{{ post.likes || 0 }}</span>
                      </button>
                      
                      <button class="flex items-center space-x-2 text-gray-text hover:text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition ml-auto">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Comentarios expandibles -->
                  <div *ngIf="expandedPosts.has(post.id)" class="border-t border-dark-border bg-dark-bg/50">
                    <div class="p-6 space-y-4">
                      <ng-container *ngIf="authService.isAuthenticated() && authService.currentUser() as user">
                        <div class="flex space-x-3">
                          <ng-container *ngIf="user.avatar?.startsWith('http'); else defaultCommentAvatar">
                            <img [src]="user.avatar" alt="{{ user.name }}" 
                                 class="w-10 h-10 rounded-full border-2 border-primary/30 object-cover">
                          </ng-container>
                          <ng-template #defaultCommentAvatar>
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                              {{ user.avatar || getCurrentUserInitial() }}
                            </div>
                          </ng-template>

                          <div class="flex-1 flex space-x-2">
                            <input type="text" 
                                   [ngModel]="commentTexts.get(post.id) || ''"
                                   (ngModelChange)="commentTexts.set(post.id, $event)"
                                   placeholder="Escribe un comentario..."
                                   class="flex-1 px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition">
                            <button (click)="addComment(post.id)" 
                                    [disabled]="!commentTexts.get(post.id)?.trim()"
                                    class="px-4 py-2 bg-primary rounded-lg text-white hover:bg-primary-dark transition disabled:opacity-50 font-medium">
                              Enviar
                            </button>
                          </div>
                        </div>
                      </ng-container>

                      <div class="space-y-3 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div *ngFor="let comment of postComments.get(post.id) || []; trackBy: trackByComment" 
                             class="flex space-x-3 p-4 bg-dark-card rounded-xl hover:bg-dark-hover transition">
                          <ng-container *ngIf="comment.avatar?.startsWith('http'); else defaultCommentUser">
                            <img [src]="comment.avatar" alt="{{ comment.name }}" 
                                 class="w-10 h-10 rounded-full border-2 border-primary/30 object-cover">
                          </ng-container>
                          <ng-template #defaultCommentUser>
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-dark to-primary flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                              {{ comment.avatar || getInitial(comment.name) }}
                            </div>
                          </ng-template>
                          <div class="flex-1">
                            <div class="flex items-center space-x-2">
                              <span class="text-white font-semibold">{{ comment.name || 'Usuario' }}</span>
                              <span class="text-gray-secondary text-sm">{{ formatDate(comment.created_at) }}</span>
                            </div>
                            <p class="text-gray-text mt-1">{{ comment.text }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </ng-container>

              <!-- No hay posts -->
              <ng-template #noPosts>
                <div class="bg-dark-card rounded-2xl p-16 text-center border border-dark-border">
                  <div class="max-w-md mx-auto">
                    <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-full flex items-center justify-center">
                      <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 class="text-white text-xl font-bold mb-2">No hay publicaciones aún</h3>
                    <p class="text-gray-text">Sé el primero en compartir algo con la comunidad</p>
                  </div>
                </div>
              </ng-template>
            </div>

          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Tendencias de Tecnologías -->
            <div class="bg-dark-card rounded-2xl border border-dark-border p-6 shadow-xl">
              <h2 class="text-white font-bold text-lg mb-4 flex items-center">
                <svg class="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Tecnologías en Tendencia
              </h2>
              <div class="space-y-3">
                <ng-container *ngIf="trending.length > 0; else noTrending">
                  <div *ngFor="let tech of trending; trackBy: trackByTech" 
                       class="p-3 hover:bg-dark-hover rounded-lg cursor-pointer transition group">
                    <div class="flex items-center justify-between mb-1">
                      <p class="text-gray-secondary text-sm">#{{ tech.rank }} en {{ getCategoryName(tech.category) }}</p>
                      <span class="text-xs px-2 py-1 rounded-full"
                            [ngClass]="getCategoryColor(tech.category)">
                        {{ tech.category }}
                      </span>
                    </div>
                    <p class="text-white font-semibold group-hover:text-primary transition">#{{ tech.name }}</p>
                    <p class="text-gray-secondary text-xs mt-1">{{ tech.count }} proyecto{{ tech.count !== 1 ? 's' : '' }}</p>
                  </div>
                </ng-container>
                <ng-template #noTrending>
                  <p class="text-gray-secondary text-sm text-center py-4">No hay tendencias aún</p>
                </ng-template>
              </div>
            </div>

            <!-- Sugerencias de Usuarios -->
            <div class="bg-dark-card rounded-2xl border border-dark-border p-6 shadow-xl">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-white font-bold text-lg flex items-center">
                  <svg class="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Usuarios Sugeridos
                </h2>
                <button (click)="refreshSuggestions()" 
                        class="p-1.5 text-gray-text hover:text-primary hover:bg-primary/10 rounded-lg transition"
                        title="Recargar sugerencias">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <div class="space-y-4">
                <ng-container *ngIf="suggestions.length > 0; else noSuggestions">
                  <div *ngFor="let suggestion of suggestions; trackBy: trackBySuggestion" 
                       class="flex items-center space-x-3">
                    <a [routerLink]="['/profile', suggestion.id]">
                      <ng-container *ngIf="suggestion.avatar?.startsWith('http'); else defaultSuggestionAvatar">
                        <img [src]="suggestion.avatar" alt="{{ suggestion.name }}" 
                             class="w-10 h-10 rounded-full border-2 border-primary/30 object-cover">
                      </ng-container>
                      <ng-template #defaultSuggestionAvatar>
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {{ suggestion.avatar || getInitial(suggestion.name) }}
                        </div>
                      </ng-template>
                    </a>
                    <div class="flex-1 min-w-0">
                      <a [routerLink]="['/profile', suggestion.id]">
                        <p class="text-white font-semibold truncate text-sm hover:text-primary transition">
                          {{ suggestion.name }}
                        </p>
                      </a>
                      <div class="flex items-center space-x-2">
                        <p class="text-gray-secondary text-xs truncate">@{{ suggestion.username }}</p>
                        <span *ngIf="suggestion.isNew" 
                              class="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full border border-green-500/30">
                          Nuevo
                        </span>
                      </div>
                    </div>
                    <button *ngIf="authService.isAuthenticated()"
                            (click)="followUser(suggestion.id)"
                            class="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition">
                      Seguir
                    </button>
                  </div>
                </ng-container>
                <ng-template #noSuggestions>
                  <p class="text-gray-secondary text-sm text-center py-4">No hay sugerencias disponibles</p>
                </ng-template>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  postService = inject(PostService);
  authService = inject(AuthService);
  http = inject(HttpClient);

  private API_URL = 'http://localhost:3000/api';

  posts: any[] = [];
  newPost = '';
 expandedPosts = new Set<string>();
postComments = new Map<string, any[]>();
commentTexts = new Map<string, string>();
  trending: any[] = [];
  suggestions: any[] = [];

  ngOnInit() {
    this.loadPosts();
    this.loadTrending();
    this.loadSuggestions();
  }

  getCurrentUserInitial(): string {
    const name = this.authService.currentUser()?.name;
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getInitial(name?: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  loadPosts() {
    const headers: any = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    this.http.get<any[]>(`${this.API_URL}/posts`, { headers }).subscribe({
      next: (data) => {
        this.posts = data;
        console.log('Posts cargados:', this.posts);
      },
      error: (err) => console.error('Error loading posts:', err)
    });
  }

  createPost() {
    if (!this.newPost.trim()) return;

    this.postService.createPost(this.newPost).subscribe({
      next: () => {
        this.newPost = '';
        this.loadPosts();
      },
      error: (err) => alert(err.error?.message || 'Error al crear post')
    });
  }

  toggleComments(postId: string) {
    if (this.expandedPosts.has(postId)) {
      this.expandedPosts.delete(postId);
    } else {
      this.expandedPosts.add(postId);
      this.loadComments(postId);
    }
  }

  loadComments(postId: string) {
    this.postService.getComments(postId).subscribe({
      next: (comments) => this.postComments.set(postId, comments),
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  addComment(postId: string) {
  const text = this.commentTexts.get(postId);
  if (!text?.trim()) return;

  this.postService.createComment(postId, text).subscribe({
    next: () => {
      this.commentTexts.set(postId, '');
      this.loadComments(postId);
      // Actualizar contador
      const post = this.posts.find(p => p.id === postId);
      if (post) {
        post.comments_count = (post.comments_count || 0) + 1;
      }
    },
    error: (err) => alert(err.error?.message || 'Error al comentar')
  });
}

  toggleLike(postId: string) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    if (post.userHasLiked) {
      // Unlike
      this.http.delete(`${this.API_URL}/posts/${postId}/like`, { headers }).subscribe({
        next: () => {
          post.userHasLiked = false;
          post.likes = Math.max(0, (post.likes || 1) - 1);
        },
        error: (err) => console.error('Error removing like:', err)
      });
    } else {
      // Like
      this.http.post(`${this.API_URL}/posts/${postId}/like`, {}, { headers }).subscribe({
        next: () => {
          post.userHasLiked = true;
          post.likes = (post.likes || 0) + 1;
        },
        error: (err) => console.error('Error adding like:', err)
      });
    }
  }

  toggleRepost(postId: string) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    if (post.userHasReposted) {
      // Remove repost
      this.http.delete(`${this.API_URL}/posts/${postId}/repost`, { headers }).subscribe({
        next: () => {
          post.userHasReposted = false;
          post.reposts = Math.max(0, (post.reposts || 1) - 1);
          // Recargar posts para quitar el repost de la lista
          this.loadPosts();
        },
        error: (err) => console.error('Error removing repost:', err)
      });
    } else {
      // Create repost
      this.http.post(`${this.API_URL}/posts/${postId}/repost`, {}, { headers }).subscribe({
        next: () => {
          post.userHasReposted = true;
          post.reposts = (post.reposts || 0) + 1;
          // Recargar posts para mostrar el nuevo repost
          this.loadPosts();
        },
        error: (err) => {
          if (err.error?.message) {
            alert(err.error.message);
          }
          console.error('Error adding repost:', err);
        }
      });
    }
  }

  loadTrending() {
    this.http.get<any[]>(`${this.API_URL}/trending/technologies`).subscribe({
      next: (data) => {
        this.trending = data.slice(0, 5); // Solo mostrar top 5
        console.log('Tendencias cargadas:', this.trending);
      },
      error: (err) => console.error('Error loading trending:', err)
    });
  }

  loadSuggestions() {
    const headers: any = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    this.http.get<any[]>(`${this.API_URL}/users/suggestions`, { headers }).subscribe({
      next: (data) => {
        this.suggestions = data;
        console.log('Sugerencias cargadas:', this.suggestions);
      },
      error: (err) => console.error('Error loading suggestions:', err)
    });
  }

  refreshSuggestions() {
    this.loadSuggestions();
  }

  followUser(userId: string) {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post(`${this.API_URL}/follow/${userId}`, {}, { headers }).subscribe({
      next: () => {
        // Remover de sugerencias
        this.suggestions = this.suggestions.filter(s => s.id !== userId);
        // Si quedan menos de 3, cargar más
        if (this.suggestions.length < 3) {
          this.loadSuggestions();
        }
      },
      error: (err) => alert(err.error?.message || 'Error al seguir usuario')
    });
  }

  getCategoryName(category: string): string {
    const names: any = {
      frontend: 'Frontend',
      backend: 'Backend',
      database: 'Base de Datos',
      mobile: 'Móvil',
      devops: 'DevOps',
      other: 'Otros'
    };
    return names[category] || 'Desarrollo';
  }

  getCategoryColor(category: string): string {
    const colors: any = {
      frontend: 'bg-blue-500/10 text-blue-500 border border-blue-500/30',
      backend: 'bg-green-500/10 text-green-500 border border-green-500/30',
      database: 'bg-purple-500/10 text-purple-500 border border-purple-500/30',
      mobile: 'bg-pink-500/10 text-pink-500 border border-pink-500/30',
      devops: 'bg-orange-500/10 text-orange-500 border border-orange-500/30',
      other: 'bg-gray-500/10 text-gray-500 border border-gray-500/30'
    };
    return colors[category] || colors.other;
  }

  formatDate(date?: string): string {
    if (!date) return 'Hace un momento';
    const now = new Date();
    const postDate = new Date(date);
    const diff = now.getTime() - postDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return postDate.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short'
    });
  }

  trackByPost(index: number, post: any) {
    return `${post.id}-${post.post_type}-${post.reposted_by_id || 'original'}`;
  }

  trackByComment(index: number, comment: any) {
    return comment.id;
  }

  trackByTech(index: number, tech: any) {
    return tech.name;
  }

  trackBySuggestion(index: number, suggestion: any) {
    return suggestion.id;
  }

  isCurrentUser(userId: string): boolean {
    return this.authService.currentUser()?.id === userId;
  }

  toggleFollow(userId: string, post: any) {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    if (post.isFollowing) {
      // Dejar de seguir
      this.http.delete(`${this.API_URL}/follow/${userId}`, { headers }).subscribe({
        next: () => {
          post.isFollowing = false;
        },
        error: (err) => console.error('Error al dejar de seguir:', err)
      });
    } else {
      // Seguir
      this.http.post(`${this.API_URL}/follow/${userId}`, {}, { headers }).subscribe({
        next: () => {
          post.isFollowing = true;
        },
        error: (err) => {
          if (err.error?.message) {
            alert(err.error.message);
          }
          console.error('Error al seguir:', err);
        }
      });
    }
  }
}