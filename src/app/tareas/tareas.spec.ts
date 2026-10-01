import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tarea } from './tarea';
import { Tareas } from './tareas';

const tarea = (id: number, titulo: string, completada = false): Tarea => ({
  id,
  titulo,
  completada,
  creadaEn: '2026-10-01T10:00:00',
});

describe('Tareas', () => {
  let fixture: ComponentFixture<Tareas>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tareas],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Tareas);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  async function cargar(tareas: Tarea[]): Promise<void> {
    http.expectOne('/api/tareas').flush(tareas);
    await fixture.whenStable();
  }

  it('muestra el estado vacio cuando no hay tareas', async () => {
    await cargar([]);
    expect(el.textContent).toContain('No hay tareas todavía');
  });

  it('lista las tareas y cuenta las pendientes', async () => {
    await cargar([tarea(1, 'Montar CI'), tarea(2, 'Escribir tests', true)]);
    expect(el.querySelectorAll('li').length).toBe(2);
    expect(el.textContent).toContain('1 pendiente(s) de 2');
    expect(el.querySelector('li.hecha')?.textContent).toContain('Escribir tests');
  });

  it('crea una tarea nueva y la muestra arriba', async () => {
    await cargar([tarea(1, 'Existente')]);

    const entrada = el.querySelector('form input') as HTMLInputElement;
    entrada.value = '  Nueva tarea  ';
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));

    const req = http.expectOne({ method: 'POST', url: '/api/tareas' });
    expect(req.request.body).toEqual({ titulo: 'Nueva tarea' });
    req.flush(tarea(2, 'Nueva tarea'));
    await fixture.whenStable();

    const items = el.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Nueva tarea');
    expect(entrada.value).toBe('');
  });

  it('no envia nada si el titulo esta vacio', async () => {
    await cargar([]);
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    http.expectNone({ method: 'POST', url: '/api/tareas' });
  });

  it('marca una tarea como completada', async () => {
    await cargar([tarea(1, 'Montar CI')]);

    (el.querySelector('li input[type=checkbox]') as HTMLInputElement).click();

    const req = http.expectOne({ method: 'PUT', url: '/api/tareas/1' });
    expect(req.request.body).toEqual({ titulo: 'Montar CI', completada: true });
    req.flush(tarea(1, 'Montar CI', true));
    await fixture.whenStable();

    expect(el.querySelector('li')?.classList).toContain('hecha');
  });

  it('borra una tarea', async () => {
    await cargar([tarea(1, 'Montar CI')]);

    (el.querySelector('button.borrar') as HTMLButtonElement).click();
    http.expectOne({ method: 'DELETE', url: '/api/tareas/1' }).flush(null);
    await fixture.whenStable();

    expect(el.querySelectorAll('li').length).toBe(0);
    expect(el.textContent).toContain('No hay tareas todavía');
  });

  it('muestra un error si falla la carga', async () => {
    http.expectOne('/api/tareas').flush('fallo', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('No se pudieron cargar');
  });
});
