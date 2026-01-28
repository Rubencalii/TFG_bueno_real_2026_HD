import React from 'react';

const ALLERGEN_ICONS = {
    'gluten': { icon: 'grain', label: 'Sin Gluten' },
    'huevo': { icon: 'egg', label: 'Sin Huevo' },
    'lactosa': { icon: 'water_drop', label: 'Sin Lactosa' },
    'vegano': { icon: 'eco', label: 'Vegano' },
    'frutos_secos': { icon: 'nutrition', label: 'Sin Frutos Secos' },
    'marisco': { icon: 'set_meal', label: 'Sin Marisco' },
};

export default function SearchBar({ searchTerm, onSearchChange, activeFilters, onToggleFilter, alergenos }) {
    const allergenList = alergenos || Object.keys(ALLERGEN_ICONS);

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 card-shadow border border-gray-100 mb-8 sm:mb-12">
            <div className="flex flex-col gap-4 sm:gap-6">
                {/* Search Input */}
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-primary">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl text-text-main placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base sm:text-lg"
                        placeholder="Buscar platos..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Allergen Filters */}
                <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1">
                    <span className="text-[10px] sm:text-[11px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap shrink-0">
                        Filtros:
                    </span>
                    <div className="flex gap-2">
                        {allergenList.map(alergeno => {
                            const key = alergeno.toLowerCase();
                            const info = ALLERGEN_ICONS[key] || { icon: 'warning', label: alergeno };
                            const isActive = activeFilters.includes(key);
                            
                            return (
                                <button
                                    key={alergeno}
                                    onClick={() => onToggleFilter(key)}
                                    className={`flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-3 sm:px-4 text-[10px] sm:text-xs font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                                        isActive 
                                            ? 'bg-primary text-white border-primary neon-glow' 
                                            : 'bg-white border border-gray-200 text-text-muted hover:bg-primary hover:text-white hover:border-primary'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{info.icon}</span>
                                    <span className="hidden sm:inline">{info.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
