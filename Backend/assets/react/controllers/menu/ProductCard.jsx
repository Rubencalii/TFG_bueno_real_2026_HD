import React, { useState } from 'react';

export default function ProductCard({ producto, onAddToCart, onRemoveFromCart, quantity, t, isAuthenticated }) {
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notes, setNotes] = useState('');

    const handleAdd = () => {
        onAddToCart(producto, notes);
        setNotes('');
        setShowNotesModal(false);
    };

    const handleQuickAdd = () => {
        onAddToCart(producto, '');
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden card-shadow hover:translate-y-[-4px] transition-all group border border-gray-100 dark:border-slate-700">
                {/* Image */}
                <div 
                    className="h-40 sm:h-56 bg-cover bg-center overflow-hidden relative"
                    style={{ backgroundImage: `url("${producto.imagen || '/placeholder-food.jpg'}")` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    
                    {/* Tags */}
                    {producto.destacado && (
                        <div className="p-3 sm:p-4 relative">
                            <span className="bg-secondary px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white orange-glow">
                                {t('TOP SELLER') || 'TOP SELLER'}
                            </span>
                        </div>
                    )}
                    {producto.vegetariano && (
                        <div className="p-3 sm:p-4 relative">
                            <span className="bg-primary px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white neon-glow">
                                {t('VEGETARIANA') || 'VEGETARIANA'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 pt-4 sm:pt-6 flex flex-col h-full relative">
                    {/* Title and Price */}
                    <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                        <h4 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                            {producto.nombre}
                        </h4>
                        <p className="text-lg sm:text-xl font-black text-primary whitespace-nowrap">
                            {parseFloat(producto.precio).toFixed(2)}€
                        </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-8 leading-relaxed line-clamp-2">
                        {producto.descripcion}
                    </p>

                    {/* Allergens and Add Button */}
                    <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-50 dark:border-slate-700">
                        <div className="flex gap-1 sm:gap-2 flex-wrap">
                            {producto.alergenos?.map(alergeno => (
                                <span 
                                    key={alergeno}
                                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-gray-50 dark:bg-slate-700 text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400 font-black uppercase border border-gray-100 dark:border-slate-600"
                                >
                                    {t(alergeno) || alergeno}
                                </span>
                            ))}
                        </div>
                        
                        {isAuthenticated && (
                        <div className="flex items-center gap-2">
                            {/* Notes button - secondary but visible */}
                            <button 
                                onClick={() => setShowNotesModal(true)}
                                className="size-11 sm:size-12 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors border border-gray-200 dark:border-slate-600"
                                title={t('Añadir con nota') || 'Añadir con nota'}
                            >
                                <span className="material-symbols-outlined text-xl">edit_note</span>
                            </button>
                            
                            <div className="flex-1">
                                {quantity === 0 ? (
                                    /* Primary ADD button - high visibility */
                                    <button 
                                        onClick={handleQuickAdd}
                                        className="w-full h-11 sm:h-12 bg-primary text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all active:scale-95"
                                    >
                                        <span className="text-xl">+</span>
                                    </button>
                                ) : (
                                    /* Quantity Selector - when item is already in cart */
                                    <div className="flex items-center justify-between bg-white dark:bg-slate-700 rounded-2xl p-1 border-2 border-primary shadow-sm h-11 sm:h-12 overflow-hidden">
                                        <button 
                                            onClick={() => onRemoveFromCart(producto.id)}
                                            className="size-8 sm:size-10 flex items-center justify-center text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-colors"
                                        >
                                            <span className="text-2xl font-bold">−</span>
                                        </button>
                                        
                                        <div className="flex flex-col items-center justify-center leading-none">
                                            <span className="text-gray-900 dark:text-white font-black text-sm sm:text-base">
                                                {quantity}
                                            </span>
                                            <span className="text-[8px] font-bold text-primary uppercase tracking-tighter">
                                                {t('en carrito') || 'en carrito'}
                                            </span>
                                        </div>
                                        
                                        <button 
                                            onClick={handleQuickAdd}
                                            className="size-8 sm:size-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-md shadow-primary/20 hover:scale-110 transition-transform active:scale-95"
                                        >
                                            <span className="text-2xl font-bold">+</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNotesModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{t('Añadir nota al pedido') || 'Añadir nota al pedido'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{producto.nombre}</p>
                        <textarea
                            className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-xl mb-4 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder={t('Ej: Sin cebolla, poco hecho...') || 'Ej: Sin cebolla, poco hecho...'}
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowNotesModal(false)}
                                className="flex-1 py-3 border border-gray-200 dark:border-slate-600 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                {t('Cancelar') || 'Cancelar'}
                            </button>
                            <button 
                                onClick={handleAdd}
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold neon-glow"
                            >
                                {t('Añadir') || 'Añadir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
