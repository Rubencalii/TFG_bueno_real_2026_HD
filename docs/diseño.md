# Diseño Visual - Comanda Digital

**Proyecto:** Trabajo de Fin de Grado (TFG)  
**Sistema:** Comanda Digital - Aplicación Web Progresiva para Restaurantes  
**Versión:** 2.0 (Febrero 2026)  
**Framework CSS:** Tailwind CSS  
**Diseño:** Mobile First & Responsive + Dark Mode

---

## 📋 Índice

1. [Paleta de Colores](#1-paleta-de-colores)
2. [Sistema Semáforo (Cocina)](#2-sistema-semáforo-cocina)
3. [Modo Oscuro](#3-modo-oscuro)
4. [Componentes UI](#4-componentes-ui)
5. [Diseño por Módulo](#5-diseño-por-módulo)
6. [Configuración Tailwind](#6-configuración-tailwind)
7. [Accesibilidad](#7-accesibilidad)
8. [Iconografía](#8-iconografía)

---

## 1. Paleta de Colores

### 1.1 Color Primario (Acción/CTA)

| Propiedad | Valor |
|-----------|-------|
| **Color** | Azul Profesional |
| **Hex** | `#2563EB` |
| **RGB** | `rgb(37, 99, 235)` |
| **Tailwind** | `blue-600` / `primary` |

**Uso:**
- Botones principales ("Confirmar Pedido", "Añadir al Carrito")
- Enlaces y elementos interactivos
- Barra de navegación activa
- Iconos de acción

**Estados:**
| Estado | Color | Clase Tailwind |
|--------|-------|----------------|
| Normal | `#2563EB` | `bg-primary` |
| Hover | `#1D4ED8` | `hover:bg-blue-700` |
| Active | `#1E40AF` | `active:bg-blue-800` |
| Disabled | `#93C5FD` | `bg-blue-300` |

---

### 1.2 Color Secundario (Calidez)

| Propiedad | Valor |
|-----------|-------|
| **Color** | Naranja Cálido |
| **Hex** | `#F97316` |
| **RGB** | `rgb(249, 115, 22)` |
| **Tailwind** | `orange-500` |

**Uso:**
- Acentos visuales
- Categorías destacadas
- Badges de "Nuevo" o "Destacado"
- Elementos decorativos

---

### 1.3 Colores Neutros

| Uso | Hex | Tailwind | Aplicación |
|-----|-----|----------|------------|
| Texto principal | `#1F2937` | `gray-800` | Títulos, encabezados |
| Texto secundario | `#6B7280` | `gray-500` | Descripciones, subtítulos |
| Texto deshabilitado | `#9CA3AF` | `gray-400` | Elementos inactivos |
| Fondo claro | `#F9FAFB` | `gray-50` | Fondo general app |
| Fondo tarjetas | `#FFFFFF` | `white` | Cards, modales |
| Bordes | `#E5E7EB` | `gray-200` | Separadores, bordes |

---

## 2. Sistema Semáforo (Cocina)

Sistema de alertas visuales basado en el tiempo de espera de los pedidos.

### 2.1 Configuración de Tiempos

| Estado | Tiempo | Color | Hex | Tailwind |
|--------|--------|-------|-----|----------|
| 🟢 **Reciente** | 0-5 min | Verde | `#10B981` | `emerald-500` |
| 🟡 **Alerta** | 5-10 min | Amarillo | `#F59E0B` | `amber-500` |
| 🔴 **Crítico** | +10 min | Rojo | `#EF4444` | `red-500` |

### 2.2 Aplicación Visual

```html
<!-- Tarjeta VERDE (0-5 min) -->
<div class="bg-white border-l-4 border-emerald-500 rounded-lg shadow">
  ...
</div>

<!-- Tarjeta AMARILLA (5-10 min) -->
<div class="bg-amber-50 border-l-4 border-amber-500 rounded-lg shadow">
  ...
</div>

<!-- Tarjeta ROJA (+10 min) - Con animación -->
<div class="bg-red-50 border-l-4 border-red-500 rounded-lg shadow animate-pulse">
  ...
</div>
```

### 2.3 Gradientes de Tiempo (Implementación React)

```javascript
const getColorByTime = (minutes) => {
  if (minutes < 5) return 'border-emerald-500';
  if (minutes < 10) return 'border-amber-500 bg-amber-50';
  return 'border-red-500 bg-red-50 animate-pulse';
};
```

---

## 3. Modo Oscuro

El sistema soporta modo oscuro automático basado en preferencias del sistema.

### 3.1 Colores Modo Oscuro

| Elemento | Light Mode | Dark Mode |
|----------|------------|-----------|
| Fondo app | `gray-50` | `slate-900` |
| Fondo tarjetas | `white` | `slate-800` |
| Texto principal | `gray-800` | `white` |
| Texto secundario | `gray-500` | `gray-400` |
| Bordes | `gray-200` | `slate-700` |
| Inputs | `white` | `slate-700` |

### 3.2 Clases Tailwind Dark Mode

```html
<!-- Ejemplo de tarjeta con dark mode -->
<div class="bg-white dark:bg-slate-800 
            text-gray-800 dark:text-white 
            border border-gray-200 dark:border-slate-700 
            rounded-xl shadow">
  <h3 class="font-bold dark:text-white">Título</h3>
  <p class="text-gray-500 dark:text-gray-400">Descripción</p>
</div>

<!-- Ejemplo de input con dark mode -->
<input class="w-full px-3 py-2 
              bg-white dark:bg-slate-700 
              border dark:border-slate-600 
              text-gray-800 dark:text-white 
              dark:placeholder-gray-400
              rounded-lg" />
```

### 3.3 Configuración Tailwind para Dark Mode

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // o 'media' para automático
  // ...
}
```

---

## 4. Componentes UI

### 4.1 Botones

#### Botón Primario
```html
<button class="px-4 py-2 bg-primary text-white rounded-lg 
               hover:bg-blue-700 transition-colors
               disabled:bg-blue-300 disabled:cursor-not-allowed">
  Confirmar
</button>
```

#### Botón Secundario
```html
<button class="px-4 py-2 border border-gray-300 dark:border-slate-600 
               text-gray-700 dark:text-white rounded-lg 
               hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
  Cancelar
</button>
```

#### Botón Peligro
```html
<button class="px-4 py-2 bg-red-600 text-white rounded-lg 
               hover:bg-red-700 transition-colors">
  Eliminar
</button>
```

#### Botón Éxito
```html
<button class="px-4 py-2 bg-emerald-600 text-white rounded-lg 
               hover:bg-emerald-700 transition-colors">
  Guardar
</button>
```

### 4.2 Tarjetas

#### Tarjeta Básica
```html
<div class="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 
            border border-gray-100 dark:border-slate-700">
  <h3 class="font-bold text-gray-800 dark:text-white">Título</h3>
  <p class="text-gray-500 dark:text-gray-400 mt-2">Contenido</p>
</div>
```

#### Tarjeta de Producto
```html
<div class="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
  <img src="..." class="w-full h-32 object-cover" />
  <div class="p-4">
    <h3 class="font-bold dark:text-white">Producto</h3>
    <p class="text-primary font-bold">12.50€</p>
    <button class="mt-2 w-full py-2 bg-primary text-white rounded-lg">
      Añadir
    </button>
  </div>
</div>
```

### 4.3 Badges

#### Badge de Estado
```html
<!-- Pendiente -->
<span class="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
  Pendiente
</span>

<!-- En Preparación -->
<span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
  En Preparación
</span>

<!-- Listo -->
<span class="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
  Listo
</span>

<!-- Entregado -->
<span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
  Entregado
</span>
```

#### Badge de Alerta (Alergia)
```html
<span class="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-full 
             animate-pulse">
  ⚠️ CELIACO
</span>
```

### 4.4 Modales

```html
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div class="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md 
              shadow-xl transform transition-all">
    <!-- Header -->
    <div class="p-4 border-b dark:border-slate-700">
      <h3 class="text-lg font-bold dark:text-white">Título Modal</h3>
    </div>
    
    <!-- Content -->
    <div class="p-4">
      <p class="text-gray-600 dark:text-gray-300">Contenido del modal</p>
    </div>
    
    <!-- Footer -->
    <div class="p-4 border-t dark:border-slate-700 flex gap-2 justify-end">
      <button class="px-4 py-2 border rounded-lg dark:border-slate-600 dark:text-white">
        Cancelar
      </button>
      <button class="px-4 py-2 bg-primary text-white rounded-lg">
        Confirmar
      </button>
    </div>
  </div>
</div>
```

### 4.5 Formularios

```html
<form class="space-y-4">
  <!-- Input de texto -->
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Nombre
    </label>
    <input type="text" 
           class="w-full px-3 py-2 border rounded-lg
                  bg-white dark:bg-slate-700 
                  border-gray-300 dark:border-slate-600
                  text-gray-800 dark:text-white
                  focus:ring-2 focus:ring-primary focus:border-transparent
                  dark:placeholder-gray-400"
           placeholder="Introduce el nombre" />
  </div>
  
  <!-- Select -->
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Categoría
    </label>
    <select class="w-full px-3 py-2 border rounded-lg
                   bg-white dark:bg-slate-700 
                   border-gray-300 dark:border-slate-600
                   text-gray-800 dark:text-white">
      <option>Opción 1</option>
      <option>Opción 2</option>
    </select>
  </div>
  
  <!-- Textarea -->
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Descripción
    </label>
    <textarea class="w-full px-3 py-2 border rounded-lg
                     bg-white dark:bg-slate-700 
                     border-gray-300 dark:border-slate-600
                     text-gray-800 dark:text-white
                     dark:placeholder-gray-400"
              rows="3"
              placeholder="Descripción del producto"></textarea>
  </div>
</form>
```

---

## 5. Diseño por Módulo

### 5.1 Módulo Cliente (Móvil)

```
┌────────────────────────────────────┐
│  🍽️ Restaurante       Mesa 5      │  ← Header fijo
├────────────────────────────────────┤
│  [Entrantes] [Pizzas] [Bebidas]   │  ← Navegación categorías
├────────────────────────────────────┤
│                                    │
│  ┌─────────────────────────────┐   │
│  │ 🍕 Margherita         9.50€ │   │  ← Tarjetas de productos
│  │ Tomate, mozzarella, albahaca│   │
│  │                       [+]   │   │
│  └─────────────────────────────┘   │
│                                    │
│  ┌─────────────────────────────┐   │
│  │ 🥗 Ensalada César    8.00€  │   │
│  │ Lechuga, pollo, parmesano   │   │
│  │                       [+]   │   │
│  └─────────────────────────────┘   │
│                                    │
├────────────────────────────────────┤
│  🛒 3 items              25.50€   │  ← Carrito flotante
│  [        Ver Pedido         ]    │
└────────────────────────────────────┘
```

**Colores aplicados:**
- Fondo: `bg-gray-50 dark:bg-slate-900`
- Header: `bg-white dark:bg-slate-800`
- Tarjetas: `bg-white dark:bg-slate-800`
- Carrito: `bg-primary text-white`

### 5.2 Módulo Cocina (Tablero Kanban)

```
┌─────────────────────────────────────────────────────────────────┐
│  🍳 COCINA                                    12:45 | 8 pedidos │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  PENDIENTE  │  │ EN PREPAR.  │  │    LISTO    │  │ENTREGADO│ │
│  │    (3)      │  │    (2)      │  │    (2)      │  │   (1)   │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────┤ │
│  │┌───────────┐│  │┌───────────┐│  │┌───────────┐│  │         │ │
│  ││🟢 Mesa 5  ││  ││🟡 Mesa 3  ││  ││🟢 Mesa 7  ││  │         │ │
│  ││ 2x Pizza  ││  ││ 1x Burger ││  ││ 3x Pasta  ││  │         │ │
│  ││ 12:42     ││  ││ 12:35     ││  ││ 12:40     ││  │         │ │
│  │└───────────┘│  │└───────────┘│  │└───────────┘│  │         │ │
│  │             │  │             │  │             │  │         │ │
│  │┌───────────┐│  │┌───────────┐│  │┌───────────┐│  │         │ │
│  ││🟢 Mesa 2  ││  ││🔴 Mesa 1  ││  ││🟡 Mesa 4  ││  │         │ │
│  ││ 1x Risotto││  ││ ⚠️ CELIACO││  ││ 2x Ensala.││  │         │ │
│  ││ 12:44     ││  ││ 12:25     ││  ││ 12:38     ││  │         │ │
│  │└───────────┘│  │└───────────┘│  │└───────────┘│  │         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Colores aplicados:**
- Fondo: `bg-gray-100 dark:bg-slate-900`
- Columnas: `bg-gray-200/50 dark:bg-slate-800`
- Tarjetas: `bg-white dark:bg-slate-700`
- Semáforo: bordes coloreados según tiempo

### 5.3 Módulo Barra

Similar a cocina pero con:
- Filtro solo para categorías tipo "barra"
- Indicadores de mesas que piden cuenta
- Indicadores de mesas que llaman al camarero
- Botón de cierre de mesa y generación de ticket

### 5.4 Módulo Administración (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 Panel de Administración              [Usuario] [🚪 Salir]  │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│  📦 Productos│   GESTIÓN DE PRODUCTOS                           │
│  📁 Categorías│  ┌─────────────────────────────────────────────┐ │
│  🪑 Mesas    │  │ [+ Nuevo Producto]                  🔍 Buscar│ │
│  👥 Usuarios │  ├─────────────────────────────────────────────┤ │
│  🎫 Tickets  │  │ Nombre      │ Categoría │ Precio │ Acciones │ │
│  📅 Reservas │  ├─────────────────────────────────────────────┤ │
│  📊 Reportes │  │ Margherita  │ Pizzas    │ 9.50€  │ ✏️ 🗑️   │ │
│              │  │ César       │ Ensaladas │ 8.00€  │ ✏️ 🗑️   │ │
│              │  │ Cerveza     │ Bebidas   │ 3.00€  │ ✏️ 🗑️   │ │
│              │  └─────────────────────────────────────────────┘ │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

**Colores aplicados:**
- Sidebar: `bg-slate-800 text-white`
- Contenido: `bg-gray-50 dark:bg-slate-900`
- Tablas: `bg-white dark:bg-slate-800`
- Acciones: iconos con colores semánticos

---

## 6. Configuración Tailwind

### 6.1 tailwind.config.js

```javascript
module.exports = {
  darkMode: 'class',
  content: [
    './templates/**/*.html.twig',
    './assets/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Color primario personalizado
        'primary': {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        
        // Sistema semáforo
        'semaforo': {
          'verde': '#10B981',
          'amarillo': '#F59E0B',
          'rojo': '#EF4444',
        },
        
        // Alertas
        'alerta': {
          'critica': '#DC2626',
          'exito': '#059669',
          'info': '#2563EB',
          'advertencia': '#F59E0B',
        },
      },
      
      // Animaciones personalizadas
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      // Espaciado mínimo para áreas táctiles
      minWidth: {
        'touch': '44px',
      },
      minHeight: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
```

---

## 7. Accesibilidad

### 7.1 Contraste WCAG 2.1

Todas las combinaciones cumplen con el **nivel AA** (mínimo 4.5:1 para texto normal).

| Texto | Fondo | Ratio | Nivel |
|-------|-------|-------|-------|
| `gray-800` | `white` | 14.8:1 | AAA ✅ |
| `gray-500` | `white` | 7.0:1 | AAA ✅ |
| `white` | `primary` | 6.1:1 | AA ✅ |
| `white` | `red-600` | 5.9:1 | AA ✅ |
| `white` | `slate-800` | 12.6:1 | AAA ✅ |

### 7.2 Áreas Táctiles

- **Mínimo:** 44x44px (Apple) / 48x48px (Android)
- **Implementación:** `min-h-[44px] min-w-[44px]` o `min-h-touch min-w-touch`

### 7.3 Indicadores No Dependientes del Color

El sistema semáforo se complementa con:
- **Iconos:** ⏰ (reloj) para indicar tiempo
- **Texto:** Timestamp visible (ej: "12:45 - Hace 8 min")
- **Orden:** Tarjetas más antiguas arriba
- **Animación:** Pulso para estados críticos

### 7.4 Herramientas de Validación

- **Contraste:** https://webaim.org/resources/contrastchecker/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

## 8. Iconografía

### 8.1 Emojis del Sistema

| Contexto | Emoji | Uso |
|----------|-------|-----|
| Mesa | 🪑 | Identificación de mesas |
| Cocina | 🍳 | Panel de cocina |
| Barra | 🍺 | Panel de barra |
| Producto | 🍕🥗🍔 | Categorías de productos |
| Usuario | 👤 | Gestión de usuarios |
| Admin | 👑 | Rol administrador |
| Gerente | 👔 | Rol gerente |
| Camarero | 🧑‍🍳 | Rol camarero |
| Cocinero | 👨‍🍳 | Rol cocinero |
| Barman | 🍸 | Rol barman |
| Alerta | ⚠️ | Alertas de alergia |
| Éxito | ✅ | Confirmaciones |
| Error | ❌ | Errores |
| Ticket | 🎫 | Sistema de tickets |
| Reserva | 📅 | Sistema de reservas |
| Dinero | 💰 | Pagos y cobros |

### 8.2 Estados de Pedido

| Estado | Emoji | Color |
|--------|-------|-------|
| Pendiente | ⏳ | `amber-500` |
| En Preparación | 🔥 | `blue-500` |
| Listo | ✅ | `emerald-500` |
| Entregado | 📦 | `gray-500` |

### 8.3 Métodos de Pago

| Método | Emoji |
|--------|-------|
| Efectivo | 💵 |
| Tarjeta | 💳 |
| TPV | 📱 |

---

## Visualización de la Paleta

```
┌─────────────────────────────────────────────────────────────────┐
│                    PALETA DE COLORES                             │
│                   COMANDA DIGITAL v2.0                           │
└─────────────────────────────────────────────────────────────────┘

COLORES PRINCIPALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

█████████  Primario (Blue-600)
           #2563EB · rgb(37, 99, 235)
           Botones CTA, Enlaces, Acciones

█████████  Secundario (Orange-500)
           #F97316 · rgb(249, 115, 22)
           Acentos, Destacados


SISTEMA SEMÁFORO (COCINA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

█████████  Verde (Emerald-500) · 0-5 min
           #10B981 · Pedido reciente

█████████  Amarillo (Amber-500) · 5-10 min
           #F59E0B · Alerta de demora

█████████  Rojo (Red-500) · +10 min
           #EF4444 · Crítico/Retrasado


MODO CLARO (Light Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

█████████  Gray-800 · Texto principal
           #1F2937

█████████  Gray-500 · Texto secundario
           #6B7280

█████████  Gray-50 · Fondo app
           #F9FAFB

█████████  White · Tarjetas
           #FFFFFF


MODO OSCURO (Dark Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

█████████  Slate-900 · Fondo app
           #0F172A

█████████  Slate-800 · Tarjetas
           #1E293B

█████████  Slate-700 · Inputs, bordes
           #334155

█████████  White · Texto principal
           #FFFFFF


ALERTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

█████████  Red-600 · Alergia crítica
           #DC2626

█████████  Emerald-600 · Éxito
           #059669

█████████  Amber-500 · Advertencia
           #F59E0B
```

---

**Documento generado:** Febrero 2026  
**Autor:** Proyecto TFG - Comanda Digital  
**Framework:** Tailwind CSS 3.x
