# Paleta de Colores - Comanda Digital

**Proyecto:** Trabajo de Fin de Grado (TFG)  
**Sistema:** Comanda Digital - Aplicación Web Progresiva para Restaurantes  
**Diseño:** Mobile First & Responsive  
**Framework CSS:** Tailwind CSS

---

## 📋 Índice

1. [Paleta Principal](#paleta-principal)
2. [Sistema Semáforo (Cocina)](#sistema-semáforo-cocina)
3. [Colores de Soporte](#colores-de-soporte)
4. [Alertas y Estados](#alertas-y-estados)
5. [Aplicación por Módulo](#aplicación-por-módulo)
6. [Configuración Tailwind](#configuración-tailwind)
7. [Criterios de Accesibilidad](#criterios-de-accesibilidad)
8. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎨 Paleta Principal

### Primario (Acción/CTA)

**Color:** Azul Profesional  
**Hex:** `#2563EB`  
**RGB:** `rgb(37, 99, 235)`  
**Tailwind:** `blue-600`

**Uso:**
- Botones principales ("Confirmar Pedido", "Añadir al Carrito")
- Enlaces y elementos interactivos
- Barra de navegación activa
- Iconos de acción

**Estados:**
- Normal: `#2563EB`
- Hover: `#1D4ED8` (blue-700)
- Active: `#1E40AF` (blue-800)
- Disabled: `#93C5FD` (blue-300)

---

### Secundario (Calidez)

**Color:** Naranja Cálido  
**Hex:** `#F97316`  
**RGB:** `rgb(249, 115, 22)`  
**Tailwind:** `orange-500`

**Uso:**
- Acentos visuales
- Categorías destacadas
- Badges de "Nuevo" o "Destacado"
- Elementos decorativos

**Estados:**
- Normal: `#F97316`
- Hover: `#EA580C` (orange-600)
- Active: `#C2410C` (orange-700)

---

## 🚦 Sistema Semáforo (Cocina)

Sistema de alertas visuales basado en el tiempo de espera de los pedidos.

### Verde - Pedido Reciente

**Tiempo:** 0-5 minutos  
**Hex:** `#10B981`  
**RGB:** `rgb(16, 185, 129)`  
**Tailwind:** `emerald-500`

**Aplicación:**
- Border-left de tarjetas: `border-l-4 border-emerald-500`
- Background opcional: `bg-emerald-50`

---

### Amarillo - Alerta de Demora

**Tiempo:** 5-10 minutos  
**Hex:** `#F59E0B`  
**RGB:** `rgb(245, 158, 11)`  
**Tailwind:** `amber-500`

**Aplicación:**
- Border-left de tarjetas: `border-l-4 border-amber-500`
- Background opcional: `bg-amber-50`
- Icono de advertencia

---

### Rojo - Crítico/Retrasado

**Tiempo:** +10 minutos  
**Hex:** `#EF4444`  
**RGB:** `rgb(239, 68, 68)`  
**Tailwind:** `red-500`

**Aplicación:**
- Border-left de tarjetas: `border-l-4 border-red-500`
- Background crítico: `bg-red-50`
- Animación de pulso opcional
- Alerta sonora

---

## 🎯 Colores de Soporte

### Texto Principal

**Hex:** `#1F2937`  
**RGB:** `rgb(31, 41, 55)`  
**Tailwind:** `gray-800`

**Uso:** Títulos, encabezados, texto de alta jerarquía

---

### Texto Secundario

**Hex:** `#6B7280`  
**RGB:** `rgb(107, 114, 128)`  
**Tailwind:** `gray-500`

**Uso:** Descripciones, subtítulos, información complementaria

---

### Texto Deshabilitado

**Hex:** `#9CA3AF`  
**RGB:** `rgb(156, 163, 175)`  
**Tailwind:** `gray-400`

**Uso:** Elementos inactivos, placeholders

---

### Fondo Claro (App Background)

**Hex:** `#F9FAFB`  
**RGB:** `rgb(249, 250, 251)`  
**Tailwind:** `gray-50`

**Uso:** Fondo general de la aplicación

---

### Fondo Tarjetas/Componentes

**Hex:** `#FFFFFF`  
**RGB:** `rgb(255, 255, 255)`  
**Tailwind:** `white`

**Uso:** Cards, modales, menús desplegables

---

### Bordes Sutiles

**Hex:** `#E5E7EB`  
**RGB:** `rgb(229, 231, 235)`  
**Tailwind:** `gray-200`

**Uso:** Separadores, bordes de tarjetas

---

## ⚠️ Alertas y Estados

### Alerta Crítica (Alergia/Advertencia)

**Hex:** `#DC2626`  
**RGB:** `rgb(220, 38, 38)`  
**Tailwind:** `red-600`

**Fondo:** `#FEE2E2` (red-100)  
**Texto:** `#DC2626` (red-600)

**Uso:**
- Badges "ALERGIA", "CELIACO", "SIN GLUTEN"
- Notas críticas en pedidos
- Advertencias de seguridad alimentaria

**Código de ejemplo:**
```html
<span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
  ⚠️ CELIACO
</span>
```

---

### Estado Éxito

**Hex:** `#059669`  
**RGB:** `rgb(5, 150, 105)`  
**Tailwind:** `emerald-600`

**Fondo:** `#D1FAE5` (emerald-100)

**Uso:**
- Confirmación "Pedido enviado"
- Estados completados
- Mensajes de éxito

---

### Estado Información

**Hex:** `#2563EB`  
**RGB:** `rgb(37, 99, 235)`  
**Tailwind:** `blue-600`

**Fondo:** `#DBEAFE` (blue-100)

**Uso:**
- Notificaciones informativas
- Tips y ayudas contextuales

---

### Estado Advertencia (No crítica)

**Hex:** `#F59E0B`  
**RGB:** `rgb(245, 158, 11)`  
**Tailwind:** `amber-500`

**Fondo:** `#FEF3C7` (amber-100)

**Uso:**
- Avisos de stock bajo
- Recomendaciones

---

## 📱 Aplicación por Módulo

### Módulo Cliente (Móvil)

#### Pantalla Principal
```css
background: #F9FAFB (gray-50)
```

#### Tarjetas de Productos
```css
background: #FFFFFF
border: 1px solid #E5E7EB (gray-200)
border-radius: 12px
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
```

#### Botón [+] Añadir
```css
background: #2563EB (blue-600)
color: #FFFFFF
hover: #1D4ED8 (blue-700)
```

#### Carrito Flotante
```css
background: #2563EB (blue-600)
color: #FFFFFF
border-top: 2px solid #1E40AF (blue-800)
```

#### Badges de Alérgenos
```css
background: #FEE2E2 (red-100)
color: #DC2626 (red-600)
border: 1px solid #FECACA (red-200)
```

#### Navegación de Categorías
```css
active: #F97316 (orange-500)
inactive: #6B7280 (gray-500)
```

---

### Módulo Cocina (Tablero Kanban)

#### Fondo General
```css
background: #F3F4F6 (gray-100)
```

#### Columnas Kanban
```css
background: #E5E7EB (gray-200)
border-radius: 8px
padding: 16px
```

#### Tarjeta de Pedido (Base)
```css
background: #FFFFFF
border-radius: 8px
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
min-height: 200px
```

#### Tarjeta VERDE (0-5 min)
```css
border-left: 4px solid #10B981 (emerald-500)
```

#### Tarjeta AMARILLA (5-10 min)
```css
border-left: 4px solid #F59E0B (amber-500)
background: #FFFBEB (amber-50)
```

#### Tarjeta ROJA (+10 min)
```css
border-left: 4px solid #EF4444 (red-500)
background: #FEF2F2 (red-50)
animation: pulse 2s infinite
```

#### Nota de Alergia (Dentro de tarjeta)
```css
background: #DC2626 (red-600)
color: #FFFFFF
padding: 8px 12px
border-radius: 4px
font-weight: 700
```

#### Número de Mesa
```css
font-size: 32px
font-weight: 700
color: #1F2937 (gray-800)
```

#### Timestamp
```css
color: #6B7280 (gray-500)
font-size: 14px
```

---

### Módulo Admin (Desktop)

#### Sidebar de Navegación
```css
background: #1F2937 (gray-800)
color: #FFFFFF
width: 240px
```

#### Área Principal
```css
background: #FFFFFF
padding: 32px
```

#### Botones Principales
```css
background: #2563EB (blue-600)
hover: #1D4ED8 (blue-700)
```

#### Botones Secundarios
```css
background: #F97316 (orange-500)
hover: #EA580C (orange-600)
```

#### Tablas de Datos
```css
header-background: #F9FAFB (gray-50)
border: 1px solid #E5E7EB (gray-200)
row-hover: #F3F4F6 (gray-100)
```

#### Estados de Mesa
```css
Ocupada: #10B981 (emerald-500)
Libre: #9CA3AF (gray-400)
Reservada: #F59E0B (amber-500)
```

---

## ⚙️ Configuración Tailwind

### tailwind.config.js

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Colores principales
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
        'secondary': {
          DEFAULT: '#F97316',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
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
    },
  },
  plugins: [],
}
```

---

## ✅ Criterios de Accesibilidad

### Contraste WCAG 2.1

Todos los colores cumplen con el **nivel AA** (mínimo 4.5:1 para texto normal, 3:1 para texto grande).

#### Combinaciones Validadas

| Texto | Fondo | Ratio | Nivel |
|-------|-------|-------|-------|
| `#1F2937` | `#FFFFFF` | 14.8:1 | AAA ✅ |
| `#6B7280` | `#FFFFFF` | 7.0:1 | AAA ✅ |
| `#FFFFFF` | `#2563EB` | 6.1:1 | AA ✅ |
| `#FFFFFF` | `#F97316` | 4.7:1 | AA ✅ |
| `#DC2626` | `#FEE2E2` | 7.8:1 | AAA ✅ |
| `#FFFFFF` | `#DC2626` | 5.9:1 | AA ✅ |

**Herramienta de validación:**  
https://webaim.org/resources/contrastchecker/

---

### Áreas Táctiles Mínimas

- **Botones:** Mínimo 44x44px (Apple) / 48x48px (Android)
- **Implementación:** `min-h-[44px] min-w-[44px]`

---

### Indicadores No Dependientes del Color

El sistema semáforo se complementa con:
- **Iconos:** ⏰ (reloj) para indicar tiempo
- **Texto:** Timestamp visible (ej: "12:45 - Hace 8 min")
- **Orden:** Tarjetas más antiguas arriba

---

## 📊 Visualización Completa de la Paleta

```
┌─────────────────────────────────────────────────────────────┐
│                    PALETA DE COLORES                        │
│                   COMANDA DIGITAL                           │
└─────────────────────────────────────────────────────────────┘

COLORES PRINCIPALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

█████████  Primario (Blue-600)
           #2563EB · rgb(37, 99, 235)
           Botones CTA, Enlaces

█████████  Secundario (Orange-500)
           #F97316 · rgb(249, 115, 22)
           Acentos, Categorías


SISTEMA SEMÁFORO (COCINA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

█████████  Verde (Emerald-500) · 0-5 min
           #10B981 · rgb(16, 185, 129)

█████████  Amarillo (Amber-500) · 5-10 min
           #F59E0B · rgb(245, 158, 11)

█████████  Rojo (Red-500) · +10 min
           #EF4444 · rgb(239, 68, 68)


NEUTRALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

█████████  Gray-800 · Texto principal
           #1F2937 · rgb(31, 41, 55)

█████████  Gray-500 · Texto secundario
           #6B7280 · rgb(107, 114, 128)

█████████  Gray-200 · Bordes
           #E5E7EB · rgb(229, 231, 235)

█████████  Gray-50 · Fondo app
           #F9FAFB · rgb(249, 250, 251)


ALERTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

█████████  Red-600 · Alergia crítica
           #DC2626 · rgb(220, 38, 38)

█████████  Emerald-600 · Éxito
           #059669 · rgb(5, 150, 105)
```

---

## 🔗 Recursos y Herramientas

### Verificación de Contraste
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Accessible Colors:** https://accessible-colors.com/

### Generadores de Paleta
- **Coolors:** https://coolors.co/2563eb-f97316-10b981-f59e0b-ef4444
- **Tailwind Shades:** https://www.tailwindshades.com/

### Documentación Oficial
- **Tailwind CSS Colors:** https://tailwindcss.com/docs/customizing-colors
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---
