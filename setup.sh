#!/bin/bash

# Script de configuración automática para Comanda Digital
echo "🚀 Iniciando configuración de Comanda Digital..."

# Entrar en la carpeta del Backend
cd Backend

# 1. Levantar contenedores de Docker
echo "🐳 Levantando contenedores de Docker..."
docker compose up -d

# 2. Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# 3. Instalar dependencias de PHP (dentro del contenedor)
echo "📦 Instalando dependencias de PHP..."
docker exec symfony_app composer install

# 4. Ejecutar migraciones de la base de datos
echo "🗄️ Configurando la base de datos..."
docker exec symfony_app php bin/console doctrine:migrations:migrate --no-interaction

# 5. Instalar dependencias de JavaScript
echo "npm 📦 Instalando dependencias de React/JS..."
npm install

# 6. Compilar assets por primera vez
echo "🎨 Compilando interfaz visual..."
npm run build

echo "✅ ¡Todo listo! Ya puedes acceder al proyecto:"
echo "👉 Cliente: http://localhost:8001/mesa/[TOKEN]"
echo "👉 Cocina:  http://localhost:8001/cocina"
echo ""
echo "Nota: Recuerda ejecutar 'npm run dev-server' si vas a realizar cambios en el código de React."
