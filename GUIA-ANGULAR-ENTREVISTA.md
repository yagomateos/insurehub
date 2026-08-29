# Guía de Angular usado en InsureHub — repaso para entrevista

Este documento explica, con ejemplos reales sacados del propio proyecto (rutas de archivo incluidas), cada concepto de Angular moderno que se ha usado. Está pensado para que lo repases y puedas explicar **qué hace, por qué se usa así, y cuándo NO usarlo** — que es lo que normalmente se pregunta en una entrevista técnica.

---

## 0. Antes de nada: qué versión es realmente

El enunciado original pedía "Angular 21", pero **esa versión no existe todavía** (a fecha de este proyecto, la última estable es Angular 20). El proyecto está construido con:

```
Angular CLI: 20.3.35
Angular:     20.3.30
Node:        22.20 / 24.20
```

Esto es importante decirlo en la entrevista si te preguntan: **da la misma respuesta técnica** decir "usé Angular 20, que ya trae todo lo que antes se consideraba experimental: standalone components por defecto, signals estables, guards e interceptors funcionales" que decir "Angular 21". Lo relevante no es el número de versión, son las APIs que dominas.

Compruébalo tú mismo en cualquier momento:
```bash
npx ng version
```

---

## 1. Arquitectura del proyecto (feature-based)

```
src/app/
├── core/                  → todo lo transversal, una sola vez en toda la app
│   ├── auth/               (AuthService, modelos de sesión)
│   ├── guards/              (authGuard, guestGuard)
│   ├── interceptors/        (authInterceptor)
│   ├── models/              (Customer, Policy, Claim)
│   └── services/            (MockDataService, ToastService, UiStateService)
├── shared/                 → componentes/reutilizables SIN lógica de negocio
│   ├── components/          (Button, Badge, Card, Modal, Tabs, Pagination…)
│   ├── directives/          (ClickOutsideDirective)
│   └── utils/                (status-styles, csv-export)
├── layout/                 → el "esqueleto" visual de la app ya autenticada
│   ├── shell/                (ShellComponent: sidebar + header + <router-outlet>)
│   ├── sidebar/
│   └── header/
├── features/                → una carpeta por dominio de negocio
│   ├── auth/ (login, forgot-password)
│   ├── dashboard/
│   ├── customers/ (list, detail, form)
│   ├── policies/  (list, form)
│   ├── claims/    (list, detail, form)
│   ├── profile/
│   └── settings/
└── app.routes.ts           → único punto donde se define el árbol de rutas
```

**Por qué esta estructura y no "todo en `components/`"**: así cualquier persona nueva en el proyecto encuentra el código por *dominio*, no por *tipo de archivo*. Es el patrón que usa el propio equipo de Angular en sus guías oficiales desde 2023 ("feature-based" / "folder-by-feature").

**Pregunta típica de entrevista**: *"¿Dónde meterías la lógica que decide si un cliente puede tener más de 3 pólizas?"* → En un método del `MockDataService` (o un servicio de dominio en `core`), nunca en el componente. Los componentes solo **piden** datos y **muestran** estado, no deciden reglas de negocio.

---

## 2. Standalone Components (sin NgModules)

Desde Angular 14 existen, desde Angular 17 son el default, y aquí se usan al 100%: **no hay ni un solo `NgModule`** en toda la app (ni `AppModule`, ni feature modules).

```ts
// src/app/features/dashboard/dashboard.component.ts
@Component({
  selector: 'app-dashboard',
  standalone: true,                 // no hace falta declararlo en ningún módulo
  imports: [RouterLink, DatePipe, CurrencyPipe, CardComponent, StatCardComponent, ...],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class DashboardComponent { }
```

Cada componente **declara sus propias dependencias** en `imports: []` — directivas, pipes, otros componentes. Si no lo usas en el template, no lo importas (y si lo importas sin usarlo, Angular te avisa en build: me pasó con `SkeletonComponent` en `policies-list` y tuve que quitarlo).

**Ventaja real que puedes contar en la entrevista**: lazy loading por componente individual (ver sección 6), sin necesidad de crear un módulo por feature solo para poder hacer `loadChildren`.

**Pregunta típica**: *"¿Qué son standalone components y qué problema resuelven?"* → Antes, todo componente tenía que declararse en un `NgModule`, lo que generaba mucho boilerplate y acoplaba el lazy-loading a nivel de módulo. Standalone permite que un componente sea autocontenido: declara sus imports y ya se puede cargar solo.

---

## 3. Signals — estado síncrono y reactivo

Los signals (estables desde Angular 17) se usan aquí para **todo el estado de interfaz**: filtros, paginación, modales abiertos, usuario actual, sesión.

### 3.1 `signal()` — estado mutable
```ts
// src/app/core/services/ui-state.service.ts
readonly sidebarCollapsed = signal(false);
readonly mobileDrawerOpen = signal(false);

toggleSidebar(): void {
  this.sidebarCollapsed.update((v) => !v);   // update() = nuevo valor basado en el anterior
}
```
```ts
// src/app/features/customers/customers-list/customers-list.component.ts
protected readonly search = signal('');
protected readonly page = signal(1);
protected readonly sortDir = signal<SortDir>('asc');
```

Formas de escribir un signal:
- `.set(valor)` — reemplaza el valor entero.
- `.update(prev => nuevo)` — calcula el nuevo valor a partir del anterior.

En el proyecto hay **27 signals** repartidos entre servicios y componentes.

### 3.2 `computed()` — estado derivado, memoizado automáticamente
```ts
// src/app/features/customers/customers-list/customers-list.component.ts
protected readonly filteredCustomers = computed(() => {
  const term = this.search().trim().toLowerCase();   // se "suscribe" solo leyendo
  const status = this.statusFilter();
  let list = this.data.customers();
  // ...filtra y ordena...
  return sorted;
});

protected readonly pagedCustomers = computed(() => {
  const start = (this.page() - 1) * this.pageSize;
  return this.filteredCustomers().slice(start, start + this.pageSize);
});
```
Lo importante para la entrevista: **un `computed` solo se recalcula cuando cambia algún signal que lee dentro**. Aquí `pagedCustomers` depende de `filteredCustomers` (que a su vez depende de `search`, `statusFilter`, `sortDir`...) y de `page`. Angular construye ese grafo de dependencias automáticamente, sin que tú declares nada — a diferencia de un `useMemo` de React, donde declaras el array de dependencias a mano.

### 3.3 `effect()` — efecto secundario cuando cambia un signal
Se usa solo donde de verdad hace falta sincronizar algo *fuera* del sistema reactivo de Angular (aquí: rellenar un formulario reactivo cuando cambia el `@Input` signal del cliente a editar):

```ts
// src/app/features/customers/customer-form/customer-form.component.ts
readonly customer = input<Customer | null>(null);

constructor() {
  effect(() => {
    const c = this.customer();
    if (c) {
      this.form.patchValue({ firstName: c.firstName, lastName: c.lastName, /* ... */ });
    } else {
      this.form.reset({ firstName: '', /* ... */ });
    }
  });
}
```

**Por qué no usar `effect()` para todo** (pregunta típica): porque `effect()` es para *efectos secundarios* (tocar el DOM, sincronizar con algo externo, un formulario). Si solo necesitas un valor derivado para pintarlo en el template, usa `computed()` — es más barato y más declarativo. El CLAUDE.md del proyecto lo deja explícito: *"`effect()` únicamente cuando sea necesario"*.

---

## 4. `input()` / `output()` — la nueva forma de comunicar componentes

Sustituyen a los decoradores `@Input()` / `@Output()` de toda la vida. Son **signals**, así que se leen como función y se pueden usar dentro de un `computed()`.

```ts
// src/app/shared/components/badge/badge.component.ts
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');   // input opcional con valor por defecto
  readonly dot = input(true);
}
```
```ts
// src/app/features/customers/customer-detail/customer-detail.component.ts
readonly id = input.required<string>();          // input obligatorio, tipado, sin '?' ni '!'
```
```ts
// src/app/shared/components/pagination/pagination.component.ts
readonly pageChange = output<number>();           // reemplaza a @Output() + EventEmitter
// ...
this.pageChange.emit(page);
```

El proyecto tiene **21 `input()`** y **9 `output()`**. Regla de oro que sigue todo el proyecto (y que puedes citar en la entrevista): *"los componentes hijos no modifican directamente el estado del padre; comunican mediante eventos (`output`) y el padre decide qué hacer"*. Ejemplo real: `ui-pagination` no sabe nada de clientes ni de `MockDataService`; solo emite `pageChange` y quien lo usa (`customers-list`) decide `this.page.set($event)`.

### Bonus: `withComponentInputBinding()`
```ts
// src/app/app.config.ts
provideRouter(routes, withComponentInputBinding())
```
Esto hace que el `:id` de la URL (`/customers/:id`) se inyecte **automáticamente** como `input.required<string>()` en el componente de la ruta, sin tener que hacer `ActivatedRoute.snapshot.paramMap.get('id')` a mano. Se ve en `customer-detail.component.ts` y `claim-detail.component.ts`.

---

## 5. Dependency Injection con `inject()`

Reemplaza la inyección por constructor en la mayoría de sitios modernos (aunque el constructor sigue funcionando y también se usa cuando hace falta, p. ej. para leer un `input()` en el constructor de `customer-form`).

```ts
// src/app/features/customers/customers-list/customers-list.component.ts
export class CustomersListComponent {
  private readonly data = inject(MockDataService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  ...
}
```

**18 usos de `inject()`** en el proyecto. Ventaja sobre el constructor que puedes explicar: `inject()` funciona en cualquier "contexto de inyección" (no solo en la clase del componente) — por eso los **guards funcionales** y los **interceptors funcionales** (siguiente sección) pueden usarlo, cosa que era imposible con la sintaxis antigua de guards/interceptors basados en clases.

---

## 6. Angular Router: lazy loading, guards e interceptors funcionales

### 6.1 Lazy loading por componente (`loadComponent`)
```ts
// src/app/app.routes.ts
{
  path: 'dashboard',
  data: { title: 'Dashboard', breadcrumb: [{ label: 'Dashboard' }] },
  loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
},
```
Cada una de las **13 rutas** con `loadComponent` genera su propio *chunk* JS que el navegador solo descarga cuando el usuario navega ahí (lo puedes comprobar en `dist/` tras `ng build`: verás `chunk-XXXX.js | dashboard-component | 14.71 kB`). Esto es lazy loading real, sin necesidad de un `NgModule` intermedio como antes de standalone.

### 6.2 Guards funcionales (`CanActivateFn`)
```ts
// src/app/core/guards/auth.guard.ts
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
};
```
Un guard funcional es **solo una función**, no una clase con `@Injectable()` que implemente `CanActivate`. Se registra así:
```ts
{ path: '', canActivate: [authGuard], loadComponent: () => import('./layout/shell/shell.component')... }
```
Aquí protejo **todo el árbol de rutas autenticadas de golpe** poniendo el guard en la ruta padre (`ShellComponent`), no ruta por ruta — así no se me puede olvidar proteger una ruta nueva.

También hay `guestGuard`: al revés, si ya tienes sesión no te deja volver a `/login`.

### 6.3 Interceptor funcional (`HttpInterceptorFn`)
```ts
// src/app/core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token();
  const authedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.handleUnauthorized();
        router.navigate(['/login'], { queryParams: { sessionExpired: true } });
      }
      return throwError(() => error);
    }),
  );
};
```
Se registra en `app.config.ts` con `provideHttpClient(withInterceptors([authInterceptor]))`. Esto es el flujo clásico de entrevista: **el componente nunca sabe que existe un JWT** — pide datos a un servicio, el servicio llama a `HttpClient`, y el interceptor añade el header y gestiona el 401 de forma centralizada. Si mañana cambia el esquema de auth, no tocas ni un componente.

### 6.4 Rutas anidadas + `data` para breadcrumb/título
```ts
{
  path: '',
  canActivate: [authGuard],
  loadComponent: () => ...ShellComponent,
  children: [
    { path: 'dashboard', data: {...}, loadComponent: ... },
    { path: 'customers', data: {...}, loadComponent: ... },
    { path: 'customers/:id', data: {...}, loadComponent: ... },
  ],
}
```
El `ShellComponent` (sidebar + header) se renderiza **una sola vez** y dentro va cambiando el `<router-outlet>` con cada feature — así el sidebar no se destruye/recrea al navegar.

---

## 7. RxJS — dónde se usa y por qué (no todo es signals)

El CLAUDE.md del proyecto es explícito: *"usar RxJS para operaciones asíncronas y streams; no usarlo solo porque está disponible"*. Aquí RxJS aparece en:

### 7.1 Simular una llamada HTTP real (con latencia y error)
```ts
// src/app/core/auth/auth.service.ts
login(credentials: LoginCredentials): Observable<AuthUser> {
  const isValid = ...;
  if (!isValid) {
    return throwError(() => ({ status: 401, message: 'Correo o contraseña incorrectos.' })).pipe(delay(700));
  }
  return of(session).pipe(
    delay(700),                                  // simula latencia de red
    tap((s) => this.persistSession(s, credentials.rememberMe)),  // efecto secundario
    map((s) => s.user),                          // transforma el valor emitido
  );
}
```
El componente de login simplemente hace `.subscribe({ next, error })` — exactamente igual que si fuera un `HttpClient.post(...)` real. Es la forma correcta de que, el día de mañana, cambiar `of(...).pipe(delay(...))` por `this.http.post<AuthSession>('/api/login', credentials)` sea un cambio de una línea.

### 7.2 El propio interceptor (sección 6.3) — `catchError`, `throwError`.

### 7.3 Reaccionar a eventos del Router
```ts
// src/app/layout/header/header.component.ts
private readonly meta$ = this.router.events.pipe(
  filter((e): e is NavigationEnd => e instanceof NavigationEnd),
  startWith(null),
  map(() => { /* calcula título y breadcrumb a partir de route.data */ }),
);
```

### 7.4 Interoperar RxJS ↔ Signals con `toSignal`
```ts
protected readonly meta = toSignal(this.meta$, { initialValue: { title: 'InsureHub', breadcrumb: [] } });
```
Esto es de `@angular/core/rxjs-interop`. **Pregunta típica de entrevista**: *"¿cuándo usarías `toSignal` en vez de un `async` pipe?"* → cuando necesitas leer ese valor de forma síncrona en TypeScript (dentro de otro `computed`, o en lógica de la clase), no solo pintarlo en el template. Si solo lo vas a pintar, el `async` pipe sigue siendo válido y más simple.

También se usa en `claim-form.component.ts` para convertir `form.controls.customerId.valueChanges` (un Observable) en un signal y así poder derivar con `computed()` la lista de pólizas disponibles cuando cambia el cliente seleccionado — mezcla real de RxJS (evento del formulario) + signals (estado derivado).

**Regla que puedes citar textualmente en la entrevista**: *signals para estado local/síncrono de UI (filtros, modal abierto, loading), RxJS para streams asíncronos y composición de eventos (HTTP, navegación, valueChanges de formularios). No convertir automáticamente todo Observable en signal.*

---

## 8. Reactive Forms

Todos los formularios (`login`, `customer-form`, `policy-form`, `claim-form`, `profile`) usan `ReactiveFormsModule`, nunca `ngModel`/template-driven.

```ts
// src/app/features/auth/login/login.component.ts
protected readonly form = this.fb.nonNullable.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  rememberMe: [true],
});

protected readonly emailError = computed(() => {
  const control = this.form.controls.email;
  if (!control.touched && !control.dirty) return '';
  if (control.hasError('required')) return 'El correo electrónico es obligatorio.';
  if (control.hasError('email')) return 'Introduce un correo electrónico válido.';
  return '';
});
```

Puntos a destacar en la entrevista:
- `fb.nonNullable.group(...)` — evita que TypeScript infiera los controles como `string | null`, muy útil combinado con `strict: true`.
- Los mensajes de error se calculan con `computed()` (signals), no con lógica imperativa en el template — mantiene el HTML declarativo.
- Validación cruzada dependiente (formulario de siniestro): el control `policyId` se resetea y se filtran las pólizas disponibles cuando cambia `customerId`, usando `valueChanges` + `toSignal` + `computed` juntos (sección 7.4).
- Estados de UI cubiertos en cada formulario: `required`, error de formato, `loading` (signal `saving`), éxito (toast), error de envío (`submitError` signal), `disabled` mientras guarda.

---

## 9. Nueva sintaxis de control de flujo en templates

Desde Angular 17, `@if` / `@for` / `@switch` sustituyen a `*ngIf` / `*ngFor` / `*ngSwitch`. Se usan en **todo** el proyecto, no hay ni un solo `*ngIf` clásico.

```html
<!-- src/app/features/customers/customer-detail/customer-detail.component.ts -->
@if (customer(); as customer) {
  <div class="space-y-6"> ... </div>
} @else {
  <ui-empty-state title="Cliente no encontrado" ... />
}

@switch (activeTab()) {
  @case ('info') { ... }
  @case ('policies') { ... }
  @case ('claims') { ... }
  @case ('activity') { ... }
}
```
```html
<!-- src/app/features/customers/customers-list/customers-list.component.ts -->
@for (customer of pagedCustomers(); track customer.id) {
  <tr>...</tr>
}
```

Diferencias clave que puedes explicar:
- `@for` **obliga** a poner `track` (aquí siempre `track item.id`) — evita el típico bug de olvidar `trackBy` en `*ngFor`, que causaba re-renders innecesarios de toda la lista.
- No hace falta importar `CommonModule` para usarlas — son sintaxis del compilador, no directivas.
- `@if (x(); as y)` te deja capturar el valor ya "desenvuelto" del signal, evitando llamar `x()` varias veces.

---

## 10. `ChangeDetectionStrategy.OnPush` en todos los componentes

**38 componentes** del proyecto declaran `changeDetection: ChangeDetectionStrategy.OnPush`. Combinado con signals esto es casi gratis: un componente `OnPush` solo se re-renderiza cuando cambia un `@Input`/signal que lee, en vez de en cada ciclo de detección de cambios de Angular (el comportamiento por defecto, mucho más costoso en apps grandes).

**Pregunta típica**: *"¿Por qué OnPush + signals funciona tan bien junto?"* → porque los signals notifican a Angular exactamente qué ha cambiado (fine-grained reactivity), así que con `OnPush` Angular sabe con precisión cuándo re-renderizar ese componente en concreto, sin tener que recorrer todo el árbol de componentes comprobando si algo cambió.

---

## 11. Servicios y estado compartido (patrón `providedIn: 'root'`)

```ts
// src/app/core/services/mock-data.service.ts
@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly _customers = signal<Customer[]>([]);
  readonly customers = this._customers.asReadonly();   // expone lectura, no escritura
  ...
}
```
Patrón usado en `MockDataService`, `AuthService`, `ToastService`, `UiStateService`: **estado privado mutable + signal público de solo lectura** (`.asReadonly()`), con métodos explícitos (`addCustomer`, `updateClaimStatus`...) como única forma de mutar. Es el equivalente, con signals, a lo que en NgRx/state management se llama "single source of truth" — el componente nunca muta el array de clientes directamente, siempre llama a un método del servicio.

---

## 12. Testing (Jasmine + Karma + TestBed)

```ts
// src/app/core/auth/auth.service.spec.ts
it('authenticates with the demo credentials and stores the session', (done) => {
  service.login({ email: 'yago.mateos@insurehub.com', password: 'Insurehub2026', rememberMe: true })
    .subscribe((user) => {
      expect(user.name).toBe('Yago Mateos');
      expect(service.isAuthenticated()).toBe(true);
      done();
    });
});
```
```ts
// src/app/core/guards/auth.guard.spec.ts
const result = TestBed.runInInjectionContext(() => authGuard(route, state));
```
`TestBed.runInInjectionContext` es necesario porque un guard funcional usa `inject()` — solo funciona dentro de un "contexto de inyección" activo, así que en el test hay que crear ese contexto manualmente. Es un detalle muy concreto que demuestra que entiendes cómo funciona `inject()` por dentro.

---

## 13. Preguntas que te pueden hacer y cómo responderlas con este proyecto

| Pregunta | Respuesta apoyada en el proyecto |
|---|---|
| "¿Signals o RxJS?" | "Depende del tipo de estado: uso signals para estado síncrono de UI (filtros, modales, paginación) y RxJS para streams async (HTTP, eventos del router, valueChanges). Lo tengo mezclado con `toSignal` cuando necesito leer un stream de forma síncrona." |
| "¿Cómo proteges rutas?" | "Guards funcionales (`CanActivateFn`) con `inject()`, puestos en la ruta padre para proteger todo un subárbol de una vez." |
| "¿Cómo añades el token JWT a las peticiones?" | "Un interceptor funcional (`HttpInterceptorFn`) registrado con `provideHttpClient(withInterceptors([...]))`, que además gestiona el 401 centralizadamente." |
| "¿Por qué standalone y no NgModules?" | "Menos boilerplate, cada componente declara sus propias dependencias, y permite lazy loading por componente sin necesidad de un módulo intermedio." |
| "¿Cómo optimizas el rendimiento de renderizado?" | "OnPush en todos los componentes + signals, que notifican cambios de forma granular." |
| "¿Cómo estructuras una app grande?" | "Feature-based: `core` (transversal, una instancia), `shared` (componentes reutilizables sin lógica de negocio), `features` (una carpeta por dominio)." |
| "¿Diferencia entre `computed` y `effect`?" | "`computed` es para *derivar* un valor de forma pura y se usa en el template o en otra lógica de lectura; `effect` es para *efectos secundarios* cuando cambia un signal (aquí: sincronizar un formulario reactivo con un `input()`)." |

---

## 14. Cómo comprobarlo tú mismo antes de la entrevista

```bash
cd /Users/yagomateos/Proyectos/InsureHub
npm start                # arranca en localhost:4200
npx ng test               # 7 tests, todos deberían pasar
npx ng build               # build de producción, comprueba que no hay warnings
```

Y si quieres contar cifras concretas en la entrevista: el proyecto tiene **27 signals**, **19 usos de `computed`**, **21 `input()`**, **9 `output()`**, **18 `inject()`**, **13 rutas con lazy loading**, **38 componentes con `OnPush`**, 1 guard funcional (con variante `guestGuard`), 1 interceptor funcional, y 0 `NgModule`.
