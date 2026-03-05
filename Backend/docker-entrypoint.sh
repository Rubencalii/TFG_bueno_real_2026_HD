#!/bin/bash
set -e

echo "Iniciando Comanda Digital..."

# Funcion para esperar a que MariaDB este lista
wait_for_db() {
    echo "Esperando a que la base de datos este lista..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if php -r '
            try {
                $host = getenv("DB_HOST") ?: "database";
                $port = getenv("DB_PORT") ?: "3306";
                $user = getenv("DB_USER") ?: "app";
                $pass = getenv("DB_PASSWORD") ?: "ChangeMe123";
                $pdo = new PDO("mysql:host=$host;port=$port", $user, $pass);
                exit(0);
            } catch (Exception $e) {
                exit(1);
            }
        ' 2>/dev/null; then
            echo "Base de datos disponible!"
            return 0
        fi
        attempt=$((attempt + 1))
        echo "   Intento $attempt/$max_attempts..."
        sleep 2
    done
    echo "No se pudo conectar a la base de datos"
    exit 1
}

# Funcion para verificar si hay datos en la BD
check_if_empty() {
    php -r '
        try {
            $host = getenv("DB_HOST") ?: "database";
            $port = getenv("DB_PORT") ?: "3306";
            $user = getenv("DB_USER") ?: "app";
            $pass = getenv("DB_PASSWORD") ?: "ChangeMe123";
            $dbname = getenv("DB_NAME") ?: "app";
            $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $user, $pass);
            $result = $pdo->query("SELECT COUNT(*) FROM mesa");
            if ($result && $result->fetchColumn() > 0) {
                exit(1);
            }
            exit(0);
        } catch (Exception $e) {
            exit(0);
        }
    ' 2>/dev/null
    return $?
}

# 1. Preparar directorios
echo "Preparando entorno..."
rm -rf /app/var/cache/*
mkdir -p /app/var/cache /app/var/log /app/var/share

# 2. Instalar dependencias si no existen
if [ ! -f "vendor/autoload.php" ]; then
    echo "Instalando dependencias de PHP..."
    composer install --no-interaction --optimize-autoloader
fi

# 3. Esperar a la base de datos
wait_for_db

# 4. Sincronizar esquema de base de datos
echo "Sincronizando esquema de base de datos..."
php bin/console doctrine:schema:update --force --no-interaction

# 5. Cargar fixtures si la BD esta vacia (usar dev para que cargue DoctrineFixturesBundle)
if check_if_empty; then
    echo "Cargando datos de demo..."
    APP_ENV=dev php bin/console doctrine:fixtures:load --no-interaction
    echo "Datos de demo cargados!"
    rm -rf /app/var/cache/dev
else
    echo "La base de datos ya tiene datos, omitiendo fixtures."
fi

# 6. Calentar cache de produccion
echo "Calentando cache de produccion..."
php bin/console cache:warmup --no-interaction

# 7. Fijar permisos para www-data (PHP-FPM)
chown -R www-data:www-data /app/var

# 8. Backend listo
echo "Backend listo. Iniciando PHP-FPM..."

# 9. Iniciar PHP-FPM
exec php-fpm