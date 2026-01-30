import React from 'react';

export default function PedidoCard({ pedido, onNext, nextLabel, nextIcon, isReady, loading }) {
    // Colores del semáforo con soporte dark mode
    const semaforoColors = {
        verde: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
        amarillo: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/30',
        rojo: 'border-l-red-500 bg-red-50 dark:bg-red-900/30 animate-pulse'
    };

    const borderColor = semaforoColors[pedido.colorSemaforo] || 'border-l-gray-300 dark:border-l-gray-600';

    // Verificar si hay notas especiales (alergias)
    const tieneNotasEspeciales = pedido.detalles.some(d => 
        d.notas && (d.notas.toLowerCase().includes('alergia') || 
                    d.notas.toLowerCase().includes('celiaco') ||
                    d.notas.toLowerCase().includes('sin'))
    );

    return (
        <div className={`bg-white dark:bg-slate-700 rounded-xl shadow-md overflow-hidden border-l-4 ${borderColor} transition-colors`}>
            {/* Header de la tarjeta */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-gray-800 dark:text-white">
                            {pedido.mesa}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full font-medium">
                            Mesa
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{pedido.createdAt}</p>
                        <p className={`text-xs font-medium ${
                            pedido.minutosEspera >= 10 ? 'text-red-600 dark:text-red-400' : 
                            pedido.minutosEspera >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                            Hace {pedido.minutosEspera} min
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerta de notas especiales */}
            {tieneNotasEspeciales && (
                <div className="bg-red-600 text-white px-4 py-2 font-bold text-sm">
                    ⚠️ NOTAS ESPECIALES - VER DETALLES
                </div>
            )}

            {/* Lista de productos */}
            <div className="p-4 space-y-2">
                {pedido.detalles.map((detalle, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <span className="bg-primary/10 dark:bg-primary/20 text-primary font-black text-sm px-2 py-0.5 rounded">
                            {detalle.cantidad}x
                        </span>
                        <div className="flex-1">
                            <p className="font-bold text-gray-800 dark:text-white text-sm">{detalle.producto}</p>
                            {detalle.notas && (
                                <p className={`text-xs mt-1 px-2 py-1 rounded ${
                                    detalle.notas.toLowerCase().includes('alergia') ||
                                    detalle.notas.toLowerCase().includes('celiaco')
                                        ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-bold'
                                        : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 italic'
                                }`}>
                                    "{detalle.notas}"
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Botón de acción */}
            <div className="p-4 pt-2">
                <button
                    onClick={onNext}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                        isReady 
                            ? 'bg-emerald-500 hover:bg-emerald-600' 
                            : 'bg-primary hover:bg-primary/90'
                    } disabled:opacity-50`}
                >
                    <span className="material-symbols-outlined">{nextIcon}</span>
                    {loading ? 'Procesando...' : nextLabel}
                </button>
            </div>
        </div>
    );
}
