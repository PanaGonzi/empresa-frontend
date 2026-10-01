import { Component } from '@angular/core';
import { Tareas } from './tareas/tareas';

@Component({
  imports: [Tareas],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
