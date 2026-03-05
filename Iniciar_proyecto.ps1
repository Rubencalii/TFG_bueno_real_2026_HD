# Script de inicio para Comanda Digital (Windows PowerShell)
# Ejecutar con: .\Iniciar_proyecto.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Iniciando proyecto Comanda Digital..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Comprobar si estamos en la carpeta raiz
if (-not (Test-Path "Backend")) {
    Write-Host "Error: No se encuentra la carpeta 'Backend'. Ejecuta este script desde la raiz del proyecto." -ForegroundColor Red
    exit 1
}

# Comprobar que Docker esta disponible
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) { throw }
} catch {
    Write-Host "Error: Docker no esta disponible. Asegurate de que Docker Desktop esta iniciado." -ForegroundColor Red
    exit 1
}

# Entrar en la carpeta Backend
Push-Location Backend

try {
    # Detener contenedores previos
    Write-Host "Deteniendo contenedores previos..." -ForegroundColor Yellow
    docker compose down --remove-orphans 2>$null

    # Levantar contenedores
    Write-Host "Levantando contenedores de Docker (Nginx + PHP-FPM + MariaDB)..." -ForegroundColor Yellow
    docker compose up -d --build

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error al levantar los contenedores." -ForegroundColor Red
        exit 1
    }

    # Esperar a que el backend este realmente listo
    Write-Host "Esperando a que el sistema se inicialice (esto puede tardar la primera vez)..." -ForegroundColor Yellow
    $maxAttempts = 60
    $attempt = 0
    $ready = $false

    while ($attempt -lt $maxAttempts) {
        docker compose exec -T app php -v 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
            break
        }
        $attempt++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
    Write-Host ""

    if (-not $ready) {
        Write-Host "Advertencia: El backend tarda mas de lo esperado. Revisa los logs con: docker compose logs app" -ForegroundColor Yellow
    }

    # Mostrar URLs de acceso
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "  Comanda Digital esta lista!" -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "  Web Clientes: http://localhost:8001" -ForegroundColor White
    Write-Host "  Web Cocina:   http://localhost:8001/cocina" -ForegroundColor White
    Write-Host "  Web Barra:    http://localhost:8001/barra" -ForegroundColor White
    Write-Host "  Web Admin:    http://localhost:8001/admin" -ForegroundColor White
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proyecto iniciado correctamente!" -ForegroundColor Green

} finally {
    Pop-Location
}
