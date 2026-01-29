# 🚀 Siguientes Pasos - Comanda Digital

¡Gran progreso! Hemos completado la integración de seguimiento de pedidos en tiempo real y limpiado la interfaz base.

---

## ✅ Completado Hoy

- [x] **Arquitectura Híbrida**: Clarificación del uso de Symfony UX (carga inicial) junto con una API REST manual (interacción dinámica).
- [x] **Seguimiento de Pedidos ("Mis Pedidos")**:
    - Creación del componente React `MyOrdersSection`.
    - Implementación de barra de progreso dinámica (Pendiente -> Preparando -> Listo).
    - Sistema de auto-actualización (polling cada 10s) para ver cambios de cocina.
    - Redirección automática al confirmar carrito.
- [x] **Limpieza de Interfaz**: Eliminación de navegación y pies de página antiguos en `base.html.twig`.
- [x] **Backend**: Endpoint funcional para obtener pedidos activos por token de mesa.

---

## 👨‍🍳 1. Fase 4: Pulido de Cocina (KDS)

Aunque el tablero es funcional, faltan detalles de UX para el personal:

- [ ] **Alertas de Alergias**: Resaltar visualmente en las tarjetas las notas que contengan alérgenos ("SIN GLUTEN", "CELIACO").
- [ ] **Acciones de Finalización**: Asegurar que el estado "entregado" limpie correctamente la pantalla.
- [ ] **Sonidos**: Añadir un aviso acústico opcional cuando entre un pedido nuevo.

---

## 🔧 2. Fase 5: Panel de Administración (Próximo Gran Paso)

Esta es la parte pendiente más importante:

- [ ] **Seguridad**: Implementar el login para el administrador (usando la entidad `User` ya existente).
- [ ] **Gestión de Carta (CRUD)**:
    - Formulario para añadir/editar productos y categorías.
    - Subida de imágenes para los platos.
    - Gestión de alérgenos por producto.
- [ ] **Gestión de Mesas**:
    - Crear nuevas mesas.
    - Generar y visualizar el enlace/QR único para cada mesa basándose en su `tokenQr`.
- [ ] **Histórico**: Ver pedidos antiguos y estadísticas básicas de ventas.

---

## 🌟 3. Mejoras Opcionales (Futuro)

- [ ] **Mercure**: Cambiar el polling de 10s por notificaciones Push reales (Server-Sent Events) para que sea instantáneo.
- [ ] **Cierre de Mesa**: Botón para que el cliente pida la cuenta y el sistema sume todos sus pedidos de la sesión.

---

## 💻 Comandos Útiles

```bash
# Levantar todo el entorno:
cd Backend
docker compose up -d
npm run dev-server

# Ver logs del servidor:
docker logs -f symfony_app
```
