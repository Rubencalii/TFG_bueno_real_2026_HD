# Presentación TFG: Comanda Digital

**Autor:** Rubén Corral Romero
**Fecha:** Mayo 2026
**Duración estimada:** 15-20 minutos

---

## Índice de Exposición

1. [Introducción y Motivación](#1-introducción-y-motivación)
2. [Objetivos del Proyecto](#2-objetivos-del-proyecto)
3. [Stack Tecnológico y por qué](#3-stack-tecnológico-y-por-qué)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Funcionalidades Principales](#6-funcionalidades-principales)
7. [Seguridad Implementada](#7-seguridad-implementada)
8. [Demostración en Vivo](#8-demostración-en-vivo)
9. [Aspectos Técnicos Destacables](#9-aspectos-técnicos-destacables)
10. [Conclusiones y Trabajo Futuro](#10-conclusiones-y-trabajo-futuro)
11. [Preguntas del Tribunal](#11-preguntas-del-tribunal)

---

## 1. Introducción y Motivación

### El Problema

La hostelería ha vivido una digitalización superficial: la mayoria de restaurantes que "tienen QR" ofrecen un PDF estático. El cliente consulta la carta, pero todo lo demás sigue siendo analógico: hablar con el camarero, esperar a pedir, volver a esperar a cobrar.

Esto genera tres problemas concretos:

- **Errores de comunicación** entre sala y cocina (el camarero apunta mal, se olvida una nota de alergia)
- **Tiempos muertos** para el cliente que no puede pedir cuando quiere
- **Ineficiencia en cocina** sin visión global de qué está tardando más

### Mi Solución

**Comanda Digital** es una PWA completa que digitaliza el proceso entero:

```
Cliente escanea QR -> Elige platos -> Confirma pedido
        |                                     |
        v                                     v
   Ve el total                      Aparece en cocina/barra
   en tiempo real                   con sistema semáforo
        |                                     |
        v                                     v
   Pide la cuenta                    Camarero genera ticket
   desde el móvil                    con IVA desglosado
```

**Punto clave:** No es una carta digital. Es un sistema de gestión integral donde el cliente forma parte del flujo de trabajo.

---

## 2. Objetivos del Proyecto

| Objetivo | Solución implementada |
|---|---|
| Eliminar el papel y los errores | Pedidos digitales directos desde la mesa a la cocina |
| Seguridad alimentaria | Filtro dinámico de 14 alérgenos reglamentarios |
| Optimizar tiempos de cocina | Sistema semáforo con umbrales configurables |
| Facturación correcta | Tickets con desglose de base imponible e IVA 10% |
| Gestión de reservas | Ciclo completo con estados y asignación de mesas |
| Accesibilidad | Sin instalación, sin registro, solo escanear el QR |
| Multiidioma | ES / EN / FR con traducciones en base de datos |

---

## 3. Stack Tecnológico y por qué

### Resumen visual

```
+--------------------------------------------------+
|  CLIENTE (navegador del comensal)                |
|  React 18  +  Tailwind CSS  +  PWA               |
+--------------------------------------------------+
                    |  API REST (JSON)
+--------------------------------------------------+
|  BACKEND                                         |
|  Symfony 8  +  PHP 8.4  +  Doctrine ORM          |
+--------------------------------------------------+
                    |  TCP/IP interno Docker
+--------------------------------------------------+
|  BASE DE DATOS                                   |
|  MariaDB 11.3                                    |
+--------------------------------------------------+
                    |  Docker network
+--------------------------------------------------+
|  INFRAESTRUCTURA                                 |
|  Docker Compose  +  Nginx  +  PHP-FPM            |
+--------------------------------------------------+
```

### Justificación de cada decisión

**Symfony 8 (no Laravel)**
Symfony es más modular y explícito. Obliga a entender lo que haces: el sistema de seguridad, el ORM, los servicios. Es además el framework que usa Drupal, Magento y empresas como Trivago. Para un TFG que quiere demostrar conocimiento técnico, Symfony exige más y enseña más.

**React 18 embebido con Symfony UX / Webpack Encore**
En lugar de separar frontend y backend en dos proyectos independientes (con toda la complejidad de CORS, autenticación cruzada, despliegue separado), utilizo Webpack Encore para que React se sirva desde el mismo servidor Symfony. Esto simplifica el despliegue sin sacrificar la reactividad de React.

**MariaDB sobre PostgreSQL o MongoDB**
El dominio es relacional: mesas, pedidos, productos, alérgenos, tickets. MariaDB es compatible con MySQL (herramienta muy usada en hostelería), código abierto, y con un rendimiento excelente para este volumen de datos.

**Docker Compose**
El proyecto arranca con un solo comando en cualquier máquina. No hay dependencias del sistema operativo del desarrollador. En producción, la misma imagen funciona sin cambios.

---

## 4. Arquitectura del Sistema

### Los 5 módulos y sus usuarios

| Módulo | Usuario | Dispositivo típico | Función principal |
|---|---|---|---|
| **Cliente** | Comensal | Móvil (cualquier) | Ver carta, pedir, pagar |
| **Cocina** | Cocinero | Tablet en cocina | Ver pedidos, gestionar tiempos |
| **Barra** | Barman | Tablet en barra | Ver bebidas, cerrar mesas |
| **Camarero** | Camarero | Móvil o tablet | Asignar mesas, atender alertas |
| **Admin** | Gerente/Admin | PC | Gestionar todo el sistema |

### Sistema de roles (jerarquía)

```
ROLE_ADMIN
    |
ROLE_GERENTE
    |
ROLE_COCINA  ROLE_BARRA  ROLE_CAMARERO
```

Un admin puede hacer todo lo que hace un gerente, y un gerente puede hacer todo lo que hace un cocinero, barman o camarero.

### Flujo de un pedido completo

```
[CLIENTE]                 [BACKEND]              [COCINA/BARRA]
    |                         |                        |
    | 1. Escanea QR            |                        |
    |------> GET /mesa/token   |                        |
    |<------ {mesa activa}     |                        |
    |                         |                        |
    | 2. Envía pedido con PIN  |                        |
    |------> POST /api/pedido  |                        |
    |        {mesaId, pin,     |                        |
    |         items[]}         |                        |
    |                         | 3. Guarda en BD        |
    |                         |----------------------->|
    |<------ {success, total}  |                        |
    |                         |                        |
    |                         | 4. Polling cada 10s    |
    |                         |<-----------------------|
    |                         |----> [pedido nuevo!]-->|
    |                         |                        |
    | 5. Pide la cuenta       |                        |
    |------> POST /pagar       |                        |
    |                         | 6. Genera ticket       |
    |                         |   numero: 2026-0042    |
    |<------ {total, IVA}      |                        |
```

---

## 5. Modelo de Datos

### Las 10 entidades y sus relaciones

| Entidad | Descripción | Relaciones clave |
|---|---|---|
| **User** | Usuarios del sistema | - |
| **Mesa** | Mesas físicas del restaurante | 1:N con Pedido, Ticket, Reserva |
| **Categoria** | Categorías del menú (cocina / barra) | 1:N con Producto |
| **Producto** | Platos y bebidas | N:M con Alergeno |
| **Alergeno** | 14 alérgenos reglamentarios UE | N:M con Producto |
| **Pedido** | Pedido de una mesa | N:1 con Mesa, 1:N con DetallePedido |
| **DetallePedido** | Línea individual de un pedido | N:1 con Pedido y Producto |
| **Ticket** | Factura generada al cobrar | N:1 con Mesa |
| **Pago** | Pago parcial de un ticket | N:1 con Ticket |
| **Reserva** | Reserva de mesa | N:1 con Mesa |

### Diagrama E-R simplificado

```
Mesa ---1:N---> Pedido ---1:N---> DetallePedido ---N:1---> Producto
 |                                                              |
 |---1:N---> Ticket                                            |
 |                                                   Producto ---N:M---> Alergeno
 |---1:N---> Reserva                                     |
                                                         N:1
                                                     Categoria
```

### Campos destacados de Mesa (decisión de diseño)

La entidad Mesa tiene campos que van más allá de simples datos:

- `tokenQr` — identificador aleatorio de 8 chars para la URL pública
- `securityPin` — PIN de 8 dígitos que rota en cada cierre de mesa
- `llamaCamarero`, `pideCuenta` — flags de alerta para el panel de barra
- `lastLlamarAt`, `lastPedirCuentaAt` — timestamps para rate limiting (evita spam)
- `pagoOnlinePendiente`, `metodoPagoPreferido` — estado del flujo de pago

---

## 6. Funcionalidades Principales

### 6.1 Módulo Cliente

**Acceso por QR sin registro**
Cada mesa tiene un token único en su URL (`/mesa/m9OqYZ0D`). El cliente no instala nada, no se registra. Solo escanea.

**PIN de seguridad**
Para evitar que cualquier persona envíe pedidos a una mesa que no es la suya, se usa un PIN de 8 dígitos que el camarero proporciona. El PIN rota automáticamente al cerrar la mesa. El pedido debe incluir el PIN en el payload.

**Filtro de alérgenos**
El cliente puede seleccionar sus intolerancias. El menú se filtra en tiempo real ocultando los productos que contienen esos alérgenos. Los 14 alérgenos están regulados por la normativa europea (Reglamento 1169/2011).

**Carrito flotante + confirmación**
El total se actualiza en tiempo real mientras el cliente añade productos. Al confirmar, el pedido llega directamente a cocina o barra según la categoría de cada producto.

**Multiidioma**
Las traducciones de productos y categorías se guardan en base de datos (tabla de traducciones). El cliente elige idioma con banderas. Soporta ES, EN y FR.

### 6.2 Módulo Cocina y Barra

**Sistema semáforo**

| Color | Tiempo transcurrido | Significado |
|---|---|---|
| Verde | 0-5 minutos | Pedido reciente, sin urgencia |
| Amarillo | 5-10 minutos | Atencion, el cliente espera |
| Rojo | Más de 10 minutos | Urgente, prioridad máxima |

El color se calcula en el backend al devolver los pedidos activos. No requiere sincronización de relojes entre clientes.

**Tablero Kanban**
Los pedidos pasan por 4 estados: `pendiente -> en_preparacion -> listo -> entregado`. Cada cambio es un click. La pantalla se refresca automáticamente por polling cada 10 segundos.

**Separación cocina/barra**
Los productos tienen categoría de tipo `cocina` o `barra`. Al confirmar el pedido, los productos se enrutan automáticamente al panel correcto.

### 6.3 Módulo Administración

8 controladores especializados:

1. **Productos** — CRUD completo, precio, imagen, alérgenos, categoría, disponibilidad
2. **Categorías** — Nombre, tipo (cocina/barra), orden
3. **Alérgenos** — Nombre e icono (los 14 reglamentarios)
4. **Mesas** — Crear/editar, activar/desactivar, regenerar QR, ver estado
5. **Usuarios** — CRUD con roles, no se puede eliminar al único admin
6. **Tickets** — Ver, cobrar, anular (genera ticket rectificativo con valores negativos), exportar CSV
7. **Reservas** — Crear, editar, cambiar estado, estadísticas
8. **Reportes** — Ventas por período, top productos, horas punta, totales por método de pago

### 6.4 Sistema de Tickets

El número de ticket sigue el formato `YYYY-NNNN` (ej: `2026-0042`).

**Por qué dos flushes al crear un ticket:**
Primero se persiste el ticket con un número temporal (`TMP-{uniqid}`) para obtener el ID autoincrementado de la base de datos. Con ese ID definitivo y único, se calcula el número real. Esto evita la race condition que existiría si se consultara el MAX(id) antes de insertar: dos peticiones simultáneas podrían obtener el mismo número.

**Desglose de IVA:**
El IVA de restauración en España es el 10%. La base imponible se calcula dividiendo el total entre 1.10:

```
base = total / 1.10
iva  = total - base
```

Ejemplo: total 39.00€ → base 35.45€ + IVA 3.55€

**Ticket rectificativo:**
Si se anula un ticket ya cobrado, se genera automáticamente un ticket rectificativo con los mismos importes en negativo. Esto cumple con los requisitos fiscales.

---

## 7. Seguridad Implementada

| Capa | Mecanismo | Detalles |
|---|---|---|
| **Autenticación** | Symfony Security + Custom Authenticator | Sesiones PHP con cookie segura |
| **CSRF** | Stateless CSRF (Symfony 8) | Valida Origin/Referer header en login |
| **Autorización** | ACL por roles | 9 reglas en `access_control` de security.yaml |
| **PIN de mesa** | Rotación por cierre | 8 dígitos, se invalida al cerrar mesa |
| **Rate limiting** | Timestamps en BD | `lastLlamarAt`, `lastPedirCuentaAt` con cooldown 30s |
| **Passwords** | bcrypt costo 13 | Symfony password hasher |
| **Sanitización** | `htmlspecialchars` + `strip_tags` | En campos de texto libre (reservas) |
| **Integridad de admin** | Validación doble | No se puede eliminar al único administrador del sistema |

### Rutas protegidas

```
/admin/*          -> ROLE_ADMIN
/cocina/*         -> ROLE_COCINA
/barra/*          -> ROLE_BARRA
/camarero/*       -> ROLE_CAMARERO
/api/cocina/*     -> ROLE_COCINA   (antes sin protección)
/api/barra/*      -> ROLE_BARRA    (antes sin protección)
```

---

## 8. Demostración en Vivo

### Preparación previa (hacer antes de que llegue el tribunal)

- [ ] `.\iniciar_proyecto.ps1` ejecutado y contenedores arriba
- [ ] Navegador con 4 pestañas abiertas:
  - Pestaña 1: `http://localhost:8001/mesa/m9OqYZ0D` (cliente - Mesa 1)
  - Pestaña 2: `http://localhost:8001/cocina/` (cocina)
  - Pestaña 3: `http://localhost:8001/barra/` (barra)
  - Pestaña 4: `http://localhost:8001/admin/` (admin)
- [ ] Credentials admin: `admin@comanda.com` / `admin123`
- [ ] Tener el PIN de Mesa 1 a mano (ver en admin -> mesas)

### Guión de demo (10 minutos)

#### Paso 1 — Vista del cliente (2 min)

Ir a pestaña 1 (menú del comensal):
- Mostrar la carta con categorías
- Hacer click en el icono de alérgeno "Gluten" y ver cómo desaparecen productos
- Deshacer el filtro
- Cambiar el idioma a inglés y volver a español
- Añadir 2 productos al carrito, mostrar el total en la barra inferior
- Click en "Confirmar Pedido", introducir el PIN

#### Paso 2 — Panel de cocina (2 min)

Ir a pestaña 2 (cocina):
- El pedido aparece en "Pendiente" con semáforo verde
- Click en "En Preparación"
- Esperar o saltar directamente a "Listo"

#### Paso 3 — Panel de barra (1 min)

Ir a pestaña 3 (barra):
- Mostrar la notificación de la mesa (pide cuenta)
- Hacer click en "Generar Ticket"
- Mostrar el ticket con IVA desglosado

#### Paso 4 — Panel de administración (3 min)

Ir a pestaña 4 (admin):
- Dashboard general: mesas activas, alertas
- Tickets > Resumen de caja del día
- Exportar CSV de tickets del mes
- Mostrar sección de Reservas
- Mostrar reportes de ventas (gráfica de horas punta)

#### Paso 5 — Mencionar sin demo (2 min, verbal)

- Gestión de usuarios y roles
- Regeneración de QR de mesa
- Sistema de traducciones

---

## 9. Aspectos Técnicos Destacables

### Refactorización del controlador monolítico

El AdminController original tenía más de 1.300 líneas. Lo dividí en 8 controladores especializados aplicando el principio de Responsabilidad Única (SRP de SOLID):

```
AdminController.php (1.384 líneas)
    |
    +---> ProductoController.php
    +---> CategoriaController.php
    +---> AlergenoController.php
    +---> UsuarioController.php
    +---> MesaController.php
    +---> TicketController.php
    +---> ReservaController.php
    +---> ReporteController.php
```

Cada controlador tiene entre 80 y 200 líneas y una única responsabilidad.

### Rate limiting sin sesiones

El rate limiting de "llamar al camarero" usa timestamps en la propia entidad Mesa, no en la sesión del usuario. Esto es importante porque los comensales no tienen sesión PHP. Si se usara la sesión, bastaría con borrar la cookie para saltarse el límite. Con timestamps en base de datos, el límite es por mesa (no por dispositivo).

### Numeración de tickets sin race condition

Problema clásico: si dos camareros generan ticket simultáneamente y ambos consultan `MAX(id)` antes de insertar, obtienen el mismo número y hay colisión. Solución: persistir primero con número temporal, hacer flush para que la BD asigne el autoincrement, y luego actualizar con el número real basado en ese ID único.

### Tests automatizados

PHPUnit 12 con 3 tests de integración que verifican el flujo de seguridad completo (login, acceso protegido, logout). Los tests corren contra una base de datos de test separada. Se corrigió un problema de entorno donde `APP_ENV=prod` del contenedor Docker sobreescribía el entorno de test.

---

## 10. Conclusiones y Trabajo Futuro

### Lo que se ha conseguido

- Sistema completo y funcional de gestión de comandas
- Interfaz adaptada a móvil (cliente), tablet (cocina/barra) y PC (admin)
- Seguridad real implementada, no simulada
- Despliegue reproducible con Docker en cualquier máquina
- Soporte multiidioma completo en base de datos
- Facturación con validez fiscal (base + IVA, ticket rectificativo)
- 50+ endpoints REST documentados y testeados manualmente

### Trabajo futuro

| Mejora | Motivación |
|---|---|
| WebSockets | Reemplazar el polling cada 10s por notificaciones push instantáneas |
| App nativa (React Native) | Mejor experiencia en dispositivos de cocina/barra |
| Pasarela de pago real | Integrar Stripe o Redsys para pagos online efectivos |
| Gestión de inventario | Descontar stock automáticamente al confirmar pedidos |
| Recomendaciones con IA | Sugerir platos según el historial de la mesa o la temporada |
| Modo offline | Service Worker para que el camarero pueda trabajar sin WiFi |

---

## 11. Preguntas del Tribunal

### Arquitectura y tecnología

**"¿Por qué Symfony y no Laravel?"**

Symfony tiene una arquitectura más explícita y modular. Con Laravel muchas cosas "simplemente funcionan" con magia, mientras que Symfony obliga a entender cada componente: el container de servicios, el event dispatcher, el sistema de seguridad. Para un TFG donde se quiere demostrar comprensión técnica, Symfony es más exigente y más formativo. Además, es la base de frameworks como Drupal o Magento, y es ampliamente usado en empresas grandes.

**"¿Por qué no una SPA pura con React y una API separada?"**

Porque añade complejidad sin aportar valor para este proyecto. Con una SPA separada necesitas CORS, un sistema de autenticación por tokens (JWT), dos despliegues distintos y dos repositorios o un monorepo. Con Symfony UX y Webpack Encore tengo React con todas sus ventajas (reactividad, componentes) servido desde el mismo servidor, sin los problemas de CORS ni la complejidad de doble despliegue.

**"¿Qué es Doctrine ORM y qué ventajas tiene?"**

Doctrine es la capa de abstracción entre el código PHP y la base de datos. En lugar de escribir SQL directamente, defino las entidades como clases PHP con anotaciones. Doctrine genera el SQL, gestiona las relaciones, y me abstrae del motor concreto de base de datos. La principal ventaja es que si en el futuro quisiera migrar de MariaDB a PostgreSQL, el código PHP no cambia.

**"¿Por qué Docker?"**

El problema del "en mi máquina funciona" desaparece. El contenedor incluye exactamente las mismas versiones de PHP, Nginx, MariaDB que se usan en producción. Cualquier persona puede clonar el repositorio, ejecutar un comando y tener el sistema funcionando. Además, el `docker-entrypoint.sh` automatiza las migraciones de base de datos al arrancar el contenedor.

---

### Seguridad

**"¿Cómo funciona el sistema de PIN?"**

Cada mesa tiene un PIN de 8 dígitos generado aleatoriamente. Cuando el comensal quiere pedir, debe incluir el PIN en el payload del pedido. El camarero le proporciona el PIN al llevarle la carta. Cuando se cierra la mesa (se genera el ticket), el PIN se regenera automáticamente, invalidando cualquier petición futura con el PIN anterior.

**"¿Qué pasa si alguien intenta hacer spam de 'llamar al camarero'?"**

Hay un rate limiting de 30 segundos implementado mediante timestamps en la propia entidad Mesa, en base de datos. No usa sesiones ni cookies, porque el cliente no tiene sesión autenticada. Esto significa que aunque borres las cookies, el límite sigue activo porque está en la base de datos asociado a la mesa, no al dispositivo.

**"¿Cómo se protegen las rutas de la cocina y la barra?"**

Con el `access_control` de Symfony. Las rutas `/api/cocina/*` requieren `ROLE_COCINA` y `/api/barra/*` requieren `ROLE_BARRA`. Si alguien intenta acceder sin autenticarse, recibe 401. Si está autenticado pero no tiene el rol necesario, recibe 403.

**"¿Qué es un ticket rectificativo y por qué lo implementaste?"**

Cuando se anula una factura ya cobrada, las normas fiscales no permiten simplemente borrarla. En su lugar, se debe generar un documento rectificativo con los mismos importes en negativo, que "cancela" contablemente el ticket original. El sistema genera este rectificativo automáticamente al anular un ticket pagado, y ambos quedan en el histórico con referencia cruzada.

---

### Diseño y decisiones

**"¿Por qué polling cada 10 segundos en lugar de WebSockets?"**

Prioricé la funcionalidad completa del sistema sobre la optimización de tiempo real. El polling cada 10 segundos es perfectamente suficiente para el caso de uso de un restaurante: una décima de segundo de latencia no tiene impacto real en si el cocinero ve el pedido. WebSockets añaden complejidad de infraestructura (necesitan una conexión persistente, un servidor compatible como Node.js o Mercure) que no estaba justificada para el alcance del TFG. Está en el trabajo futuro.

**"¿Cómo funciona el multiidioma?"**

Las traducciones de productos y categorías se guardan en base de datos, no en archivos YAML. Esto permite que el administrador añada o modifique traducciones desde el panel sin tocar código. El cliente selecciona el idioma con banderas y la API devuelve los datos en el idioma correspondiente. Para los textos estáticos de la interfaz (botones, mensajes) uso el sistema estándar de traducciones de Symfony con archivos YAML por idioma.

**"¿Qué harías diferente si empezaras de cero?"**

Implementaría WebSockets desde el principio usando Symfony Mercure, ya que cambiar de polling a WebSockets implica modificar tanto el backend como todos los componentes React que consumen datos en tiempo real. También separaría más claramente los tipos de categorías (cocina/barra) a nivel de entidad en lugar de un campo de texto, para facilitar futuras extensiones.

**"¿Cómo escalaria el sistema para una cadena de restaurantes?"**

La arquitectura de Docker facilita escalar horizontalmente: se pueden añadir más instancias del contenedor de la aplicación detrás de un balanceador de carga. La base de datos se migrarìa a un cluster MariaDB con réplicas de lectura. Para múltiples restaurantes, añadiría un concepto de "tenant" (empresa) a nivel de base de datos, con aislamiento por esquema o por base de datos separada.

---

### Testing y calidad

**"¿Tienes tests?"**

Sí, tests de integración con PHPUnit 12. Hay 3 tests que verifican el flujo completo de seguridad: login correcto, acceso a rutas protegidas y logout. El entorno de test usa una base de datos separada (`app_test`) que se resetea en cada ejecución. También realicé testing manual exhaustivo de todos los endpoints de la API.

**"¿Encontraste bugs durante el desarrollo?"**

Durante la fase de testing detecté y corregí 18 bugs clasificados por severidad. Los más importantes fueron: una race condition en la generación del número de ticket que podía producir números duplicados en peticiones concurrentes, rutas de API de cocina y barra sin protección de acceso, y el PIN de seguridad que en una versión anterior se exponía en la respuesta JSON de notificaciones.

---

## Checklist Pre-Exposición

- [ ] `.\iniciar_proyecto.ps1` ejecutado sin errores
- [ ] Verificar que `http://localhost:8001` responde
- [ ] Login como admin: `admin@comanda.com` / `admin123`
- [ ] Anotar el PIN de la Mesa 1 (verlo en Admin > Mesas)
- [ ] Pestañas abiertas: cliente, cocina, barra, admin
- [ ] Tener el QR de mesa listo para mostrar (en Admin > Mesas > QR)
- [ ] Cronómetro preparado para la demo
- [ ] Silenciar notificaciones del ordenador

---

*Proyecto desarrollado como Trabajo de Fin de Grado, 2026.*
