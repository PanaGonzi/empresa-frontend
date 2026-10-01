import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Tarea, TareaPeticion } from './tarea';

@Injectable({ providedIn: 'root' })
export class TareaService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/tareas';

  listar(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(this.url);
  }

  crear(peticion: TareaPeticion): Observable<Tarea> {
    return this.http.post<Tarea>(this.url, peticion);
  }

  actualizar(id: number, peticion: TareaPeticion): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.url}/${id}`, peticion);
  }

  borrar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
