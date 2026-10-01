import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Tarea } from './tarea';
import { TareaService } from './tarea.service';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.html',
  styleUrl: './tareas.scss',
})
export class Tareas implements OnInit {
  private readonly servicio = inject(TareaService);

  protected readonly tareas = signal<Tarea[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly pendientes = computed(() => this.tareas().filter((t) => !t.completada).length);

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.servicio.listar().subscribe({
      next: (tareas) => {
        this.tareas.set(tareas);
        this.error.set(null);
      },
      error: () => this.error.set('No se pudieron cargar las tareas'),
    });
  }

  protected crear(entrada: HTMLInputElement): void {
    const titulo = entrada.value.trim();
    if (!titulo) {
      return;
    }
    this.servicio.crear({ titulo }).subscribe({
      next: (nueva) => {
        this.tareas.update((lista) => [nueva, ...lista]);
        entrada.value = '';
        this.error.set(null);
      },
      error: () => this.error.set('No se pudo crear la tarea'),
    });
  }

  protected alternar(tarea: Tarea): void {
    this.servicio.actualizar(tarea.id, { titulo: tarea.titulo, completada: !tarea.completada }).subscribe({
      next: (actualizada) =>
        this.tareas.update((lista) => lista.map((t) => (t.id === actualizada.id ? actualizada : t))),
      error: () => this.error.set('No se pudo actualizar la tarea'),
    });
  }

  protected borrar(tarea: Tarea): void {
    this.servicio.borrar(tarea.id).subscribe({
      next: () => this.tareas.update((lista) => lista.filter((t) => t.id !== tarea.id)),
      error: () => this.error.set('No se pudo borrar la tarea'),
    });
  }
}
