# Especificaciones Técnicas: Comanda Digital

**Proyecto:** Trabajo de Fin de Grado (TFG)  
**Versión:** 2.0 (Febrero 2026)  
**Descripción:** Sistema completo de gestión de comandas para restaurantes con interfaz web responsive.

---

## 📋 Tabla de Contenido

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Contrato de API](#6-contrato-de-api)
7. [Flujos de Usuario](#7-flujos-de-usuario)
8. [Seguridad](#8-seguridad)
9. [Estrategia de Pruebas](#9-estrategia-de-pruebas)
10. [Conclusiones](#10-conclusiones)

---

## 1. Introducción

### 1.1 Contexto y Motivación

La hostelería ha sufrido una transformación digital acelerada. Sin embargo, la mayoría de soluciones adoptadas se limitan a digitalizar cartas físicas en PDFs estáticos accesibles por código QR.

**Comanda Digital** resuelve esta desconexión, facilitando, automatizando y acelerando el proceso completo desde que el cliente se sienta hasta que la comida llega a la mesa.

### 1.2 Objetivos del Proyecto

| Objetivo | Descripción |
|----------|-------------|
| **Eliminar el PDF estático** | Interfaz interactiva donde el cliente añade productos al carrito desde su móvil |
| **Seguridad Alimentaria** | Filtrado dinámico de alérgenos que oculta platos no aptos |
| **Optimización de Cocina** | Sistema semáforo (Verde/Amarillo/Rojo) según tiempo de espera |
| **Gestión de Cobro** | Cálculo automático de cuenta con generación de tickets fiscales |
| **Sistema de Reservas** | Gestión completa de reservas con estados y asignación de mesas |

---

## 2. Requisitos del Sistema

### 2.1 Módulo Cliente (RF-01 a RF-05)

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-01 | Acceso Directo QR | Identificación automática de mesa mediante token en URL |
| RF-02 | Navegación Single Page | Carta completa en una vista con scroll suave entre categorías |
| RF-03 | Filtro de Alérgenos | Panel con iconos de alérgenos que oculta productos no aptos |
| RF-04 | Añadido Rápido | Botón `[+]` para añadir productos sin abrir modales |
| RF-05 | Selector de Idioma | Banderas ES/FR/EN con traducción completa de carta y productos |
| RF-06 | Carrito Flotante | Barra inferior persistente con total y acceso a confirmar |

### 2.2 Módulo Cocina y Barra (RF-07 a RF-11)

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-07 | Tablero Kanban | Columnas: Pendiente, En Preparación, Listo, Entregado |
| RF-08 | Interacción Táctil | Cambio de estado con un solo toque |
| RF-09 | Sistema Semáforo | 🟢 Verde (0-5min), 🟡 Amarillo (5-10min), 🔴 Rojo (+10min) |
| RF-10 | Alertas Críticas | Resaltado para notas de alergia ("CELIACO", "SIN GLUTEN") |
| RF-11 | Cierre de Mesa | Botón para generar ticket con cálculo automático |

### 2.3 Módulo Administración (RF-12 a RF-20)

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-12 | CRUD Productos | Alta, baja, modificación con asignación de alérgenos |
| RF-13 | CRUD Categorías | Gestión de categorías con tipo (cocina/barra) |
| RF-14 | Gestión de Mesas | Crear, editar, eliminar mesas con regeneración de QR |
| RF-15 | Gestión de Usuarios | CRUD de usuarios con roles (admin, gerente, camarero, cocinero, barman) |
| RF-16 | Sistema de Tickets | Creación, cobro, anulación y rectificación de tickets |
| RF-17 | Reportes de Ventas | Estadísticas por período, método de pago, categoría |
| RF-18 | Exportación | Exportar tickets a CSV/Excel |
| RF-19 | Gestión de Reservas | CRUD completo con estados y asignación a mesas |
| RF-20 | Gestión de Traducciones | CRUD de traducciones para productos y categorías en ES/FR/EN |

### 2.4 Requisitos No Funcionales

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Rendimiento | Carga inicial < 2 segundos en 4G |
| RNF-02 | Disponibilidad | Reconexión automática de polling |
| RNF-03 | Usabilidad | Mobile First, botones mínimo 44x44px |
| RNF-04 | Seguridad | Control de acceso por roles, CSRF protection |
| RNF-05 | Escalabilidad | Arquitectura Docker para despliegue flexible |

---

## 3. Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|------------|---------|---------------|
| **Backend** | Symfony | 8.0 | Framework PHP robusto y escalable |
| **Frontend** | React + Tailwind CSS | 18.x / 3.x | Interfaces reactivas con Symfony UX |
| **Base de Datos** | MariaDB | 11.3 | Motor relacional fiable |
| **Servidor** | Nginx | Latest | Servidor web de alto rendimiento |
| **Infraestructura** | Docker + Docker Compose | Latest | Contenedorización completa |
| **Bundler** | Webpack Encore | 4.x | Gestión de assets con hot-reload |
| **Lenguaje** | PHP | 8.3+ | Última versión estable |
| **Control Versiones** | Git + GitHub | - | Git Flow con Pull Requests |

---

## 4. Arquitectura del Sistema

### 4.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                  │
├─────────────────────────────────────────────────────────────────┤
│  📱 Móvil (Cliente)    │  💻 Tablet (Cocina/Barra)  │  🖥️ Desktop (Admin) │
│  - Carta digital       │  - Kanban pedidos           │  - Panel gestión     │
│  - Carrito             │  - Sistema semáforo         │  - Reportes          │
│  - Pedir cuenta        │  - Cambio estados           │  - Configuración     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX (Reverse Proxy)                       │
│                         Puerto 80/443                            │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SYMFONY 8.0 (Backend)                          │
├─────────────────────────────────────────────────────────────────┤
│  Controllers:                                                    │
│  ├── AdminController (Panel administración)                      │
│  ├── BarraController (Panel barra)                               │
│  ├── CocinaController (Panel cocina)                             │
│  ├── MesaController (Carta cliente)                              │
│  ├── PedidoController (API pedidos)                              │
│  └── SecurityController (Autenticación)                          │
├─────────────────────────────────────────────────────────────────┤
│  Services: Doctrine ORM, Security, Twig, PasswordHasher         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MariaDB 11.3 (Base de Datos)                  │
│                         Puerto 3306                              │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Estructura de Contenedores Docker

```yaml
services:
  app:        # Symfony + PHP-FPM (Puerto 9000)
  nginx:      # Servidor web (Puerto 80)
  database:   # MariaDB (Puerto 3306)
```

---

## 5. Modelo de Datos

### 5.1 Entidades del Sistema

| Entidad | Descripción | Campos Principales |
|---------|-------------|-------------------|
| **User** | Usuarios del sistema | id, email, password, roles[], rol |
| **Mesa** | Mesas del restaurante | id, numero, tokenQr, activa, llamaCamarero, pideCuenta, metodoPagoPreferido, pagoOnlinePendiente |
| **Categoria** | Categorías de productos | id, nombre, orden, activa, tipo (cocina/barra) |
| **Producto** | Productos del menú | id, nombre, descripcion, precio, imagen, activo, destacado, vegetariano, categoria_id |
| **Alergeno** | Alérgenos alimentarios | id, nombre |
| **Pedido** | Pedidos de clientes | id, mesa_id, estado, createdAt, totalCalculado |
| **DetallePedido** | Líneas de pedido | id, pedido_id, producto_id, cantidad, notas, precioUnitario |
| **Ticket** | Tickets/Facturas | id, numero, mesa_id, baseImponible, iva, total, metodoPago, estado, createdAt, paidAt, detalleJson, ticketRectificadoId |
| **Reserva** | Reservas de mesas | id, nombreCliente, telefono, email, fecha, hora, numPersonas, notas, estado, mesa_id, createdAt, updatedAt |
| **Idioma** | Idiomas disponibles | id, codigo (es/fr/en), nombre, bandera, activo |
| **ProductoTraduccion** | Traducciones de productos | id, producto_id, idioma_id, nombre, descripcion |
| **CategoriaTraduccion** | Traducciones de categorías | id, categoria_id, idioma_id, nombre |

### 5.2 Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DIAGRAMA ENTIDAD-RELACIÓN                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│    USER     │
├─────────────┤
│ PK id       │
│    email    │
│    password │
│    roles[]  │
│    rol      │
└─────────────┘

┌─────────────┐       1:N        ┌─────────────┐       1:N        ┌──────────────────┐
│    MESA     │──────────────────│   PEDIDO    │──────────────────│  DETALLE_PEDIDO  │
├─────────────┤                  ├─────────────┤                  ├──────────────────┤
│ PK id       │                  │ PK id       │                  │ PK id            │
│    numero   │                  │ FK mesa_id  │                  │ FK pedido_id     │
│    tokenQr  │                  │    estado   │                  │ FK producto_id   │
│    activa   │                  │    createdAt│                  │    cantidad      │
│    llama... │                  │    total... │                  │    notas         │
│    pide...  │                  └─────────────┘                  │    precioUnit... │
│    metodo...|                                                   └──────────────────┘
│    pagoOn...|                                                            │
└─────────────┘                                                            │
      │                                                                    │
      │ 1:N                                                               N:1
      ▼                                                                    ▼
┌─────────────┐                                                   ┌─────────────┐
│   TICKET    │                                                   │  PRODUCTO   │
├─────────────┤                                                   ├─────────────┤
│ PK id       │                                                   │ PK id       │
│    numero   │         N:M (producto_alergeno)                   │    nombre   │
│ FK mesa_id  │         ┌───────────────────────────────────────▶│    descrip..│
│    baseImp..│         │                                         │    precio   │
│    iva      │         │                                         │    imagen   │
│    total    │         │                                         │    activo   │
│    metodo...|         │                                         │    destac.. │
│    estado   │         │                                         │    vegetar..|
│    created..|         │                                         │ FK categ_id │
│    paidAt   │         │                                         └─────────────┘
│    detalle..|         │                                                │
│    ticketR..|         │                                               N:1
└─────────────┘         │                                                ▼
      │                 │                                         ┌─────────────┐
      │ 1:N             │                                         │  CATEGORIA  │
      ▼                 │                                         ├─────────────┤
┌─────────────┐         │                                         │ PK id       │
│   RESERVA   │         │                                         │    nombre   │
├─────────────┤         │                                         │    orden    │
│ PK id       │         │                                         │    activa   │
│    nombre...|         │                                         │    tipo     │
│    telefono │         │                                         └─────────────┘
│    email    │         │
│    fecha    │         │
│    hora     │         │                                         ┌─────────────┐
│    numPers..|         └─────────────────────────────────────────│  ALERGENO   │
│    notas    │                                                   ├─────────────┤
│    estado   │                                                   │ PK id       │
│ FK mesa_id  │                                                   │    nombre   │
│    created..|                                                   └─────────────┘
│    updated..|
└─────────────┘

LEYENDA:
────────
PK = Primary Key (Clave Primaria)
FK = Foreign Key (Clave Foránea)
1:N = Relación Uno a Muchos
N:M = Relación Muchos a Muchos
```

### 5.3 Estados de Entidades

**Pedido.estado:**
```
pendiente → en_preparacion → listo → entregado
```

**Ticket.estado:**
```
pendiente → pagado
          ↘ anulado
```

**Reserva.estado:**
```
pendiente → confirmada → completada
          ↘ cancelada
          ↘ no_show
```

**Ticket.metodoPago:**
```
efectivo | tarjeta | tpv
```

---

## 6. Contrato de API

### 6.1 Endpoints Públicos (Cliente)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/mesa/{token}` | Obtiene la carta para una mesa |
| POST | `/api/pedido` | Crea un nuevo pedido |
| GET | `/api/mesa/{token}/pedidos` | Lista pedidos de la mesa |
| GET | `/api/mesa/{token}/total` | Obtiene el total a pagar |
| POST | `/api/mesa/{token}/llamar` | Llama al camarero |
| POST | `/api/mesa/{token}/pagar` | Solicita la cuenta |
| POST | `/api/mesa/{token}/pagar-online` | Indica pago online |
| GET | `/api/idiomas` | Lista idiomas disponibles |
| GET | `/mesa/{token}?lang={codigo}` | Obtiene carta traducida al idioma especificado |

### 6.2 Endpoints Cocina/Barra

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cocina/pedidos` | Lista pedidos de cocina |
| GET | `/api/barra/pedidos` | Lista pedidos de barra |
| PATCH | `/api/pedido/{id}/estado` | Cambia estado del pedido |
| GET | `/api/barra/notificaciones` | Notificaciones de barra |
| POST | `/api/barra/mesa/{id}/cerrar` | Cierra una mesa |

### 6.3 Endpoints Administración

| Recurso | Método | Endpoint | Descripción |
|---------|--------|----------|-------------|
| **Productos** | POST | `/admin/api/producto` | Crear producto |
| | PUT | `/admin/api/producto/{id}` | Editar producto |
| | DELETE | `/admin/api/producto/{id}` | Eliminar producto |
| **Categorías** | POST | `/admin/api/categoria` | Crear categoría |
| | PUT | `/admin/api/categoria/{id}` | Editar categoría |
| | DELETE | `/admin/api/categoria/{id}` | Eliminar categoría |
| **Mesas** | GET | `/admin/api/mesas` | Listar mesas |
| | POST | `/admin/api/mesa` | Crear mesa |
| | PUT | `/admin/api/mesa/{id}` | Editar mesa |
| | DELETE | `/admin/api/mesa/{id}` | Eliminar mesa |
| | POST | `/admin/api/mesa/{id}/toggle` | Activar/desactivar |
| | POST | `/admin/api/mesa/{id}/regenerar-qr` | Regenerar QR |
| | POST | `/admin/api/mesa/{id}/atender` | Atender alerta |
| | POST | `/admin/api/mesa/{id}/confirmar-pago-online` | Confirmar pago |
| | POST | `/admin/api/mesa/{id}/limpiar-alertas` | Limpiar alertas |
| **Usuarios** | GET | `/admin/api/usuarios` | Listar usuarios |
| | POST | `/admin/api/usuario` | Crear usuario |
| | PUT | `/admin/api/usuario/{id}` | Editar usuario |
| | DELETE | `/admin/api/usuario/{id}` | Eliminar usuario |
| **Alérgenos** | GET | `/admin/api/alergenos` | Listar alérgenos |
| | POST | `/admin/api/alergeno` | Crear alérgeno |
| | DELETE | `/admin/api/alergeno/{id}` | Eliminar alérgeno |
| **Tickets** | POST | `/admin/api/ticket` | Crear ticket |
| | GET | `/admin/api/ticket/{id}` | Ver ticket |
| | POST | `/admin/api/ticket/{id}/cobrar` | Cobrar ticket |
| | POST | `/admin/api/ticket/{id}/anular` | Anular ticket |
| | DELETE | `/admin/api/ticket/{id}` | Eliminar ticket |
| | GET | `/admin/api/ticket/{id}/imprimir` | Imprimir ticket |
| | GET | `/admin/api/tickets/resumen` | Resumen de caja |
| **Reservas** | GET | `/admin/api/reservas` | Listar reservas |
| | POST | `/admin/api/reserva` | Crear reserva |
| | GET | `/admin/api/reserva/{id}` | Ver reserva |
| | PUT | `/admin/api/reserva/{id}` | Editar reserva |
| | DELETE | `/admin/api/reserva/{id}` | Eliminar reserva |
| | POST | `/admin/api/reserva/{id}/estado` | Cambiar estado |
| | GET | `/admin/api/reservas/estadisticas` | Estadísticas |
| **Reportes** | GET | `/admin/api/reportes/ventas` | Reporte de ventas |
| | GET | `/admin/api/exportar/tickets` | Exportar tickets |
| **Pedidos** | GET | `/admin/api/pedidos/activos` | Pedidos activos |
| | POST | `/admin/api/pedido/{id}/estado` | Cambiar estado |
| **Traducciones** | GET | `/admin/api/traducciones` | Listar traducciones |
| | POST | `/admin/api/producto/{id}/traduccion` | Crear traducción de producto |
| | PUT | `/admin/api/producto-traduccion/{id}` | Editar traducción de producto |
| | DELETE | `/admin/api/producto-traduccion/{id}` | Eliminar traducción |
| | POST | `/admin/api/categoria/{id}/traduccion` | Crear traducción de categoría |
| | GET | `/admin/api/idiomas` | Gestionar idiomas disponibles |
| **Config** | GET | `/admin/api/config` | Configuración |
| | GET | `/admin/api/notificaciones` | Notificaciones |

---

## 7. Flujos de Usuario

### 7.1 Flujo Cliente (Happy Path)

```
1. Cliente escanea QR de la mesa
   └── GET /mesa/{token}
       └── Se carga la carta con categorías y productos

2. Cliente añade productos al carrito
   └── Acción local en React (estado del carrito)

3. Cliente confirma pedido
   └── POST /api/pedido
       └── Se guarda pedido con estado "pendiente"

4. Cocina/Barra recibe el pedido
   └── GET /api/cocina/pedidos (polling cada 10s)
       └── Aparece tarjeta con semáforo verde

5. Personal cambia estado
   └── PATCH /api/pedido/{id}/estado
       └── pendiente → en_preparacion → listo → entregado

6. Cliente pide la cuenta
   └── POST /api/mesa/{token}/pagar
       └── Mesa.pideCuenta = true

7. Barra genera ticket y cierra mesa
   └── POST /api/barra/mesa/{id}/cerrar
       └── Se crea Ticket, se limpian pedidos
```

### 7.2 Flujo Administración

```
1. Admin accede al panel
   └── GET /admin/
       └── Autenticación requerida (ROLE_ADMIN o ROLE_GERENTE)

2. Gestiona catálogo
   └── CRUD de productos, categorías, alérgenos

3. Gestiona mesas
   └── CRUD de mesas con generación de QR

4. Gestiona usuarios
   └── CRUD de usuarios con asignación de roles

5. Consulta reportes
   └── GET /admin/api/reportes/ventas
       └── Estadísticas por período, método de pago, categoría
```

### 7.3 Flujo Sistema Multiidioma

```
1. Cliente escanea QR y carga página
   └── Detección automática de idioma del navegador
       └── Fallback al idioma por defecto (ES) si no soportado

2. Cliente selecciona idioma preferido
   └── Clic en bandera (ES 🇪🇸 | FR 🇫🇷 | EN 🇬🇧)
       └── Recarga contenido traducido via GET /mesa/{token}?lang=xx

3. Sistema carga traducciones
   ├── Productos traducidos desde ProductoTraduccion
   ├── Categorías traducidas desde CategoriaTraduccion  
   └── Textos de interfaz desde archivo de traducción

4. Admin gestiona traducciones
   └── Panel de traducciones en administración
       ├── Crear/editar traducciones de productos
       ├── Crear/editar traducciones de categorías
       └── Validar completitud de traducciones
```

---

## 8. Seguridad

### 8.1 Autenticación

- **Método:** Formulario de login con email/password
- **Hasher:** Bcrypt/Argon2 (auto-selección por Symfony)
- **Sesiones:** Cookies seguras con HttpOnly

### 8.2 Autorización (Roles)

| Rol | Código Symfony | Permisos |
|-----|----------------|----------|
| Administrador | `ROLE_ADMIN` | Acceso total al sistema |
| Gerente | `ROLE_GERENTE` | Acceso a administración y reportes |
| Cocinero | `ROLE_COCINA` | Acceso al panel de cocina |
| Barman | `ROLE_BARRA` | Acceso al panel de barra |
| Camarero | `ROLE_CAMARERO` | Acceso básico |

### 8.3 Control de Acceso

```yaml
access_control:
    - { path: ^/admin, roles: [ROLE_ADMIN, ROLE_GERENTE] }
    - { path: ^/cocina, roles: [ROLE_COCINA, ROLE_ADMIN, ROLE_GERENTE] }
    - { path: ^/barra, roles: [ROLE_BARRA, ROLE_ADMIN, ROLE_GERENTE] }
```

### 8.4 Protección CSRF

- Tokens CSRF stateless en formularios de login
- Validación en backend con `CsrfTokenBadge`
- Configuración en `csrf.yaml`

### 8.5 Validación de Datos

- Sanitización de inputs para evitar XSS
- Validación de tipos en backend
- Prepared statements (Doctrine) para prevenir SQL Injection

---

## 9. Estrategia de Pruebas

### 9.1 Pruebas Unitarias (PHPUnit)

```bash
php bin/phpunit
```

- Verificación de lógica de negocio
- Cálculos de totales y tickets
- Validación de estados

### 9.2 Pruebas de Integración

- Verificación de endpoints API
- Flujos completos de pedido
- Validación de contenedor de servicios

### 9.3 Validaciones Automáticas

```bash
# Validar contenedor
php bin/console lint:container

# Validar plantillas Twig
php bin/console lint:twig templates/

# Validar configuración YAML
php bin/console lint:yaml config/

# Validar esquema de base de datos
php bin/console doctrine:schema:validate
```

### 9.4 Pruebas Manuales (UAT)

- Escaneo de QR real con dispositivo móvil
- Flujo completo de pedido
- Cierre de mesa y generación de ticket

---

## 10. Conclusiones

### 10.1 Objetivos Cumplidos

✅ Carta digital interactiva con filtro de alérgenos  
✅ Sistema de pedidos en tiempo real (polling)  
✅ Panel de cocina con sistema semáforo  
✅ Panel de barra con gestión de mesas  
✅ Sistema de tickets fiscales con impresión  
✅ Panel de administración completo  
✅ Sistema de reservas con estados  
✅ Control de acceso por roles  
✅ Arquitectura Docker para despliegue  
✅ Modo oscuro en interfaz  
✅ Sistema multiidioma (ES/FR/EN) con banderas  

### 10.2 Líneas Futuras

- **WebSockets/Mercure:** Notificaciones push en tiempo real
- **App Nativa:** Desarrollo con React Native
- **Integración TPV:** Conexión con terminales de punto de venta
- **Multi-restaurante:** Soporte para cadenas
- **Analytics Avanzados:** Dashboard con métricas de negocio
- **Pagos Online:** Integración con Stripe/PayPal

---

## Anexos

### Anexo A: Variables de Entorno

```env
APP_ENV=prod
APP_SECRET=your-secret-key
DATABASE_URL=mysql://user:pass@database:3306/comanda
```

### Anexo B: Comandos de Despliegue

```bash
# Levantar contenedores
docker compose up -d

# Ejecutar migraciones
docker compose exec app php bin/console doctrine:migrations:migrate

# Cargar datos de demo
docker compose exec app php bin/console doctrine:fixtures:load

# Build de assets
npm run build
```

### Anexo C: Estructura de Archivos

```
Backend/
├── src/
│   ├── Controller/     # Controladores (Admin, Barra, Cocina, Mesa, Pedido, Security)
│   ├── Entity/         # Entidades Doctrine (12 entidades: +Idioma, +ProductoTraduccion, +CategoriaTraduccion)
│   ├── Repository/     # Repositorios con queries personalizadas
│   └── Security/       # Autenticador personalizado
├── templates/          # Plantillas Twig
├── assets/react/       # Componentes React
├── config/             # Configuración Symfony
├── migrations/         # Migraciones de base de datos
└── public/             # Punto de entrada y assets compilados
```

---

**Documento generado:** Febrero 2026  
**Autor:** Proyecto TFG - Comanda Digital
