import React, { useState, useMemo } from 'react';
import MenuHeader from './MenuHeader';
import SearchBar from './SearchBar';
import CategoryNav from './CategoryNav';
import ProductGrid from './ProductGrid';
import CartFloat from './CartFloat';
import MyOrdersSection from './MyOrdersSection';
import LanguageSelector from './LanguageSelector';
import { useTranslations, translateAllergen, translateCategory } from './translations';

export default function MenuPage({ mesa, productos, categorias, alergenos, idiomas, idiomaActual, ui }) {
    console.log('🌍 UI Object received:', ui);
    console.log('🌍 Current locale:', idiomaActual?.codigo);
    const { t } = useTranslations(idiomaActual?.codigo || 'es', ui);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [activeCategory, setActiveCategory] = useState(categorias?.[0] || null);
    const [toast, setToast] = useState(null);
    const [activeView, setActiveView] = useState('menu'); // 'menu' or 'orders'

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

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
        showToast(`${producto.nombre} ${t('añadido') || 'añadido'}`);
    };

    const getItemQuantity = (productoId) => {
        return cart
            .filter(item => item.id === productoId)
            .reduce((sum, item) => sum + item.cantidad, 0);
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

    // Función para cambiar idioma
    const handleLanguageChange = (idioma) => {
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('lang', idioma.codigo);
        window.location.href = currentUrl.toString();
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-display min-h-screen selection:bg-primary selection:text-white transition-colors">
            <MenuHeader 
                mesa={mesa} 
                activeView={activeView} 
                onViewChange={setActiveView} 
                onToast={showToast}
                t={t}
            />
            
            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-40">
                {activeView === 'menu' ? (
                    <>
                        {/* Title Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
                    <div className="space-y-2">
                        <h1 className="text-gray-900 dark:text-white text-4xl sm:text-6xl font-black leading-tight tracking-tighter">
                            {t('MESA') || 'MESA'} {mesa?.numero || '?'}
                        </h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary text-[11px] font-black rounded-full border border-primary/20 uppercase tracking-widest">
                                {ui?.liveSession || t('liveSession')}
                            </span>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">
                                {ui?.comandaDigital || t('comandaDigital')}
                            </p>
                        </div>
                    </div>
                    
                    {/* Selector de idioma */}
                    {idiomas && idiomas.length > 1 && (
                        <div className="flex-shrink-0">
                            <LanguageSelector
                                idiomas={idiomas}
                                idiomaActual={idiomaActual}
                                onLanguageChange={handleLanguageChange}
                            />
                        </div>
                    )}
                </div>

                {/* Search and Filters */}
                <SearchBar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    activeFilters={activeFilters}
                    onToggleFilter={toggleFilter}
                    alergenos={alergenos}
                    currentLang={idiomaActual?.codigo || 'es'}
                    t={t}
                />

                {/* Category Navigation */}
                <CategoryNav 
                    categorias={categorias}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    currentLang={idiomaActual?.codigo || 'es'}
                    t={t}
                />

                {/* Products Grid */}
                    <ProductGrid 
                        productos={filteredProductos}
                        activeCategory={activeCategory}
                        onAddToCart={addToCart}
                        onRemoveFromCart={removeFromCart}
                        cartItems={cart}
                        t={t}
                    />
                </>
                ) : (
                    <MyOrdersSection mesa={mesa} t={t} />
                )}
            </main>

            {/* Notification Toast */}
            {toast && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
                    <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 border border-white/10 dark:border-gray-200">
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                        {toast}
                    </div>
                </div>
            )}

            {/* Floating Cart */}
            <CartFloat 
                items={cart}
                total={cartTotal}
                count={cartCount}
                onRemove={removeFromCart}
                mesa={mesa}
                t={t}
                ui={ui}
                onOrderSuccess={() => {
                    setCart([]);
                    setActiveView('orders');
                    showToast(t('¡Pedido enviado!') || '¡Pedido enviado!');
                }}
            />
        </div>
    );
}
