// Traducciones de la interfaz de usuario
const translations = {
    es: {
        // Header
        liveSession: 'LIVE SESSION',
        comandaDigital: 'Comanda Digital',
        
        // Filtros de alérgenos
        sinGluten: 'SIN GLUTEN',
        sinLactosa: 'SIN LACTOSA', 
        sinHuevo: 'SIN HUEVO',
        sinPescado: 'SIN PESCADO',
        sinMarisco: 'SIN MARISCO',
        sinFrutosSecos: 'SIN FRUTOS SECOS',
        sinSoja: 'SIN SOJA',
        
        // Categorías por defecto
        platosPrincipales: 'PLATOS PRINCIPALES',
        combos: 'COMBOS',
        pizzas: 'PIZZAS',
        bocadillos: 'BOCADILLOS Y SÁNDWICHES',
        hamburguesas: 'HAMBURGUESAS',
        bebidas: 'BEBIDAS',
        cocteles: 'CÓCTELES',
        cafes: 'CAFÉS E INFUSIONES',
        
        // Botones y acciones
        añadir: 'AÑADIR',
        quitar: 'QUITAR',
        verPedidos: 'VER PEDIDOS',
        buscarPlatos: 'Buscar platos...',
        
        // Carrito
        tuCarrito: 'Tu carrito',
        total: 'Total',
        confirmarPedido: 'CONFIRMAR PEDIDO',
        carritoVacio: 'Tu carrito está vacío'
    },
    
    fr: {
        // Header  
        liveSession: 'SESSION LIVE',
        comandaDigital: 'Commande Digitale',
        
        // Filtros de alérgenos
        sinGluten: 'SANS GLUTEN',
        sinLactosa: 'SANS LACTOSE',
        sinHuevo: 'SANS ŒUFS',
        sinPescado: 'SANS POISSON',
        sinMarisco: 'SANS FRUITS DE MER',
        sinFrutosSecos: 'SANS NOIX',
        sinSoja: 'SANS SOJA',
        
        // Categorías por defecto
        platosPrincipales: 'PLATS PRINCIPAUX',
        combos: 'COMBOS',
        pizzas: 'PIZZAS',
        bocadillos: 'SANDWICHS',
        hamburguesas: 'HAMBURGERS',
        bebidas: 'BOISSONS',
        cocteles: 'COCKTAILS',
        cafes: 'CAFÉS ET INFUSIONS',
        
        // Botones y acciones
        añadir: 'AJOUTER',
        quitar: 'RETIRER',
        verPedidos: 'VOIR COMMANDES',
        buscarPlatos: 'Rechercher plats...',
        
        // Carrito
        tuCarrito: 'Votre panier',
        total: 'Total',
        confirmarPedido: 'CONFIRMER COMMANDE',
        carritoVacio: 'Votre panier est vide'
    },
    
    en: {
        // Header
        liveSession: 'LIVE SESSION',
        comandaDigital: 'Digital Order',
        
        // Filtros de alérgenos  
        sinGluten: 'GLUTEN FREE',
        sinLactosa: 'LACTOSE FREE',
        sinHuevo: 'EGG FREE',
        sinPescado: 'FISH FREE',
        sinMarisco: 'SEAFOOD FREE',
        sinFrutosSecos: 'NUT FREE',
        sinSoja: 'SOY FREE',
        
        // Categorías por defecto
        platosPrincipales: 'MAIN COURSES',
        combos: 'COMBOS',
        pizzas: 'PIZZAS', 
        bocadillos: 'SANDWICHES',
        hamburguesas: 'BURGERS',
        bebidas: 'DRINKS',
        cocteles: 'COCKTAILS',
        cafes: 'COFFEES & TEAS',
        
        // Botones y acciones
        añadir: 'ADD',
        quitar: 'REMOVE',
        verPedidos: 'VIEW ORDERS',
        buscarPlatos: 'Search dishes...',
        
        // Carrito
        tuCarrito: 'Your cart',
        total: 'Total',
        confirmarPedido: 'CONFIRM ORDER',
        carritoVacio: 'Your cart is empty'
    }
};

// Hook personalizado para traducciones
export function useTranslations(currentLang = 'es') {
    const t = (key) => {
        return translations[currentLang]?.[key] || translations['es'][key] || key;
    };
    
    return { t };
}

// Función para traducir nombres de alérgenos
export function translateAllergen(allergenName, lang = 'es') {
    const allergenMap = {
        'gluten': 'sinGluten',
        'lactosa': 'sinLactosa', 
        'huevo': 'sinHuevo',
        'pescado': 'sinPescado',
        'marisco': 'sinMarisco',
        'frutos secos': 'sinFrutosSecos',
        'soja': 'sinSoja'
    };
    
    const key = allergenMap[allergenName.toLowerCase()];
    return key ? translations[lang]?.[key] || translations['es'][key] : allergenName;
}

// Función para traducir nombres de categorías por defecto
export function translateCategory(categoryName, lang = 'es') {
    const categoryMap = {
        'Platos Principales': 'platosPrincipales',
        'Combos': 'combos',
        'Pizzas': 'pizzas',
        'Bocadillos y Sándwiches': 'bocadillos',
        'Hamburguesas': 'hamburguesas', 
        'Bebidas': 'bebidas',
        'Cócteles': 'cocteles',
        'Cafés e Infusiones': 'cafes'
    };
    
    const key = categoryMap[categoryName];
    return key ? translations[lang]?.[key] || translations['es'][key] : categoryName;
}

export default translations;