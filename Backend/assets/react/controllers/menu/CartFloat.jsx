import React, { useState } from 'react';

export default function CartFloat({ items, total, count, onRemove, mesa, onOrderSuccess }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (items.length === 0) return;
        
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/pedido', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mesaId: mesa?.id,
                    items: items.map(item => ({
                        productoId: item.id,
                        cantidad: item.cantidad,
                        notas: item.notas || null
                    }))
                })
            });
            
            if (response.ok) {
                setIsOpen(false);
                if (onOrderSuccess) onOrderSuccess();
            } else {
                alert('Error al enviar el pedido');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (count === 0) return null;

    return (
        <>
            {/* Cart Drawer */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)}>
                    <div 
                        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto transition-colors"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Tu Pedido</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="space-y-4 mb-6">
                            {items.map((item, index) => (
                                <div key={`${item.id}-${item.notas}-${index}`} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{item.nombre}</p>
                                        {item.notas && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{item.notas}"</p>
                                        )}
                                        <p className="text-xs text-primary font-bold">
                                            {item.cantidad} x {parseFloat(item.precio).toFixed(2)}€
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => onRemove(item.id, item.notas)}
                                            className="size-8 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="w-6 text-center font-bold text-gray-900 dark:text-white">{item.cantidad}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total and Submit */}
                        <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                            <div className="flex justify-between mb-4">
                                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-xl font-black text-primary">{total.toFixed(2)}€</span>
                            </div>
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-white font-black rounded-2xl neon-glow disabled:opacity-50"
                            >
                                {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 z-40 pointer-events-none">
                <div className="max-w-[1200px] mx-auto pointer-events-auto">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_50px_rgba(0,0,0,0.4)] rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-700 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 sm:gap-6 transition-colors">
                        {/* Cart Info */}
                        <button 
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-4 sm:gap-6"
                        >
                            <div className="size-12 sm:size-14 bg-primary/10 dark:bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary relative border border-primary/20">
                                <span className="material-symbols-outlined text-2xl sm:text-3xl font-bold">shopping_bag</span>
                                <div className="absolute -top-2 -right-2 size-5 sm:size-6 bg-secondary text-white text-[10px] sm:text-xs font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                                    {count}
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                                    {count} artículo{count !== 1 ? 's' : ''} • <span className="text-primary">{total.toFixed(2)} €</span>
                                </p>
                                <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                                    IVA e impuestos incluidos
                                </p>
                            </div>
                        </button>

                        {/* Confirm Button */}
                        <div className="flex items-center gap-4 flex-1 justify-end">
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-primary text-white font-black rounded-xl sm:rounded-2xl transition-all hover:bg-primary/90 active:scale-95 neon-glow uppercase tracking-tighter text-sm sm:text-base disabled:opacity-50"
                            >
                                <span>{isSubmitting ? 'Enviando...' : 'Confirmar'}</span>
                                <span className="material-symbols-outlined font-bold text-lg sm:text-xl">rocket_launch</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
