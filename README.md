# 🍽️ Comanda Digital - TFG

¡Bienvenido al sistema de **Comanda Digital**! Este proyecto es una Aplicación Web Progresiva (PWA) diseñada para optimizar la gestión de pedidos en restaurantes, conectando directamente a los clientes con la cocina.

## 🚀 Inicio Rápido

Si quieres ejecutar el proyecto en un ordenador nuevo, solo necesitas tener instalado **Docker** y **Git**. Sigue estos pasos:

1. **Clonar el proyecto:**

    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd TFG_bueno_real_2026_HD
    ```

2. **Levantar el sistema (Un solo comando):**
   He preparado un script de configuración automática. Ejecuta:
    ```bash
    # Si estás en Linux o Mac:
    chmod +x setup.sh && ./setup.sh
    ```

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
