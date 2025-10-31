import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
      <!-- Hero Section -->
      <div class="bg-gradient-to-br from-primary/20 via-primary-dark/20 to-primary-light/20 rounded-3xl p-12 border border-primary/30 text-center">
        <h1 class="text-5xl font-bold text-white mb-4">Acerca de DevFolio</h1>
        <p class="text-xl text-gray-text max-w-2xl mx-auto">
          Una plataforma innovadora para desarrolladores que buscan compartir sus proyectos,
          colaborar y crecer juntos en comunidad.
        </p>
      </div>

      <!-- Mission -->
      <div class="bg-dark-card rounded-2xl p-8 border border-dark-border">
        <div class="flex items-start space-x-4 mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-primary-light flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white mb-3">Nuestra Misión</h2>
            <p class="text-gray-text leading-relaxed">
              DevFolio nace con el objetivo de crear un espacio donde desarrolladores de todos los niveles
              puedan mostrar su trabajo, aprender de otros y construir conexiones significativas. Creemos
              en el poder de la comunidad y el código abierto para impulsar el crecimiento profesional.
            </p>
          </div>
        </div>
      </div>

      <!-- Why We Created It -->
      <div class="bg-dark-card rounded-2xl p-8 border border-dark-border">
        <div class="flex items-start space-x-4 mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-dark to-primary flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white mb-3">¿Por Qué Lo Creamos?</h2>
            <p class="text-gray-text leading-relaxed mb-4">
              Como estudiantes y desarrolladores, nos dimos cuenta de la necesidad de tener un espacio
              dedicado donde poder:
            </p>
            <ul class="space-y-2 text-gray-text">
              <li class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Compartir proyectos de manera profesional</span>
              </li>
              <li class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Recibir feedback constructivo de la comunidad</span>
              </li>
              <li class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Colaborar en proyectos de código abierto</span>
              </li>
              <li class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Aprender de las experiencias de otros desarrolladores</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Team -->
      <div class="bg-dark-card rounded-2xl p-8 border border-dark-border">
        <h2 class="text-3xl font-bold text-white mb-8 text-center">Nuestro Equipo</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (member of team; track member.name) {
            <div class="bg-dark-bg rounded-xl p-6 border border-dark-border hover:border-primary/50 transition group">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 rounded-full bg-gradient-to-r from-primary via-primary-dark to-primary-light flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition">
                  {{ member.name.charAt(0) }}
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">{{ member.name }}</h3>
                  <p class="text-primary">{{ member.role }}</p>
                </div>
              </div>
              <p class="text-gray-text mt-4 leading-relaxed">{{ member.bio }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Features -->
      <div class="bg-dark-card rounded-2xl p-8 border border-dark-border">
        <h2 class="text-3xl font-bold text-white mb-8 text-center">Características Principales</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-6">
            <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-primary to-primary-light flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Portafolio de Proyectos</h3>
            <p class="text-gray-text">Muestra tus mejores trabajos con descripciones detalladas y enlaces</p>
          </div>

          <div class="text-center p-6">
            <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-primary-dark to-primary flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Foros de Discusión</h3>
            <p class="text-gray-text">Debate, pregunta y comparte conocimiento con la comunidad</p>
          </div>

          <div class="text-center p-6">
            <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-primary-light to-primary-dark flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Red de Desarrolladores</h3>
            <p class="text-gray-text">Conecta con otros devs, sigue sus proyectos y colabora</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {
  team = [
    {
      name: 'Eytan Vidal',
      role: 'Full Stack Developer',
      bio: 'Apasionado por crear experiencias de usuario excepcionales y arquitecturas escalables.'
    },
    {
      name: 'Luis Delgado',
      role: 'Backend Developer',
      bio: 'Especializado en APIs robustas y optimización de bases de datos.'
    },
    {
      name: 'Gabriel Flores',
      role: 'Frontend Developer',
      bio: 'Enfocado en interfaces modernas y responsive con las últimas tecnologías.'
    },
    {
      name: 'Luis Figueroa',
      role: 'DevOps Engineer',
      bio: 'Experto en infraestructura cloud y procesos de CI/CD automatizados.'
    }
  ];
}