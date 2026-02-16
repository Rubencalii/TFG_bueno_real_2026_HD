FROM php:8.4-fpm

# Instalar extensiones necesarias para Symfony y MariaDB
RUN apt-get update \
    && apt-get install -y git unzip libicu-dev libzip-dev libpng-dev libonig-dev libxml2-dev libssl-dev \
    && docker-php-ext-install intl pdo pdo_mysql zip opcache

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copiar el script de entrada
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
