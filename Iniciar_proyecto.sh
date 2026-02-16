#!/bin/bash
set -e

# Script de inicio para Comanda Digital

echo "🚀 Iniciando proyecto Comanda Digital..."

# Comprobar si estamos en la carpeta raíz
if [ ! -d "Backend" ]; then
    echo "❌ Error: No se encuentra la carpeta 'Backend'. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Detener contenedores previos
cd Backend

echo "🛑 Deteniendo contenedores previos..."
docker compose down --remove-orphans

# Levantar contenedores
echo "🐳 Levantando contenedores de Docker (Nginx + PHP-FPM + MariaDB)..."
docker compose up -d --build

# Esperar a que el backend esté realmente listo
echo "⏳ Esperando a que el sistema se inicialice (esto puede tardar la primera vez)..."
until docker compose exec -T app php -v > /dev/null 2>&1; do
    printf "."
    sleep 2
done
echo ""

# Mostrar URLs de acceso
cat <<EOF
-----------------------------------------------------
  🎉 ¡Comanda Digital está lista!
-----------------------------------------------------
  📱 Web Clientes: http://localhost:8001
  👨‍🍳 Web Cocina:  http://localhost:8001/cocina
  🍺 Web Barra:    http://localhost:8001/barra
  ⚙️ Web Admin:    http://localhost:8001/admin
-----------------------------------------------------
EOF

echo "✅ ¡Proyecto iniciado correctamente!"
