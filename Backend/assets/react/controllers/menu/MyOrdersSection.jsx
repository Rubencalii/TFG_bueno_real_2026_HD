import React, { useState, useEffect } from 'react';

export default function MyOrdersSection({ mesa }) {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPedidos = async () => {
        try {
            const response = await fetch(`/api/mesa/${mesa.tokenQr}/pedidos`);
            if (response.ok) {
                const data = await response.json();
                setPedidos(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
        const interval = setInterval(fetchPedidos, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, [mesa.tokenQr]);

    const getStatusInfo = (estado) => {
        switch (estado) {
            case 'pendiente':
                return { 
                    label: 'Pendiente', 
                    icon: 'schedule', 
                    color: 'text-amber-500', 
                    bg: 'bg-amber-50 dark:bg-amber-900/30',
                    border: 'border-amber-200 dark:border-amber-800',
                    step: 1
                };
            case 'en_preparacion':
                return { 
                    label: 'En Preparación', 
                    icon: 'skillet', 
                    color: 'text-blue-500', 
                    bg: 'bg-blue-50 dark:bg-blue-900/30',
                    border: 'border-blue-200 dark:border-blue-800',
                    step: 2
                };
            case 'listo':
                return { 
                    label: '¡Listo para servir!', 
                    icon: 'check_circle', 
                    color: 'text-emerald-500', 
                    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
                    border: 'border-emerald-200 dark:border-emerald-800',
                    step: 3
                };
            default:
                return { 
                    label: estado, 
                    icon: 'info', 
                    color: 'text-gray-500', 
                    bg: 'bg-gray-50 dark:bg-slate-700',
                    border: 'border-gray-200 dark:border-slate-600',
                    step: 0
                };
        }
    };

    if (loading && pedidos.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 font-bold">Cargando tus pedidos...</p>
            </div>
        );
    }

    if (pedidos.length === 0) {
        return (
            <div className="py-20 text-center px-6">
                <div className="size-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl">receipt_long</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No tienes pedidos activos</h3>
                <p className="text-gray-500 dark:text-gray-400">Cuando realices un pedido, aparecerá aquí para que puedas seguir su estado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[600px] mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Mis Pedidos</h2>
                <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                    {pedidos.length} {pedidos.length === 1 ? 'Pedido' : 'Pedidos'}
                </span>
            </div>

            {pedidos.map((pedido) => {
                const status = getStatusInfo(pedido.estado);
                return (
                    <div key={pedido.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                        {/* Status Header */}
                        <div className={`${status.bg} ${status.border} border-b p-4 flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined ${status.color} font-bold`}>
                                    {status.icon}
                                </span>
                                <span className={`font-black text-sm uppercase tracking-tight ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                Pedido #{pedido.id} • {pedido.createdAt}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-6 py-4 bg-white dark:bg-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex flex-col items-center gap-1">
                                        <div className={`size-2 rounded-full ${status.step >= s ? status.color.replace('text', 'bg') : 'bg-gray-200 dark:bg-slate-600'}`}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${status.color.replace('text', 'bg')} transition-all duration-1000`}
                                    style={{ width: `${(status.step / 3) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="p-6 space-y-3">
                            {pedido.detalles.map((detalle, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="size-6 bg-gray-50 dark:bg-slate-700 rounded-lg flex items-center justify-center text-[10px] font-black text-primary border border-gray-100 dark:border-slate-600">
                                            {detalle.cantidad}
                                        </span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{detalle.producto}</span>
                                    </div>
                                    {detalle.notas && (
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 italic">"{detalle.notas}"</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer Info */}
                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-700/50 border-t border-gray-50 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total del pedido</span>
                            <span className="font-black text-gray-900 dark:text-white">{parseFloat(pedido.total).toFixed(2)}€</span>
                        </div>
                    </div>
                );
            })}

            <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 dark:border-primary/20">
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Nota</p>
                <p className="text-xs text-gray-900 dark:text-gray-200 font-medium leading-relaxed">
                    Si necesitas cancelar algo o tienes alguna duda, por favor avisa a un camarero.
                </p>
            </div>
        </div>
    );
}
