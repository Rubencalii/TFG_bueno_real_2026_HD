import React, { useState, useEffect } from 'react';
import PedidoCard from './PedidoCard';

export default function CocinaPage({ pedidos: initialPedidos }) {
    const [pedidos, setPedidos] = useState(initialPedidos || []);
    const [loading, setLoading] = useState(false);

    // Estados del pedido para las columnas
    const ESTADOS = {
        PENDIENTE: 'pendiente',
        EN_PREPARACION: 'en_preparacion',
        LISTO: 'listo'
    };

    const [audioEnabled, setAudioEnabled] = useState(localStorage.getItem('cocina_audio') === 'true');

    // Función para refrescar pedidos
    const refreshPedidos = async () => {
        try {
            const response = await fetch('/api/cocina/pedidos');
            if (response.ok) {
                const data = await response.json();
                
                // Detección inteligente de nuevos pedidos
                if (audioEnabled && data.length > 0) {
                    const nuevosIds = data.map(p => p.id);
                    const actualesIds = pedidos.map(p => p.id);
                    const hayNuevos = nuevosIds.some(id => !actualesIds.includes(id));
                    
                    if (hayNuevos) {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.play().catch(e => console.log('Audio blocked'));
                    }
                }
                
                setPedidos(data);
            }
        } catch (error) {
            console.error('Error al refrescar pedidos:', error);
        }
    };

    const toggleAudio = () => {
        const newValue = !audioEnabled;
        setAudioEnabled(newValue);
        localStorage.setItem('cocina_audio', newValue);
        if (newValue) {
            // Test sound to "unlock" audio context
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.1;
            audio.play().catch(e => console.log('Initial unlock blocked'));
        }
    };

    // Auto-refresh cada 10 segundos
    useEffect(() => {
        const interval = setInterval(refreshPedidos, 10000);
        return () => clearInterval(interval);
    }, [pedidos, audioEnabled]);

    // Cambiar estado de un pedido
    const cambiarEstado = async (pedidoId, nuevoEstado) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/pedido/${pedidoId}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (response.ok) {
                // Actualizar estado local
                setPedidos(prev => prev.map(p => 
                    p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
                ));
                
                // Si es "entregado", remover de la lista después de 500ms
                if (nuevoEstado === 'entregado') {
                    setTimeout(() => {
                        setPedidos(prev => prev.filter(p => p.id !== pedidoId));
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            alert('Error al cambiar estado del pedido');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar pedidos por estado
    const pedidosPendientes = pedidos.filter(p => p.estado === ESTADOS.PENDIENTE);
    const pedidosEnPreparacion = pedidos.filter(p => p.estado === ESTADOS.EN_PREPARACION);
    const pedidosListos = pedidos.filter(p => p.estado === ESTADOS.LISTO);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-4 lg:p-6 transition-colors">
            {/* Header */}
            <header className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-gray-800 dark:text-white">
                            🍳 Panel de Cocina
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} activo{pedidos.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a 
                            href="/barra"
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">hail</span>
                            Ir a Camarero
                        </a>
                        <a 
                            href="/logout"
                            className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            Salir
                        </a>
                        <button 
                            onClick={toggleAudio}
                            className={`p-2 rounded-lg font-bold transition-all flex items-center gap-2 ${audioEnabled ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}
                            title={audioEnabled ? 'Sonido activado' : 'Sonido desactivado'}
                        >
                            <span className="material-symbols-outlined">{audioEnabled ? 'notifications_active' : 'notifications_off'}</span>
                        </button>
                        <button 
                            onClick={refreshPedidos}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">refresh</span>
                            Actualizar
                        </button>
                    </div>
                </div>
            </header>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Columna: Pendientes */}
                <div className="bg-gray-200 dark:bg-slate-800 rounded-xl p-4 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="size-3 bg-amber-500 rounded-full animate-pulse"></span>
                        <h2 className="font-bold text-gray-700 dark:text-gray-200">PENDIENTES</h2>
                        <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {pedidosPendientes.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pedidosPendientes.length === 0 ? (
                            <p className="text-gray-400 dark:text-gray-500 text-center py-8">Sin pedidos pendientes</p>
                        ) : (
                            pedidosPendientes.map(pedido => (
                                <PedidoCard 
                                    key={pedido.id} 
                                    pedido={pedido}
                                    onNext={() => cambiarEstado(pedido.id, ESTADOS.EN_PREPARACION)}
                                    nextLabel="Preparar"
                                    nextIcon="skillet"
                                    loading={loading}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Columna: En Preparación */}
                <div className="bg-gray-200 dark:bg-slate-800 rounded-xl p-4 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="size-3 bg-blue-500 rounded-full animate-pulse"></span>
                        <h2 className="font-bold text-gray-700 dark:text-gray-200">EN PREPARACIÓN</h2>
                        <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {pedidosEnPreparacion.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pedidosEnPreparacion.length === 0 ? (
                            <p className="text-gray-400 dark:text-gray-500 text-center py-8">Nada en preparación</p>
                        ) : (
                            pedidosEnPreparacion.map(pedido => (
                                <PedidoCard 
                                    key={pedido.id} 
                                    pedido={pedido}
                                    onNext={() => cambiarEstado(pedido.id, ESTADOS.LISTO)}
                                    nextLabel="Listo"
                                    nextIcon="check_circle"
                                    loading={loading}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Columna: Listos */}
                <div className="bg-gray-200 dark:bg-slate-800 rounded-xl p-4 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="size-3 bg-emerald-500 rounded-full"></span>
                        <h2 className="font-bold text-gray-700 dark:text-gray-200">LISTOS PARA SERVIR</h2>
                        <span className="ml-auto bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {pedidosListos.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pedidosListos.length === 0 ? (
                            <p className="text-gray-400 dark:text-gray-500 text-center py-8">Ningún pedido listo</p>
                        ) : (
                            pedidosListos.map(pedido => (
                                <PedidoCard 
                                    key={pedido.id} 
                                    pedido={pedido}
                                    onNext={() => cambiarEstado(pedido.id, 'entregado')}
                                    nextLabel="Entregado"
                                    nextIcon="check"
                                    isReady={true}
                                    loading={loading}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
