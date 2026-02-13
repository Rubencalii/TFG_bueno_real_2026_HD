import React, { useState, useEffect, useMemo } from 'react';
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
    
    // PIN Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');
    const [isLoadingPin, setIsLoadingPin] = useState(false);
    const [pinRequested, setPinRequested] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);

    // On load, re-verify stored PIN against server
    useEffect(() => {
        const verifyStoredPin = async () => {
            if (!mesa?.tokenQr) { setIsCheckingAuth(false); return; }
            
            const storedPin = localStorage.getItem(`mesa_pin_${mesa.tokenQr}`);
            if (!storedPin) { setIsCheckingAuth(false); return; }

            try {
                const response = await fetch(`/api/mesa/${mesa.tokenQr}/verify-pin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin: storedPin })
                });
                const data = await response.json();
                if (data.success) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem(`mesa_pin_${mesa.tokenQr}`);
                }
            } catch (error) {
                console.error('Error verifying PIN:', error);
            }
            setIsCheckingAuth(false);
        };
        verifyStoredPin();
    }, [mesa?.tokenQr]);

    // Polling: auto-lock if table is closed (PIN rotated by admin)
    useEffect(() => {
        if (!isAuthenticated || !mesa?.tokenQr) return;

        const intervalId = setInterval(async () => {
            const storedPin = localStorage.getItem(`mesa_pin_${mesa.tokenQr}`);
            if (!storedPin) { setIsAuthenticated(false); return; }

            try {
                const response = await fetch(`/api/mesa/${mesa.tokenQr}/verify-pin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin: storedPin })
                });
                const data = await response.json();
                if (!data.success) {
                    localStorage.removeItem(`mesa_pin_${mesa.tokenQr}`);
                    setIsAuthenticated(false);
                    setPinInput('');
                    setCart([]);
                    setPinRequested(false);
                    setShowPinModal(false);
                }
            } catch (error) {
                console.error('Auth polling error:', error);
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, mesa?.tokenQr]);

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        setIsLoadingPin(true);
        setPinError('');

        try {
            const response = await fetch(`/api/mesa/${mesa.tokenQr}/verify-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: pinInput })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem(`mesa_pin_${mesa.tokenQr}`, pinInput);
                setIsAuthenticated(true);
            } else {
                setPinError('PIN incorrecto. Pregunta al camarero.');
            }
        } catch (error) {
            setPinError('Error de conexión');
        } finally {
            setIsLoadingPin(false);
        }
    };

    const handleSolicitarPin = async () => {
        try {
            const response = await fetch(`/api/mesa/${mesa.tokenQr}/solicitar-pin`, { method: 'POST' });
            if (response.ok) {
                setPinRequested(true);
                showToast('¡PIN solicitado! El camarero viene enseguida.');
            }
        } catch (error) {
            console.error('Error solicitando PIN:', error);
        }
    };

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

    // Auto-refresh si la mesa se cierra
    React.useEffect(() => {
        if (!mesa?.tokenQr) return;

        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/mesa/${mesa.tokenQr}/status`);
                if (response.ok) {
                    const data = await response.json();
                    if (!data.active) {
                        window.location.reload(); // Recargar para mostrar error/cerrar sesión
                    }
                }
            } catch (error) {
                console.error('Error checking table status:', error);
            }
        };

        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [mesa]);

    return (
        <div className="bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-display min-h-screen selection:bg-primary selection:text-white transition-colors">
            <MenuHeader 
                mesa={mesa} 
                activeView={activeView} 
                onViewChange={setActiveView} 
                onToast={showToast}
                t={t}
                isAuthenticated={isAuthenticated}
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
                        isAuthenticated={isAuthenticated}
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

            {isAuthenticated && (
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
            )}

            {/* PIN MODAL — triggered from floating bar */}
            {showPinModal && !isAuthenticated && (
                <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
                        <span className="material-symbols-outlined text-6xl text-primary mb-4 block text-center">lock_open</span>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">Introduce tu PIN</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center text-sm">Pídelo al camarero si no lo tienes</p>
                        
                        <form onSubmit={handlePinSubmit} className="space-y-4">
                            <input
                                type="tel"
                                maxLength="8"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                placeholder="00000000"
                                className="w-full text-center text-3xl font-black tracking-[0.2em] py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-0 transition-colors"
                                autoFocus
                            />
                            
                            {pinError && (
                                <p className="text-red-500 font-bold text-sm bg-red-100 p-2 rounded">{pinError}</p>
                            )}
                            
                            <button 
                                type="submit" 
                                disabled={isLoadingPin || pinInput.length < 8}
                                className="w-full py-4 bg-primary text-white font-black rounded-xl text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingPin ? 'Verificando...' : 'Desbloquear Mesa'}
                            </button>
                        </form>
                        
                        <button 
                            onClick={() => setShowPinModal(false)}
                            className="w-full mt-3 py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* FLOATING AUTH BAR — shown when not authenticated */}
            {!isAuthenticated && !isCheckingAuth && !showPinModal && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-t-2 border-primary/30 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
                    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-primary text-xl">lock</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Modo solo lectura</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Introduce el PIN para poder hacer pedidos</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button 
                                    onClick={() => setShowPinModal(true)}
                                    className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white font-black rounded-xl text-sm uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                                >
                                    <span className="material-symbols-outlined text-lg">lock_open</span>
                                    Tengo el PIN
                                </button>
                                <button 
                                    onClick={handleSolicitarPin}
                                    disabled={pinRequested}
                                    className={`flex-1 sm:flex-none px-6 py-3 font-black rounded-xl text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                        pinRequested 
                                            ? 'bg-emerald-500 text-white cursor-not-allowed' 
                                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-lg">{pinRequested ? 'check_circle' : 'hail'}</span>
                                    {pinRequested ? 'Solicitado ✓' : 'Solicitar PIN'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading while checking auth */}
            {isCheckingAuth && (
                <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <p className="text-white text-lg">Verificando acceso...</p>
                </div>
            )}
        </div>
    );
}
