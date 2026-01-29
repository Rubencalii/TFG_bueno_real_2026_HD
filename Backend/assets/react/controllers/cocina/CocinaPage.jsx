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

    // Función para refrescar pedidos
    const refreshPedidos = async () => {
        try {
            const response = await fetch('/api/cocina/pedidos');
            if (response.ok) {
                const data = await response.json();
                setPedidos(data);
            }
        } catch (error) {
            console.error('Error al refrescar pedidos:', error);
        }
    };

    // Auto-refresh cada 10 segundos
    useEffect(() => {
        const interval = setInterval(refreshPedidos, 10000);
        return () => clearInterval(interval);
    }, []);

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
                
                // Si es "listo", remover de la lista después de 2 segundos
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
        <div className="min-h-screen bg-gray-100 p-4 lg:p-6">
            {/* Header */}
            <header className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-gray-800">
                            🍳 Panel de Cocina
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} activo{pedidos.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button 
                        onClick={refreshPedidos}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Actualizar
                    </button>
                </div>
            </header>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Columna: Pendientes */}
                <div className="bg-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="size-3 bg-amber-500 rounded-full animate-pulse"></span>
                        <h2 className="font-bold text-gray-700">PENDIENTES</h2>
                        <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {pedidosPendientes.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pedidosPendientes.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">Sin pedidos pendientes</p>
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
                <div className="bg-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="size-3 bg-blue-500 rounded-full animate-pulse"></span>
                        <h2 className="font-bold text-gray-700">EN PREPARACIÓN</h2>
                        <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {pedidosEnPreparacion.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pedidosEnPreparacion.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">Nada en preparación</p>
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
                <div className="bg-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="size-3 bg-emerald-500 rounded-full"></span>
                        <h2 className="font-bold text-gray-700">LISTOS PARA SERVIR</h2>
                        <span className="ml-auto bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {pedidosListos.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pedidosListos.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">Ningún pedido listo</p>
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
