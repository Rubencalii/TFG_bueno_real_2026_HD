import React, { useState } from 'react';

export default function ProductCard({ producto, onAddToCart }) {
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
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden card-shadow hover:translate-y-[-4px] transition-all group border border-gray-100">
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
                                TOP SELLER
                            </span>
                        </div>
                    )}
                    {producto.vegetariano && (
                        <div className="p-3 sm:p-4 relative">
                            <span className="bg-primary px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white neon-glow">
                                VEGETARIANA
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 pt-4 sm:pt-6 flex flex-col h-full relative">
                    {/* Title and Price */}
                    <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                        <h4 className="text-base sm:text-xl font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2">
                            {producto.nombre}
                        </h4>
                        <p className="text-lg sm:text-xl font-black text-primary whitespace-nowrap">
                            {parseFloat(producto.precio).toFixed(2)}€
                        </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-text-muted mb-4 sm:mb-8 leading-relaxed line-clamp-2">
                        {producto.descripcion}
                    </p>

                    {/* Allergens and Add Button */}
                    <div className="flex items-center justify-between mt-auto gap-2">
                        <div className="flex gap-1 sm:gap-2 flex-wrap">
                            {producto.alergenos?.map(alergeno => (
                                <span 
                                    key={alergeno}
                                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-gray-50 text-[8px] sm:text-[9px] text-text-muted font-black uppercase border border-gray-100"
                                >
                                    {alergeno}
                                </span>
                            ))}
                        </div>
                        
                        <div className="flex gap-2">
                            {/* Notes button */}
                            <button 
                                onClick={() => setShowNotesModal(true)}
                                className="size-10 sm:size-12 bg-gray-100 text-text-muted rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="Añadir con nota"
                            >
                                <span className="material-symbols-outlined text-lg sm:text-xl">edit_note</span>
                            </button>
                            
                            {/* Quick add button */}
                            <button 
                                onClick={handleQuickAdd}
                                className="size-10 sm:size-12 bg-primary text-white rounded-xl sm:rounded-2xl flex items-center justify-center neon-glow hover:scale-110 transition-transform active:scale-95"
                            >
                                <span className="material-symbols-outlined font-black">add</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNotesModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Añadir nota al pedido</h3>
                        <p className="text-sm text-text-muted mb-4">{producto.nombre}</p>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-xl mb-4 text-sm"
                            placeholder="Ej: Sin cebolla, poco hecho..."
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowNotesModal(false)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-text-muted"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleAdd}
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold neon-glow"
                            >
                                Añadir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
