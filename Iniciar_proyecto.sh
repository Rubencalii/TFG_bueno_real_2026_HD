#!/bin/bash
set -e

# Script de inicio para Comanda Digital

echo "🚀 Iniciando proyecto Comanda Digital..."

# Comprobar si estamos en la carpeta raíz
if [ ! -d "Backend" ]; then
    echo "❌ Error: No se encuentra la carpeta 'Backend'. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Detener contenedores previos y limpiar orphans
cd Backend

echo "🛑 Deteniendo contenedores previos..."
docker compose down --remove-orphans

# Levantar contenedores
sleep 2
echo "🐳 Levantando contenedores de Docker..."
docker compose up -d

# Esperar a que la base de datos esté lista
sleep 10

# Instalar dependencias PHP si es necesario
if [ ! -d "vendor" ]; then
    echo "📦 Instalando dependencias de PHP..."
    composer install --no-interaction --optimize-autoloader
fi

# Instalar dependencias Node.js
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Node.js..."
    npm install
fi

# Compilar assets
if [ -f "package.json" ]; then
    echo "🎨 Compilando estilos y scripts..."
    npm run build || npm run encore
fi

# La comprobación de la base de datos ahora se realiza dentro del contenedor symfony_app
# a través de su entrypoint. Simplemente esperamos a que el contenedor esté listo.
DB_READY=1
if [ $DB_READY -eq 1 ]; then
    if [ -f "bin/console" ]; then
        echo "🗄️ Ejecutando migraciones..."
        docker compose exec -T app php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration
    fi
else
    echo "❌ No se pudo conectar a la base de datos. Revisa el contenedor database."
fi

# Mostrar URLs de acceso
cat <<EOF
-----------------------------------------------------
🌐 Web Clientes: http://localhost:8001
👨‍🍳 Web Cocina:  http://localhost:8001/cocina
🍺 Web Barra:    http://localhost:8001/barra
⚙️ Web Admin:    http://localhost:8001/admin
-----------------------------------------------------
EOF

echo "✅ ¡Proyecto iniciado correctamente!"
