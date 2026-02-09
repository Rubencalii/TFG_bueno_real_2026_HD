# 🎓 Presentación TFG: Comanda Digital

**Autor:** Rubén  
**Fecha:** Febrero 2026  
**Duración estimada exposición:** 15-20 minutos

---

## 📋 Índice de Exposición

1. [Introducción y Motivación](#1-introducción-y-motivación)
2. [Objetivos del Proyecto](#2-objetivos-del-proyecto)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Funcionalidades Principales](#6-funcionalidades-principales)
7. [Demostración en Vivo](#7-demostración-en-vivo)
8. [Aspectos Técnicos Destacables](#8-aspectos-técnicos-destacables)
9. [Conclusiones y Trabajo Futuro](#9-conclusiones-y-trabajo-futuro)

---

## 1. Introducción y Motivación

### El Problema

> "La hostelería ha sufrido una transformación digital, pero la mayoría de soluciones se limitan a **PDFs estáticos** accesibles por QR."

### Mi Solución

**Comanda Digital** es una PWA completa que:

- Conecta al **cliente** directamente con la **cocina**
- Automatiza todo el proceso: desde sentarse hasta pagar
- Elimina errores de comunicación y reduce tiempos de espera

### Punto clave para el tribunal

> 💡 "No es solo una carta digital, es un **sistema de gestión integral** del restaurante."

---

## 2. Objetivos del Proyecto

| Objetivo                  | Cómo lo resuelvo                                   |
| ------------------------- | -------------------------------------------------- |
| **Eliminar papel**        | Carta interactiva desde el móvil del cliente       |
| **Seguridad alimentaria** | Filtrado dinámico de alérgenos en tiempo real      |
| **Optimizar cocina**      | Sistema semáforo 🟢🟡🔴 según tiempo espera        |
| **Automatizar cobros**    | Tickets fiscales con desglose IVA automático       |
| **Gestión reservas**      | Sistema completo con estados y asignación de mesas |

---

## 3. Stack Tecnológico

### Diagrama para la presentación

```
┌─────────────────────────────────────────────────────┐
│                 📱 FRONTEND                          │
│   React 18 + Tailwind CSS (vía Symfony UX)          │
└─────────────────────────────────────────────────────┘
                        ↕ API REST
┌─────────────────────────────────────────────────────┐
│                 ⚙️ BACKEND                           │
│   Symfony 8.0 + PHP 8.3 + Doctrine ORM              │
└─────────────────────────────────────────────────────┘
                        ↕ Conexión
┌─────────────────────────────────────────────────────┐
│                 🗄️ BASE DE DATOS                     │
│   MariaDB 11.3                                       │
└─────────────────────────────────────────────────────┘
                        ↕ Contenedores
┌─────────────────────────────────────────────────────┐
│                 🐳 INFRAESTRUCTURA                   │
│   Docker + Docker Compose + Nginx                   │
└─────────────────────────────────────────────────────┘
```

### Por qué estas tecnologías (puntos a mencionar)

1. **Symfony 8**: Framework PHP más maduro, usado en empresas grandes (Spotify, Trivago)
2. **React**: Biblioteca más popular para interfaces reactivas
3. **Tailwind CSS**: Desarrollo visual rápido sin CSS custom
4. **Docker**: Mismo entorno en desarrollo y producción
5. **MariaDB**: Compatible MySQL, código abierto, rendimiento superior

---

## 4. Arquitectura del Sistema

### Los 4 Módulos

| Módulo      | Usuario  | Dispositivo | Función                        |
| ----------- | -------- | ----------- | ------------------------------ |
| **Cliente** | Comensal | 📱 Móvil    | Ver carta, pedir, pagar        |
| **Cocina**  | Cocinero | 📊 Tablet   | Ver pedidos, gestionar tiempos |
| **Barra**   | Camarero | 📊 Tablet   | Ver bebidas, cerrar mesas      |
| **Admin**   | Gerente  | 💻 PC       | Gestionar todo el sistema      |

### Flujo de datos (importante explicar)

```
CLIENTE                    BACKEND                  COCINA/BARRA
   │                          │                          │
   │  1. Escanea QR           │                          │
   │ ─────────────────────────>│                          │
   │  2. Recibe carta         │                          │
   │ <─────────────────────────│                          │
   │                          │                          │
   │  3. Añade productos      │                          │
   │  (local en React)        │                          │
   │                          │                          │
   │  4. Confirma pedido      │                          │
   │ ─────────────────────────>│  5. Guarda en BD        │
   │                          │ ─────────────────────────>│
   │                          │  6. Polling cada 10s     │
   │                          │ <─────────────────────────│
   │                          │  7. Nuevo pedido!        │
   │                          │ ─────────────────────────>│
```

---

## 5. Modelo de Datos

### 9 Entidades principales

| Entidad           | Descripción          | Relaciones                                     |
| ----------------- | -------------------- | ---------------------------------------------- |
| **User**          | Usuarios del sistema | Roles: admin, gerente, cocina, barra, camarero |
| **Mesa**          | Mesas físicas        | → Pedidos, → Tickets, → Reservas               |
| **Categoria**     | Categorías del menú  | → Productos                                    |
| **Producto**      | Platos y bebidas     | → Alérgenos (N:M)                              |
| **Pedido**        | Pedido de cliente    | → Mesa, → Detalles                             |
| **DetallePedido** | Línea de pedido      | → Pedido, → Producto                           |
| **Ticket**        | Factura/ticket       | → Mesa                                         |
| **Reserva**       | Reserva de mesa      | → Mesa                                         |
| **Alergeno**      | Alérgeno alimentario | ← Productos (N:M)                              |

### Diagrama E-R simplificado

```
Mesa ──1:N──> Pedido ──1:N──> DetallePedido ──N:1──> Producto
  │                                                      │
  │──1:N──> Ticket                                       │
  │                                        Producto <──N:M──> Alergeno
  │──1:N──> Reserva                              │
                                                 N:1
                                                 │
                                            Categoria
```

---

## 6. Funcionalidades Principales

### 6.1 Módulo Cliente

**Puntos clave a demostrar:**

1. **Acceso por QR**: Cada mesa tiene un token único → `/mesa/{token}`
2. **Filtro de alérgenos**: Click en icono → oculta productos no aptos
3. **Carrito flotante**: Siempre visible, muestra total en tiempo real
4. **Multiidioma**: ES 🇪🇸 / EN 🇬🇧 / FR 🇫🇷
5. **Pedir cuenta**: Elige método de pago (efectivo/tarjeta/online)

### 6.2 Módulo Cocina/Barra

**Sistema semáforo (muy visual para demo):**

| Color       | Tiempo   | Significado  |
| ----------- | -------- | ------------ |
| 🟢 Verde    | 0-5 min  | Todo bien    |
| 🟡 Amarillo | 5-10 min | Ojo, apúrate |
| 🔴 Rojo     | +10 min  | ¡Urgente!    |

**Tablero Kanban:**

- Columnas: Pendiente → En Preparación → Listo → Entregado
- Cambio de estado con 1 click/touch

### 6.3 Módulo Administración

**8 secciones de gestión:**

1. **Dashboard**: Vista general del restaurante
2. **Productos**: CRUD completo con alérgenos e imágenes
3. **Categorías**: Organización del menú (cocina/barra)
4. **Mesas**: Crear, editar, regenerar QR
5. **Usuarios**: Roles y permisos
6. **Tickets**: Facturación, anulación, exportar CSV
7. **Reservas**: Estados, asignación de mesas
8. **Reportes**: Ventas por día, productos top, horas punta

---

## 7. Demostración en Vivo

### Guión de demo (orden sugerido)

#### Paso 1: Mostrar el menú del cliente (2 min)

```
URL: http://localhost:8001/mesa/{token}
```

- Navegar por categorías
- Mostrar filtro de alérgenos
- Añadir productos al carrito
- Cambiar idioma

#### Paso 2: Confirmar pedido (1 min)

- Click en "Confirmar Pedido"
- Mostrar mensaje de éxito

#### Paso 3: Ir a Cocina (2 min)

```
URL: http://localhost:8001/cocina/
```

- Mostrar el pedido que acaba de llegar (semáforo verde)
- Esperar unos segundos → cambia a amarillo
- Cambiar estado a "En Preparación"
- Cambiar estado a "Listo"

#### Paso 4: Cobrar desde Barra (2 min)

```
URL: http://localhost:8001/barra/
```

- Mostrar notificación de mesa
- Generar ticket
- Mostrar ticket con desglose IVA

#### Paso 5: Panel Admin (3 min)

```
URL: http://localhost:8001/admin/
```

- Mostrar dashboard
- Crear un producto nuevo
- Mostrar reportes de ventas
- Exportar tickets a CSV

---

## 8. Aspectos Técnicos Destacables

### 8.1 Buenas Prácticas Aplicadas

| Práctica        | Implementación                                                |
| --------------- | ------------------------------------------------------------- |
| **SOLID**       | Controladores pequeños (8 controladores Admin refactorizados) |
| **Seguridad**   | CSRF protection, roles ACL, passwords hasheados               |
| **Clean Code**  | Código documentado, nombres descriptivos                      |
| **Docker**      | Todo en contenedores, un comando para arrancar                |
| **Multiidioma** | Sistema de traducciones Symfony estándar                      |

### 8.2 Métricas del Proyecto

| Métrica                | Valor  |
| ---------------------- | ------ |
| Líneas de código PHP   | ~5,000 |
| Líneas de código React | ~3,500 |
| Entidades Doctrine     | 9      |
| Endpoints API          | 50+    |
| Controladores          | 15     |
| Componentes React      | 25+    |

### 8.3 Arquitectura de Controladores (refactorización)

**Punto a mencionar sobre calidad de código:**

> "Refactoricé un controlador monolítico de 1,384 líneas en 8 controladores especializados, aplicando el principio de Responsabilidad Única (SOLID)."

```
Antes:                    Después:
AdminController (52KB) →  ProductoController (3.4KB)
                          CategoriaController (2.9KB)
                          AlergenoController (1.8KB)
                          UsuarioController (3.8KB)
                          MesaController (8.6KB)
                          TicketController (10.3KB)
                          ReservaController (8.4KB)
                          ReporteController (7.9KB)
```

---

## 9. Conclusiones y Trabajo Futuro

### ✅ Objetivos Cumplidos

1. ✅ Sistema completo de comandas funcional
2. ✅ Interfaz adaptada a móvil, tablet y PC
3. ✅ Gestión de alérgenos en tiempo real
4. ✅ Sistema de tickets con validez fiscal
5. ✅ Panel de administración completo
6. ✅ Soporte multiidioma (ES/EN/FR)
7. ✅ Despliegue con Docker en un comando

### 🔮 Trabajo Futuro

| Mejora               | Descripción                                             |
| -------------------- | ------------------------------------------------------- |
| **WebSockets**       | Reemplazar polling por notificaciones push reales       |
| **App Nativa**       | Versión iOS/Android con React Native                    |
| **Pasarela de Pago** | Integrar Stripe/Redsys para pagos online reales         |
| **IA**               | Recomendaciones personalizadas según pedidos anteriores |
| **Inventario**       | Gestión de stock automática                             |

---

## 📝 Preguntas Frecuentes del Tribunal

### "¿Por qué Symfony y no Laravel?"

> Symfony tiene mejor arquitectura empresarial, más modular, y es la base de otras herramientas (Drupal, Magento). Laravel es más opinado.

### "¿Por qué no usaste WebSockets?"

> Prioricé funcionalidad completa. El polling cada 10 segundos es suficiente para el caso de uso. Los WebSockets están en el roadmap futuro.

### "¿Cómo gestionas la seguridad?"

> CSRF tokens en todos los formularios, passwords hasheados con bcrypt, ACL por roles (admin, gerente, cocinero, camarero), APP_SECRET seguro.

### "¿Es escalable?"

> Sí, Docker permite escalar horizontalmente añadiendo más contenedores. La BD puede migrarse a un cluster MariaDB.

### "¿Cuánto tiempo dedicaste?"

> Aproximadamente X meses de desarrollo, incluyendo investigación, diseño, implementación y testing.

---

## 🎯 Checklist Pre-Exposición

- [ ] Docker arrancado y funcionando
- [ ] Datos de demo cargados (35 productos, 15 mesas)
- [ ] Navegador con pestañas preparadas: Cliente, Cocina, Barra, Admin
- [ ] Presentación o diapositivas de apoyo listas
- [ ] Móvil para simular escaneo QR (opcional)
- [ ] Cronómetro para controlar tiempos

---

**¡Mucha suerte con la exposición! 🍀**
