import React, { useState, useEffect } from 'react';

const AnalyticsDashboard = () => {
    const [data, setData] = useState({
        topProductos: [],
        ventasPorHora: [],
        ventasSemanales: [],
        resumenHoy: []
    });
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/admin/api/analytics');
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Analizando datos del negocio...</div>;

    const totalVentasHoy = data.resumenHoy.reduce((acc, curr) => acc + parseFloat(curr.total), 0);

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Business Intelligence</h2>
                <p className="text-gray-500 dark:text-gray-400">Análisis detallado del rendimiento de tu restaurante</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Ventas Hoy" value={formatCurrency(totalVentasHoy)} icon="attach_money" color="bg-primary" />
                <StatCard title="Tickets Hoy" value={data.ventasPorHora.reduce((acc, curr) => acc + 1, 0) + " (demo)"} icon="receipt" color="bg-emerald-500" />
                <StatCard title="Ticket Medio" value={formatCurrency(totalVentasHoy / 5 || 0)} icon="analytics" color="bg-amber-500" />
                <StatCard title="Predicción" value={formatCurrency(totalVentasHoy * 1.2)} icon="auto_graph" color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Products */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">emoji_events</span>
                        Top 5 Productos
                    </h3>
                    <div className="space-y-6 flex-1">
                        {data.topProductos.map((prod, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-700 dark:text-gray-300">{prod.nombre}</span>
                                    <span className="text-primary">{prod.total} uds.</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all duration-1000" 
                                        style={{ width: `${(prod.total / data.topProductos[0].total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hourly Heatmap */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">schedule</span>
                        Intensidad de Ventas (Hoy)
                    </h3>
                    <div className="h-48 flex items-end gap-2 px-2">
                        {Array.from({ length: 24 }).map((_, h) => {
                            const hourlyData = data.ventasPorHora.find(v => v.hora === h);
                            const height = hourlyData ? (parseFloat(hourlyData.total) / Math.max(...data.ventasPorHora.map(v => parseFloat(v.total)), 1)) * 100 : 5;
                            return (
                                <div key={h} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div 
                                        className={`w-full rounded-t-lg transition-all duration-700 ${hourlyData ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-700'}`}
                                        style={{ height: `${height}%` }}
                                    >
                                        {hourlyData && (
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-gray-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none transform -translate-x-1/4">
                                                {formatCurrency(hourlyData.total)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold">{h}h</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Weekly Revenue Trends */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                    Tendencia de Ingresos (Últimos 7 días)
                </h3>
                <div className="h-64 relative flex items-end justify-between px-4 pb-8">
                     {/* Simplified line chart via SVG could be here, using bars for now for safety */}
                     {data.ventasSemanales.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-3 w-20">
                            <span className="text-xs font-bold text-gray-500">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(day.total)}</span>
                            <div className="w-12 bg-emerald-500/20 rounded-2xl relative overflow-hidden h-32 flex items-end">
                                <div 
                                    className="w-full bg-emerald-500 rounded-2xl transition-all duration-1000"
                                    style={{ height: `${(day.total / Math.max(...data.ventasSemanales.map(v => v.total), 1)) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-black text-gray-900 dark:text-white">{day.fecha.split('-').slice(1).reverse().join('/')}</span>
                        </div>
                     ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:translate-y-[-4px] transition-transform">
        <div className="flex items-center gap-4">
            <div className={`size-12 rounded-2xl ${color} flex items-center justify-center text-white`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

export default AnalyticsDashboard;
