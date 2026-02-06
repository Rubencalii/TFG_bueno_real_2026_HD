#!/bin/bash

# Script de inicio automático para Comanda Digital
echo "🚀 Iniciando proyecto..."

# Comprobar si estamos en la carpeta correcta
if [ ! -d "Backend" ]; then
    echo "❌ Error: No se encuentra la carpeta 'Backend'. Asegúrate de ejecutar este script desde la raíz del proyecto."
    exit 1
fi

# Entrar en la carpeta del Backend
cd Backend

# 1. Levantar contenedores de Docker
echo "🐳 Levantando contenedores de Docker..."
docker compose up -d

# 2. Esperar a que la base de datos arranque (evita errores de conexión)
echo "⏳ Esperando 10 segundos a que la base de datos esté lista..."
sleep 10

# 3. Instalar dependencias de PHP (dentro del contenedor)
echo "📦 Instalando dependencias de PHP (Composer)..."
docker exec symfony_app composer install

# 4. Ejecutar migraciones para tener la BD al día
echo "🗄️ Actualizando la base de datos..."
docker exec symfony_app php bin/console doctrine:migrations:migrate --no-interaction

# 5. Instalar dependencias del Frontend (React/JS)
echo "📦 Instalando dependencias de Node.js..."
npm install

# 6. Compilar los archivos del frontend
echo "🎨 Compilando estilos y scripts..."
npm run build

echo ""
echo "✅ ¡Proyecto iniciado correctamente!"
echo "-----------------------------------------------------"
echo "🌐 Web Clientes: http://localhost:8001"
echo "👨‍🍳 Web Cocina:  http://localhost:8001/cocina"
echo "-----------------------------------------------------"
