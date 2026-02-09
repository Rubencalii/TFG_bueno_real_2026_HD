FROM php:8.4-cli

# Instalar extensiones y dependencias (incluyendo pgsql para Render)
RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libzip-dev libpng-dev libpq-dev \
    && docker-php-ext-install intl pdo pdo_pgsql zip opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copiar archivos
COPY Backend/ .

# Instalar dependencias
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Permisos
RUN mkdir -p var/cache var/log && chmod -R 777 var

# Puerto
EXPOSE 8080

# Script de arranque
COPY --chmod=755 <<EOF /start.sh
#!/bin/bash
set -e
echo "🚀 Arrancando en Render..."

# Cache
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod

# Migraciones (si hay base de datos configurada)
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️ Ejecutando migraciones..."
    php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration --env=prod || echo "⚠️ Error en migraciones (puede ser normal si la BD está vacía o ya migrada)"
    
    # Fixtures (datos de prueba) - Ojo: esto borra la BD, comentar si no quieres reiniciar datos siempre
    # php bin/console doctrine:fixtures:load --no-interaction --env=prod || echo "⚠️ Error cargando fixtures"
fi

# Servidor
echo "🌐 Iniciando servidor..."
php -S 0.0.0.0:8080 -t public
EOF

CMD ["/start.sh"]
