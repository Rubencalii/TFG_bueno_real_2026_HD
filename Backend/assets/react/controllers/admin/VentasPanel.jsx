import React, { useState, useEffect } from "react";

const VentasPanel = () => {
    const [data, setData] = useState({
        tickets: [],
        resumen: [],
        fecha: "",
        actualizacion: "",
    });
    const [loading, setLoading] = useState(true);
    const [desde, setDesde] = useState(new Date().toISOString().split('T')[0]);
    const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0]);

    const fetchVentas = async () => {
        try {
            const response = await fetch(`/admin/api/ventas?desde=${desde}&hasta=${hasta}`);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error("Error fetching ventas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVentas();
        // Solo auto-refrescar si estamos viendo "hoy"
        const isToday = desde === new Date().toISOString().split('T')[0] && hasta === desde;
        let interval;
        if (isToday) {
            interval = setInterval(fetchVentas, 30000);
        }
        return () => interval && clearInterval(interval);
    }, [desde, hasta]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
        }).format(amount);
    };

    const totalVentasStripe =
        data.resumen.find((r) => r.metodoPago === "stripe")?.total || 0;
    const totalVentasFisico = data.resumen.reduce(
        (acc, r) =>
            r.metodoPago !== "stripe" ? acc + parseFloat(r.total) : acc,
        0,
    );
    const totalIva = data.tickets.reduce(
        (acc, t) => acc + parseFloat(t.iva),
        0,
    );
    const totalNeto = data.resumen.reduce(
        (acc, r) => acc + parseFloat(r.total),
        0,
    );

    if (loading)
        return (
            <div className="p-8 text-center text-gray-500">
                Cargando panel de ventas...
            </div>
        );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Resumen del Turno */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined">
                                receipt_long
                            </span>
                            Gestión de Ventas y Facturación
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                            🗓️ Resumen del Turno: {data.fecha} |
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                ABIERTA
                            </span>
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Desde</label>
                            <input 
                                type="date" 
                                value={desde}
                                onChange={(e) => setDesde(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hasta</label>
                            <input 
                                type="date" 
                                value={hasta}
                                onChange={(e) => setHasta(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                        <div className="text-right sm:ml-4 sm:mb-2">
                             <div className="text-[10px] text-gray-400 uppercase tracking-tight">
                                Última actualización: {data.actualizacion}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-l-4 border-l-blue-500 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Ventas Online (Stripe)
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(totalVentasStripe)}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-l-4 border-l-amber-500 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Ventas Físico (Efectivo/TPV)
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(totalVentasFisico)}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-l-4 border-l-emerald-500 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        IVA Acumulado (10%)
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(totalIva)}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-l-4 border-l-purple-500 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        TOTAL NETO DEL DÍA
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(totalNeto)}
                    </p>
                </div>
            </div>

            {/* Main Tickets Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                        📜 Histórico de Tickets y Facturas
                    </h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            Excel/CSV
                        </button>
                        <button className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                            PDF Trimestral
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    ID Factura
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Mesa
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Método
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Base Imp.
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    IVA (10%)
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {data.tickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${ticket.anulado ? "opacity-50 grayscale" : ""}`}
                                >
                                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                                        {ticket.factura}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        #{ticket.mesa}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1 capitalize">
                                            {ticket.metodo === "stripe" &&
                                                "💳 "}
                                            {ticket.metodo === "efectivo" &&
                                                "💶 "}
                                            {ticket.metodo === "tpv" && "📟 "}
                                            {ticket.metodo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                ticket.estado === "pagado"
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    : ticket.estado ===
                                                        "anulado"
                                                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            }`}
                                        >
                                            {ticket.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {formatCurrency(ticket.base)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {formatCurrency(ticket.iva)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(ticket.total)}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors text-slate-500"
                                                title="Ver detalle"
                                            >
                                                <span className="material-symbols-outlined size-5">
                                                    visibility
                                                </span>
                                            </button>
                                            <button
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors text-slate-500"
                                                title="Imprimir"
                                            >
                                                <span className="material-symbols-outlined size-5">
                                                    print
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fiscal Footer */}
            <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-6 border border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Configuración Fiscal
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            CIF/NIF: B12345678 (Restaurante Ejemplo S.L.)
                        </p>
                        <p className="text-sm text-gray-500">
                            Serie Actual: {new Date().getFullYear()}-
                            (Correlativa)
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="material-symbols-outlined text-emerald-500">
                            verified_user
                        </span>
                        <div className="text-xs">
                            <p className="font-bold text-gray-900 dark:text-white uppercase">
                                Modo Ley Antifraude
                            </p>
                            <p className="text-gray-500">
                                Registros no editables (Ley 11/2021)
                            </p>
                        </div>
                        <div className="ml-2 text-emerald-500 font-bold">
                            ACTIVO
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VentasPanel;
