import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../services/search.service';

interface MentionUser {
  id: number;
  name: string;
  username: string;
  avatar?: string;
}

@Component({
  selector: 'app-mention-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible && users.length > 0) {
      <div class="absolute left-0 bottom-full mb-2 w-64 bg-dark-card rounded-lg border border-dark-border shadow-2xl z-50 max-h-64 overflow-y-auto">
        @for (user of users; track user.id; let i = $index) {
          <button (click)="selectUser(user)"
                  [class.bg-dark-hover]="selectedIndex === i"
                  class="w-full p-3 flex items-center space-x-3 hover:bg-dark-hover transition text-left">
            @if (user.avatar && user.avatar.startsWith('http')) {
              <img [src]="user.avatar" [alt]="user.name"
                   class="w-8 h-8 rounded-full border-2 border-primary/30">
            } @else {
              <div class="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
            }
            <div class="flex-1 min-w-0">
              <div class="text-white font-semibold text-sm truncate">{{ user.name }}</div>
              <div class="text-gray-secondary text-xs truncate">@{{ user.username }}</div>
            </div>
          </button>
        }
      </div>
    }
  `
})
export class MentionDropdownComponent implements OnInit, OnChanges {
  @Input() query = '';
  @Output() userSelected = new EventEmitter<MentionUser>();

  users: MentionUser[] = [];
  visible = false;
  selectedIndex = 0;

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    console.log('⚙️ MentionDropdown inicializado');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['query'] && changes['query'].currentValue !== changes['query'].previousValue) {
      const query = changes['query'].currentValue;
      console.log('🔍 Query cambiado a:', query);

      if (query && query.length >= 1) {
        this.search(query);
      } else {
        this.hide();
      }
    }
  }

  search(query: string) {
    this.searchService.searchUsers(query).subscribe({
      next: (users) => {
        console.log('✅ Usuarios encontrados:', users);
        this.users = users;
        this.visible = users.length > 0;
        this.selectedIndex = 0;
      },
      error: (err) => {
        console.error('❌ Error buscando usuarios:', err);
        this.hide();
      }
    });
  }

  selectUser(user: MentionUser) {
    console.log('👤 Usuario seleccionado:', user);
    this.userSelected.emit(user);
    this.hide();
  }

  hide() {
    this.visible = false;
    this.users = [];
    this.selectedIndex = 0;
  }

  navigateUp() {
    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
  }

  navigateDown() {
    this.selectedIndex = Math.min(this.users.length - 1, this.selectedIndex + 1);
  }

  selectCurrent() {
    if (this.users[this.selectedIndex]) {
      this.selectUser(this.users[this.selectedIndex]);
    }
  }
}
