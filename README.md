# 🍽️ Comanda Digital - TFG

¡Bienvenido al sistema de **Comanda Digital**! Este proyecto es una Aplicación Web Progresiva (PWA) diseñada para optimizar la gestión de pedidos en restaurantes, conectando directamente a los clientes con la cocina.

## 🚀 Inicio Rápido

### Requisitos

- **Docker** instalado y funcionando
- **Git** para clonar el proyecto

### Un solo comando para todo

```bash
# Clonar y ejecutar
git clone [URL_DEL_REPOSITORIO]
cd TFG_bueno_real_2026_HD/Backend

# Levantar todo (contenedores + base de datos + datos de demo)
docker compose up -d
```

Espera ~30 segundos y todo estará listo:

- ✅ Contenedores arriba
- ✅ Base de datos configurada
- ✅ 15 mesas creadas con tokens QR
- ✅ 35 productos del menú
- ✅ Servidor funcionando

### URLs de acceso

| Sección       | URL                                  |
| ------------- | ------------------------------------ |
| **Menú mesa** | `http://localhost:8001/mesa/{token (QR de la mesa)}` |
| **Cocina**    | `http://localhost:8001/cocina/`      |
| **Barra**     | `http://localhost:8001/barra/`       |
| **Admin**     | `http://localhost:8001/admin/`       |

> 💡 Los tokens de las mesas se muestran automáticamente en los logs al arrancar.
> Ejecuta `docker logs symfony_app` para verlos.

---

## 🏗️ Arquitectura del Proyecto

Este sistema utiliza una arquitectura híbrida moderna:

- **Backend:** Symfony 8 (PHP) gestionando la lógica de negocio, seguridad y base de datos.
- **Frontend:** React (vía Symfony UX) para una interfaz de usuario fluida y reactiva.
- **Base de Datos:** MariaDB para el almacenamiento persistente de pedidos, mesas y productos.
- **Contenedores:** Docker para asegurar que el proyecto funcione igual en cualquier dispositivo.

### ¿Cómo se comunican?

1.  **Carga Inicial:** Symfony UX inyecta los datos directamente en React al abrir el menú (máxima velocidad).
2.  **Tiempo Real:** React utiliza una **API REST manual** (Endpoints en PHP que devuelven JSON) para enviar pedidos y consultar el estado de la cocina sin recargar la página.

---

## 📁 Estructura de Carpetas

- `/Backend`: El corazón del proyecto (Symfony + React).
- `/docs`: Documentación detallada, manuales de diseño y próximos pasos.
- `/Backend/assets/react/controllers`: Aquí vive toda la lógica visual de React (Menú, Carrito, Cocina).

---

## 🛠️ Comandos Útiles

Una vez instalado, estos son los comandos que más usarás dentro de la carpeta `/Backend`:

| Acción                        | Comando                                                |
| :---------------------------- | :----------------------------------------------------- |
| **Arrancar todo**             | `docker compose up -d`                                 |
| **Parar todo**                | `docker compose down`                                  |
| **Ver logs**                  | `docker logs -f symfony_app`                           |
| **Compilar cambios visuales** | `npm run dev-server`                                   |
| **Entrar a la BBDD**          | `docker exec -it backend-database-1 mariadb -u app -p` |

---

## 👤 Autor

**Rubén** - Trabajo de Fin de Grado (TFG) 2026.
