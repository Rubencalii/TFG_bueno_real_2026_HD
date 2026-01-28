import React from 'react';

export default function MenuHeader({ mesa }) {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-10">
                    {/* Logo */}
                    <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
                        <div className="size-8 sm:size-10 bg-primary rounded-xl flex items-center justify-center text-white transition-transform group-hover:rotate-12">
                            <span className="material-symbols-outlined font-bold text-lg sm:text-xl">restaurant</span>
                        </div>
                        <h2 className="text-text-main text-lg sm:text-xl font-bold leading-tight tracking-tight">
                            Comanda <span className="font-black text-primary">Digital</span>
                        </h2>
                    </div>
                    
                    {/* Nav - Hidden on mobile */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-text-main text-sm font-bold tracking-wider uppercase border-b-2 border-primary pb-1" href="#">
                            Menú
                        </a>
                        <a className="text-text-muted text-sm font-bold tracking-wider uppercase hover:text-primary transition-colors" href="#">
                            Mis Pedidos
                        </a>
                        <a className="text-text-muted text-sm font-bold tracking-wider uppercase hover:text-primary transition-colors" href="#">
                            Ayuda
                        </a>
                    </nav>
                </div>

                {/* Mesa Info */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 pl-4 sm:pl-6 border-l border-gray-100">
                        <div className="text-right">
                            <p className="text-[9px] sm:text-[10px] text-text-muted font-bold uppercase tracking-widest">Mesa</p>
                            <p className="text-xl sm:text-2xl font-black text-text-main leading-none">
                                {String(mesa?.numero || '?').padStart(2, '0')}
                            </p>
                        </div>
                        <div className="size-10 sm:size-12 rounded-2xl bg-gray-50 flex items-center justify-center text-primary border border-gray-100">
                            <span className="material-symbols-outlined text-2xl sm:text-3xl">table_restaurant</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
