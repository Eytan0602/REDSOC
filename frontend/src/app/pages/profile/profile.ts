import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto p-4 lg:p-6">
      @if (user) {
        <!-- Profile Header -->
        <div class="bg-dark-card rounded-2xl border border-dark-border overflow-hidden mb-6">
          <!-- Cover Image with Profile Info Overlay -->
          <div [class]="'h-80 bg-gradient-to-r ' + selectedBanner + ' relative overflow-hidden'">
            <!-- Pattern Overlay -->
            <div class="absolute inset-0 opacity-20" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.4&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
            
            <!-- Animated circles decoration -->
            <div class="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-10 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            @if (isOwnProfile) {
              <div class="absolute top-4 right-4 flex gap-2">
                <button (click)="changeBanner()" 
                        class="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition z-10 group">
                  <svg class="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button class="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition z-10">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            }

            <!-- Profile Info Inside Banner -->
            <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div class="max-w-5xl mx-auto">
                <div class="flex flex-col md:flex-row md:items-end md:justify-between">
                  <!-- Avatar & Info -->
                  <div class="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
                    <div class="relative">
                      @if (user.avatar && user.avatar.startsWith('http')) {
                        <img [src]="user.avatar" alt="{{ user.name }}" 
                             class="w-40 h-40 rounded-2xl border-4 border-white/20 shadow-2xl object-cover backdrop-blur-sm">
                      } @else {
                        <div class="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary to-primary-light border-4 border-white/20 flex items-center justify-center text-white font-bold text-6xl shadow-2xl backdrop-blur-sm">
                          {{ user.avatar || user.name.charAt(0).toUpperCase() }}
                        </div>
                      }
                      @if (isOwnProfile) {
                        <button class="absolute bottom-2 right-2 p-2.5 bg-primary rounded-xl hover:bg-primary-dark transition shadow-lg">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      }
                    </div>
                    
                    <div class="pb-2">
                      <div class="flex items-center space-x-3 mb-1">
                        <h1 class="text-4xl font-bold text-white drop-shadow-lg">{{ user.name }}</h1>
                        @if (user.verified) {
                          <svg class="w-7 h-7 text-primary drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        }
                      </div>
                      <p class="text-white/90 text-lg mb-2 drop-shadow-lg">&#64;{{ user.username }}</p>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex space-x-3 mt-4 md:mt-0">
                    @if (isOwnProfile) {
                      <button routerLink="/settings"
                              class="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editar Perfil</span>
                      </button>
                    } @else {
                      <!-- Botón de Mensaje -->
                      <button (click)="startChat()"
                              class="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Mensaje</span>
                      </button>
                      
                      @if (user.isFollowing) {
                        <button (click)="unfollowUser()"
                                class="px-6 py-2 bg-white/10 backdrop-blur-md border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition flex items-center space-x-2">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Siguiendo</span>
                        </button>
                      } @else {
                        <button (click)="followUser()"
                                class="px-6 py-2 bg-primary backdrop-blur-md rounded-lg text-white font-semibold hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/50 transition flex items-center space-x-2">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          <span>Seguir</span>
                        </button>
                      }
                      
                      <button class="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <!-- Bio and Meta Info -->
            <div class="mb-6">
              @if (user.bio) {
                <p class="text-white text-base leading-relaxed max-w-2xl bg-dark-bg/50 p-4 rounded-lg border border-white/10 backdrop-blur-sm mb-4">
                  <svg class="w-5 h-5 text-primary inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  {{ user.bio }}
                </p>
              } @else if (isOwnProfile) {
                <button routerLink="/settings" class="text-gray-text hover:text-primary text-sm flex items-center space-x-1 transition mb-4">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Agregar biografía</span>
                </button>
              }
              
              <!-- User Meta Info -->
              <div class="flex flex-wrap items-center gap-4 text-gray-text text-sm">
                @if (user.location) {
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ user.location }}</span>
                  </div>
                }
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Se unió en {{ formatJoinDate(user.created_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="flex space-x-8 mt-6 pt-6 border-t border-dark-border">
              <button (click)="activeTab = 'posts'" 
                      [class.text-primary]="activeTab === 'posts'"
                      [class.scale-110]="activeTab === 'posts'"
                      class="text-center hover:opacity-80 transition-all transform">
                <div class="text-2xl font-bold text-white">{{ userPosts.length }}</div>
                <div class="text-gray-text flex items-center justify-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Posts
                </div>
              </button>

              <button (click)="activeTab = 'reposts'" 
                      [class.text-primary]="activeTab === 'reposts'"
                      [class.scale-110]="activeTab === 'reposts'"
                      class="text-center hover:opacity-80 transition-all transform">
                <div class="text-2xl font-bold text-white">{{ userReposts.length }}</div>
                <div class="text-gray-text flex items-center justify-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reposts
                </div>
              </button>

              <button (click)="activeTab = 'projects'" 
                      [class.text-primary]="activeTab === 'projects'"
                      [class.scale-110]="activeTab === 'projects'"
                      class="text-center hover:opacity-80 transition-all transform">
                <div class="text-2xl font-bold text-white">{{ userProjects.length }}</div>
                <div class="text-gray-text flex items-center justify-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Proyectos
                </div>
              </button>
              
              <button (click)="showFollowersModal = true; loadFollowers(user.id)" 
                      class="text-center hover:opacity-80 transition-all transform hover:scale-110">
                <div class="text-2xl font-bold text-white">{{ user.followers || 0 }}</div>
                <div class="text-gray-text flex items-center justify-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Seguidores
                </div>
              </button>
              
              <button (click)="showFollowingModal = true; loadFollowing(user.id)" 
                      class="text-center hover:opacity-80 transition-all transform hover:scale-110">
                <div class="text-2xl font-bold text-white">{{ user.following || 0 }}</div>
                <div class="text-gray-text flex items-center justify-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Siguiendo
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Content Tabs -->
        <div class="bg-dark-card rounded-2xl border border-dark-border overflow-hidden mb-6">
          <div class="flex border-b border-dark-border">
            <button (click)="activeTab = 'posts'"
                    [class.border-primary]="activeTab === 'posts'"
                    [class.text-primary]="activeTab === 'posts'"
                    class="flex-1 px-6 py-4 text-gray-text hover:text-white transition border-b-2 border-transparent font-semibold">
              Posts
            </button>
            <button (click)="activeTab = 'reposts'"
                    [class.border-primary]="activeTab === 'reposts'"
                    [class.text-primary]="activeTab === 'reposts'"
                    class="flex-1 px-6 py-4 text-gray-text hover:text-white transition border-b-2 border-transparent font-semibold">
              Reposts
            </button>
            <button (click)="activeTab = 'projects'"
                    [class.border-primary]="activeTab === 'projects'"
                    [class.text-primary]="activeTab === 'projects'"
                    class="flex-1 px-6 py-4 text-gray-text hover:text-white transition border-b-2 border-transparent font-semibold">
              Proyectos
            </button>
          </div>
        </div>

        <!-- Posts Tab -->
        @if (activeTab === 'posts') {
          <div class="space-y-4">
            @for (post of userPosts; track post.id) {
              <div class="bg-dark-card rounded-2xl p-6 border border-dark-border hover:border-dark-hover transition">
                <div class="flex items-start space-x-4 mb-4">
                  @if (user.avatar && user.avatar.startsWith('http')) {
                    <img [src]="user.avatar" alt="{{ user.name }}" 
                         class="w-12 h-12 rounded-full border-2 border-primary/30 object-cover">
                  } @else {
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold">
                      {{ user.avatar || user.name.charAt(0).toUpperCase() }}
                    </div>
                  }
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <div>
                        <h3 class="text-white font-semibold">{{ user.name }}</h3>
                        <p class="text-gray-secondary text-sm">&#64;{{ user.username }} · {{ formatDate(post.created_at) }}</p>
                      </div>
                      @if (isOwnProfile) {
                        <button (click)="deletePost(post.id)"
                        class="text-gray-text hover:text-red-500 transition">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      }
                    </div>
                  </div>
                </div>

                <p class="text-white text-lg mb-4 leading-relaxed">{{ post.content }}</p>

                <div class="flex items-center space-x-6 pt-4 border-t border-dark-border">
                  <button (click)="toggleComments(post.id)"
                          class="flex items-center space-x-2 text-gray-text hover:text-primary transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{{ postComments.get(post.id)?.length || 0 }}</span>
                  </button>
                  <button class="flex items-center space-x-2 text-gray-text hover:text-red-500 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ post.likes || 0 }}</span>
                  </button>
                </div>

                @if (expandedPosts.has(post.id)) {
                  <div class="mt-6 space-y-4">
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
                          <input type="text" [(ngModel)]="commentText" placeholder="Escribe un comentario..."
                                 class="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none">
                          <button (click)="addComment(post.id)" [disabled]="!commentText.trim()"
                                  class="px-4 py-2 bg-primary rounded-lg text-white hover:bg-primary-dark transition disabled:opacity-50">
                            Enviar
                          </button>
                        </div>
                      </div>
                    }

                    <div class="space-y-3">
                      @for (comment of postComments.get(post.id); track comment.id) {
                        <div class="flex space-x-3 p-4 bg-dark-bg rounded-lg">
                          @if (comment.avatar && comment.avatar.startsWith('http')) {
                            <img [src]="comment.avatar" alt="{{ comment.name }}" 
                                 class="w-10 h-10 rounded-full border-2 border-primary/30 object-cover">
                          } @else {
                            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-primary-dark to-primary flex items-center justify-center text-white font-semibold text-sm">
                              {{ comment.avatar || comment.name?.charAt(0).toUpperCase() }}
                            </div>
                          }
                          <div class="flex-1">
                            <div class="flex items-center space-x-2">
                              <span class="text-white font-semibold">{{ comment.name }}</span>
                              <span class="text-gray-secondary text-sm">{{ formatDate(comment.created_at) }}</span>
                            </div>
                            <p class="text-gray-text mt-1">{{ comment.text }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            } @empty {
              <div class="bg-dark-card rounded-2xl p-12 text-center border border-dark-border">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-gray-text">{{ isOwnProfile ? 'Aún no has publicado nada' : 'Este usuario no ha publicado nada' }}</p>
              </div>
            }
          </div>
        }

        <!-- Reposts Tab -->
        @if (activeTab === 'reposts') {
          <div class="space-y-4">
            @for (repost of userReposts; track repost.id) {
              <div class="bg-dark-card rounded-2xl p-6 border border-dark-border hover:border-dark-hover transition">
                <div class="mb-4 flex items-center space-x-2 text-gray-secondary text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{{ isOwnProfile ? 'Hiciste repost' : user.name + ' hizo repost' }} {{ formatDate(repost.repost_created_at) }}</span>
                </div>

                <div class="flex items-start space-x-4 mb-4 p-4 bg-dark-bg rounded-lg">
                  @if (repost.original_avatar && repost.original_avatar.startsWith('http')) {
                    <a [routerLink]="['/profile', repost.original_user_id]">
                      <img [src]="repost.original_avatar" alt="{{ repost.original_name }}" 
                           class="w-12 h-12 rounded-full border-2 border-primary/30 object-cover cursor-pointer hover:ring-2 hover:ring-primary transition">
                    </a>
                  } @else {
                    <a [routerLink]="['/profile', repost.original_user_id]">
                      <div class="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-primary transition">
                        {{ repost.original_avatar || repost.original_name?.charAt(0).toUpperCase() }}
                      </div>
                    </a>
                  }
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <div>
                        <a [routerLink]="['/profile', repost.original_user_id]" class="hover:text-primary transition">
                          <h3 class="text-white font-semibold">{{ repost.original_name }}</h3>
                        </a>
                        <p class="text-gray-secondary text-sm">&#64;{{ repost.original_username }} · {{ formatDate(repost.created_at) }}</p>
                      </div>
                    </div>
                    <p class="text-white text-lg mt-2 leading-relaxed">{{ repost.content }}</p>
                  </div>
                </div>

                <div class="flex items-center space-x-6 pt-4 border-t border-dark-border">
                  <button (click)="toggleComments(repost.id)"
                          class="flex items-center space-x-2 text-gray-text hover:text-primary transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{{ repost.comments_count || 0 }}</span>
                  </button>
                  <button class="flex items-center space-x-2 text-gray-text hover:text-red-500 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ repost.likes || 0 }}</span>
                  </button>
                </div>

                @if (expandedPosts.has(repost.id)) {
                  <div class="mt-6 space-y-4">
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
                          <input type="text" [(ngModel)]="commentText" placeholder="Escribe un comentario..."
                                 class="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:border-primary focus:outline-none">
                          <button (click)="addComment(repost.id)" [disabled]="!commentText.trim()"
                                  class="px-4 py-2 bg-primary rounded-lg text-white hover:bg-primary-dark transition disabled:opacity-50">
                            Enviar
                          </button>
                        </div>
                      </div>
                    }

                    <div class="space-y-3">
                      @for (comment of postComments.get(repost.id); track comment.id) {
                        <div class="flex space-x-3 p-4 bg-dark-bg rounded-lg">
                          @if (comment.avatar && comment.avatar.startsWith('http')) {
                            <img [src]="comment.avatar" alt="{{ comment.name }}" 
                                 class="w-10 h-10 rounded-full border-2 border-primary/30 object-cover">
                          } @else {
                            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-primary-dark to-primary flex items-center justify-center text-white font-semibold text-sm">
                              {{ comment.avatar || comment.name?.charAt(0).toUpperCase() }}
                            </div>
                          }
                          <div class="flex-1">
                            <div class="flex items-center space-x-2">
                              <span class="text-white font-semibold">{{ comment.name }}</span>
                              <span class="text-gray-secondary text-sm">{{ formatDate(comment.created_at) }}</span>
                            </div>
                            <p class="text-gray-text mt-1">{{ comment.text }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            } @empty {
              <div class="bg-dark-card rounded-2xl p-12 text-center border border-dark-border">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p class="text-gray-text">{{ isOwnProfile ? 'No has hecho reposts' : 'Este usuario no ha hecho reposts' }}</p>
              </div>
            }
          </div>
        }

        <!-- Projects Tab -->
        @if (activeTab === 'projects') {
          <div class="space-y-6">
            @for (project of userProjects; track project.id) {
              <div class="bg-dark-card rounded-2xl border border-dark-border hover:border-primary/50 transition group overflow-hidden">
                <div class="h-48 bg-gradient-to-br from-primary/30 via-primary-dark/30 to-primary-light/30 flex items-center justify-center">
                  <svg class="w-20 h-20 text-white opacity-50 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>

                <div class="p-6">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-primary transition">
                        {{ project.title }}
                      </h3>
                      <p class="text-gray-text text-sm leading-relaxed">
                        {{ project.description }}
                      </p>
                    </div>
                    @if (isOwnProfile) {
                      <button class="text-gray-text hover:text-red-500 transition ml-4">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    }
                  </div>

                  @if (project.technologies) {
                    <div class="flex flex-wrap gap-2 mb-4">
                      @for (tech of project.technologies.split(','); track tech) {
                        <span class="px-3 py-1 bg-dark-bg rounded-full text-xs text-primary border border-primary/30">
                          {{ tech.trim() }}
                        </span>
                      }
                    </div>
                  }

                  <div class="flex items-center justify-between pt-4 border-t border-dark-border">
                    <div class="flex space-x-4">
                      @if (project.github_url) {
                        <a [href]="project.github_url" target="_blank"
                           class="flex items-center space-x-2 text-gray-text hover:text-primary transition">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          <span>GitHub</span>
                        </a>
                      }
                      @if (project.demo_url) {
                        <a [href]="project.demo_url" target="_blank"
                           class="flex items-center space-x-2 text-gray-text hover:text-primary transition">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>Demo</span>
                        </a>
                      }
                    </div>
                    <button class="flex items-center space-x-2 text-gray-text hover:text-red-500 transition">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{{ project.likes || 0 }}</span>
                    </button>
                  </div>

                  <div class="text-gray-secondary text-xs mt-4">
                    Creado {{ formatDate(project.created_at) }}
                  </div>
                </div>
              </div>
            } @empty {
              <div class="bg-dark-card rounded-2xl p-12 text-center border border-dark-border">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <p class="text-gray-text">{{ isOwnProfile ? 'Aún no has creado proyectos' : 'Este usuario no ha creado proyectos' }}</p>
                @if (isOwnProfile) {
                  <button routerLink="/projects"
                          class="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-primary-light rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-primary/50 transition">
                    Crear Proyecto
                  </button>
                }
              </div>
            }
          </div>
        }

      } @else {
        <div class="flex items-center justify-center min-h-screen">
          <div class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      }

      <!-- Followers Modal -->
      @if (showFollowersModal) {
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showFollowersModal = false">
          <div class="bg-dark-card rounded-2xl p-6 max-w-md w-full border border-dark-border max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6 sticky top-0 bg-dark-card pb-4">
              <h3 class="text-xl font-bold text-white">Seguidores</h3>
              <button (click)="showFollowersModal = false" class="text-gray-text hover:text-white transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-3">
              @for (follower of followers; track follower.id) {
                <a [routerLink]="['/profile', follower.id]" (click)="showFollowersModal = false"
                   class="flex items-center justify-between p-3 rounded-lg hover:bg-dark-hover transition">
                  <div class="flex items-center space-x-3">
                    @if (follower.avatar && follower.avatar.startsWith('http')) {
                      <img [src]="follower.avatar" alt="{{ follower.name }}" 
                           class="w-12 h-12 rounded-full border-2 border-primary/30 object-cover">
                    } @else {
                      <div class="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold">
                        {{ follower.avatar || follower.name.charAt(0).toUpperCase() }}
                      </div>
                    }
                    <div>
                      <div class="text-white font-semibold">{{ follower.name }}</div>
                      <div class="text-gray-secondary text-sm">&#64;{{ follower.username }}</div>
                    </div>
                  </div>
                  @if (!isOwnProfile && follower.id !== authService.currentUser()?.id) {
                    <button class="px-4 py-1 bg-primary rounded-lg text-white text-sm hover:bg-primary-dark transition">
                      Seguir
                    </button>
                  }
                </a>
              } @empty {
                <p class="text-gray-text text-center py-8">No hay seguidores</p>
              }
            </div>
          </div>
        </div>
      }

      <!-- Following Modal -->
      @if (showFollowingModal) {
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showFollowingModal = false">
          <div class="bg-dark-card rounded-2xl p-6 max-w-md w-full border border-dark-border max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6 sticky top-0 bg-dark-card pb-4">
              <h3 class="text-xl font-bold text-white">Siguiendo</h3>
              <button (click)="showFollowingModal = false" class="text-gray-text hover:text-white transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-3">
              @for (following of followingList; track following.id) {
                <a [routerLink]="['/profile', following.id]" (click)="showFollowingModal = false"
                   class="flex items-center justify-between p-3 rounded-lg hover:bg-dark-hover transition">
                  <div class="flex items-center space-x-3">
                    @if (following.avatar && following.avatar.startsWith('http')) {
                      <img [src]="following.avatar" alt="{{ following.name }}" 
                           class="w-12 h-12 rounded-full border-2 border-primary/30 object-cover">
                    } @else {
                      <div class="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold">
                        {{ following.avatar || following.name.charAt(0).toUpperCase() }}
                      </div>
                    }
                    <div>
                      <div class="text-white font-semibold">{{ following.name }}</div>
                      <div class="text-gray-secondary text-sm">&#64;{{ following.username }}</div>
                    </div>
                  </div>
                  @if (isOwnProfile) {
                    <button class="px-4 py-1 bg-dark-hover border border-primary text-primary rounded-lg text-sm hover:bg-primary hover:text-white transition">
                      Siguiendo
                    </button>
                  }
                </a>
              } @empty {
                <p class="text-gray-text text-center py-8">No sigue a nadie</p>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  userService = inject(UserService);
  postService = inject(PostService);
  http = inject(HttpClient);
  messageService = inject(MessageService);

  user: any = null;
  userPosts: any[] = [];
  userProjects: any[] = [];
  userReposts: any[] = [];
  isOwnProfile = false;
  activeTab = 'posts';
  showFollowersModal = false;
  showFollowingModal = false;
  followers: any[] = [];
  followingList: any[] = [];
  expandedPosts = new Set<string>();
  postComments = new Map<string, any[]>();
  commentText = '';
  private API_URL = 'http://localhost:3000/api';
  
  bannerGradients = [
    'from-purple-600 via-pink-600 to-red-600',
    'from-blue-600 via-cyan-600 to-teal-600',
    'from-green-600 via-emerald-600 to-lime-600',
    'from-orange-600 via-red-600 to-pink-600',
    'from-indigo-600 via-purple-600 to-pink-600',
    'from-cyan-600 via-blue-600 to-purple-600',
    'from-yellow-600 via-orange-600 to-red-600',
    'from-rose-600 via-pink-600 to-purple-600',
    'from-sky-600 via-blue-600 to-indigo-600',
    'from-emerald-600 via-green-600 to-teal-600',
    'from-fuchsia-600 via-purple-600 to-indigo-600',
    'from-amber-600 via-orange-600 to-pink-600',
    'from-lime-600 via-green-600 to-cyan-600',
    'from-red-600 via-rose-600 to-pink-600',
    'from-teal-600 via-cyan-600 to-blue-600'
  ];
  selectedBanner = '';

  ngOnInit() {
    this.selectedBanner = this.getRandomBanner();
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.loadUser(userId);
      } else {
        this.loadOwnProfile();
      }
    });
  }

  getRandomBanner(): string {
    const randomIndex = Math.floor(Math.random() * this.bannerGradients.length);
    return this.bannerGradients[randomIndex];
  }
  
  changeBanner() {
    this.selectedBanner = this.getRandomBanner();
  }

  loadOwnProfile() {
    this.isOwnProfile = true;
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.loadUser(currentUser.id);
    }
  }

  loadUser(id: string) {
    this.userService.getUser(id).subscribe({
      next: (data) => {
        this.user = data;
        this.userPosts = data.posts || [];
        this.isOwnProfile = this.authService.currentUser()?.id === id;
        this.loadUserProjects(id);
        this.loadUserReposts(id);
      },
      error: (err) => console.error('Error loading user:', err)
    });
  }

  loadUserProjects(userId: string) {
    this.http.get<any[]>(`${this.API_URL}/projects`).subscribe({
      next: (projects) => {
        this.userProjects = projects.filter(p => p.user_id === userId);
      },
      error: (err) => console.error('Error loading user projects:', err)
    });
  }

  loadUserReposts(userId: string) {
    this.http.get<any[]>(`${this.API_URL}/users/${userId}/reposts`).subscribe({
      next: (reposts) => {
        this.userReposts = reposts;
      },
      error: (err) => console.error('Error loading user reposts:', err)
    });
  }

  loadFollowers(id: string) {
    this.userService.getFollowers(id).subscribe({
      next: (data) => this.followers = data,
      error: (err) => console.error('Error loading followers:', err)
    });
  }

  loadFollowing(id: string) {
    this.userService.getFollowing(id).subscribe({
      next: (data) => this.followingList = data,
      error: (err) => console.error('Error loading following:', err)
    });
  }

  followUser() {
    if (!this.user) return;
    this.userService.followUser(this.user.id).subscribe({
      next: () => {
        this.user.isFollowing = true;
        this.user.followers++;
      },
      error: (err) => alert(err.error?.message || 'Error al seguir')
    });
  }

  unfollowUser() {
    if (!this.user) return;
    this.userService.unfollowUser(this.user.id).subscribe({
      next: () => {
        this.user.isFollowing = false;
        this.user.followers--;
      },
      error: (err) => alert(err.error?.message || 'Error al dejar de seguir')
    });
  }

  toggleComments(postId: string) {
    if (this.expandedPosts.has(postId)) {
    } else {
      this.expandedPosts.add(postId);
      this.loadComments(postId);
    }
  }
deletePost(postId: string): void {
  if (confirm('¿Estás seguro de que deseas eliminar este post?')) {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        // Eliminar del array local
        this.userPosts = this.userPosts.filter(p => p.id !== postId);
        console.log('Post eliminado');
      },
      error: (err: any) => {
        console.error('Error al eliminar:', err);
        alert('Error al eliminar el post');
      }
    });
  }
}
  loadComments(postId: string) {
    this.postService.getComments(postId).subscribe({
      next: (comments) => this.postComments.set(postId, comments),
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  addComment(postId: string) {
    if (!this.commentText.trim()) return;

    this.postService.createComment(postId, this.commentText).subscribe({
      next: () => {
        this.commentText = '';
        this.loadComments(postId);
      },
      error: (err) => alert(err.error?.message || 'Error al comentar')
    });
  }

  startChat() {
    if (!this.user) return;
    this.messageService.startChatWith(this.user.id);
  }

  formatDate(date: string): string {
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

  formatJoinDate(date: string): string {
    if (!date) return 'Hace tiempo';
    const joinDate = new Date(date);
    return joinDate.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  }
}
       