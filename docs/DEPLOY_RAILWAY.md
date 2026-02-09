# 🚀 Guía de Despliegue en Railway.app

## Requisitos Previos

1. Cuenta en [Railway.app](https://railway.app/) (gratis con GitHub)
2. Repositorio en GitHub con tu proyecto
3. ~5 minutos de tu tiempo

---

## Paso 1: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app/) y haz login con GitHub
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tus repositorios
5. Selecciona tu repo `TFG_bueno_real_2026_HD`

---

## Paso 2: Añadir Base de Datos

1. En tu proyecto Railway, click en **"+ New"**
2. Selecciona **"Database" → "MySQL"** (compatible con MariaDB)
3. Railway creará automáticamente la BD y las variables de entorno

---

## Paso 3: Configurar Variables de Entorno

En la pestaña **"Variables"** de tu servicio backend, añade:

```env
APP_ENV=prod
APP_SECRET=genera_una_clave_segura_de_32_caracteres
DATABASE_URL=${{MySQL.DATABASE_URL}}
```

> 💡 Railway conecta automáticamente `${{MySQL.DATABASE_URL}}` con tu BD

---

## Paso 4: Configurar el Build

Railway detectará automáticamente el `Dockerfile`. Si no:

1. Ve a **Settings** → **Build**
2. Selecciona **"Dockerfile"**
3. Path: `Backend/Dockerfile`

---

## Paso 5: Desplegar

1. Railway desplegará automáticamente cuando hagas push a GitHub
2. El primer deploy tarda ~5-10 minutos
3. Una vez listo, Railway te dará una URL como:
    ```
    https://comanda-digital-production.up.railway.app
    ```

---

## URLs de tu Aplicación

Una vez desplegada:

| Sección          | URL                                          |
| ---------------- | -------------------------------------------- |
| **Menú Cliente** | `https://tu-app.up.railway.app/mesa/{token}` |
| **Cocina**       | `https://tu-app.up.railway.app/cocina/`      |
| **Barra**        | `https://tu-app.up.railway.app/barra/`       |
| **Admin**        | `https://tu-app.up.railway.app/admin/`       |

---

## Troubleshooting

### Error: "No se puede conectar a la BD"

- Verifica que `DATABASE_URL` esté configurada correctamente
- Revisa los logs en Railway dashboard

### Error: "Migraciones fallan"

- Ejecuta manualmente desde Railway CLI:
    ```bash
    railway run php bin/console doctrine:migrations:migrate
    ```

### Quiero cargar datos de demo

```bash
railway run php bin/console doctrine:fixtures:load
```

---

## Costes

| Plan      | Límites         | Coste   |
| --------- | --------------- | ------- |
| **Hobby** | $5 créditos/mes | Gratis  |
| **Pro**   | Sin límites     | $20/mes |

Con $5/mes gratis, tu TFG puede estar online **indefinidamente** si no tiene mucho tráfico.

---

## Alternativa: Dockerfile Optimizado para Railway

Si tienes problemas, Railway funciona mejor con Nginx. Puedes crear un `Dockerfile.railway`:

```dockerfile
FROM php:8.4-fpm-alpine

# Instalar extensiones
RUN apk add --no-cache nginx git unzip icu-dev libzip-dev \
    && docker-php-ext-install intl pdo pdo_mysql zip opcache

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY Backend/ .

# Instalar dependencias
RUN composer install --no-dev --optimize-autoloader

# Exponer puerto
EXPOSE 8080

CMD php -S 0.0.0.0:8080 -t public
```

---

**¡Listo!** Tu TFG estará disponible en una URL pública para la demo ante el tribunal. 🎓
