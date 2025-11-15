import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-dark-bg">
      <app-navbar />
      <div class="flex">
        <app-sidebar class="hidden lg:block" />
        <main class="flex-1 lg:ml-64 min-h-screen">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  ngOnInit() {
    // Aplicar tema guardado
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    }
  }
}