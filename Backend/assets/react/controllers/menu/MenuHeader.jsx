import React from 'react';

export default function MenuHeader({ mesa, activeView, onViewChange, onToast }) {
    const handleMesaAction = async (action, message) => {
        try {
            const response = await fetch(`/api/mesa/${mesa.tokenQr}/` + action, { method: 'POST' });
            if (response.ok) {
                onToast(message);
            }
        } catch (error) {
            console.error('Error action:', error);
        }
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            html.classList.add('light');
            localStorage.setItem('darkMode', 'false');
        } else {
            html.classList.add('dark');
            html.classList.remove('light');
            localStorage.setItem('darkMode', 'true');
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-700 transition-colors">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-10">
                    {/* Logo */}
                    <div 
                        className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
                        onClick={() => onViewChange('menu')}
                    >
                        <div className="size-8 sm:size-10 bg-primary rounded-xl flex items-center justify-center text-white transition-transform group-hover:rotate-12">
                            <span className="material-symbols-outlined font-bold text-lg sm:text-xl">restaurant</span>
                        </div>
                        <h2 className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold leading-tight tracking-tight">
                            Comanda <span className="font-black text-primary">Digital</span>
                        </h2>
                    </div>
                    
                    {/* Nav */}
                    <nav className="flex items-center gap-3 sm:gap-6">
                        <button 
                            className={`text-[10px] sm:text-xs font-black tracking-wider uppercase pb-1 transition-all ${
                                activeView === 'menu' 
                                ? 'text-gray-900 dark:text-white border-b-2 border-primary' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-primary'
                            }`}
                            onClick={() => onViewChange('menu')}
                        >
                            Menú
                        </button>
                        <button 
                            className={`text-[10px] sm:text-xs font-black tracking-wider uppercase pb-1 transition-all ${
                                activeView === 'orders' 
                                ? 'text-gray-900 dark:text-white border-b-2 border-primary' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-primary'
                            }`}
                            onClick={() => onViewChange('orders')}
                        >
                            Mis Pedidos
                        </button>
                        
                        {/* Acciones de mesa */}
                        <div className="flex items-center gap-2 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-100 dark:border-slate-700">
                            <button 
                                onClick={() => handleMesaAction('llamar', 'Camarero avisado')}
                                className="size-8 sm:size-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors group relative"
                                title="Llamar camarero"
                            >
                                <span className="material-symbols-outlined text-xl">hail</span>
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Llamar camarero</span>
                            </button>
                            <button 
                                onClick={() => handleMesaAction('pagar', 'Cuenta solicitada')}
                                className="size-8 sm:size-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors group relative"
                                title="Pedir cuenta"
                            >
                                <span className="material-symbols-outlined text-xl">payments</span>
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Pedir cuenta</span>
                            </button>
                            {/* Dark mode toggle */}
                            <button 
                                onClick={toggleDarkMode}
                                className="size-8 sm:size-10 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-yellow-400 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                title="Cambiar tema"
                            >
                                <span className="material-symbols-outlined text-xl">contrast</span>
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Mesa Info */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 pl-4 sm:pl-6 border-l border-gray-100 dark:border-slate-700">
                        <div className="text-right">
                            <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Mesa</p>
                            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                                {String(mesa?.numero || '?').padStart(2, '0')}
                            </p>
                        </div>
                        <div className="size-10 sm:size-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-primary border border-gray-100 dark:border-slate-700">
                            <span className="material-symbols-outlined text-2xl sm:text-3xl">table_restaurant</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
