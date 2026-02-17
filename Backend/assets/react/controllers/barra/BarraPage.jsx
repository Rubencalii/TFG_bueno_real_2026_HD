import React, { useState, useEffect } from "react";
import PedidoCard from "../cocina/PedidoCard";

export default function BarraPage({
    pedidos: initialPedidos,
    notificaciones: initialNotificaciones,
}) {
    const [pedidos, setPedidos] = useState(initialPedidos || []);
    const [notificaciones, setNotificaciones] = useState(
        initialNotificaciones || [],
    );
    const [loading, setLoading] = useState(false);

    const ESTADOS = {
        PENDIENTE: "pendiente",
        EN_PREPARACION: "en_preparacion",
        LISTO: "listo",
    };

    const refreshData = async () => {
        try {
            // Refrescar pedidos
            const resPedidos = await fetch("/api/barra/pedidos");
            if (resPedidos.ok) {
                const data = await resPedidos.json();
                setPedidos(data);
            }
            // Refrescar notificaciones
            const resNotif = await fetch("/api/barra/notificaciones");
            if (resNotif.ok) {
                const data = await resNotif.json();
                setNotificaciones(data);
            }
        } catch (error) {
            console.error("Error al refrescar datos:", error);
        }
    };

    useEffect(() => {
        const interval = setInterval(refreshData, 5000); // Barra refresca más rápido (5s)
        return () => clearInterval(interval);
    }, []);

    const cambiarEstado = async (pedidoId, nuevoEstado) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/pedido/${pedidoId}/estado`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            if (response.ok) {
                setPedidos((prev) =>
                    prev.map((p) =>
                        p.id === pedidoId ? { ...p, estado: nuevoEstado } : p,
                    ),
                );
                if (nuevoEstado === "entregado") {
                    setTimeout(() => {
                        setPedidos((prev) =>
                            prev.filter((p) => p.id !== pedidoId),
                        );
                    }, 500);
                }
            }
        } catch (error) {
            console.error("Error al cambiar estado:", error);
        } finally {
            setLoading(false);
        }
    };

    const cerrarMesa = async (mesaId, metodoPago) => {
        const metodoLabel = metodoPago === "tarjeta" ? "TARJETA" : "EFECTIVO";
        if (!confirm(`¿Confirmar cierre de mesa con pago ${metodoLabel}?`))
            return;

        try {
            const response = await fetch(`/api/barra/mesa/${mesaId}/cerrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ metodoPago: metodoPago || "efectivo" }),
            });

            if (response.ok) {
                const data = await response.json();
                setNotificaciones((prev) =>
                    prev.filter((n) => n.mesaId !== mesaId),
                );
                refreshData();

                // Mostrar opciones de impresión si se generó un ticket
                if (data.ticket) {
                    const imprimir = confirm(
                        `Mesa cerrada con éxito.\nTicket #${data.ticket} generado.\n\n¿Desea imprimir el ticket?`,
                    );
                    if (imprimir) {
                        // Abrir ticket en nueva ventana para imprimir
                        window.open(
                            `/admin/api/ticket/${data.ticketId}/imprimir`,
                            "_blank",
                            "width=300,height=600",
                        );
                    }
                }
            }
        } catch (error) {
            console.error("Error al cerrar mesa:", error);
        }
    };

    const pedidosPendientes = pedidos.filter(
        (p) => p.estado === ESTADOS.PENDIENTE,
    );
    const pedidosEnPreparacion = pedidos.filter(
        (p) => p.estado === ESTADOS.EN_PREPARACION,
    );
    const pedidosListos = pedidos.filter((p) => p.estado === ESTADOS.LISTO);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col lg:flex-row transition-colors">
            {/* Sidebar: Notificaciones y Avisos */}
            <aside className="w-full lg:w-80 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-6 flex-shrink-0 transition-colors">
                <div className="flex items-center gap-2 mb-8">
                    <span className="material-symbols-outlined text-primary font-black">
                        notifications_active
                    </span>
                    <h2 className="text-xl font-black text-gray-800 dark:text-white">
                        AVISOS
                    </h2>
                    <a
                        href="/camarero"
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Ir a Gestión de Mesas"
                    >
                        <span class="material-symbols-outlined">
                            grid_view
                        </span>
                    </a>
                    <a
                        href="/cocina"
                        className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        title="Ir a Cocina"
                    >
                        <span className="material-symbols-outlined">
                            restaurant
                        </span>
                    </a>
                    <a
                        href="/logout"
                        className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        title="Cerrar sesión"
                    >
                        <span className="material-symbols-outlined">
                            logout
                        </span>
                    </a>
                </div>

                <div className="space-y-4">
                    {notificaciones.length === 0 ? (
                        <div className="text-center py-10">
                            <span className="material-symbols-outlined text-gray-200 dark:text-gray-600 text-5xl mb-2">
                                check_circle
                            </span>
                            <p className="text-gray-400 dark:text-gray-500 text-sm">
                                Sin avisos pendientes
                            </p>
                        </div>
                    ) : (
                        notificaciones.map((notif) => (
                            <div
                                key={notif.mesaId}
                                className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-4 border border-gray-100 dark:border-slate-600 shadow-sm animate-pulse-subtle transition-colors"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                                        MESA {notif.numero}
                                    </h3>
                                    <span className="px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary text-[10px] font-black rounded-md uppercase tracking-widest">
                                        AHORA
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {notif.llamaCamarero && (
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg border border-amber-100 dark:border-amber-800">
                                            <span className="material-symbols-outlined text-sm">
                                                hail
                                            </span>
                                            <span className="text-xs font-bold uppercase tracking-tight">
                                                Llama al camarero
                                            </span>
                                        </div>
                                    )}
                                    {notif.solicitaPin && (
                                        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                                                <span className="material-symbols-outlined text-sm">
                                                    lock
                                                </span>
                                                <span className="text-xs font-bold uppercase tracking-tight">
                                                    Solicita PIN de acceso
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    const pinEl =
                                                        e.currentTarget
                                                            .nextElementSibling;
                                                    pinEl.classList.toggle(
                                                        "hidden",
                                                    );
                                                    e.currentTarget.textContent =
                                                        pinEl.classList.contains(
                                                            "hidden",
                                                        )
                                                            ? "👁 Ver PIN"
                                                            : "Ocultar PIN";
                                                }}
                                                className="w-full py-1.5 bg-purple-600 text-white text-xs font-black rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                👁 Ver PIN
                                            </button>
                                            <div className="hidden mt-2 text-center">
                                                <p className="text-2xl font-black text-purple-700 dark:text-purple-300 tracking-[0.3em] bg-white dark:bg-slate-800 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                                                    {notif.securityPin ||
                                                        "--------"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {notif.pideCuenta && (
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                            <span className="material-symbols-outlined text-sm">
                                                payments
                                            </span>
                                            <span className="text-xs font-bold uppercase tracking-tight">
                                                Pide la cuenta:{" "}
                                                {parseFloat(
                                                    notif.totalCuenta,
                                                ).toFixed(2)}
                                                €
                                            </span>
                                        </div>
                                    )}
                                    {notif.pideCuenta && notif.metodoPago && (
                                        <div
                                            className={`flex items-center gap-2 p-2 rounded-lg border ${
                                                notif.metodoPago === "tarjeta"
                                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800"
                                                    : "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800"
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                {notif.metodoPago === "tarjeta"
                                                    ? "credit_card"
                                                    : "payments"}
                                            </span>
                                            <span className="text-xs font-bold uppercase tracking-tight">
                                                Método:{" "}
                                                {notif.metodoPago === "tarjeta"
                                                    ? "TARJETA (datáfono)"
                                                    : "EFECTIVO"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() =>
                                        cerrarMesa(
                                            notif.mesaId,
                                            notif.metodoPago,
                                        )
                                    }
                                    className="w-full py-2 bg-gray-800 dark:bg-white text-white dark:text-gray-800 text-xs font-black rounded-xl uppercase tracking-widest hover:bg-black dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        check_circle
                                    </span>
                                    {notif.pideCuenta
                                        ? `Cobrar ${notif.metodoPago === "tarjeta" ? "💳" : "💵"} y Cerrar`
                                        : "Atendido"}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Content: Kanban de Bebidas */}
            <main className="flex-1 p-6 lg:p-10 overflow-x-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                            🍷 Panel de Barra
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Gestión de bebidas y servicio
                        </p>
                    </div>
                    <button
                        onClick={refreshData}
                        className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">
                            refresh
                        </span>
                        Actualizar
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[900px]">
                    {/* Columna: Pendientes */}
                    <div className="bg-gray-200/50 dark:bg-slate-800/50 rounded-3xl p-6 border border-gray-200/50 dark:border-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                            <h2 className="font-black text-gray-700 dark:text-gray-200 tracking-tighter uppercase">
                                PENDIENTES
                            </h2>
                            <span className="ml-auto bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full">
                                {pedidosPendientes.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {pedidosPendientes.map((pedido) => (
                                <PedidoCard
                                    key={pedido.id}
                                    pedido={pedido}
                                    onNext={() =>
                                        cambiarEstado(
                                            pedido.id,
                                            ESTADOS.EN_PREPARACION,
                                        )
                                    }
                                    nextLabel="Servir"
                                    nextIcon="local_bar"
                                    loading={loading}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Columna: Preparando */}
                    <div className="bg-gray-200/50 dark:bg-slate-800/50 rounded-3xl p-6 border border-gray-200/50 dark:border-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            <h2 className="font-black text-gray-700 dark:text-gray-200 tracking-tighter uppercase">
                                PREPARANDO
                            </h2>
                            <span className="ml-auto bg-blue-500 text-white text-xs font-black px-3 py-1 rounded-full">
                                {pedidosEnPreparacion.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {pedidosEnPreparacion.map((pedido) => (
                                <PedidoCard
                                    key={pedido.id}
                                    pedido={pedido}
                                    onNext={() =>
                                        cambiarEstado(pedido.id, ESTADOS.LISTO)
                                    }
                                    nextLabel="Listo"
                                    nextIcon="check_circle"
                                    loading={loading}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Columna: Listos */}
                    <div className="bg-gray-200/50 dark:bg-slate-800/50 rounded-3xl p-6 border border-gray-200/50 dark:border-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <h2 className="font-black text-gray-700 dark:text-gray-200 tracking-tighter uppercase">
                                LISTOS
                            </h2>
                            <span className="ml-auto bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full">
                                {pedidosListos.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {pedidosListos.map((pedido) => (
                                <PedidoCard
                                    key={pedido.id}
                                    pedido={pedido}
                                    onNext={() =>
                                        cambiarEstado(pedido.id, "entregado")
                                    }
                                    nextLabel="Cerrar"
                                    nextIcon="done"
                                    isReady={true}
                                    loading={loading}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
