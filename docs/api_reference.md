# API Reference - Comanda Digital

This document provides a detailed reference of the available API endpoints in the Comanda Digital system.

## 📱 Public API (Customer Side)

Base Route: `/api`

### Pedidos (Orders)

| Method   | Endpoint                     | Description                                                                         |
| :------- | :--------------------------- | :---------------------------------------------------------------------------------- |
| **POST** | `/pedido`                    | Create a new order. Items are automatically grouped by category type (Kitchen/Bar). |
| **GET**  | `/mesa/{token}/pedidos`      | List active orders for a specific table.                                            |
| **GET**  | `/mesa/{token}/total`        | Get the current bill total for a table.                                             |
| **POST** | `/mesa/{token}/llamar`       | Notify staff that the customer needs assistance.                                    |
| **POST** | `/mesa/{token}/pagar`        | Request the bill and specify a payment method.                                      |
| **POST** | `/mesa/{token}/pagar-online` | Initiate an online payment (pending confirmation).                                  |

### Tables & Session

| Method   | Endpoint                      | Description                                          |
| :------- | :---------------------------- | :--------------------------------------------------- |
| **GET**  | `/mesa/{token}/status`        | Check if a table is active and get its ID/Number.    |
| **POST** | `/mesa/{token}/verify-pin`    | Verify the 8-digit security PIN for a table session. |
| **POST** | `/mesa/{token}/solicitar-pin` | Request the server to provide/show the table PIN.    |
| **GET**  | `/idiomas`                    | List available languages and flags.                  |

---

## 🍳 Staff API (Kitchen & Bar)

Base Route: `/api`

| Method    | Endpoint                  | Description                                                                |
| :-------- | :------------------------ | :------------------------------------------------------------------------- |
| **GET**   | `/cocina/pedidos`         | Get all pending and active orders for the Kitchen.                         |
| **GET**   | `/barra/pedidos`          | Get all pending and active orders for the Bar.                             |
| **PATCH** | `/pedido/{id}/estado`     | Update order status (`pendiente`, `en_preparacion`, `listo`, `entregado`). |
| **GET**   | `/barra/notificaciones`   | Get real-time alerts (Waiter calls, PIN requests, Bill requests).          |
| **POST**  | `/barra/mesa/{id}/cerrar` | Close a table, generate a fiscal ticket, and reset the PIN.                |

---

## ⚙️ Administration API

Base Route: `/admin/api` (Requires `ROLE_ADMIN` or `ROLE_GERENTE`)

### Product Management

| Method     | Endpoint         | Description                 |
| :--------- | :--------------- | :-------------------------- |
| **POST**   | `/producto`      | Create a new product.       |
| **PUT**    | `/producto/{id}` | Update an existing product. |
| **DELETE** | `/producto/{id}` | Delete a product.           |

### Category Management

| Method     | Endpoint          | Description                                |
| :--------- | :---------------- | :----------------------------------------- |
| **POST**   | `/categoria`      | Create a new category (Type: kitchen/bar). |
| **PUT**    | `/categoria/{id}` | Update a category.                         |
| **DELETE** | `/categoria/{id}` | Delete a category (only if empty).         |

### Table Management

| Method     | Endpoint                           | Description                                               |
| :--------- | :--------------------------------- | :-------------------------------------------------------- |
| **GET**    | `/mesas`                           | List all tables with their status and current bill.       |
| **POST**   | `/mesa`                            | Add a new table.                                          |
| **PUT**    | `/mesa/{id}`                       | Edit table properties.                                    |
| **DELETE** | `/mesa/{id}`                       | Remove a table.                                           |
| **POST**   | `/mesa/{id}/toggle`                | Activate/Deactivate a table.                              |
| **POST**   | `/mesa/{id}/regenerar-qr`          | Reset the QR token and Security PIN.                      |
| **POST**   | `/mesa/{id}/atender`               | Clear "Call Waiter" or "PIN Request" alerts.              |
| **POST**   | `/mesa/{id}/confirmar-pago-online` | Confirm a pending online payment and generate the ticket. |
| **POST**   | `/mesa/{id}/limpiar-alertas`       | Reset all table flags and rotate the PIN.                 |

### Reservations, Users & Reports

| Method   | Endpoint           | Description                            |
| :------- | :----------------- | :------------------------------------- |
| **GET**  | `/reservas`        | List all future and past reservations. |
| **POST** | `/reserva`         | Create a new booking.                  |
| **GET**  | `/reportes/ventas` | Get sales summaries and statistics.    |
| **GET**  | `/usuarios`        | Manage staff accounts and roles.       |
