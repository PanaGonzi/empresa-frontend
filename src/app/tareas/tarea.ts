export interface Tarea {
  id: number;
  titulo: string;
  completada: boolean;
  creadaEn: string;
}

export interface TareaPeticion {
  titulo: string;
  completada?: boolean;
}
