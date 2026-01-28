# 🚀 Siguientes Pasos - Comanda Digital

¡Gran progreso hoy! Hemos completado la **Fase 1** (Base de datos core), **Fase 2** (Configuración React) y la implementación visual de la **Fase 3** (Menú digital).

Para continuar mañana, aquí tienes la hoja de ruta:

## 1. Datos Reales (Backend) 🛠️

Actualmente el menú usa datos "mock" (falsos) en `MesaController`.

- [ ] **Crear entidad `Categoria`**: `nombre`, `orden`, `activa`.
- [ ] **Crear entidad `Producto`**: `nombre`, `descripcion`, `precio`, `imagen`, `alergenos` (array), `categoria_id`.
- [ ] **Migrar BBDD**: `php bin/console make:migration` y `migrate`.
- [ ] **Cargar datos**: Crear unos fixtures o insertar productos reales en la base de datos.
- [ ] **Actualizar Controller**: Modificar `MesaController::menuMesa` para que haga `findAll()` de categorías y productos.

## 2. Hacer funcional el Pedido (API) 🛒

El botón "Confirmar Pedido" del carrito envía un POST a `/api/pedido`, pero ese endpoint no existe aún.

- [ ] **Crear `PedidoController`**: Endpoint `POST /api/pedido`.
- [ ] **Lógica de guardado**:
  - Recibir JSON del frontend.
  - Crear nuevo objeto `Pedido` vinculado a la `Mesa`.
  - Crear objetos `DetallePedido` para cada item.
  - Calcular total.
  - Persistir en Doctrine.
- [ ] **Respuesta**: Devolver OK para que el frontend limpie el carrito.

## 3. Fase 4: Frontend Cocina 👨‍🍳

Una vez que los pedidos se guarden en BBDD, necesitamos visualizarlos.

- [ ] **Crear vista Cocina**: Página `/cocina` que liste los pedidos con estado "pendiente".
- [ ] **Diseño Kanban/Lista**: Tarjetas con los platos y número de mesa.
- [ ] **Acciones**: Botones para cambiar estado (Pendiente -> Preparando -> Listo).
- [ ] **(Opcional)**: Mercure para tiempo real (que aparezcan solos sin recargar).

---

### Comando para arrancar mañana:

```bash
docker compose up -d  # Levantar contenedores
npm run dev-server    # Levantar servidor de assets (o npm run watch)
```
