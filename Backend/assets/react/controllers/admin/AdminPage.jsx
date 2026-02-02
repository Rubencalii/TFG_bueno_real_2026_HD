import React, { useState, useEffect } from 'react';

export default function AdminPage({ 
    productos: initialProductos, 
    categorias: initialCategorias, 
    mesas: initialMesas,
    tickets: initialTickets,
    resumenCaja: initialResumen,
    usuarios: initialUsuarios,
    alergenos: initialAlergenos,
    pedidosActivos: initialPedidos,
    notificaciones: initialNotificaciones
}) {
    const [productos, setProductos] = useState(initialProductos || []);
    const [categorias, setCategorias] = useState(initialCategorias || []);
    const [mesas, setMesas] = useState(initialMesas || []);
    const [tickets, setTickets] = useState(initialTickets || []);
    const [resumenCaja, setResumenCaja] = useState(initialResumen || {});
    const [usuarios, setUsuarios] = useState(initialUsuarios || []);
    const [alergenos, setAlergenos] = useState(initialAlergenos || []);
    const [pedidosActivos, setPedidosActivos] = useState(initialPedidos || []);
    const [notificaciones, setNotificaciones] = useState(initialNotificaciones || []);
    const [reportes, setReportes] = useState(null);
    
    const [activeSection, setActiveSection] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Modal states
    const [showProductoModal, setShowProductoModal] = useState(false);
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
    const [showUsuarioModal, setShowUsuarioModal] = useState(false);
    const [showAlergenoModal, setShowAlergenoModal] = useState(false);
    const [showMesaModal, setShowMesaModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const formatCurrency = (value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Polling para notificaciones
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeSection === 'pedidos' || activeSection === 'dashboard') {
                refreshPedidos();
                refreshNotificaciones();
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [activeSection]);

    const refreshPedidos = async () => {
        try {
            const response = await fetch('/admin/api/pedidos/activos');
            const data = await response.json();
            setPedidosActivos(data);
        } catch (error) { console.error('Error:', error); }
    };

    const refreshNotificaciones = async () => {
        try {
            const response = await fetch('/admin/api/notificaciones');
            const data = await response.json();
            setNotificaciones(data);
        } catch (error) { console.error('Error:', error); }
    };

    const refreshResumen = async () => {
        try {
            const response = await fetch('/admin/api/tickets/resumen');
            const data = await response.json();
            setResumenCaja(data.resumen);
            setTickets(data.tickets);
        } catch (error) { console.error('Error:', error); }
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
                showToast(`Ticket ${data.numero} creado`);
                window.location.reload();
            } else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
        finally { setLoading(false); setShowTicketModal(false); }
    };

    const handleCobrarTicket = async (ticketId, metodoPago) => {
        try {
            const response = await fetch(`/admin/api/ticket/${ticketId}/cobrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metodoPago })
            });
            const data = await response.json();
            if (data.success) {
                setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, estado: 'pagado' } : t));
                showToast('Ticket cobrado');
                refreshResumen();
            } else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
    };

    const handleAnularTicket = async (ticketId) => {
        if (!confirm('¿Anular este ticket?')) return;
        try {
            const response = await fetch(`/admin/api/ticket/${ticketId}/anular`, { method: 'POST' });
            const data = await response.json();
            if (data.success) { showToast('Ticket anulado'); window.location.reload(); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
    };

    const handleVerTicket = async (ticketId) => {
        try {
            const response = await fetch(`/admin/api/ticket/${ticketId}`);
            const data = await response.json();
            setSelectedTicket(data);
            setShowTicketDetailModal(true);
        } catch (error) { showToast('Error', 'error'); }
    };

    // ============ PRODUCTOS ============
    const handleSaveProducto = async (formData) => {
        setLoading(true);
        try {
            const url = editingItem ? `/admin/api/producto/${editingItem.id}` : '/admin/api/producto';
            const response = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) { showToast('Guardado'); window.location.reload(); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
        finally { setLoading(false); setShowProductoModal(false); setEditingItem(null); }
    };

    const handleDeleteProducto = async (id) => {
        if (!confirm('¿Eliminar?')) return;
        try {
            const response = await fetch(`/admin/api/producto/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) { setProductos(prev => prev.filter(p => p.id !== id)); showToast('Eliminado'); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
    };

    // ============ CATEGORÍAS ============
    const handleSaveCategoria = async (formData) => {
        setLoading(true);
        try {
            const url = editingItem ? `/admin/api/categoria/${editingItem.id}` : '/admin/api/categoria';
            const response = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) { showToast('Guardado'); window.location.reload(); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
        finally { setLoading(false); setShowCategoriaModal(false); setEditingItem(null); }
    };

    const handleDeleteCategoria = async (id) => {
        if (!confirm('¿Eliminar?')) return;
        try {
            const response = await fetch(`/admin/api/categoria/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) { setCategorias(prev => prev.filter(c => c.id !== id)); showToast('Eliminado'); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
    };

    // ============ USUARIOS ============
    const handleSaveUsuario = async (formData) => {
        setLoading(true);
        try {
            const url = editingItem ? `/admin/api/usuario/${editingItem.id}` : '/admin/api/usuario';
            const response = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) { showToast('Guardado'); window.location.reload(); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
        finally { setLoading(false); setShowUsuarioModal(false); setEditingItem(null); }
    };

    const handleDeleteUsuario = async (id) => {
        if (!confirm('¿Eliminar?')) return;
        try {
            const response = await fetch(`/admin/api/usuario/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) { setUsuarios(prev => prev.filter(u => u.id !== id)); showToast('Eliminado'); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
    };

    // ============ ALÉRGENOS ============
    const handleSaveAlergeno = async (formData) => {
        setLoading(true);
        try {
            const response = await fetch('/admin/api/alergeno', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) { showToast('Guardado'); window.location.reload(); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
        finally { setLoading(false); setShowAlergenoModal(false); }
    };

    const handleDeleteAlergeno = async (id) => {
        if (!confirm('¿Eliminar?')) return;
        try {
            const response = await fetch(`/admin/api/alergeno/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) { setAlergenos(prev => prev.filter(a => a.id !== id)); showToast('Eliminado'); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
    };

    // ============ MESAS ============
    const handleSaveMesa = async (formData) => {
        setLoading(true);
        try {
            const url = editingItem ? `/admin/api/mesa/${editingItem.id}` : '/admin/api/mesa';
            const response = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) { showToast('Guardado'); window.location.reload(); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
        finally { setLoading(false); setShowMesaModal(false); setEditingItem(null); }
    };

    const handleRegenerarQR = async (id) => {
        if (!confirm('¿Regenerar QR?')) return;
        try {
            const response = await fetch(`/admin/api/mesa/${id}/regenerar-qr`, { method: 'POST' });
            const data = await response.json();
            if (data.success) { setMesas(prev => prev.map(m => m.id === id ? { ...m, tokenQr: data.tokenQr } : m)); showToast('QR regenerado'); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
    };

    const handleDeleteMesa = async (id) => {
        if (!confirm('¿Eliminar?')) return;
        try {
            const response = await fetch(`/admin/api/mesa/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) { setMesas(prev => prev.filter(m => m.id !== id)); showToast('Eliminada'); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
    };

    // ============ PEDIDOS ============
    const handleCambiarEstadoPedido = async (id, nuevoEstado) => {
        try {
            const response = await fetch(`/admin/api/pedido/${id}/estado`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            const data = await response.json();
            if (data.success) { setPedidosActivos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p)); showToast('Actualizado'); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
    };

    // ============ NOTIFICACIONES ============
    const handleAtenderMesa = async (mesaId) => {
        try {
            const response = await fetch(`/admin/api/mesa/${mesaId}/atender`, { method: 'POST' });
            const data = await response.json();
            if (data.success) { setNotificaciones(prev => prev.filter(n => n.mesaId !== mesaId || n.tipo !== 'camarero')); showToast('Atendido'); }
        } catch (error) { showToast('Error', 'error'); }
    };

    // ============ REPORTES ============
    const loadReportes = async (periodo = 'semana') => {
        try {
            const response = await fetch(`/admin/api/reportes/ventas?periodo=${periodo}`);
            const data = await response.json();
            setReportes(data);
        } catch (error) { showToast('Error', 'error'); }
    };

    // ============ EXPORTAR ============
    const handleExportar = () => {
        const desde = prompt('Desde (YYYY-MM-DD):', new Date().toISOString().slice(0, 8) + '01');
        const hasta = prompt('Hasta (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
        if (desde && hasta) window.location.href = `/admin/api/exportar/tickets?desde=${desde}&hasta=${hasta}`;
    };

    const filteredProductos = productos.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const stats = {
        ventasHoy: resumenCaja.totalVentas || 0,
        ticketsPendientes: resumenCaja.numTicketsPendientes || 0,
        pedidosActivos: pedidosActivos.length,
        mesasOcupadas: mesas.filter(m => m.ocupada).length,
        totalMesas: mesas.length,
        alertas: notificaciones.length,
    };

    const menuItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Panel' },
        { id: 'facturacion', icon: 'receipt_long', label: 'Facturación' },
        { id: 'pedidos', icon: 'orders', label: 'Pedidos', badge: stats.pedidosActivos },
        { id: 'productos', icon: 'inventory_2', label: 'Productos' },
        { id: 'categorias', icon: 'label', label: 'Categorías' },
        { id: 'mesas', icon: 'table_restaurant', label: 'Mesas / QR' },
        { id: 'usuarios', icon: 'group', label: 'Usuarios' },
        { id: 'alergenos', icon: 'warning', label: 'Alérgenos' },
        { id: 'reportes', icon: 'analytics', label: 'Reportes' },
        { id: 'notificaciones', icon: 'notifications', label: 'Alertas', badge: stats.alertas },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-900">
            {/* Sidebar */}
            <aside className="w-56 bg-slate-800 text-white flex flex-col shrink-0">
                <div className="p-4 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-primary size-8 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">restaurant_menu</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold">Comanda Digital</h1>
                            <p className="text-slate-400 text-xs">Admin</p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveSection(item.id); if (item.id === 'reportes') loadReportes(); }}
                                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg w-full text-left text-sm ${
                                    activeSection === item.id ? 'bg-primary/20 text-primary' : 'text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                                {item.badge > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                            </button>
                        ))}
                    </nav>

                    <div className="pt-4 border-t border-slate-700 space-y-1">
                        <a href="/cocina" className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white text-sm"><span className="material-symbols-outlined text-lg">skillet</span>Cocina</a>
                        <a href="/barra" className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white text-sm"><span className="material-symbols-outlined text-lg">local_bar</span>Barra</a>
                        <button onClick={handleExportar} className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white text-sm w-full"><span className="material-symbols-outlined text-lg">download</span>Exportar</button>
                        <a href="/logout" className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white text-sm"><span className="material-symbols-outlined text-lg">logout</span>Salir</a>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-12 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-4 sticky top-0 z-10">
                    <input type="text" className="bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-3 py-1.5 text-sm w-64" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <div className="flex gap-2">
                        {activeSection === 'productos' && <button onClick={() => { setEditingItem(null); setShowProductoModal(true); }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Producto</button>}
                        {activeSection === 'categorias' && <button onClick={() => { setEditingItem(null); setShowCategoriaModal(true); }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Categoría</button>}
                        {activeSection === 'usuarios' && <button onClick={() => { setEditingItem(null); setShowUsuarioModal(true); }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Usuario</button>}
                        {activeSection === 'alergenos' && <button onClick={() => setShowAlergenoModal(true)} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Alérgeno</button>}
                        {activeSection === 'mesas' && <button onClick={() => { setEditingItem(null); setShowMesaModal(true); }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Mesa</button>}
                    </div>
                </header>

                <div className="flex-1 p-4 space-y-4">
                    {/* DASHBOARD */}
                    {activeSection === 'dashboard' && (
                        <>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Panel de Control</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                <StatCard icon="euro" label="Ventas Hoy" value={formatCurrency(stats.ventasHoy)} color="green" />
                                <StatCard icon="receipt" label="Pendientes" value={stats.ticketsPendientes} color="amber" />
                                <StatCard icon="orders" label="Pedidos" value={stats.pedidosActivos} color="blue" />
                                <StatCard icon="table_restaurant" label="Mesas" value={`${stats.mesasOcupadas}/${stats.totalMesas}`} color="purple" />
                                <StatCard icon="notifications" label="Alertas" value={stats.alertas} color={stats.alertas > 0 ? 'red' : 'green'} />
                            </div>

                            {notificaciones.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                    <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">🔔 Alertas Activas</h3>
                                    <div className="space-y-2">
                                        {notificaciones.slice(0, 5).map((n, i) => (
                                            <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-2 text-sm">
                                                <span>{n.mensaje}</span>
                                                {n.tipo === 'camarero' && <button onClick={() => handleAtenderMesa(n.mesaId)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Atender</button>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <QuickAction onClick={() => setActiveSection('facturacion')} icon="receipt_long" label="Facturación" color="green" />
                                <QuickAction onClick={() => setActiveSection('pedidos')} icon="orders" label="Pedidos" color="blue" />
                                <QuickAction onClick={() => setActiveSection('reportes')} icon="analytics" label="Reportes" color="purple" />
                                <QuickAction onClick={handleExportar} icon="download" label="Exportar" color="amber" />
                            </div>
                        </>
                    )}

                    {/* PEDIDOS */}
                    {activeSection === 'pedidos' && (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pedidos en Tiempo Real</h2>
                                <button onClick={refreshPedidos} className="text-primary text-sm">🔄 Actualizar</button>
                            </div>
                            {pedidosActivos.length === 0 ? (
                                <div className="text-center py-12 text-slate-500"><span className="material-symbols-outlined text-4xl mb-2">check_circle</span><p>No hay pedidos activos</p></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {pedidosActivos.map(p => (
                                        <div key={p.id} className={`bg-white dark:bg-slate-800 rounded-xl p-3 border-l-4 ${p.colorSemaforo === 'verde' ? 'border-green-500' : p.colorSemaforo === 'amarillo' ? 'border-amber-500' : 'border-red-500'}`}>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold">Mesa {p.mesa}</span>
                                                <span className="text-xs text-slate-500">{p.minutosEspera} min</span>
                                            </div>
                                            <ul className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                {p.detalles.map((d, i) => <li key={i}>• {d.cantidad}x {d.producto}</li>)}
                                            </ul>
                                            <div className="flex gap-2">
                                                {p.estado === 'pendiente' && <button onClick={() => handleCambiarEstadoPedido(p.id, 'en_preparacion')} className="flex-1 bg-blue-500 text-white py-1 rounded text-xs">Preparar</button>}
                                                {p.estado === 'en_preparacion' && <button onClick={() => handleCambiarEstadoPedido(p.id, 'listo')} className="flex-1 bg-green-500 text-white py-1 rounded text-xs">Listo</button>}
                                                {p.estado === 'listo' && <button onClick={() => handleCambiarEstadoPedido(p.id, 'entregado')} className="flex-1 bg-slate-500 text-white py-1 rounded text-xs">Entregado</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* FACTURACIÓN */}
                    {activeSection === 'facturacion' && (
                        <>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Facturación</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
                                    <p className="text-xs text-green-600">💵 Efectivo</p>
                                    <p className="text-xl font-bold text-green-700">{formatCurrency(resumenCaja.totalEfectivo)}</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                                    <p className="text-xs text-blue-600">💳 Tarjeta</p>
                                    <p className="text-xl font-bold text-blue-700">{formatCurrency(resumenCaja.totalTarjeta)}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                                    <p className="text-xs text-purple-600">📱 TPV</p>
                                    <p className="text-xl font-bold text-purple-700">{formatCurrency(resumenCaja.totalTPV)}</p>
                                </div>
                                <div className="bg-slate-800 rounded-xl p-3">
                                    <p className="text-xs text-slate-400">Total</p>
                                    <p className="text-xl font-bold text-white">{formatCurrency(resumenCaja.totalVentas)}</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold mb-3">Generar Ticket</h3>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    {mesas.filter(m => m.ocupada).map(m => (
                                        <button key={m.id} onClick={() => { setEditingItem(m); setShowTicketModal(true); }} className="bg-amber-50 border border-amber-200 rounded-lg p-3 hover:bg-amber-100">
                                            <p className="font-bold text-amber-700">Mesa {m.numero}</p>
                                            <p className="text-lg font-bold">{formatCurrency(m.total)}</p>
                                        </button>
                                    ))}
                                    {mesas.filter(m => m.ocupada).length === 0 && <p className="col-span-full text-center text-slate-500 py-4">No hay mesas ocupadas</p>}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700">
                                        <tr>
                                            <th className="text-left px-3 py-2">Ticket</th>
                                            <th className="text-left px-3 py-2">Mesa</th>
                                            <th className="text-left px-3 py-2">Método</th>
                                            <th className="text-left px-3 py-2">Estado</th>
                                            <th className="text-right px-3 py-2">Total</th>
                                            <th className="text-right px-3 py-2">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {tickets.map(t => (
                                            <tr key={t.id}>
                                                <td className="px-3 py-2 font-mono">{t.numero}</td>
                                                <td className="px-3 py-2">Mesa {t.mesa}</td>
                                                <td className="px-3 py-2 capitalize">{t.metodoPago === 'efectivo' ? '💵' : t.metodoPago === 'tarjeta' ? '💳' : '📱'} {t.metodoPago}</td>
                                                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs font-bold ${t.estado === 'pagado' ? 'bg-green-100 text-green-700' : t.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{t.estado}</span></td>
                                                <td className="px-3 py-2 text-right font-bold">{formatCurrency(t.total)}</td>
                                                <td className="px-3 py-2 text-right">
                                                    <button onClick={() => handleVerTicket(t.id)} className="text-slate-400 hover:text-primary p-1"><span className="material-symbols-outlined text-lg">visibility</span></button>
                                                    {t.estado === 'pendiente' && <button onClick={() => handleCobrarTicket(t.id, t.metodoPago)} className="text-green-500 p-1"><span className="material-symbols-outlined text-lg">check_circle</span></button>}
                                                    {t.estado !== 'anulado' && <button onClick={() => handleAnularTicket(t.id)} className="text-red-400 p-1"><span className="material-symbols-outlined text-lg">cancel</span></button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* PRODUCTOS */}
                    {activeSection === 'productos' && (
                        <>
                            <h2 className="text-xl font-bold">Productos ({filteredProductos.length})</h2>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700"><tr><th className="text-left px-3 py-2">Producto</th><th className="text-left px-3 py-2">Categoría</th><th className="text-right px-3 py-2">Precio</th><th className="text-center px-3 py-2">Estado</th><th className="text-right px-3 py-2">Acciones</th></tr></thead>
                                    <tbody className="divide-y">
                                        {filteredProductos.map(p => (
                                            <tr key={p.id}>
                                                <td className="px-3 py-2"><div className="flex items-center gap-2">{p.imagen && <img src={p.imagen} className="w-8 h-8 rounded object-cover" />}<span>{p.nombre}</span></div></td>
                                                <td className="px-3 py-2 text-slate-500">{p.categoriaNombre}</td>
                                                <td className="px-3 py-2 text-right font-mono">{formatCurrency(p.precio)}</td>
                                                <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                                                <td className="px-3 py-2 text-right">
                                                    <button onClick={() => { setEditingItem(p); setShowProductoModal(true); }} className="text-slate-400 hover:text-primary p-1"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                    <button onClick={() => handleDeleteProducto(p.id)} className="text-red-400 p-1"><span className="material-symbols-outlined text-lg">delete</span></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* CATEGORÍAS */}
                    {activeSection === 'categorias' && (
                        <>
                            <h2 className="text-xl font-bold">Categorías ({categorias.length})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {categorias.map(c => (
                                    <div key={c.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border flex justify-between items-center">
                                        <div><h3 className="font-bold">{c.nombre}</h3><p className="text-xs text-slate-500">{c.tipo === 'cocina' ? '🍳 Cocina' : '🍺 Barra'}</p></div>
                                        <div>
                                            <button onClick={() => { setEditingItem(c); setShowCategoriaModal(true); }} className="text-slate-400 hover:text-primary p-1"><span className="material-symbols-outlined">edit</span></button>
                                            <button onClick={() => handleDeleteCategoria(c.id)} className="text-red-400 p-1"><span className="material-symbols-outlined">delete</span></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* MESAS */}
                    {activeSection === 'mesas' && (
                        <>
                            <h2 className="text-xl font-bold">Mesas y QR</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {mesas.map(m => (
                                    <div key={m.id} className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-2 ${m.ocupada ? 'border-amber-400' : m.activa ? 'border-green-400' : 'border-slate-300'}`}>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold">Mesa {m.numero}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${m.ocupada ? 'bg-amber-100 text-amber-700' : m.activa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{m.ocupada ? 'Ocupada' : m.activa ? 'Libre' : 'Inactiva'}</span>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-700 rounded p-2 text-center mb-2">
                                            <code className="text-xs">{m.tokenQr}</code>
                                            <p className="text-xs text-slate-400">/mesa/{m.tokenQr}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleRegenerarQR(m.id)} className="flex-1 bg-blue-100 text-blue-700 py-1.5 rounded text-xs">Regenerar QR</button>
                                            <button onClick={() => { setEditingItem(m); setShowMesaModal(true); }} className="p-1.5 bg-slate-100 rounded"><span className="material-symbols-outlined text-sm">edit</span></button>
                                            <button onClick={() => handleDeleteMesa(m.id)} className="p-1.5 bg-red-100 text-red-600 rounded"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* USUARIOS */}
                    {activeSection === 'usuarios' && (
                        <>
                            <h2 className="text-xl font-bold">Usuarios ({usuarios.length})</h2>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700"><tr><th className="text-left px-3 py-2">Email</th><th className="text-left px-3 py-2">Rol</th><th className="text-right px-3 py-2">Acciones</th></tr></thead>
                                    <tbody className="divide-y">
                                        {usuarios.map(u => (
                                            <tr key={u.id}>
                                                <td className="px-3 py-2">{u.email}</td>
                                                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs uppercase ${u.rol === 'admin' ? 'bg-red-100 text-red-700' : u.rol === 'gerente' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{u.rol || 'camarero'}</span></td>
                                                <td className="px-3 py-2 text-right">
                                                    <button onClick={() => { setEditingItem(u); setShowUsuarioModal(true); }} className="text-slate-400 hover:text-primary p-1"><span className="material-symbols-outlined">edit</span></button>
                                                    <button onClick={() => handleDeleteUsuario(u.id)} className="text-red-400 p-1"><span className="material-symbols-outlined">delete</span></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* ALÉRGENOS */}
                    {activeSection === 'alergenos' && (
                        <>
                            <h2 className="text-xl font-bold">Alérgenos ({alergenos.length})</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {alergenos.map(a => (
                                    <div key={a.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 border flex justify-between items-center">
                                        <span>{a.nombre}</span>
                                        <button onClick={() => handleDeleteAlergeno(a.id)} className="text-red-400 p-1"><span className="material-symbols-outlined">delete</span></button>
                                    </div>
                                ))}
                                {alergenos.length === 0 && <p className="col-span-full text-center text-slate-500 py-8">No hay alérgenos</p>}
                            </div>
                        </>
                    )}

                    {/* REPORTES */}
                    {activeSection === 'reportes' && (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Reportes</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => loadReportes('dia')} className="px-3 py-1 bg-slate-200 rounded text-sm">Hoy</button>
                                    <button onClick={() => loadReportes('semana')} className="px-3 py-1 bg-primary text-white rounded text-sm">Semana</button>
                                    <button onClick={() => loadReportes('mes')} className="px-3 py-1 bg-slate-200 rounded text-sm">Mes</button>
                                </div>
                            </div>
                            {reportes ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                                            <p className="text-slate-500 text-sm">Total del Período</p>
                                            <p className="text-2xl font-bold text-green-600">{formatCurrency(reportes.totalPeriodo)}</p>
                                            <p className="text-xs text-slate-400">{reportes.ticketsPeriodo} tickets</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                                            <p className="text-slate-500 text-sm">Ticket Medio</p>
                                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(reportes.ticketsPeriodo > 0 ? reportes.totalPeriodo / reportes.ticketsPeriodo : 0)}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                                        <h3 className="font-bold mb-3">🏆 Productos Más Vendidos</h3>
                                        <div className="space-y-2">
                                            {reportes.productosTop.slice(0, 5).map((p, i) => (
                                                <div key={i} className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : 'bg-amber-700'}`}>{i + 1}</span><span>{p.nombre}</span></div>
                                                    <div className="text-right"><span className="font-bold">{p.cantidad} uds</span><span className="text-slate-500 text-sm ml-2">{formatCurrency(p.total)}</span></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : <p className="text-center text-slate-500 py-8">Cargando...</p>}
                        </>
                    )}

                    {/* NOTIFICACIONES */}
                    {activeSection === 'notificaciones' && (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Centro de Alertas</h2>
                                <button onClick={refreshNotificaciones} className="text-primary text-sm">🔄 Actualizar</button>
                            </div>
                            {notificaciones.length === 0 ? (
                                <div className="text-center py-12 text-slate-500"><span className="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span><p>Todo en orden</p></div>
                            ) : (
                                <div className="space-y-2">
                                    {notificaciones.map((n, i) => (
                                        <div key={i} className={`bg-white dark:bg-slate-800 rounded-xl p-3 border-l-4 ${n.prioridad === 'alta' ? 'border-red-500' : 'border-amber-500'} flex justify-between items-center`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`material-symbols-outlined ${n.tipo === 'camarero' ? 'text-red-500' : 'text-amber-500'}`}>{n.tipo === 'camarero' ? 'person_alert' : n.tipo === 'cuenta' ? 'receipt' : 'schedule'}</span>
                                                <span>{n.mensaje}</span>
                                            </div>
                                            {n.tipo === 'camarero' && <button onClick={() => handleAtenderMesa(n.mesaId)} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Atender</button>}
                                            {n.tipo === 'cuenta' && <button onClick={() => setActiveSection('facturacion')} className="bg-amber-500 text-white px-3 py-1 rounded text-sm">Facturar</button>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* MODALES */}
            {showProductoModal && <ProductoModal producto={editingItem} categorias={categorias} onSave={handleSaveProducto} onClose={() => { setShowProductoModal(false); setEditingItem(null); }} loading={loading} />}
            {showCategoriaModal && <CategoriaModal categoria={editingItem} onSave={handleSaveCategoria} onClose={() => { setShowCategoriaModal(false); setEditingItem(null); }} loading={loading} />}
            {showTicketModal && editingItem && <TicketModal mesa={editingItem} onSave={handleCrearTicket} onClose={() => { setShowTicketModal(false); setEditingItem(null); }} loading={loading} />}
            {showTicketDetailModal && selectedTicket && <TicketDetailModal ticket={selectedTicket} onClose={() => { setShowTicketDetailModal(false); setSelectedTicket(null); }} />}
            {showUsuarioModal && <UsuarioModal usuario={editingItem} onSave={handleSaveUsuario} onClose={() => { setShowUsuarioModal(false); setEditingItem(null); }} loading={loading} />}
            {showAlergenoModal && <AlergenoModal onSave={handleSaveAlergeno} onClose={() => setShowAlergenoModal(false)} loading={loading} />}
            {showMesaModal && <MesaModal mesa={editingItem} onSave={handleSaveMesa} onClose={() => { setShowMesaModal(false); setEditingItem(null); }} loading={loading} />}

            {toast && <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white text-sm z-50 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.message}</div>}
        </div>
    );
}

// Componentes auxiliares
function StatCard({ icon, label, value, color }) {
    const colors = { blue: 'bg-blue-100 text-blue-600', green: 'bg-green-100 text-green-600', amber: 'bg-amber-100 text-amber-600', purple: 'bg-purple-100 text-purple-600', red: 'bg-red-100 text-red-600' };
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border">
            <div className="flex items-center gap-2">
                <div className={`size-8 rounded-lg flex items-center justify-center ${colors[color]}`}><span className="material-symbols-outlined text-lg">{icon}</span></div>
                <div><p className="text-lg font-bold">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
            </div>
        </div>
    );
}

function QuickAction({ onClick, icon, label, color }) {
    const colors = { amber: 'text-amber-500', blue: 'text-blue-500', green: 'text-green-500', purple: 'text-purple-500' };
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl border hover:bg-slate-50">
            <span className={`material-symbols-outlined text-2xl ${colors[color]}`}>{icon}</span>
            <span className="text-sm">{label}</span>
        </button>
    );
}

function ProductoModal({ producto, categorias, onSave, onClose, loading }) {
    const [formData, setFormData] = useState({ nombre: producto?.nombre || '', descripcion: producto?.descripcion || '', precio: producto?.precio || '', imagen: producto?.imagen || '', categoriaId: producto?.categoriaId || categorias[0]?.id || '', activo: producto?.activo ?? true, destacado: producto?.destacado ?? false });
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md">
                <div className="p-4 border-b"><h3 className="font-bold">{producto ? 'Editar' : 'Nuevo'} Producto</h3></div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-3">
                    <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Nombre" required />
                    <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Descripción" rows="2" />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} className="px-3 py-2 border rounded-lg" placeholder="Precio" required />
                        <select value={formData.categoriaId} onChange={(e) => setFormData({ ...formData, categoriaId: parseInt(e.target.value) })} className="px-3 py-2 border rounded-lg">{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
                    </div>
                    <input type="url" value={formData.imagen} onChange={(e) => setFormData({ ...formData, imagen: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="URL Imagen" />
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({ ...formData, activo: e.target.checked })} />Activo</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.destacado} onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })} />Destacado</label>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-lg">{loading ? '...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CategoriaModal({ categoria, onSave, onClose, loading }) {
    const [formData, setFormData] = useState({ nombre: categoria?.nombre || '', tipo: categoria?.tipo || 'cocina', orden: categoria?.orden || 0 });
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm">
                <div className="p-4 border-b"><h3 className="font-bold">{categoria ? 'Editar' : 'Nueva'} Categoría</h3></div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-3">
                    <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Nombre" required />
                    <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                        <option value="cocina">🍳 Cocina</option>
                        <option value="barra">🍺 Barra</option>
                    </select>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-lg">{loading ? '...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TicketModal({ mesa, onSave, onClose, loading }) {
    const [metodo, setMetodo] = useState('efectivo');
    const formatCurrency = (v) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v || 0);
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm">
                <div className="p-4 border-b"><h3 className="font-bold">🧾 Ticket Mesa {mesa.numero}</h3></div>
                <div className="p-4 space-y-4">
                    <div className="text-center bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(mesa.total)}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {['efectivo', 'tarjeta', 'tpv'].map(m => (
                            <button key={m} onClick={() => setMetodo(m)} className={`p-3 rounded-lg border-2 flex flex-col items-center ${metodo === m ? 'border-primary bg-primary/10' : 'border-slate-200'}`}>
                                <span className="text-xl">{m === 'efectivo' ? '💵' : m === 'tarjeta' ? '💳' : '📱'}</span>
                                <span className="text-xs capitalize">{m}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancelar</button>
                        <button onClick={() => onSave(mesa.id, metodo)} disabled={loading} className="flex-1 py-2 bg-green-600 text-white rounded-lg">{loading ? '...' : 'Generar'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TicketDetailModal({ ticket, onClose }) {
    const formatCurrency = (v) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v || 0);
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between"><div><h3 className="font-bold">Ticket #{ticket.numero}</h3><p className="text-xs text-slate-500">{ticket.createdAt}</p></div><span className={`px-2 py-1 rounded text-xs ${ticket.estado === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{ticket.estado}</span></div>
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm"><div className="bg-slate-100 rounded p-2"><p className="text-xs text-slate-500">Mesa</p><p className="font-bold">Mesa {ticket.mesa}</p></div><div className="bg-slate-100 rounded p-2"><p className="text-xs text-slate-500">Método</p><p className="font-bold capitalize">{ticket.metodoPago}</p></div></div>
                    {ticket.detalles?.length > 0 && <div className="bg-slate-50 rounded-lg p-3">{ticket.detalles.map((d, i) => <div key={i} className="flex justify-between text-sm py-1"><span>{d.cantidad}x {d.producto}</span><span className="font-mono">{formatCurrency(d.precio * d.cantidad)}</span></div>)}</div>}
                    <div className="bg-slate-800 text-white rounded-lg p-3">
                        <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Base</span><span>{formatCurrency(ticket.baseImponible)}</span></div>
                        <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">IVA 10%</span><span>{formatCurrency(ticket.iva)}</span></div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-600"><span>Total</span><span className="text-green-400">{formatCurrency(ticket.total)}</span></div>
                    </div>
                    <button onClick={onClose} className="w-full py-2 bg-slate-200 rounded-lg">Cerrar</button>
                </div>
            </div>
        </div>
    );
}

function UsuarioModal({ usuario, onSave, onClose, loading }) {
    const [formData, setFormData] = useState({ email: usuario?.email || '', rol: usuario?.rol || 'camarero', password: '' });
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm">
                <div className="p-4 border-b"><h3 className="font-bold">{usuario ? 'Editar' : 'Nuevo'} Usuario</h3></div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-3">
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Email" required />
                    <select value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                        <option value="camarero">🧑‍🍳 Camarero</option>
                        <option value="cocinero">👨‍🍳 Cocinero</option>
                        <option value="barman">🍸 Barman</option>
                        <option value="gerente">👔 Gerente</option>
                        <option value="admin">👑 Admin</option>
                    </select>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder={usuario ? 'Nueva contraseña (opcional)' : 'Contraseña'} {...(!usuario && { required: true })} />
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-lg">{loading ? '...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AlergenoModal({ onSave, onClose, loading }) {
    const [nombre, setNombre] = useState('');
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-xs">
                <div className="p-4 border-b"><h3 className="font-bold">Nuevo Alérgeno</h3></div>
                <form onSubmit={(e) => { e.preventDefault(); onSave({ nombre }); }} className="p-4 space-y-3">
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: Gluten, Lactosa..." required />
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-lg">{loading ? '...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MesaModal({ mesa, onSave, onClose, loading }) {
    const [formData, setFormData] = useState({ numero: mesa?.numero || '', activa: mesa?.activa ?? true });
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-xs">
                <div className="p-4 border-b"><h3 className="font-bold">{mesa ? 'Editar' : 'Nueva'} Mesa</h3></div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-3">
                    <input type="number" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" placeholder="Número de mesa" required />
                    <label className="flex items-center gap-2"><input type="checkbox" checked={formData.activa} onChange={(e) => setFormData({ ...formData, activa: e.target.checked })} />Mesa activa</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-lg">{loading ? '...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
