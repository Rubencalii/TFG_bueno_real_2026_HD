#!/bin/bash
set -e

echo "🚀 Iniciando Comanda Digital..."

# Función para esperar a que MariaDB esté lista
wait_for_db() {
    echo "⏳ Esperando a que la base de datos esté lista..."
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if php -r "
            try {
                \$pdo = new PDO('mysql:host=database;port=3306', 'app', '!ChangeMe!');
                exit(0);
            } catch (Exception \$e) {
                exit(1);
            }
        " 2>/dev/null; then
            echo "✅ Base de datos disponible!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo "   Intento $attempt/$max_attempts..."
        sleep 2
    done
    
    echo "❌ No se pudo conectar a la base de datos"
    exit 1
}

# Función para verificar si hay datos en la BD
check_if_empty() {
    php -r "
        try {
            \$pdo = new PDO('mysql:host=database;port=3306;dbname=app', 'app', '!ChangeMe!');
            \$result = \$pdo->query('SELECT COUNT(*) FROM mesa');
            if (\$result && \$result->fetchColumn() > 0) {
                exit(1); // Hay datos
            }
            exit(0); // Vacía
        } catch (Exception \$e) {
            exit(0); // La tabla no existe = vacía
        }
    " 2>/dev/null
    return $?
}

# 1. Instalar dependencias si no existen
if [ ! -d "vendor" ]; then
    echo "📦 Instalando dependencias de PHP..."
    composer install --no-interaction --optimize-autoloader
fi

# 2. Esperar a la base de datos
wait_for_db

# 3. Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# 4. Cargar fixtures si la BD está vacía
if check_if_empty; then
    echo "🌱 Cargando datos de demo (mesas, productos, categorías)..."
    php bin/console doctrine:fixtures:load --no-interaction
    echo "✅ Datos de demo cargados!"
else
    echo "ℹ️ La base de datos ya tiene datos, omitiendo fixtures."
fi

# 5. Mostrar URLs de acceso
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🎉 ¡Comanda Digital está lista!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  📱 Mesas (escanear QR):"

# Obtener tokens de las mesas
php -r "
    require 'vendor/autoload.php';
    try {
        \$pdo = new PDO('mysql:host=database;port=3306;dbname=app', 'app', '!ChangeMe!');
        \$result = \$pdo->query('SELECT numero, token_qr FROM mesa ORDER BY numero LIMIT 5');
        while (\$row = \$result->fetch()) {
            echo \"     Mesa \" . \$row['numero'] . \": http://localhost:8001/mesa/\" . \$row['token_qr'] . \"\n\";
        }
        echo \"     ... y más mesas disponibles\n\";
    } catch (Exception \$e) {
        echo \"     (ejecuta 'docker exec backend-database-1 mariadb -u app -p app -e \"SELECT numero, token_qr FROM mesa\"' para ver tokens)\n\";
    }
" 2>/dev/null || true

echo ""
echo "  👨‍🍳 Cocina:  http://localhost:8001/cocina/"
echo "  🍺 Barra:   http://localhost:8001/barra/"
echo "  ⚙️ Admin:   http://localhost:8001/admin/"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# 6. Iniciar servidor PHP
echo "🌐 Iniciando servidor web..."
exec php -S 0.0.0.0:8000 -t public
