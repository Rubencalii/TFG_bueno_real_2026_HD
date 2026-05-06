Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Iniciando Proyecto Restaurante (TFG)      " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Moverse al directorio del Backend
Set-Location Backend

Write-Host "[1/5] Levantando contenedores Docker (Base de datos, etc.)..." -ForegroundColor Yellow
docker compose up -d

Write-Host "[WAIT] Esperando 5 segundos para que la Base de Datos acepte conexiones externas..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

Write-Host "[2/5] Instalando dependencias de PHP (Composer)..." -ForegroundColor Yellow
composer install

Write-Host "[3/5] Ejecutando migraciones de la Base de Datos..." -ForegroundColor Yellow
php bin/console doctrine:migrations:migrate --no-interaction

Write-Host "[4/5] Instalando dependencias de Frontend (NPM)..." -ForegroundColor Yellow
npm install

Write-Host "[5/5] Compilando assets y arrancando en modo Watch..." -ForegroundColor Green
npm run watch
