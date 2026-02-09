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
    notificaciones: initialNotificaciones,
    reservasHoy: initialReservasHoy,
    reservasProximas: initialReservasProximas
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
    const [reservas, setReservas] = useState(initialReservasProximas || []);
    const [reportes, setReportes] = useState(null);
    
    const [activeSection, setActiveSection] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Modal states
    const [showProductoModal, setShowProductoModal] = useState(false);
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
    const [showUsuarioModal, setShowUsuarioModal] = useState(false);
    const [showAlergenoModal, setShowAlergenoModal] = useState(false);
    const [showMesaModal, setShowMesaModal] = useState(false);
    const [showReservaModal, setShowReservaModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const formatCurrency = (value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Sistema de sonidos de alerta
    const playAlertSound = (type = 'notification') => {
        if (!soundEnabled) return;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'urgent') {
                // Sonido urgente: 3 beeps rápidos agudos
                oscillator.frequency.value = 880;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                oscillator.start(audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.stop(audioContext.currentTime + 0.1);
                
                // Segundo beep
                setTimeout(() => {
                    const osc2 = audioContext.createOscillator();
                    const gain2 = audioContext.createGain();
                    osc2.connect(gain2); gain2.connect(audioContext.destination);
                    osc2.frequency.value = 880; osc2.type = 'sine';
                    gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                    osc2.start(); gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    osc2.stop(audioContext.currentTime + 0.1);
                }, 150);
                
                // Tercer beep
                setTimeout(() => {
                    const osc3 = audioContext.createOscillator();
                    const gain3 = audioContext.createGain();
                    osc3.connect(gain3); gain3.connect(audioContext.destination);
                    osc3.frequency.value = 1100; osc3.type = 'sine';
                    gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
                    osc3.start(); gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    osc3.stop(audioContext.currentTime + 0.15);
                }, 300);
            } else {
                // Sonido de notificación: ding suave
                oscillator.frequency.value = 587.33; // D5
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                oscillator.start(audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.stop(audioContext.currentTime + 0.3);
            }
        } catch (e) {
            console.log('Audio no soportado:', e);
        }
    };

    // Auto-refresh global cada 5 segundos
    useEffect(() => {
        if (!autoRefresh) return;
        
        // Hacer refresh inicial
        refreshAll();
        
        const interval = setInterval(() => {
            refreshAll();
        }, 5000);
        
        return () => clearInterval(interval);
    }, [autoRefresh]);

    // Refresh completo de todos los datos
    const refreshAll = async () => {
        try {
            // Hacer las llamadas por separado para manejar errores individuales
            const pedidosRes = await fetch('/admin/api/pedidos/activos');
            if (pedidosRes.ok) {
                const pedidosData = await pedidosRes.json();
                
                // Detectar nuevos pedidos
                if (pedidosData.length > pedidosActivos.length) {
                    playAlertSound('notification');
                }
                setPedidosActivos(pedidosData);
            }

            const notifRes = await fetch('/admin/api/notificaciones');
            if (notifRes.ok) {
                const notifData = await notifRes.json();
                
                // Detectar nuevas alertas urgentes
                if (notifData.length > notificaciones.length) {
                    const hasUrgent = notifData.some(n => n.tipo === 'camarero' || n.tipo === 'cuenta');
                    playAlertSound(hasUrgent ? 'urgent' : 'notification');
                    showToast(`🔔 Nueva alerta`, 'warning');
                }
                setNotificaciones(notifData);
            }

            const resumenRes = await fetch('/admin/api/tickets/resumen');
            if (resumenRes.ok) {
                const resumenData = await resumenRes.json();
                if (resumenData.resumen) setResumenCaja(resumenData.resumen);
                if (resumenData.tickets) setTickets(resumenData.tickets);
            }

            const mesasRes = await fetch('/admin/api/mesas');
            if (mesasRes.ok) {
                const mesasData = await mesasRes.json();
                setMesas(mesasData);
            }
            
            setLastUpdate(new Date());
        } catch (error) { 
            console.error('Error en auto-refresh:', error); 
        }
    };

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
            } else showToast(data.error, 'error');
        } catch (error) { showToast('Error al crear ticket', 'error'); }
        finally { setLoading(false); setShowTicketModal(false); setEditingItem(null); refreshAll(); }
    };

    // Confirmar pago online (solo gerente)
    const handleConfirmarPagoOnline = async (mesaId) => {
        if (!confirm('¿Confirmar recepción del pago online y cerrar mesa?')) return;
        setLoading(true);
        try {
            const response = await fetch(`/admin/api/mesa/${mesaId}/confirmar-pago-online`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                playSound('normal');
                showToast(`✅ Pago online confirmado - Ticket ${data.numero} generado`);
                refreshAll();
            } else showToast(data.error, 'error');
        } catch (error) { showToast('Error al confirmar pago', 'error'); }
        finally { setLoading(false); }
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
                showToast('✅ Ticket cobrado correctamente');
                refreshAll();
            } else showToast(data.error, 'error');
        } catch (error) { showToast('Error al cobrar', 'error'); }
    };

    const handleAnularTicket = async (ticketId) => {
        if (!confirm('¿Anular este ticket?')) return;
        try {
            const response = await fetch(`/admin/api/ticket/${ticketId}/anular`, { method: 'POST' });
            const data = await response.json();
            if (data.success) { showToast('Ticket anulado'); refreshAll(); }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error', 'error'); }
    };

    const handleEliminarTicket = async (ticketId) => {
        if (!confirm('¿Eliminar definitivamente este ticket de ejemplo?')) return;
        try {
            const response = await fetch(`/admin/api/ticket/${ticketId}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) { 
                showToast('Ticket eliminado'); 
                setTickets(prev => prev.filter(t => t.id !== ticketId));
                refreshAll(); 
            }
            else showToast(data.error, 'error');
        } catch (error) { showToast('Error al eliminar', 'error'); }
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

    // Descargar QR como imagen PNG
    const handleDescargarQR = async (mesa) => {
        const baseUrl = window.location.origin;
        const mesaUrl = `${baseUrl}/mesa/${mesa.tokenQr}`;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(mesaUrl)}`;
        
        try {
            showToast('Generando QR...');
            const response = await fetch(qrApiUrl);
            const blob = await response.blob();
            
            // Crear un canvas para añadir texto
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 450;
                canvas.height = 520;
                const ctx = canvas.getContext('2d');
                
                // Fondo blanco
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Dibujar QR centrado
                ctx.drawImage(img, 25, 25, 400, 400);
                
                // Añadir texto "Mesa X"
                ctx.fillStyle = '#1e293b';
                ctx.font = 'bold 36px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Mesa ${mesa.numero}`, canvas.width / 2, 475);
                
                // Añadir URL pequeña
                ctx.font = '14px Arial';
                ctx.fillStyle = '#64748b';
                ctx.fillText(mesaUrl, canvas.width / 2, 505);
                
                // Descargar
                const link = document.createElement('a');
                link.download = `QR_Mesa_${mesa.numero}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showToast(`✅ QR Mesa ${mesa.numero} descargado`);
            };
            img.src = URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error descargando QR:', error);
            showToast('Error al generar QR', 'error');
        }
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

    // ============ RESERVAS ============
    const refreshReservas = async () => {
        try {
            const response = await fetch('/admin/api/reservas?filtro=proximas');
            const data = await response.json();
            setReservas(data);
        } catch (error) { console.error('Error:', error); }
    };

    const handleSaveReserva = async (formData) => {
        setLoading(true);
        try {
            const url = editingItem ? `/admin/api/reserva/${editingItem.id}` : '/admin/api/reserva';
            const response = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) { 
                showToast(editingItem ? 'Reserva actualizada' : 'Reserva creada'); 
                refreshReservas();
                setShowReservaModal(false);
                setEditingItem(null);
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) { showToast('Error', 'error'); }
        finally { setLoading(false); }
    };

    const handleCambiarEstadoReserva = async (id, nuevoEstado) => {
        try {
            const response = await fetch(`/admin/api/reserva/${id}/estado`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            const data = await response.json();
            if (data.success) { 
                setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
                showToast('Estado actualizado'); 
            } else {
                showToast(data.error, 'error');
            }
        } catch (error) { showToast('Error', 'error'); }
    };

    const handleDeleteReserva = async (id) => {
        if (!confirm('¿Eliminar esta reserva?')) return;
        try {
            const response = await fetch(`/admin/api/reserva/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) { 
                setReservas(prev => prev.filter(r => r.id !== id)); 
                showToast('Reserva eliminada'); 
            } else {
                showToast(data.error, 'error');
            }
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
        { id: 'reservas', icon: 'calendar_month', label: 'Reservas', badge: reservas.filter(r => r.estado === 'pendiente').length },
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
                    <div className="flex items-center gap-3">
                        <input type="text" className="bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-3 py-1.5 text-sm w-64" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        
                        {/* Indicador de auto-refresh */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setAutoRefresh(!autoRefresh)} 
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${autoRefresh ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'}`}
                                title={autoRefresh ? 'Auto-refresh activo (cada 5s)' : 'Auto-refresh pausado'}
                            >
                                <span className={`material-symbols-outlined text-sm ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }}>sync</span>
                                {autoRefresh ? 'LIVE' : 'Pausado'}
                            </button>
                            <button 
                                onClick={() => setSoundEnabled(!soundEnabled)} 
                                className={`p-1.5 rounded-lg transition-all ${soundEnabled ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}
                                title={soundEnabled ? 'Sonidos activados - Click para silenciar' : 'Sonidos desactivados - Click para activar'}
                            >
                                <span className="material-symbols-outlined text-sm">{soundEnabled ? 'volume_up' : 'volume_off'}</span>
                            </button>
                            <button onClick={refreshAll} className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600" title="Actualizar ahora">
                                <span className="material-symbols-outlined text-sm text-slate-500">refresh</span>
                            </button>
                            <span className="text-xs text-slate-400 hidden md:block">Últ: {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {activeSection === 'productos' && <button onClick={() => { setEditingItem(null); setShowProductoModal(true); }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Producto</button>}
                        {activeSection === 'categorias' && <button onClick={() => { setEditingItem(null); setShowCategoriaModal(true); }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Categoría</button>}
                        {activeSection === 'usuarios' && <button onClick={() => { setEditingItem(null); setShowUsuarioModal(true); }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Usuario</button>}
                        {activeSection === 'alergenos' && <button onClick={() => setShowAlergenoModal(true)} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Alérgeno</button>}
                        {activeSection === 'mesas' && <button onClick={() => { setEditingItem(null); setShowMesaModal(true); }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Mesa</button>}
                        {activeSection === 'reservas' && <button onClick={() => { setEditingItem(null); setShowReservaModal(true); }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Reserva</button>}
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
                                                <div className="flex gap-2">
                                                    {n.tipo === 'camarero' && <button onClick={() => handleAtenderMesa(n.mesaId)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Atender</button>}
                                                    {n.tipo === 'cuenta' && (
                                                        <button onClick={() => { 
                                                            const mesa = mesas.find(m => m.id === n.mesaId);
                                                            if (mesa) { setEditingItem(mesa); setShowTicketModal(true); }
                                                        }} className="bg-primary text-white px-2 py-1 rounded text-xs">💳 Cobrar</button>
                                                    )}
                                                </div>
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

                            {/* PAGOS ONLINE PENDIENTES DE CONFIRMACIÓN - Solo Gerente */}
                            {mesas.filter(m => m.pagoOnlinePendiente && m.total > 0).length > 0 && (
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-4 border-2 border-purple-400 dark:border-purple-600 animate-pulse">
                                    <h3 className="font-bold mb-3 text-purple-700 dark:text-purple-400 flex items-center gap-2">
                                        <span className="material-symbols-outlined">phone_iphone</span>
                                        💳 PAGOS ONLINE RECIBIDOS - Confirmar para cerrar
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {mesas.filter(m => m.pagoOnlinePendiente && m.total > 0).map(m => (
                                            <button 
                                                key={m.id} 
                                                onClick={() => handleConfirmarPagoOnline(m.id)} 
                                                className="bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-purple-400 rounded-lg p-3 hover:from-purple-200 hover:to-indigo-200 relative"
                                            >
                                                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">PAGO RECIBIDO</span>
                                                <p className="font-bold text-purple-700">Mesa {m.numero}</p>
                                                <p className="text-xl font-bold text-purple-800">{formatCurrency(m.total)}</p>
                                                <p className="text-sm mt-1 font-medium text-purple-600">📱 Online</p>
                                                <p className="text-xs mt-2 text-purple-500">Click para confirmar</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mesas que PIDEN LA CUENTA (Efectivo/Tarjeta) - Para camarero */}
                            {mesas.filter(m => m.pideCuenta && !m.pagoOnlinePendiente && m.total > 0).length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border-2 border-red-300 dark:border-red-700 animate-pulse">
                                    <h3 className="font-bold mb-3 text-red-700 dark:text-red-400">🔔 Mesas que PIDEN LA CUENTA (Efectivo/Tarjeta)</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {mesas.filter(m => m.pideCuenta && !m.pagoOnlinePendiente && m.total > 0).map(m => (
                                            <button key={m.id} onClick={() => { setEditingItem(m); setShowTicketModal(true); }} className="bg-red-100 border-2 border-red-400 rounded-lg p-3 hover:bg-red-200 relative">
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">URGENTE</span>
                                                <p className="font-bold text-red-700">Mesa {m.numero}</p>
                                                <p className="text-xl font-bold text-red-800">{formatCurrency(m.total)}</p>
                                                {m.metodoPagoPreferido && (
                                                    <p className="text-sm mt-1 font-medium text-red-600">
                                                        {m.metodoPagoPreferido === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}
                                                    </p>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold mb-3">Generar Ticket - Mesas Ocupadas</h3>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    {mesas.filter(m => m.ocupada && !m.pideCuenta).map(m => (
                                        <button key={m.id} onClick={() => { setEditingItem(m); setShowTicketModal(true); }} className={`rounded-lg p-3 hover:opacity-80 ${m.llamaCamarero ? 'bg-amber-100 border-2 border-amber-400' : 'bg-amber-50 border border-amber-200'}`}>
                                            {m.llamaCamarero && <span className="text-xs text-amber-600">🔔 Llama</span>}
                                            <p className="font-bold text-amber-700">Mesa {m.numero}</p>
                                            <p className="text-lg font-bold">{formatCurrency(m.total)}</p>
                                        </button>
                                    ))}
                                    {mesas.filter(m => m.ocupada && !m.pideCuenta).length === 0 && !mesas.some(m => m.pideCuenta) && <p className="col-span-full text-center text-slate-500 py-4">No hay mesas ocupadas</p>}
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
                                                    <button onClick={() => handleEliminarTicket(t.id)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar ticket"><span className="material-symbols-outlined text-lg">close</span></button>
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

                    {/* RESERVAS */}
                    {activeSection === 'reservas' && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">📅 Reservas</h2>
                                <div className="flex gap-2">
                                    <button onClick={refreshReservas} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">refresh</span>
                                        Actualizar
                                    </button>
                                </div>
                            </div>

                            {/* Resumen de reservas de hoy */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                                    <div className="text-2xl font-bold text-blue-600">{reservas.filter(r => r.fecha === new Date().toISOString().slice(0,10)).length}</div>
                                    <div className="text-sm text-slate-500">Hoy</div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                                    <div className="text-2xl font-bold text-amber-600">{reservas.filter(r => r.estado === 'pendiente').length}</div>
                                    <div className="text-sm text-slate-500">Pendientes</div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                                    <div className="text-2xl font-bold text-green-600">{reservas.filter(r => r.estado === 'confirmada').length}</div>
                                    <div className="text-sm text-slate-500">Confirmadas</div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                                    <div className="text-2xl font-bold text-purple-600">{reservas.reduce((sum, r) => sum + r.numPersonas, 0)}</div>
                                    <div className="text-sm text-slate-500">Personas total</div>
                                </div>
                            </div>

                            {/* Tabla de reservas */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700">
                                        <tr>
                                            <th className="text-left px-4 py-3">Cliente</th>
                                            <th className="text-left px-4 py-3">Teléfono</th>
                                            <th className="text-left px-4 py-3">Fecha</th>
                                            <th className="text-left px-4 py-3">Hora</th>
                                            <th className="text-center px-4 py-3">Personas</th>
                                            <th className="text-left px-4 py-3">Mesa</th>
                                            <th className="text-left px-4 py-3">Estado</th>
                                            <th className="text-right px-4 py-3">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {reservas.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                                                    No hay reservas próximas
                                                </td>
                                            </tr>
                                        ) : (
                                            reservas.map(r => (
                                                <tr key={r.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700 ${r.fecha === new Date().toISOString().slice(0,10) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{r.nombreCliente}</div>
                                                        {r.notas && <div className="text-xs text-slate-400 truncate max-w-[150px]" title={r.notas}>📝 {r.notas}</div>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <a href={`tel:${r.telefono}`} className="text-blue-600 hover:underline">{r.telefono}</a>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={r.fecha === new Date().toISOString().slice(0,10) ? 'font-bold text-blue-600' : ''}>
                                                            {new Date(r.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">{r.hora}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded-full text-xs font-bold">
                                                            {r.numPersonas} 👥
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {r.mesaNumero ? (
                                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Mesa {r.mesaNumero}</span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">Sin asignar</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={r.estado}
                                                            onChange={(e) => handleCambiarEstadoReserva(r.id, e.target.value)}
                                                            className={`text-xs px-2 py-1 rounded border-none font-medium ${
                                                                r.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                                                                r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                                                                r.estado === 'cancelada' ? 'bg-red-100 text-red-700' :
                                                                r.estado === 'completada' ? 'bg-blue-100 text-blue-700' :
                                                                r.estado === 'no_show' ? 'bg-gray-100 text-gray-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }`}
                                                        >
                                                            <option value="pendiente">⏳ Pendiente</option>
                                                            <option value="confirmada">✅ Confirmada</option>
                                                            <option value="cancelada">❌ Cancelada</option>
                                                            <option value="completada">🎉 Completada</option>
                                                            <option value="no_show">👻 No se presentó</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button 
                                                                onClick={() => { setEditingItem(r); setShowReservaModal(true); }} 
                                                                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded"
                                                                title="Editar"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteReserva(r.id)} 
                                                                className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                                                                title="Eliminar"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
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
                                        <div className="flex gap-1 flex-wrap">
                                            <button onClick={() => handleDescargarQR(m)} className="flex-1 bg-green-100 text-green-700 py-1.5 rounded text-xs flex items-center justify-center gap-1" title="Descargar QR">
                                                <span className="material-symbols-outlined text-sm">download</span>Descargar QR
                                            </button>
                                            <button onClick={() => handleRegenerarQR(m.id)} className="p-1.5 bg-blue-100 text-blue-700 rounded" title="Regenerar QR"><span className="material-symbols-outlined text-sm">refresh</span></button>
                                            <button onClick={() => { setEditingItem(m); setShowMesaModal(true); }} className="p-1.5 bg-slate-100 rounded" title="Editar"><span className="material-symbols-outlined text-sm">edit</span></button>
                                            <button onClick={() => handleDeleteMesa(m.id)} className="p-1.5 bg-red-100 text-red-600 rounded" title="Eliminar"><span className="material-symbols-outlined text-sm">delete</span></button>
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
            {showReservaModal && <ReservaModal reserva={editingItem} mesas={mesas} onSave={handleSaveReserva} onClose={() => { setShowReservaModal(false); setEditingItem(null); }} loading={loading} />}

            {toast && <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white text-sm z-50 animate-pulse ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-green-500'}`}>{toast.message}</div>}
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
    
    const inputClass = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400 text-slate-900 focus:ring-2 focus:ring-primary outline-none";
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">{producto ? 'Editar' : 'Nuevo'} Producto</h3>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nombre</label>
                        <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className={inputClass} placeholder="Ej: Hamburguesa Especial" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Descripción</label>
                        <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className={inputClass} placeholder="Breve detalle del producto..." rows="2" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Precio (€)</label>
                            <input type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} className={inputClass} placeholder="0.00" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Categoría</label>
                            <select value={formData.categoriaId} onChange={(e) => setFormData({ ...formData, categoriaId: parseInt(e.target.value) })} className={inputClass}>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">URL Imagen</label>
                        <input type="url" value={formData.imagen} onChange={(e) => setFormData({ ...formData, imagen: e.target.value })} className={inputClass} placeholder="https://..." />
                    </div>
                    <div className="flex gap-6 py-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({ ...formData, activo: e.target.checked })} className="size-4 rounded text-primary focus:ring-primary" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Activo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={formData.destacado} onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })} className="size-4 rounded text-primary focus:ring-primary" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Destacado</span>
                        </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50">
                            {loading ? '...' : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CategoriaModal({ categoria, onSave, onClose, loading }) {
    const [formData, setFormData] = useState({ nombre: categoria?.nombre || '', tipo: categoria?.tipo || 'cocina', orden: categoria?.orden || 0 });
    const inputClass = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400 text-slate-900 focus:ring-2 focus:ring-primary outline-none";
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm shadow-2xl">
                <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">{categoria ? 'Editar' : 'Nueva'} Categoría</h3>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nombre</label>
                        <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className={inputClass} placeholder="Ej: Bebidas" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tipo de Servicio</label>
                        <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className={inputClass}>
                            <option value="cocina">🍳 Cocina</option>
                            <option value="barra">🍺 Barra</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">{loading ? '...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TicketModal({ mesa, onSave, onClose, loading }) {
    // Mapear método preferido del cliente al formato del ticket
    const getInitialMetodo = () => {
        if (mesa.metodoPagoPreferido === 'efectivo') return 'efectivo';
        if (mesa.metodoPagoPreferido === 'tarjeta') return 'tarjeta';
        if (mesa.metodoPagoPreferido === 'online') return 'tpv';
        return 'efectivo';
    };
    const [metodo, setMetodo] = useState(getInitialMetodo());
    const formatCurrency = (v) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v || 0);
    
    // Mostrar el método preferido por el cliente
    const getClientePreferido = () => {
        const labels = { efectivo: '💵 Efectivo', tarjeta: '💳 Tarjeta', online: '📱 Online' };
        return labels[mesa.metodoPagoPreferido] || null;
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900">🧾 Ticket Mesa {mesa.numero}</h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="text-center bg-slate-100 rounded-lg p-3 border border-slate-200">
                        <p className="text-sm text-slate-700 font-medium">Total</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(mesa.total)}</p>
                    </div>
                    {mesa.metodoPagoPreferido && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                            <p className="text-xs text-blue-700 mb-1 font-medium">📋 El cliente prefiere pagar con:</p>
                            <p className="font-bold text-blue-800">{getClientePreferido()}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                        {['efectivo', 'tarjeta', 'tpv'].map(m => (
                            <button key={m} onClick={() => setMetodo(m)} className={`p-3 rounded-lg border-2 flex flex-col items-center transition-colors ${metodo === m ? 'border-primary bg-primary/10 text-primary' : 'border-slate-300 text-slate-700 hover:border-slate-400'}`}>
                                <span className="text-xl">{m === 'efectivo' ? '💵' : m === 'tarjeta' ? '💳' : '📱'}</span>
                                <span className="text-xs capitalize font-medium">{m}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">Cancelar</button>
                        <button onClick={() => onSave(mesa.id, metodo)} disabled={loading} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">{loading ? '...' : 'Generar'}</button>
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
            <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
                <div className="p-4 border-b border-slate-200 flex justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900">Ticket #{ticket.numero}</h3>
                        <p className="text-xs text-slate-600">{ticket.createdAt}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${ticket.estado === 'pagado' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {ticket.estado}
                    </span>
                </div>
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-slate-100 rounded p-2">
                            <p className="text-xs text-slate-600 font-medium">Mesa</p>
                            <p className="font-bold text-slate-900">Mesa {ticket.mesa}</p>
                        </div>
                        <div className="bg-slate-100 rounded p-2">
                            <p className="text-xs text-slate-600 font-medium">Método</p>
                            <p className="font-bold text-slate-900 capitalize">{ticket.metodoPago}</p>
                        </div>
                    </div>
                    {ticket.detalles?.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <h4 className="text-sm font-medium text-slate-700 mb-2">Detalles del pedido</h4>
                            {ticket.detalles.map((d, i) => (
                                <div key={i} className="flex justify-between text-sm py-1 text-slate-900">
                                    <span>{d.cantidad}x {d.producto}</span>
                                    <span className="font-mono font-medium">{formatCurrency(d.precio * d.cantidad)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="bg-white border-2 border-slate-300 rounded-lg p-3">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700">Base</span>
                            <span className="text-slate-900 font-mono">{formatCurrency(ticket.baseImponible)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700">IVA 10%</span>
                            <span className="text-slate-900 font-mono">{formatCurrency(ticket.iva)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-slate-300">
                            <span className="text-slate-900">Total</span>
                            <span className="text-green-700 font-mono">{formatCurrency(ticket.total)}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-slate-900 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

function UsuarioModal({ usuario, onSave, onClose, loading }) {
    const [formData, setFormData] = useState({ email: usuario?.email || '', rol: usuario?.rol || 'camarero', password: '' });
    
    // Reinicializar cuando cambia el usuario (importante para edición)
    useEffect(() => {
        setFormData({ 
            email: usuario?.email || '', 
            rol: usuario?.rol || 'camarero', 
            password: '' 
        });
    }, [usuario]);
    
    const inputClass = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400 text-slate-900 focus:ring-2 focus:ring-primary outline-none";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
                <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">{usuario ? 'Editar' : 'Nuevo'} Usuario</h3>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="email@ejemplo.com" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Rol</label>
                        <select value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })} className={inputClass}>
                            <option value="camarero">🧑‍🍳 Camarero</option>
                            <option value="cocinero">👨‍🍳 Cocinero</option>
                            <option value="barman">🍸 Barman</option>
                            <option value="gerente">👔 Gerente</option>
                            <option value="admin">👑 Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{usuario ? 'Cambiar Contraseña' : 'Contraseña'}</label>
                        <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass} placeholder={usuario ? 'Dejar vacío para no cambiar' : '********'} {...(!usuario && { required: true })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">{loading ? '...' : 'Guardar'}</button>
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
    const inputClass = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400 text-slate-900 focus:ring-2 focus:ring-primary outline-none";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-xs shadow-2xl overflow-hidden">
                <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">{mesa ? 'Editar' : 'Nueva'} Mesa</h3>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Número</label>
                        <input type="number" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) })} className={inputClass} placeholder="Ej: 5" required />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer group py-1">
                        <input type="checkbox" checked={formData.activa} onChange={(e) => setFormData({ ...formData, activa: e.target.checked })} className="size-4 rounded text-primary focus:ring-primary" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Mesa activa</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">{loading ? '...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ReservaModal({ reserva, mesas, onSave, onClose, loading }) {
    const [formData, setFormData] = useState({
        nombreCliente: reserva?.nombreCliente || '',
        telefono: reserva?.telefono || '',
        email: reserva?.email || '',
        fecha: reserva?.fecha || new Date().toISOString().slice(0, 10),
        hora: reserva?.hora || '13:00',
        numPersonas: reserva?.numPersonas || 2,
        notas: reserva?.notas || '',
        mesaId: reserva?.mesaId || '',
        estado: reserva?.estado || 'pendiente'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary";
    const selectClass = "w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">📅 {reserva ? 'Editar' : 'Nueva'} Reserva</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Datos del cliente */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-slate-500 dark:text-slate-400 uppercase">Datos del Cliente</h4>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nombre *</label>
                            <input 
                                type="text" 
                                value={formData.nombreCliente} 
                                onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })} 
                                className={inputClass}
                                placeholder="Nombre del cliente" 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Teléfono *</label>
                                <input 
                                    type="tel" 
                                    value={formData.telefono} 
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} 
                                    className={inputClass}
                                    placeholder="600 123 456" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email</label>
                                <input 
                                    type="email" 
                                    value={formData.email} 
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                    className={inputClass}
                                    placeholder="email@ejemplo.com" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Datos de la reserva */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-slate-500 dark:text-slate-400 uppercase">Detalles de la Reserva</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Fecha *</label>
                                <input 
                                    type="date" 
                                    value={formData.fecha} 
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} 
                                    className={inputClass}
                                    min={new Date().toISOString().slice(0, 10)}
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Hora *</label>
                                <input 
                                    type="time" 
                                    value={formData.hora} 
                                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })} 
                                    className={inputClass}
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Personas *</label>
                                <input 
                                    type="number" 
                                    value={formData.numPersonas} 
                                    onChange={(e) => setFormData({ ...formData, numPersonas: parseInt(e.target.value) })} 
                                    className={inputClass}
                                    min="1" 
                                    max="20"
                                    required 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Mesa asignada</label>
                                <select 
                                    value={formData.mesaId} 
                                    onChange={(e) => setFormData({ ...formData, mesaId: e.target.value })} 
                                    className={selectClass}
                                >
                                    <option value="">Sin asignar</option>
                                    {mesas.filter(m => m.activa).map(m => (
                                        <option key={m.id} value={m.id}>Mesa {m.numero}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Estado</label>
                                <select 
                                    value={formData.estado} 
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })} 
                                    className={selectClass}
                                >
                                    <option value="pendiente">⏳ Pendiente</option>
                                    <option value="confirmada">✅ Confirmada</option>
                                    <option value="cancelada">❌ Cancelada</option>
                                    <option value="completada">🎉 Completada</option>
                                    <option value="no_show">👻 No se presentó</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Notas</label>
                            <textarea 
                                value={formData.notas} 
                                onChange={(e) => setFormData({ ...formData, notas: e.target.value })} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary resize-none" 
                                rows="2"
                                placeholder="Alergias, ocasión especial, etc."
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                            {loading ? '⏳ Guardando...' : (reserva ? '💾 Actualizar' : '➕ Crear Reserva')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
