import React, { useState, useMemo } from 'react';
import MenuHeader from './MenuHeader';
import SearchBar from './SearchBar';
import CategoryNav from './CategoryNav';
import ProductGrid from './ProductGrid';
import CartFloat from './CartFloat';

export default function MenuPage({ mesa, productos, categorias, alergenos }) {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [activeCategory, setActiveCategory] = useState(categorias?.[0] || null);

    // Filter products based on search and allergens
    const filteredProductos = useMemo(() => {
        if (!productos) return [];
        
        return productos.filter(producto => {
            // Search filter
            const matchesSearch = searchTerm === '' || 
                producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Allergen filter - hide products that contain selected allergens
            const matchesAllergens = activeFilters.length === 0 || 
                !producto.alergenos?.some(a => activeFilters.includes(a.toLowerCase()));
            
            // Category filter
            const matchesCategory = !activeCategory || 
                producto.categoriaId === activeCategory.id;
            
            return matchesSearch && matchesAllergens && matchesCategory;
        });
    }, [productos, searchTerm, activeFilters, activeCategory]);

    const addToCart = (producto, notas = '') => {
        setCart(prev => {
            const existing = prev.find(item => item.id === producto.id && item.notas === notas);
            if (existing) {
                return prev.map(item => 
                    item.id === producto.id && item.notas === notas
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prev, { ...producto, cantidad: 1, notas }];
        });
    };

    const removeFromCart = (productoId, notas = '') => {
        setCart(prev => {
            const existing = prev.find(item => item.id === productoId && item.notas === notas);
            if (existing && existing.cantidad > 1) {
                return prev.map(item =>
                    item.id === productoId && item.notas === notas
                        ? { ...item, cantidad: item.cantidad - 1 }
                        : item
                );
            }
            return prev.filter(item => !(item.id === productoId && item.notas === notas));
        });
    };

    const toggleFilter = (filtro) => {
        setActiveFilters(prev => 
            prev.includes(filtro) 
                ? prev.filter(f => f !== filtro)
                : [...prev, filtro]
        );
    };

    const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

    return (
        <div className="bg-background-light text-text-main font-display min-h-screen selection:bg-primary selection:text-white">
            <MenuHeader mesa={mesa} />
            
            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-40">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
                    <div className="space-y-2">
                        <h1 className="text-text-main text-4xl sm:text-6xl font-black leading-tight tracking-tighter">
                            MESA {mesa?.numero || '?'}
                        </h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-black rounded-full border border-primary/20 uppercase tracking-widest">
                                LIVE SESSION
                            </span>
                            <p className="text-text-muted text-sm font-medium tracking-wide">
                                Comanda Digital
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <SearchBar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    activeFilters={activeFilters}
                    onToggleFilter={toggleFilter}
                    alergenos={alergenos}
                />

                {/* Category Navigation */}
                <CategoryNav 
                    categorias={categorias}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                {/* Products Grid */}
                <ProductGrid 
                    productos={filteredProductos}
                    activeCategory={activeCategory}
                    onAddToCart={addToCart}
                />
            </main>

            {/* Floating Cart */}
            <CartFloat 
                items={cart}
                total={cartTotal}
                count={cartCount}
                onRemove={removeFromCart}
                mesa={mesa}
            />
        </div>
    );
}
