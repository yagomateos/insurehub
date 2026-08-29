# CLAUDE.md — InsureHub

## 1. Objetivo del proyecto

InsureHub es una aplicación empresarial de gestión de seguros desarrollada para preparar una prueba técnica de frontend.

La aplicación gestiona:

* Clientes
* Pólizas
* Siniestros
* Dashboard
* Autenticación
* Perfil de usuario

El stack objetivo es:

* Angular 21
* TypeScript
* RxJS
* Angular Signals
* Reactive Forms
* Angular Router
* HTTP Client
* Jasmine / Karma
* Playwright
* ESLint
* Docker
* GitHub Actions

La aplicación debe priorizar calidad, claridad, mantenibilidad y simplicidad.

---

# 2. PRINCIPIO PRINCIPAL

## Escribir la menor cantidad de código necesaria.

No añadir código, archivos, abstracciones, dependencias o patrones arquitectónicos que no sean necesarios para resolver el problema.

Antes de crear algo nuevo:

1. Buscar si ya existe.
2. Comprobar si puede reutilizarse.
3. Comprobar si puede resolverse de forma más sencilla.
4. Crear código nuevo únicamente si aporta una necesidad real.

La cantidad de código NO es una medida de calidad.

Una solución sencilla y clara es preferible a una solución excesivamente abstracta.

---

# 3. KISS

Aplicar siempre:

**Keep It Simple, Stupid.**

Preferir:

```text
solución sencilla
```

frente a:

```text
abstracción
→ factory
→ adapter
→ repository
→ service
→ mapper
```

si esa arquitectura no aporta un beneficio real.

No implementar patrones de diseño únicamente para demostrar que se conocen.

---

# 4. YAGNI

Aplicar:

**You Aren't Gonna Need It.**

No desarrollar funcionalidades futuras que todavía no sean necesarias.

No crear:

* APIs genéricas
* Servicios genéricos
* Componentes genéricos
* Abstracciones futuras
* Interfaces especulativas
* Configuraciones que todavía no se utilizan

Implementar únicamente lo necesario para el requisito actual.

---

# 5. DRY

Evitar duplicación.

Antes de copiar lógica:

1. Buscar código existente.
2. Comprobar si puede reutilizarse.
3. Si la duplicación es pequeña y abstraerla empeora la legibilidad, mantenerla.

No crear una abstracción únicamente para eliminar dos líneas duplicadas.

La legibilidad tiene prioridad sobre una aplicación excesiva de DRY.

---

# 6. Arquitectura

Utilizar arquitectura basada en funcionalidades.

Estructura objetivo:

```text
src/app/

core/
├── auth/
├── guards/
├── interceptors/
└── services/

shared/
├── components/
├── pipes/
└── directives/

features/
├── dashboard/
├── customers/
├── policies/
└── claims/

app.routes.ts
```

## Core

Contiene servicios y funcionalidades globales de la aplicación.

Ejemplos:

* autenticación
* interceptores
* guards
* configuración global

No colocar componentes específicos de una funcionalidad en `core`.

---

## Shared

Contiene componentes realmente reutilizables.

Ejemplos:

* Button
* Modal
* Toast
* Table
* Badge
* Pagination
* Loading
* EmptyState

No colocar componentes de negocio específicos en `shared`.

Un componente debe demostrar que tiene una necesidad real de reutilización antes de introducirse aquí.

---

## Features

Cada área de negocio debe mantenerse separada:

```text
customers/
policies/
claims/
dashboard/
```

La lógica específica de cada dominio debe permanecer dentro de su feature.

---

# 7. Angular 21

Utilizar las capacidades modernas de Angular.

Preferir:

* Standalone Components
* `inject()`
* Signals
* `input()`
* `output()`
* `computed()`
* `effect()` únicamente cuando sea necesario
* `@if`
* `@for`
* Lazy Loading
* Reactive Forms

No utilizar patrones antiguos si existe una alternativa moderna de Angular 21 claramente mejor.

---

# 8. Signals

Utilizar Signals para estado local y estado de UI.

Ejemplos:

* loading
* filtros
* usuario actual
* menú abierto/cerrado
* elemento seleccionado
* datos derivados

Preferir:

```ts
signal()
computed()
```

cuando el estado sea local o síncrono.

No convertir automáticamente todos los Observables en Signals.

Elegir la herramienta según el problema.

---

# 9. RxJS

Utilizar RxJS para operaciones asíncronas y streams.

Especialmente:

* HTTP
* búsqueda
* debounce
* cancelación de peticiones
* composición de streams
* errores

Evitar operadores innecesarios.

No utilizar RxJS únicamente porque está disponible.

Cuando sea suficiente una solución sencilla, utilizarla.

---

# 10. HTTP

Centralizar las peticiones HTTP en servicios.

Los componentes no deben contener directamente llamadas HTTP.

Ejemplo:

```text
Component
    ↓
Service
    ↓
HttpClient
    ↓
API
```

No crear una capa Repository salvo que exista una necesidad real.

---

# 11. Servicios

Crear servicios cuando exista lógica compartida, acceso a API o lógica que no pertenezca al componente.

No crear:

```text
CustomerHelperService
CustomerUtilityService
CustomerManagerService
CustomerProcessorService
```

si un único servicio o función resuelve correctamente el problema.

Evitar servicios gigantes.

---

# 12. Componentes

Los componentes deben encargarse principalmente de:

* presentación
* interacción
* composición de componentes
* estado específico de UI

Evitar colocar lógica empresarial compleja dentro de componentes.

Pero tampoco crear servicios para cada pequeña función.

Buscar un equilibrio razonable.

---

# 13. Inputs y Outputs

Utilizar la API moderna de Angular:

```ts
input()
output()
```

cuando corresponda.

Los componentes hijos no deben modificar directamente el estado del componente padre.

Utilizar eventos para comunicar acciones.

---

# 14. Routing

Utilizar Angular Router con:

* Lazy Loading
* Guards
* rutas claras
* páginas 404

Las features principales deben cargarse de forma lazy cuando tenga sentido.

---

# 15. Autenticación

La autenticación debe estar centralizada.

Componentes principales:

```text
AuthService
AuthGuard
AuthInterceptor
```

Flujo:

```text
Login
 ↓
AuthService
 ↓
JWT
 ↓
Session
 ↓
HTTP Interceptor
 ↓
API
```

El interceptor debe añadir:

```text
Authorization: Bearer <token>
```

cuando corresponda.

Gestionar correctamente:

* 401
* logout
* sesión expirada
* errores de autenticación

---

# 16. Seguridad

No almacenar información sensible innecesariamente.

No introducir secretos, API keys o credenciales en el código.

No utilizar datos reales.

No registrar tokens en consola.

No mostrar información sensible en mensajes de error.

---

# 17. Formularios

Utilizar Reactive Forms.

Los formularios deben tener:

* validación
* mensajes de error
* estado loading
* estado success
* estado error
* disabled state

Evitar duplicar reglas de validación.

---

# 18. Manejo de errores

Los errores deben gestionarse de forma explícita.

Estados mínimos:

```text
loading
success
empty
error
```

No ocultar errores con:

```ts
catchError(() => EMPTY)
```

sin una razón clara.

No utilizar `console.log` para resolver errores permanentes.

Eliminar logs temporales antes de terminar una funcionalidad.

---

# 19. TypeScript

Utilizar tipado fuerte.

Evitar:

```ts
any
```

salvo que exista una razón justificada.

Preferir interfaces y tipos claros.

No crear interfaces gigantes.

No crear tipos que solamente se utilizan una vez si no mejoran la claridad.

Evitar casts innecesarios:

```ts
as Something
```

Primero comprobar si puede resolverse correctamente mediante el sistema de tipos.

---

# 20. Código muerto

No mantener:

* imports sin utilizar
* variables sin utilizar
* métodos sin utilizar
* componentes sin referencias
* servicios sin referencias
* archivos obsoletos
* código comentado
* TODOs antiguos
* funciones duplicadas

No dejar código antiguo "por si acaso".

Si ya no se utiliza y no tiene valor histórico, eliminarlo.

---

# 21. Comentarios

No escribir comentarios que expliquen código obvio.

Evitar:

```ts
// Incrementamos el contador
counter++;
```

Los comentarios deben explicar:

* decisiones arquitectónicas
* comportamiento no evidente
* limitaciones técnicas
* decisiones de negocio

El código debe ser suficientemente claro por sí mismo.

---

# 22. Nombres

Utilizar nombres descriptivos.

Preferir:

```text
customerService
selectedCustomer
isLoading
claimStatus
```

Evitar:

```text
data
item
obj
temp
foo
result2
```

Los nombres deben explicar qué representa la información.

---

# 23. Componentes reutilizables

No crear componentes genéricos demasiado pronto.

Antes de crear un componente compartido preguntar:

1. ¿Se utiliza en más de un sitio?
2. ¿La interfaz es realmente común?
3. ¿La abstracción mejora la legibilidad?
4. ¿Reduce duplicación significativa?

Si la respuesta es no, mantenerlo dentro de su feature.

---

# 24. Dependencias

No instalar una librería para resolver algo que Angular o TypeScript ya pueden resolver.

Antes de añadir una dependencia:

1. Comprobar si ya existe una solución en el proyecto.
2. Comprobar si Angular ofrece una solución.
3. Comprobar si TypeScript puede resolverlo.
4. Evaluar si la dependencia aporta suficiente valor.

No añadir dependencias sin necesidad.

---

# 25. UI

Mantener consistencia visual.

Reutilizar componentes existentes.

No crear tres componentes diferentes para botones, tarjetas o modales si pueden utilizarse los existentes.

Evitar estilos duplicados.

---

# 26. Testing

Toda funcionalidad importante debe tener tests.

Priorizar:

* servicios
* guards
* interceptores
* lógica de negocio
* componentes con comportamiento relevante

No escribir tests que simplemente comprueben detalles internos sin valor.

Los tests deben comprobar comportamiento observable.

---

# 27. E2E

Playwright debe cubrir los flujos principales:

```text
Login
Dashboard
Clientes
Detalle de cliente
Pólizas
Siniestros
Logout
```

Los tests E2E no deben intentar cubrir todas las combinaciones posibles.

Cubrir los flujos críticos.

---

# 28. Antes de modificar código

Antes de escribir código:

1. Leer la estructura del proyecto.
2. Buscar implementaciones existentes.
3. Revisar servicios relacionados.
4. Revisar componentes relacionados.
5. Revisar rutas.
6. Revisar tipos/interfaces existentes.
7. Determinar la modificación mínima necesaria.

No crear archivos inmediatamente.

---

# 29. Regla de modificación mínima

Cuando una tarea pueda resolverse modificando:

```text
1 archivo
```

no modificar:

```text
8 archivos
```

sin una razón clara.

No hacer refactors no solicitados mientras se implementa una funcionalidad.

Separar:

```text
feature implementation
```

de:

```text
refactoring
```

---

# 30. Antes de crear código

Antes de crear una nueva clase, servicio, componente, interface o utilidad, comprobar:

```text
¿Ya existe algo equivalente?
¿Puedo reutilizarlo?
¿Puedo resolverlo con menos código?
¿Esta abstracción aporta valor real?
¿Se utilizará realmente?
```

Si la respuesta es no, no crearlo.

---

# 31. Revisión después de implementar

Después de terminar una funcionalidad:

### Paso 1 — Lint

Ejecutar ESLint.

### Paso 2 — Tests

Ejecutar los tests relacionados.

### Paso 3 — Build

Comprobar que la aplicación compila correctamente.

### Paso 4 — Código muerto

Buscar:

* imports
* variables
* métodos
* archivos
* componentes
* servicios

que hayan quedado sin uso.

### Paso 5 — Duplicación

Buscar código duplicado introducido por el cambio.

### Paso 6 — Complejidad

Preguntar:

> ¿Puede hacerse más sencillo?

### Paso 7 — Diff

Revisar exactamente qué archivos han cambiado.

Eliminar cualquier modificación que no sea necesaria para la tarea.

---

# 32. Regla de revisión Senior

Antes de considerar una tarea terminada, responder mentalmente:

```text
¿He añadido código que no era necesario?

¿He creado una abstracción demasiado pronto?

¿He duplicado lógica?

¿He creado un archivo que podría evitar?

¿He utilizado RxJS donde Signals serían suficientes?

¿He utilizado Signals donde RxJS sería más apropiado?

¿He añadido una dependencia innecesaria?

¿He dejado código muerto?

¿He cambiado archivos que no necesitaba tocar?

¿Podría explicar cada cambio durante una entrevista técnica?
```

Si alguna respuesta es sí, simplificar.

---

# 33. Claude Code debe trabajar por fases

Para tareas importantes utilizar este proceso:

## Fase 1 — Análisis

No modificar código.

Analizar:

* arquitectura
* archivos relevantes
* código existente
* solución propuesta

Mostrar un plan breve.

## Fase 2 — Implementación

Implementar únicamente el plan aprobado.

No añadir funcionalidades adicionales.

## Fase 3 — Revisión

Buscar:

* duplicación
* código muerto
* complejidad
* abstracciones innecesarias
* imports innecesarios
* errores

## Fase 4 — Tests

Ejecutar los tests correspondientes.

## Fase 5 — Validación

Ejecutar:

```text
lint
tests
build
```

## Fase 6 — Resumen

Mostrar:

* archivos modificados
* archivos creados
* archivos eliminados
* tests ejecutados
* posibles problemas

---

# 34. Regla importante para Claude Code

No asumir que más código significa mejor solución.

No implementar funcionalidades que el usuario no haya solicitado.

No crear capas arquitectónicas para problemas que todavía no existen.

No refactorizar código no relacionado con la tarea.

No modificar archivos sin necesidad.

No introducir patrones de diseño por motivos académicos.

Priorizar:

```text
Simple
Readable
Typed
Testable
Maintainable
```

---

# 35. Objetivo final

El código debe parecer escrito por un desarrollador Senior que:

* entiende Angular moderno
* conoce TypeScript
* sabe utilizar RxJS
* sabe cuándo utilizar Signals
* entiende arquitectura
* evita sobreingeniería
* escribe código mantenible
* sabe eliminar código innecesario
* escribe tests útiles
* piensa en seguridad
* puede explicar sus decisiones técnicas

La calidad se mide por la claridad y adecuación de la solución, no por la cantidad de código.
