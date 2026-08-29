# InsureHub

**InsureHub** es una plataforma interna de gestión de seguros — el tipo de herramienta que usaría el equipo de una aseguradora para llevar el día a día de sus **clientes**, **pólizas** y **siniestros**. Es una SPA (single-page application) construida en Angular, con datos ficticios pero coherentes entre sí (un cliente tiene pólizas, una póliza puede tener siniestros asociados), pensada como proyecto de portfolio / preparación técnica.

🔗 **Demo en producción:** https://insurehub-yagomateos-projects.vercel.app
📦 **Repositorio:** https://github.com/yagomateos/insurehub
📖 **Repaso de conceptos de Angular usados:** [`GUIA-ANGULAR-ENTREVISTA.md`](./GUIA-ANGULAR-ENTREVISTA.md)

**Acceso de demo:**
```
Correo:      yago.mateos@insurehub.com
Contraseña:  Insurehub2026
```

---

## 1. Qué hace la aplicación

Tras iniciar sesión, la app ofrece:

- **Dashboard** — KPIs (pólizas activas, clientes, siniestros abiertos/pendientes) con variación respecto al mes anterior, gráfico de evolución de siniestros (12 meses), gráfico de pólizas por tipo, y una tabla de siniestros recientes.
- **Clientes** — listado con búsqueda, filtro por estado, orden por columnas, paginación y exportación a CSV; ficha de detalle por cliente con pestañas (Información / Pólizas / Siniestros / Actividad) y creación de pólizas o siniestros directamente desde ahí.
- **Pólizas** — listado con búsqueda, filtro por tipo y estado, y orden por fecha de inicio, renovación o prima.
- **Siniestros** — listado con búsqueda, filtro por estado y orden por fecha o importe; ficha de detalle con línea de tiempo del proceso (Presentado → En revisión → Evaluación → Aprobado → Cerrado), historial de cambios de estado, documentación y acciones (Aprobar / Rechazar / Solicitar información / Cerrar).
- **Perfil** y **Configuración** — datos del usuario, cambio de contraseña, preferencias de notificaciones.
- **Autenticación** — login con validación, "recordarme", recuperación de contraseña, sesión JWT simulada con expiración, y rutas protegidas.

Todos los formularios de creación/edición (cliente, póliza, siniestro) tienen validación en tiempo real, estados de carga y confirmación mediante notificaciones (toasts).

---

## 2. Stack técnico

| Área | Tecnología |
|---|---|
| Framework | Angular 20 (standalone components, sin `NgModule`) |
| Lenguaje | TypeScript en modo `strict` |
| Estado de UI | Angular Signals (`signal`, `computed`, `effect`) |
| Async / streams | RxJS |
| Formularios | Reactive Forms |
| Estilos | Tailwind CSS v4 |
| Routing | Angular Router con *lazy loading* por componente |
| Auth | Guards e interceptor HTTP funcionales, JWT simulado |
| Tests | Jasmine + Karma |
| Despliegue | Vercel (CI/CD automático desde `master`) |

---

## 3. Estructura del proyecto

El código vive en `src/app/` y sigue una arquitectura **por dominio (feature-based)**, no por tipo de archivo. La idea: si buscas algo relacionado con "clientes", todo está dentro de `features/customers/`; no hay que rebuscar entre carpetas genéricas de `components/`, `services/`, etc. repartidas por todo el proyecto.

```
src/app/
│
├── core/                          # Todo lo transversal a la app (una sola vez)
│   ├── auth/
│   │   ├── auth.models.ts         # AuthUser, LoginCredentials, AuthSession
│   │   └── auth.service.ts        # Login/logout, sesión, JWT simulado
│   ├── guards/
│   │   └── auth.guard.ts          # authGuard (rutas protegidas) y guestGuard (login)
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # Añade el Bearer token, gestiona 401
│   ├── models/                    # Interfaces de dominio: Customer, Policy, Claim
│   └── services/
│       ├── mock-data.service.ts   # "Base de datos" en memoria (signals) + datos semilla
│       ├── toast.service.ts       # Sistema de notificaciones
│       └── ui-state.service.ts    # Estado de interfaz global (sidebar, loading global)
│
├── shared/                        # Componentes reutilizables SIN lógica de negocio
│   ├── components/                # Button, Badge, Card, Modal, Tabs, Pagination,
│   │                               # Avatar, DropdownMenu, LineChart, DonutChart...
│   ├── directives/
│   │   └── click-outside.directive.ts
│   └── utils/
│       ├── status-styles.ts       # Mapea estado → color/etiqueta de badge
│       └── csv-export.ts          # Exportar tablas a CSV
│
├── layout/                        # El "esqueleto" visual una vez autenticado
│   ├── shell/                     # Sidebar + header + <router-outlet>
│   ├── sidebar/                   # Navegación lateral (colapsable)
│   └── header/                    # Breadcrumb, buscador, notificaciones, menú de usuario
│
├── features/                      # Una carpeta por dominio de negocio
│   ├── auth/
│   │   ├── login/
│   │   └── forgot-password/
│   ├── dashboard/
│   ├── customers/
│   │   ├── customers-list/        # Listado + filtros + paginación
│   │   ├── customer-detail/       # Ficha con pestañas
│   │   └── customer-form/         # Alta / edición (modal)
│   ├── policies/
│   │   ├── policies-list/
│   │   └── policy-form/
│   ├── claims/
│   │   ├── claims-list/
│   │   ├── claim-detail/          # Línea de tiempo + acciones
│   │   └── claim-form/
│   ├── profile/
│   ├── settings/
│   └── errors/
│       ├── not-found/             # Página 404
│       └── unauthorized/          # Página 401
│
└── app.routes.ts                  # Único punto donde se define el árbol de rutas
```

**Regla que sigue todo el proyecto:** un componente en `features/` puede usar cosas de `core/` y de `shared/`, pero nunca al revés — ni `core/` ni `shared/` conocen la existencia de una feature concreta. Así cualquier feature se puede borrar sin romper el resto de la app.

### ¿Por qué existen `core` y `shared` como carpetas separadas?

- **`core/`** — código del que solo hay (y debe haber) **una instancia** en toda la app: el servicio de autenticación, el interceptor, los guards, el "backend" simulado. Si algo de aquí se duplicara, tendrías dos sesiones de usuario distintas o dos "bases de datos" en memoria distintas.
- **`shared/`** — piezas de interfaz **sin conocimiento del dominio**: un `ui-button` no sabe qué es un cliente ni una póliza, solo sabe pintar un botón. Esto permite reutilizarlo en cualquier feature nueva sin arrastrar dependencias de negocio.

---

## 4. Datos de la aplicación

No hay backend real: `MockDataService` (`core/services/mock-data.service.ts`) genera un conjunto de datos **relacionados entre sí** de forma determinista (mismo resultado en cada arranque) al iniciar la app:

- 64 clientes, con nombre, ciudad, contacto y estado (activo/inactivo/pendiente).
- ~120-130 pólizas repartidas entre esos clientes (1 a 3 por cliente; tipos: Auto, Hogar, Salud, Vida).
- ~70-90 siniestros asociados a esas pólizas, cada uno con su propio historial de cambios de estado.

Todo se mantiene en signals en memoria durante la sesión del navegador: crear un cliente, una póliza o un siniestro desde la interfaz actualiza esos signals al momento (sin recargar la página), pero se pierde al refrescar — es intencional, ya que el objetivo es demostrar el flujo de UI/estado, no persistencia real.

---

## 5. Cómo ejecutar el proyecto en local

Requiere Node **20.19+**, **22.12+** o **24+** (usa `nvm use` si tienes varias versiones instaladas).

```bash
npm install       # instalar dependencias
npm start         # ng serve → http://localhost:4200
```

Otros comandos útiles:

```bash
npm run build     # build de producción → dist/insurehub/browser
npm test          # tests unitarios (Jasmine + Karma, navegador headless)
npm run watch     # build en modo watch (desarrollo)
```

---

## 6. Despliegue

El proyecto está conectado a Vercel: cualquier `git push` a `master` dispara un build y despliegue automático a producción. La configuración específica de Vercel (comando de build, carpeta de salida, redirecciones para el enrutado de la SPA) está en [`vercel.json`](./vercel.json).

---

## 7. Para profundizar

Si lo que te interesa es **qué APIs concretas de Angular se usan y por qué** (signals vs. RxJS, guards funcionales, interceptors, control flow, `OnPush`...), con ejemplos sacados directamente del código y preguntas típicas de entrevista, consulta [`GUIA-ANGULAR-ENTREVISTA.md`](./GUIA-ANGULAR-ENTREVISTA.md).
