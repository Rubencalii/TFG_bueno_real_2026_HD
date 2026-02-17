import React, { useState, useEffect } from 'react';

export default function MenuHeader({ mesa, activeView, onViewChange, onToast, t, isAuthenticated, isStaff = false }) {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentRequested, setPaymentRequested] = useState(false);
    const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'online', 'processing', 'success'
    const [totalCuenta, setTotalCuenta] = useState(0);
    const [cardData, setCardData] = useState({ numero: '', expiry: '', cvv: '', nombre: '' });
    const [processingPayment, setProcessingPayment] = useState(false);

    // Cargar el total de la cuenta
    useEffect(() => {
        if (showPaymentModal) {
            fetch(`/api/mesa/${mesa.tokenQr}/total`)
                .then(res => res.json())
                .then(data => setTotalCuenta(data.total || 0))
                .catch(() => setTotalCuenta(0));
        }
    }, [showPaymentModal, mesa.tokenQr]);

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

    const handlePaymentRequest = async (metodoPago) => {
        if (metodoPago === 'online') {
            // Mostrar formulario de pago online
            setPaymentStep('online');
            return;
        }
        
        // Efectivo o tarjeta: enviar notificación al camarero
        try {
            const response = await fetch(`/api/mesa/${mesa.tokenQr}/pagar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metodoPago })
            });
            if (response.ok) {
                setShowPaymentModal(false);
                setPaymentRequested(true);
                setPaymentStep('select');
                const metodoLabel = {
                    'efectivo': t('Efectivo - El camarero viene enseguida') || 'Efectivo - El camarero viene enseguida',
                    'tarjeta': t('Tarjeta - El camarero trae el datáfono') || 'Tarjeta - El camarero trae el datáfono',
                }[metodoPago] || metodoPago;
                onToast(metodoLabel);
            }
        } catch (error) {
            console.error('Error requesting payment:', error);
        }
    };

    const handleOnlinePayment = async () => {
        // ... (existing code)
    };

    const handleStaffPayment = async (metodoPago) => {
        setProcessingPayment(true);
        setPaymentStep('processing');
        
        try {
            const response = await fetch(`/admin/api/mesa/${mesa.id}/cobrar-staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metodoPago })
            });
            
            if (response.ok) {
                setPaymentStep('success');
                setTimeout(() => {
                    setShowPaymentModal(false);
                    setPaymentStep('select');
                    onToast(t('Mesa cobrada y cerrada') || 'Mesa cobrada y cerrada');
                    // Recargar para limpiar el estado de la mesa gestionada
                    window.location.reload();
                }, 2000);
            } else {
                const errorData = await response.json();
                onToast(errorData.error || 'Error al procesar el cobro');
                setPaymentStep('select');
            }
        } catch (error) {
            console.error('Error staff payment:', error);
            onToast(t('Error al procesar el pago') || 'Error al procesar el pago');
            setPaymentStep('select');
        } finally {
            setProcessingPayment(false);
        }
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
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
        <>
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
                            {t('Comanda') || 'Comanda'} <span className="font-black text-primary">{t('Digital') || 'Digital'}</span>
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
                            {t('Menú') || 'Menú'}
                        </button>
                        <button 
                            className={`text-[10px] sm:text-xs font-black tracking-wider uppercase pb-1 transition-all ${
                                activeView === 'orders' 
                                ? 'text-gray-900 dark:text-white border-b-2 border-primary' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-primary'
                            }`}
                            onClick={() => onViewChange('orders')}
                        >
                            {t('Mis Pedidos') || 'Mis Pedidos'}
                        </button>
                        
                        {/* Acciones de mesa */}
                        <div className="flex items-center gap-2 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-100 dark:border-slate-700">
                            {isStaff ? (
                                <button 
                                    onClick={() => setShowPaymentModal(true)}
                                    className="size-8 sm:size-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors group relative"
                                    title={t('Cobrar Mesa') || 'Cobrar Mesa'}
                                >
                                    <span className="material-symbols-outlined text-xl">payments</span>
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {t('Cobrar / Cerrar') || 'Cobrar / Cerrar'}
                                    </span>
                                </button>
                            ) : (
                                !isStaff && isAuthenticated && (
                                    <>
                                    <button 
                                        onClick={() => handleMesaAction('llamar', 'Camarero avisado')}
                                        className="size-8 sm:size-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors group relative"
                                        title={t('Llamar camarero') || 'Llamar camarero'}
                                    >
                                        <span className="material-symbols-outlined text-xl">hail</span>
                                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{t('Camarero') || 'Llamar camarero'}</span>
                                    </button>
                                    <button 
                                        onClick={() => setShowPaymentModal(true)}
                                        disabled={paymentRequested}
                                        className={`size-8 sm:size-10 rounded-xl flex items-center justify-center transition-colors group relative ${
                                            paymentRequested 
                                                ? 'bg-emerald-500 text-white cursor-not-allowed' 
                                                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                        }`}
                                        title={t('Pedir cuenta') || 'Pedir cuenta'}
                                    >
                                        <span className="material-symbols-outlined text-xl">{paymentRequested ? 'check_circle' : 'payments'}</span>
                                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            {paymentRequested ? (t('Cuenta solicitada') || 'Cuenta solicitada') : (t('Pedir Cuenta') || 'Pedir cuenta')}
                                        </span>
                                    </button>
                                    </>
                                )
                            )}
                            {/* Dark mode toggle */}
                            <button 
                                onClick={toggleDarkMode}
                                className="size-8 sm:size-10 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-yellow-400 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                title={t('Cambiar tema') || 'Cambiar tema'}
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

            {/* Modal de selección de método de pago */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-center sm:text-left">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-bounce-in mx-auto sm:mx-0">
                        
                        {/* PASO 1: Selección de método */}
                        {paymentStep === 'select' && (
                            <>
                                <div className="text-center mb-6">
                                    <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-400">receipt_long</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('Pedir la cuenta') || 'Pedir la cuenta'}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('¿Cómo deseas pagar?') || '¿Cómo deseas pagar?'}</p>
                                    {totalCuenta > 0 && (
                                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                                            {totalCuenta.toFixed(2)} €
                                        </p>
                                    )}
                                </div>
                                
                                <div className="space-y-3">
                                    <button
                                        onClick={() => isStaff ? handleStaffPayment('efectivo') : handlePaymentRequest('efectivo')}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border-2 border-transparent hover:border-emerald-500 transition-all group"
                                    >
                                        <div className="size-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">payments</span>
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white">{t('Efectivo') || 'Efectivo'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{isStaff ? t('Cobrar en efectivo') : t('El camarero viene a la mesa')}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover:text-emerald-500">chevron_right</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => isStaff ? handleStaffPayment('tarjeta') : handlePaymentRequest('tarjeta')}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border-2 border-transparent hover:border-emerald-500 transition-all group"
                                    >
                                        <div className="size-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">credit_card</span>
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white">{t('Tarjeta (Datáfono)') || 'Tarjeta (Datáfono)'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{isStaff ? t('Cobrar con datáfono') : t('El camarero trae el datáfono')}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover:text-emerald-500">chevron_right</span>
                                    </button>
                                    
                                    {!isStaff && (
                                        <button
                                            onClick={() => handlePaymentRequest('online')}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 hover:from-purple-100 hover:to-indigo-100 border-2 border-transparent hover:border-purple-500 transition-all group"
                                        >
                                            <div className="size-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl text-white">phone_iphone</span>
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white">{t('Pagar ahora') || 'Pagar ahora'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Pago instantáneo con tarjeta') || 'Pago instantáneo con tarjeta'}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-400 group-hover:text-purple-500">chevron_right</span>
                                        </button>
                                    )}
                                </div>
                                
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="w-full mt-4 py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                >
                                    {t('Cancelar') || 'Cancelar'}
                                </button>
                            </>
                        )}

                        {/* PASO 2: Formulario de pago online */}
                        {paymentStep === 'online' && (
                            <>
                                <div className="text-center mb-6">
                                    <div className="size-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-4xl text-white">lock</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('Pago seguro') || 'Pago seguro'}</h3>
                                    <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                                        {totalCuenta.toFixed(2)} €
                                    </p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            {t('Número de tarjeta') || 'Número de tarjeta'}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="19"
                                            value={cardData.numero}
                                            onChange={(e) => setCardData({...cardData, numero: formatCardNumber(e.target.value)})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                {t('Caducidad') || 'Caducidad'}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/AA"
                                                maxLength="5"
                                                value={cardData.expiry}
                                                onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                {t('CVV') || 'CVV'}
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="***"
                                                maxLength="4"
                                                value={cardData.cvv}
                                                onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            {t('Nombre del titular') || 'Nombre del titular'}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="NOMBRE APELLIDOS"
                                            value={cardData.nombre}
                                            onChange={(e) => setCardData({...cardData, nombre: e.target.value.toUpperCase()})}
                                            className="w-full text-center sm:text-left px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleOnlinePayment}
                                    disabled={processingPayment}
                                    className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">lock</span>
                                    {t('Pagar') || 'Pagar'} {totalCuenta.toFixed(2)} €
                                </button>
                                
                                <button
                                    onClick={() => setPaymentStep('select')}
                                    className="w-full mt-3 py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    {t('Volver') || 'Volver'}
                                </button>
                                
                                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-sm">verified_user</span>
                                    {t('Pago seguro cifrado SSL') || 'Pago seguro cifrado SSL'}
                                </p>
                            </>
                        )}

                        {/* PASO 3: Procesando pago */}
                        {paymentStep === 'processing' && (
                            <div className="text-center py-8">
                                <div className="size-20 mx-auto mb-6 relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('Procesando pago...') || 'Procesando pago...'}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{t('No cierres esta ventana') || 'No cierres esta ventana'}</p>
                            </div>
                        )}

                        {/* PASO 4: Pago exitoso */}
                        {paymentStep === 'success' && (
                            <div className="text-center py-8">
                                <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
                                    <span className="material-symbols-outlined text-5xl text-emerald-600 dark:text-emerald-400">check_circle</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('¡Pago completado!') || '¡Pago completado!'}</h3>
                                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                                    {totalCuenta.toFixed(2)} €
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">{t('Gracias por tu visita 🙌') || 'Gracias por tu visita 🙌'}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
