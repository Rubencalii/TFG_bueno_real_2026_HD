import React, { useState } from 'react';

export default function LanguageSelector({ idiomas, idiomaActual, onLanguageChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleLanguageSelect = (idioma) => {
        setIsOpen(false);
        if (idioma.codigo !== idiomaActual.codigo) {
            onLanguageChange(idioma);
        }
    };

    return (
        <div className="relative">
            {/* Botón selector de idioma */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                type="button"
            >
                <span className="text-lg" role="img" aria-label={idiomaActual.nombre}>
                    {idiomaActual.bandera}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {idiomaActual.codigo.toUpperCase()}
                </span>
                <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Overlay para cerrar */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    ></div>
                    
                    {/* Menú desplegable */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="py-2">
                            {idiomas.map((idioma) => (
                                <button
                                    key={idioma.codigo}
                                    onClick={() => handleLanguageSelect(idioma)}
                                    className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                        idioma.codigo === idiomaActual.codigo 
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <span className="text-lg" role="img" aria-label={idioma.nombre}>
                                        {idioma.bandera}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">
                                            {idioma.nombre}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {idioma.codigo.toUpperCase()}
                                        </div>
                                    </div>
                                    {idioma.codigo === idiomaActual.codigo && (
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        {/* Línea divisoria */}
                        <div className="border-t border-gray-200 dark:border-gray-700 mx-2"></div>
                        
                        {/* Información adicional */}
                        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                            🌐 Idioma seleccionado
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}