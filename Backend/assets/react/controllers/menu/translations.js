// Hook personalizado para traducciones que utiliza el objeto ui del backend
export function useTranslations(currentLang = 'es', ui = null) {
    const t = (key) => {
        // Si tenemos el objeto ui del backend y tiene la clave, lo usamos
        if (ui && ui[key]) {
            return ui[key];
        }
        
        // Fallback básico si no hay traducción
        return key;
    };
    
    return { t };
}

export default useTranslations;