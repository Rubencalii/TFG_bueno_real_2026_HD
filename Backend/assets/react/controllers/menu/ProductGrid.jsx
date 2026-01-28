import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ productos, activeCategory, onAddToCart }) {
    if (!productos || productos.length === 0) {
        return (
            <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
                <p className="text-text-muted text-lg">No se encontraron productos</p>
                <p className="text-text-muted text-sm">Prueba a cambiar los filtros</p>
            </div>
        );
    }

    return (
        <section className="mb-16">
            {/* Section Header */}
            {activeCategory && (
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-text-main">
                        {activeCategory.nombre.toUpperCase()}
                    </h3>
                    <span className="px-2 sm:px-3 py-1 bg-gray-100 rounded-lg text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest border border-gray-200">
                        {productos.length} opciones
                    </span>
                </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {productos.map(producto => (
                    <ProductCard 
                        key={producto.id}
                        producto={producto}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>
        </section>
    );
}
