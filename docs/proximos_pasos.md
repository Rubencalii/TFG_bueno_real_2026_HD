# 🚀 Siguientes Pasos - Comanda Digital

¡Gran progreso! Hoy hemos dado un salto gigante añadiendo inteligencia al flujo de trabajo del restaurante.

---

## ✅ Completado Hoy

- [x] **Módulo de Barra e Interacción de Mesa**:
    - Creación del panel `/barra` para gestión independiente de bebidas.
    - Sistema de avisos: **Llamar al camarero** y **Pedir la cuenta** desde el móvil del cliente.
    - Lógica de **Cierre de Mesa** para reiniciar la sesión tras el pago.
- [x] **Seguimiento de Pedidos ("Mis Pedidos")**:
    - Barra de progreso dinámica y auto-actualización.
- [x] **Limpieza de Interfaz**: Eliminación de restos de plantillas antiguas.

---

## 👨‍🍳 1. Fase 5: Panel de Administración (Próximo Objetivo)

Ahora que el sistema de "servicio" (Mesa-Barra-Cocina) funciona, necesitamos la herramienta de gestión:

- [ ] **Seguridad**: Login de administrador.
- [ ] **Gestor de Carta**: Cambiar una categoría de 'cocina' a 'barra' para que el sistema sepa dónde enviarla.
- [ ] **Gestor de Mesas**: Ver los estados de todas las mesas a la vez y descargar sus QRs.

---

## 🌟 2. Mejoras de UX

- [ ] **Filtros en Cocina/Barra**: Poder ocultar pedidos ya terminados manualmente.
- [ ] **Historial de Pagos**: Guardar un registro de qué se ha cobrado en cada cierre de mesa.

---

## 💻 Comandos Útiles

```bash
cd Backend
docker compose up -d
npm run dev-server
```
