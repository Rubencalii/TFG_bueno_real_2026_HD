# 🚀 Siguientes Pasos - Comanda Digital

¡Gran progreso! Hoy hemos dado un salto gigante añadiendo inteligencia al flujo de trabajo del restaurante.

---

## ✅ Completado Hoy

- [x] **Módulo de Barra e Interacción de Mesa**:
    - Creación del panel `/barra` para gestión independiente de bebidas.
    - Sistema de avisos: **Llamar al camarero** y **Pedir la cuenta** desde el móvil del cliente.
    - Lógica de **Cierre de Mesa** para reiniciar la sesión tras el pago.
- [x] **Seguimiento de Pedidos ("Mis Pedidos")**:
    - Barra de progreso dinámica y auto-actualización.
- [x] **Limpieza de Interfaz**: Eliminación de restos de plantillas antiguas.

---

## 👨‍🍳 1. Fase 5: Panel de Administración (Próximo Objetivo)

Ahora que el sistema de "servicio" (Mesa-Barra-Cocina) funciona, necesitamos la herramienta de gestión:

- [ ] **Seguridad**: Login de administrador.
- [ ] **Gestor de Carta**: Cambiar una categoría de 'cocina' a 'barra' para que el sistema sepa dónde enviarla.
- [ ] **Gestor de Mesas**: Ver los estados de todas las mesas a la vez y descargar sus QRs.

---

## 🌟 2. Mejoras de UX

- [ ] **Filtros en Cocina/Barra**: Poder ocultar pedidos ya terminados manualmente.
- [ ] **Historial de Pagos**: Guardar un registro de qué se ha cobrado en cada cierre de mesa.

---

## 💻 Comandos Útiles

```bash
cd Backend
docker compose up -d
npm run dev-server
```

---

Aquí tienes un diseño de Markdown profesional para tu panel de administración. He estructurado la información para que sea clara, cumpla con los estándares visuales de una aplicación moderna y respete la normativa de facturación española.📑 Panel de Control: Gestión de Ventas y Facturación🗓️ Resumen del Turno: 30 de enero de 2026Estado de Caja: 🟢 ABIERTAÚltima actualización: 14:10:05 (Real-time vía Mercure)📊 Histórico de Tickets y FacturasFiltros activos: Todos los métodos de pago | Fecha: HoyID FacturaMesaMétodoEstadoBase Imp.IVA (10%)TotalAcciones2026-000105💳 StripePAGADO22,73 €2,27 €25,00 €[👁️] [🖨️]2026-000212💶 EfectivoPAGADO13,64 €1,36 €15,00 €[👁️] [🖨️]2026-000308📟 TPV BarraPENDIENTE45,45 €4,55 €50,00 €[✅ COBRAR]2026-000402💳 StripeANULADO-22,73 €-2,27 €-25,00 €[📄 Nota Ref.]💰 Cierre de Caja EstimadoConceptoImporteVentas Totales Online (Stripe)450,50 €Ventas Totales Físico (Efectivo/TPV)320,00 €Total IVA Acumulado (10%)77,05 €TOTAL NETO DEL DÍA770,50 €🛠️ Herramientas de Gestión📥 Exportar para Gestoría: [Generar Excel/CSV] [Generar PDF Trimestral]⚙️ Configuración Fiscal:CIF/NIF: B12345678 (Restaurante Ejemplo S.L.)Serie Actual: 2026- (Correlativa)Modo Ley Antifraude: ✅ ACTIVO (Registros no editables)📝 Notas del Desarrollador (Symfony/React):Formateo de Moneda: En el frontend (React), utiliza Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }) para que los puntos y comas aparezcan correctamente en español.Estado "Anulado": Si el gerente anula un ticket, la fila 2026-0004 permanece en el listado para no romper la correlación numérica, pero con valores negativos o marcados como "Rectificativa".Real-time: La tabla de la barra y la del gerente se actualizan solas gracias a los eventos de Mercure cuando llega el Webhook de Stripe.