import React, { useState } from 'react';

export default function AdminPage({ 
    productos: initialProductos, 
    categorias: initialCategorias, 
    mesas: initialMesas,
    tickets: initialTickets,
    resumenCaja: initialResumen
}) {
    const [productos, setProductos] = useState(initialProductos || []);
    const [categorias, setCategorias] = useState(initialCategorias || []);
    const [mesas, setMesas] = useState(initialMesas || []);
    const [tickets, setTickets] = useState(initialTickets || []);
    const [resumenCaja, setResumenCaja] = useState(initialResumen || {});
    const [activeSection, setActiveSection] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Modal states
    const [showProductoModal, setShowProductoModal] = useState(false);
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Formateo de moneda español
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ============ TICKETS ============
    const handleCrearTicket = async (mesaId, metodoPago) => {
        setLoading(true);
        try {
            const response = await fetch('/admin/api/ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mesaId, metodoPago })
            });
            const data = await response.json();
            if (data.success) {
                showToast(`Ticket ${data.numero} creado - Total: ${formatCurrency(data.total)}`);
                window.location.reload();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Error al crear ticket', 'error');
        } finally {
            setLoading(false);
            setShowTicketModal(false);
        }
    };

    const handleCobrarTicket = async (ticketId, metodoPago) => {
        setLoading(true);
        try {
            const response = await fetch(`/admin/api/ticket/${ticketId}/cobrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metodoPago })
            });
            const data = await response.json();
            if (data.success) {
                setTickets(prev => prev.map(t => 
                    t.id === ticketId ? { ...t, estado: 'pagado', paidAt: data.paidAt } : t
                ));
                showToast('Ticket cobrado correctamente');
                // Refresh resumen
                refreshResumen();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Error al cobrar', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAnularTicket = async (ticketId) => {
        if (!confirm('¿Anular este ticket? Se creará un ticket rectificativo.')) return;
        
        try {
            const response = await fetch(`/admin/api/ticket/${ticketId}/anular`, { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                showToast('Ticket anulado');
                window.location.reload();
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Error al anular', 'error');
        }
    };

    const handleVerTicket = async (ticketId) => {
        try {
            const response = await fetch(`/admin/api/ticket/${ticketId}`);
            const data = await response.json();
            setSelectedTicket(data);
            setShowTicketDetailModal(true);
        } catch (error) {
            showToast('Error al cargar ticket', 'error');
        }
    };

    const refreshResumen = async () => {
        try {
            const response = await fetch('/admin/api/tickets/resumen');
            const data = await response.json();
            setResumenCaja(data.resumen);
            setTickets(data.tickets);
        } catch (error) {
            console.error('Error refreshing:', error);
        }
    };

    // ============ PRODUCTOS ============
    const handleSaveProducto = async (formData) => {
        setLoading(true);
        try {
            const url = editingItem 
                ? `/admin/api/producto/${editingItem.id}`
                : '/admin/api/producto';
            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                showToast(editingItem ? 'Producto actualizado' : 'Producto creado');
                // Refresh
                window.location.reload();
            } else {
                showToast(data.error || 'Error', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setLoading(false);
            setShowProductoModal(false);
            setEditingItem(null);
        }
    };

    const handleDeleteProducto = async (id) => {
        if (!confirm('¿Eliminar este producto?')) return;
        
        try {
            const response = await fetch(`/admin/api/producto/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                setProductos(prev => prev.filter(p => p.id !== id));
                showToast('Producto eliminado');
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Error al eliminar', 'error');
        }
    };

    // ============ CATEGORÍAS ============
    const handleSaveCategoria = async (formData) => {
        setLoading(true);
        try {
            const url = editingItem 
                ? `/admin/api/categoria/${editingItem.id}`
                : '/admin/api/categoria';
            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                showToast(editingItem ? 'Categoría actualizada' : 'Categoría creada');
                window.location.reload();
            } else {
                showToast(data.error || 'Error', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setLoading(false);
            setShowCategoriaModal(false);
            setEditingItem(null);
        }
    };

    const handleDeleteCategoria = async (id) => {
        if (!confirm('¿Eliminar esta categoría?')) return;
        
        try {
            const response = await fetch(`/admin/api/categoria/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                setCategorias(prev => prev.filter(c => c.id !== id));
                showToast('Categoría eliminada');
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) {
            showToast('Error al eliminar', 'error');
        }
    };

    // ============ MESAS ============
    const handleToggleMesa = async (id) => {
        try {
            const response = await fetch(`/admin/api/mesa/${id}/toggle`, { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                setMesas(prev => prev.map(m => m.id === id ? { ...m, activa: data.activa } : m));
                showToast(data.mensaje);
            }
        } catch (error) {
            showToast('Error', 'error');
        }
    };

    // Filtrar productos
    const filteredProductos = productos.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoriaNombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const stats = {
        totalProductos: productos.length,
        productosActivos: productos.filter(p => p.activo).length,
        totalCategorias: categorias.length,
        mesasOcupadas: mesas.filter(m => m.ocupada).length,
        totalMesas: mesas.length,
        ventasHoy: resumenCaja.totalVentas || '0.00',
        ticketsPendientes: resumenCaja.numTicketsPendientes || 0,
    };

    const menuItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Panel de Control' },
        { id: 'facturacion', icon: 'receipt_long', label: 'Facturación' },
        { id: 'productos', icon: 'inventory_2', label: 'Productos' },
        { id: 'categorias', icon: 'label', label: 'Categorías' },
        { id: 'mesas', icon: 'table_restaurant', label: 'Mesas' },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col shrink-0 border-r border-slate-700">
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-primary size-10 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">restaurant_menu</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-base font-bold leading-tight">Comanda Digital</h1>
                            <p className="text-slate-400 text-xs font-normal">Administración</p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors ${
                                    activeSection === item.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}

                        <div className="pt-4 border-t border-slate-700 mt-4">
                            <a href="/cocina" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">skillet</span>
                                <span>Ir a Cocina</span>
                            </a>
                            <a href="/barra" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">hail</span>
                                <span>Ir a Barra</span>
                            </a>
                        </div>
                    </nav>

                    <div className="pt-6 border-t border-slate-700">
                        <a href="/logout" className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-300 hover:text-white">
                            <span className="material-symbols-outlined">logout</span>
                            <span>Cerrar Sesión</span>
                        </a>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Header */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                type="text"
                                className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 text-sm text-slate-900 dark:text-white"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {activeSection === 'productos' && (
                            <button
                                onClick={() => { setEditingItem(null); setShowProductoModal(true); }}
                                className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Nuevo Producto
                            </button>
                        )}
                        {activeSection === 'categorias' && (
                            <button
                                onClick={() => { setEditingItem(null); setShowCategoriaModal(true); }}
                                className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Nueva Categoría
                            </button>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
                    
                    {/* DASHBOARD */}
                    {activeSection === 'dashboard' && (
                        <>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Panel de Control</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Resumen general del restaurante</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                <StatCard icon="payments" label="Ventas Hoy" value={formatCurrency(stats.ventasHoy)} color="green" />
                                <StatCard icon="pending" label="Tickets Pendientes" value={stats.ticketsPendientes} color="amber" />
                                <StatCard icon="table_restaurant" label="Mesas Ocupadas" value={`${stats.mesasOcupadas}/${stats.totalMesas}`} color="purple" />
                                <StatCard icon="inventory_2" label="Productos" value={stats.totalProductos} color="blue" />
                                <StatCard icon="label" label="Categorías" value={stats.totalCategorias} color="blue" />
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Accesos Rápidos</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <QuickAction onClick={() => setActiveSection('facturacion')} icon="receipt_long" label="Facturación" color="green" />
                                    <QuickAction href="/cocina" icon="skillet" label="Cocina" color="orange" />
                                    <QuickAction href="/barra" icon="hail" label="Camarero" color="amber" />
                                    <QuickAction onClick={() => setActiveSection('productos')} icon="inventory_2" label="Productos" color="blue" />
                                    <QuickAction onClick={() => setActiveSection('mesas')} icon="table_restaurant" label="Mesas" color="purple" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* PRODUCTOS */}
                    {activeSection === 'productos' && (
                        <>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Productos</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Administra el menú digital de tu restaurante.</p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoría</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {filteredProductos.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                                                        No hay productos registrados.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredProductos.map(producto => (
                                                    <tr key={producto.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {producto.imagen && (
                                                                    <img src={producto.imagen} alt="" className="size-10 rounded-lg object-cover" />
                                                                )}
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 dark:text-white">{producto.nombre}</p>
                                                                    {producto.destacado && (
                                                                        <span className="text-xs text-amber-600">⭐ Destacado</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{producto.categoriaNombre}</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{producto.precio}€</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                                producto.activo 
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                                            }`}>
                                                                {producto.activo ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => { setEditingItem(producto); setShowProductoModal(true); }}
                                                                className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProducto(producto.id)}
                                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* CATEGORÍAS */}
                    {activeSection === 'categorias' && (
                        <>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Categorías</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Organiza los productos del menú.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categorias.map(categoria => (
                                    <div key={categoria.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{categoria.nombre}</h4>
                                                <span className={`text-xs px-2 py-0.5 rounded ${
                                                    categoria.tipo === 'cocina' 
                                                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                    {categoria.tipo === 'cocina' ? '🍳 Cocina' : '🍺 Barra'}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => { setEditingItem(categoria); setShowCategoriaModal(true); }}
                                                    className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategoria(categoria.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Orden: {categoria.orden}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                categoria.activa 
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {categoria.activa ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* MESAS */}
                    {activeSection === 'mesas' && (
                        <>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Estado de Mesas</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Visualiza y gestiona las mesas del restaurante.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {mesas.map(mesa => (
                                    <div 
                                        key={mesa.id} 
                                        className={`bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 shadow-sm border border-slate-200 dark:border-slate-700 ${
                                            mesa.ocupada ? 'border-l-green-500' : 'border-l-slate-300 dark:border-l-slate-600'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    Mesa {String(mesa.numero).padStart(2, '0')}
                                                </h4>
                                                <p className="text-slate-400 text-xs">Token: {mesa.tokenQr}</p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                mesa.ocupada
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                            }`}>
                                                {mesa.ocupada ? 'Ocupada' : 'Libre'}
                                            </span>
                                        </div>

                                        {(mesa.llamaCamarero || mesa.pideCuenta) && (
                                            <div className="flex gap-2 mb-3">
                                                {mesa.llamaCamarero && (
                                                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-medium">
                                                        🔔 Camarero
                                                    </span>
                                                )}
                                                {mesa.pideCuenta && (
                                                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-medium">
                                                        💳 Cuenta
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <a 
                                                href={`/mesa/${mesa.tokenQr}`}
                                                target="_blank"
                                                className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg text-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Ver Menú
                                            </a>
                                            <button
                                                onClick={() => handleToggleMesa(mesa.id)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                                    mesa.activa
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                                }`}
                                            >
                                                {mesa.activa ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* FACTURACIÓN */}
                    {activeSection === 'facturacion' && (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">📑 Gestión de Ventas y Facturación</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">Resumen del turno: {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="size-3 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">CAJA ABIERTA</span>
                                </div>
                            </div>

                            {/* Resumen de Caja */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">💶</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Efectivo</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(resumenCaja.totalEfectivo)}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">💳</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tarjeta</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(resumenCaja.totalTarjeta)}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">📟</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">TPV Barra</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(resumenCaja.totalTPV)}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">💰</span>
                                        <span className="text-green-100 text-sm font-medium">Total Ventas</span>
                                    </div>
                                    <p className="text-2xl font-black">{formatCurrency(resumenCaja.totalVentas)}</p>
                                    <p className="text-green-200 text-xs mt-1">IVA: {formatCurrency(resumenCaja.totalIVA)}</p>
                                </div>
                            </div>

                            {/* Crear Ticket desde Mesa */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Generar Ticket</h3>
                                <div className="flex flex-wrap gap-3">
                                    {mesas.filter(m => m.ocupada).map(mesa => (
                                        <button
                                            key={mesa.id}
                                            onClick={() => { setEditingItem(mesa); setShowTicketModal(true); }}
                                            className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold text-sm hover:bg-primary/20 transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">table_restaurant</span>
                                            Mesa {String(mesa.numero).padStart(2, '0')}
                                            {mesa.pideCuenta && <span className="bg-amber-500 text-white text-[10px] px-1.5 rounded">CUENTA</span>}
                                        </button>
                                    ))}
                                    {mesas.filter(m => m.ocupada).length === 0 && (
                                        <p className="text-slate-400 italic">No hay mesas ocupadas</p>
                                    )}
                                </div>
                            </div>

                            {/* Tabla de Tickets */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                    <h3 className="font-bold text-slate-900 dark:text-white">📊 Histórico de Tickets - Hoy</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Factura</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Mesa</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Método</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Base Imp.</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">IVA (10%)</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {tickets.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400 italic">
                                                        No hay tickets registrados hoy.
                                                    </td>
                                                </tr>
                                            ) : (
                                                tickets.map(ticket => (
                                                    <tr key={ticket.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 ${ticket.estado === 'anulado' ? 'opacity-50' : ''}`}>
                                                        <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                                                            {ticket.numero}
                                                            {ticket.ticketRectificadoId && (
                                                                <span className="ml-2 text-xs text-red-500">(Rectif.)</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 font-bold">{String(ticket.mesa).padStart(2, '0')}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="flex items-center gap-1">
                                                                {ticket.metodoPago === 'efectivo' && '💶'}
                                                                {ticket.metodoPago === 'tarjeta' && '💳'}
                                                                {ticket.metodoPago === 'tpv' && '📟'}
                                                                <span className="capitalize">{ticket.metodoPago}</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                                ticket.estado === 'pagado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                ticket.estado === 'pendiente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                                {ticket.estado}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(ticket.baseImponible)}</td>
                                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(ticket.iva)}</td>
                                                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(ticket.total)}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <button
                                                                    onClick={() => handleVerTicket(ticket.id)}
                                                                    className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                                                                    title="Ver detalle"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                                </button>
                                                                {ticket.estado === 'pendiente' && (
                                                                    <button
                                                                        onClick={() => handleCobrarTicket(ticket.id, ticket.metodoPago)}
                                                                        className="p-1.5 text-green-500 hover:text-green-600 transition-colors"
                                                                        title="Cobrar"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                                                    </button>
                                                                )}
                                                                {ticket.estado !== 'anulado' && (
                                                                    <button
                                                                        onClick={() => handleAnularTicket(ticket.id)}
                                                                        className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                                                                        title="Anular"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">cancel</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Cierre de Caja */}
                            <div className="bg-slate-800 dark:bg-slate-950 rounded-xl p-6 text-white">
                                <h3 className="text-lg font-bold mb-4">💰 Cierre de Caja Estimado</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-slate-400 text-sm">Base Imponible</p>
                                        <p className="text-xl font-bold">{formatCurrency(resumenCaja.totalBase)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">IVA Acumulado (10%)</p>
                                        <p className="text-xl font-bold">{formatCurrency(resumenCaja.totalIVA)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Tickets Pagados</p>
                                        <p className="text-xl font-bold">{resumenCaja.numTicketsPagados || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-400 text-sm font-bold">TOTAL NETO</p>
                                        <p className="text-3xl font-black text-green-400">{formatCurrency(resumenCaja.totalVentas)}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Modal Producto */}
            {showProductoModal && (
                <ProductoModal
                    producto={editingItem}
                    categorias={categorias}
                    onSave={handleSaveProducto}
                    onClose={() => { setShowProductoModal(false); setEditingItem(null); }}
                    loading={loading}
                />
            )}

            {/* Modal Categoría */}
            {showCategoriaModal && (
                <CategoriaModal
                    categoria={editingItem}
                    onSave={handleSaveCategoria}
                    onClose={() => { setShowCategoriaModal(false); setEditingItem(null); }}
                    loading={loading}
                />
            )}

            {/* Modal Ticket */}
            {showTicketModal && editingItem && (
                <TicketModal
                    mesa={editingItem}
                    onSave={handleCrearTicket}
                    onClose={() => { setShowTicketModal(false); setEditingItem(null); }}
                    loading={loading}
                />
            )}

            {/* Modal Detalle Ticket */}
            {showTicketDetailModal && selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => { setShowTicketDetailModal(false); setSelectedTicket(null); }}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-white font-medium z-50 ${
                    toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

// ============ COMPONENTES AUXILIARES ============

function StatCard({ icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`size-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                </div>
            </div>
        </div>
    );
}

function QuickAction({ href, onClick, icon, label, color }) {
    const colors = {
        orange: 'text-orange-500',
        amber: 'text-amber-500',
        blue: 'text-blue-500',
        green: 'text-green-500',
    };

    const Component = href ? 'a' : 'button';
    const props = href ? { href } : { onClick };

    return (
        <Component 
            {...props}
            className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
            <span className={`material-symbols-outlined text-3xl ${colors[color]}`}>{icon}</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        </Component>
    );
}

function ProductoModal({ producto, categorias, onSave, onClose, loading }) {
    const [formData, setFormData] = useState({
        nombre: producto?.nombre || '',
        descripcion: producto?.descripcion || '',
        precio: producto?.precio || '',
        imagen: producto?.imagen || '',
        categoriaId: producto?.categoriaId || categorias[0]?.id || '',
        activo: producto?.activo ?? true,
        destacado: producto?.destacado ?? false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {producto ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            rows="3"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.precio}
                                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                            <select
                                value={formData.categoriaId}
                                onChange={(e) => setFormData({ ...formData, categoriaId: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL Imagen</label>
                        <input
                            type="url"
                            value={formData.imagen}
                            onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.activo}
                                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Activo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.destacado}
                                onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Destacado</span>
                        </label>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CategoriaModal({ categoria, onSave, onClose, loading }) {
    const [formData, setFormData] = useState({
        nombre: categoria?.nombre || '',
        tipo: categoria?.tipo || 'cocina',
        orden: categoria?.orden || 0,
        activa: categoria?.activa ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                            <select
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                                <option value="cocina">🍳 Cocina</option>
                                <option value="barra">🍺 Barra</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Orden</label>
                            <input
                                type="number"
                                value={formData.orden}
                                onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.activa}
                            onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                            className="rounded border-slate-300"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Activa</span>
                    </label>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TicketModal({ mesa, onSave, onClose, loading }) {
    const [metodoPago, setMetodoPago] = useState('efectivo');

    const handleSubmit = () => {
        onSave(mesa.id, metodoPago);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        🧾 Generar Ticket - Mesa {mesa.numero}
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    {/* Resumen de la cuenta */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Resumen de la cuenta</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Base Imponible</span>
                                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                                    {formatCurrency(mesa.total / 1.10)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">IVA (10%)</span>
                                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                                    {formatCurrency(mesa.total - (mesa.total / 1.10))}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
                                <span className="font-bold text-slate-900 dark:text-white">TOTAL</span>
                                <span className="font-mono font-bold text-lg text-primary">
                                    {formatCurrency(mesa.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div>
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Método de pago</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setMetodoPago('efectivo')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    metodoPago === 'efectivo'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <span className="text-3xl">💵</span>
                                <span className={`text-sm font-medium ${
                                    metodoPago === 'efectivo' ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'
                                }`}>Efectivo</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMetodoPago('tarjeta')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    metodoPago === 'tarjeta'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <span className="text-3xl">💳</span>
                                <span className={`text-sm font-medium ${
                                    metodoPago === 'tarjeta' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                                }`}>Tarjeta</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMetodoPago('tpv')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    metodoPago === 'tpv'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <span className="text-3xl">📱</span>
                                <span className={`text-sm font-medium ${
                                    metodoPago === 'tpv' ? 'text-purple-700 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'
                                }`}>TPV</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-slate-300 dark:border-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Procesando...' : (
                                <>
                                    <span className="material-symbols-outlined">receipt_long</span>
                                    Generar Ticket
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TicketDetailModal({ ticket, onClose }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMetodoPagoIcon = (metodo) => {
        switch (metodo) {
            case 'efectivo': return '💵';
            case 'tarjeta': return '💳';
            case 'tpv': return '📱';
            default: return '💰';
        }
    };

    const getEstadoStyles = (estado) => {
        switch (estado) {
            case 'pagado':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'pendiente':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'anulado':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            🧾 Ticket #{ticket.numero}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatDateTime(ticket.fechaCreacion)}
                        </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${getEstadoStyles(ticket.estado)}`}>
                        {ticket.estado}
                    </span>
                </div>

                <div className="p-6 space-y-6">
                    {/* Info general */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Mesa</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                Mesa {ticket.mesa}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Método de pago</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {getMetodoPagoIcon(ticket.metodoPago)} {ticket.metodoPago}
                            </p>
                        </div>
                    </div>

                    {/* Productos */}
                    {ticket.detalles && ticket.detalles.length > 0 && (
                        <div>
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Productos</h4>
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-700">
                                        <tr>
                                            <th className="text-left px-4 py-2 text-slate-600 dark:text-slate-300">Producto</th>
                                            <th className="text-center px-4 py-2 text-slate-600 dark:text-slate-300">Cant.</th>
                                            <th className="text-right px-4 py-2 text-slate-600 dark:text-slate-300">Precio</th>
                                            <th className="text-right px-4 py-2 text-slate-600 dark:text-slate-300">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ticket.detalles.map((detalle, idx) => (
                                            <tr key={idx} className="border-t border-slate-200 dark:border-slate-600">
                                                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{detalle.producto}</td>
                                                <td className="px-4 py-2 text-center text-slate-600 dark:text-slate-400">{detalle.cantidad}</td>
                                                <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-400">{formatCurrency(detalle.precio)}</td>
                                                <td className="px-4 py-2 text-right font-mono font-medium text-slate-700 dark:text-slate-300">{formatCurrency(detalle.cantidad * detalle.precio)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Desglose fiscal */}
                    <div className="bg-slate-800 dark:bg-slate-950 rounded-xl p-4 text-white">
                        <h4 className="font-bold mb-4">Desglose Fiscal</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-slate-300">
                                <span>Base Imponible</span>
                                <span className="font-mono">{formatCurrency(ticket.baseImponible)}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>IVA (10%)</span>
                                <span className="font-mono">{formatCurrency(ticket.iva)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-600 text-lg">
                                <span className="font-bold">TOTAL</span>
                                <span className="font-mono font-bold text-green-400">{formatCurrency(ticket.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botón cerrar */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
