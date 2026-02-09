#!/bin/sh
set -e

echo "🚀 Iniciando Comanda Digital en producción..."

# Limpiar y calentar cache
php bin/console cache:clear --env=prod --no-warmup
php bin/console cache:warmup --env=prod

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration --env=prod

# Cargar fixtures si la BD está vacía (primera vez)
php bin/console doctrine:query:sql "SELECT COUNT(*) FROM mesa" 2>/dev/null | grep -q "0" && {
    echo "🌱 Cargando datos de demo..."
    php bin/console doctrine:fixtures:load --no-interaction --env=prod
} || echo "ℹ️ Base de datos ya tiene datos"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🎉 ¡Comanda Digital está lista!"
echo "═══════════════════════════════════════════════════════"
echo ""

# Iniciar servidor PHP en el puerto de Railway
PORT=${PORT:-8080}
echo "🌐 Servidor escuchando en puerto $PORT..."
exec php -S 0.0.0.0:$PORT -t public
