import React from 'react';

export default function CategoryNav({ categorias, activeCategory, onCategoryChange }) {
    if (!categorias || categorias.length === 0) return null;

    return (
        <div className="mb-8 sm:mb-12 border-b border-gray-100 sticky top-16 sm:top-20 bg-background-light/95 backdrop-blur-md z-40 py-3 sm:py-4">
            <div className="flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar">
                {categorias.map(categoria => {
                    const isActive = activeCategory?.id === categoria.id;
                    
                    return (
                        <button
                            key={categoria.id}
                            onClick={() => onCategoryChange(categoria)}
                            className={`flex flex-col items-center justify-center pb-2 sm:pb-3 shrink-0 transition-colors ${
                                isActive 
                                    ? 'border-b-2 border-primary text-text-main' 
                                    : 'border-b-2 border-transparent text-text-muted hover:text-primary'
                            }`}
                        >
                            <p className="text-xs sm:text-sm font-black uppercase tracking-widest">
                                {categoria.nombre}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
