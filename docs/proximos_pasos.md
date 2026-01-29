# 🚀 Siguientes Pasos - Comanda Digital

¡Gran progreso! Hemos completado la **Fase 1** (Base de datos core), **Fase 2** (Configuración React con Symfony UX) y la implementación visual de la **Fase 3** (Menú digital).

---

## 📐 Arquitectura Actual

Usamos **Symfony UX React** para integrar React directamente en Twig:

| Flujo               | Tecnología                            | Motivo                                  |
| ------------------- | ------------------------------------- | --------------------------------------- |
| **Cargar datos**    | Props via `react_component()` en Twig | Sin API, más rápido                     |
| **Guardar pedidos** | Controller Symfony (JSON)             | React necesita enviar datos al servidor |

> **Nota:** No usamos API Platform porque UX React pasa datos directamente de PHP a React sin necesidad de endpoints JSON para la carga inicial.

---

## 1. Datos Reales (Backend) 🛠️

Actualmente el menú usa datos "mock" (falsos) en `MesaController`.

- [ ] **Crear entidad `Categoria`**: `nombre`, `orden`, `activa`.
- [ ] **Crear entidad `Producto`**: `nombre`, `descripcion`, `precio`, `imagen`, `alergenos` (array), `categoria_id`.
- [ ] **Migrar BBDD**: `php bin/console make:migration` y `migrate`.
- [ ] **Cargar datos**: Crear unos fixtures o insertar productos reales en la base de datos.
- [ ] **Actualizar Controller**: Modificar `MesaController::menuMesa` para que haga `findAll()` de categorías y productos.

---

## 2. Hacer funcional el Pedido (Controller Symfony) 🛒

El botón "Confirmar Pedido" del carrito envía un POST a `/api/pedido`. Necesitamos crear el Controller que lo reciba.

> ⚠️ **Aclaración:** Aunque la ruta es `/api/pedido`, NO es API Platform. Es un Controller Symfony normal que recibe JSON y responde JSON. Es la forma más simple y eficiente para nuestro caso.

- [ ] **Crear `PedidoController`**: Con ruta `POST /api/pedido`.
- [ ] **Lógica de guardado**:
    - Recibir JSON del frontend (`$request->getContent()`).
    - Buscar la `Mesa` por ID.
    - Crear nuevo objeto `Pedido` vinculado a la mesa.
    - Crear objetos `DetallePedido` para cada item del carrito.
    - Calcular total automáticamente.
    - Persistir todo con Doctrine.
- [ ] **Respuesta**: Devolver `JsonResponse` con éxito para que React limpie el carrito.

### Ejemplo de estructura del Controller:

```php
#[Route('/api/pedido', name: 'api_crear_pedido', methods: ['POST'])]
public function crearPedido(Request $request, MesaRepository $mesaRepo): JsonResponse
{
    $data = json_decode($request->getContent(), true);
    // Crear Pedido y DetallePedido...
    return $this->json(['success' => true, 'pedidoId' => $pedido->getId()]);
}
```

---

## 3. Fase 4: Frontend Cocina 👨‍🍳

Una vez que los pedidos se guarden en BBDD, necesitamos visualizarlos.

- [ ] **Crear vista Cocina**: Página `/cocina` que liste los pedidos con estado "pendiente".
- [ ] **Diseño Kanban/Lista**: Tarjetas con los platos y número de mesa.
- [ ] **Sistema Semáforo**: Colores según tiempo de espera (verde/amarillo/rojo).
- [ ] **Acciones**: Botones para cambiar estado (Pendiente -> Preparando -> Listo).
- [ ] **(Opcional)**: Mercure para tiempo real (que aparezcan solos sin recargar).

---

## 4. Fase 5: Panel Admin 🔧

- [ ] CRUD de productos y categorías.
- [ ] Gestión de mesas (activar/desactivar).
- [ ] Generación de códigos QR.
- [ ] Vista de histórico de pedidos.

---

### Comandos para arrancar:

```bash
docker compose up -d          # Levantar contenedores
npm run dev-server            # Levantar servidor de assets (o npm run watch)
symfony server:start -d       # Servidor Symfony (opcional si usas Docker)
```

---

### Enlaces útiles:

- [Symfony UX React Docs](https://symfony.com/bundles/ux-react/current/index.html)
- [Mercure (tiempo real)](https://symfony.com/doc/current/mercure.html)
