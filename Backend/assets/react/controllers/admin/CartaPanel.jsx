import React, { useState, useEffect } from 'react';

const CartaPanel = () => {
    const [carta, setCarta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editProducto, setEditProducto] = useState(null);
    const [newProducto, setNewProducto] = useState(null); // { categoriaId: X }
    const [newCategoria, setNewCategoria] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchCarta = async () => {
        try {
            const response = await fetch('/admin/api/carta');
            if (response.ok) {
                const data = await response.json();
                setCarta(data);
            }
        } catch (error) {
            console.error('Error fetching carta:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategoria = async (id) => {
        try {
            const response = await fetch(`/admin/api/categoria/${id}/toggle`, { method: 'PATCH' });
            if (response.ok) fetchCarta();
        } catch (error) {
            console.error('Error toggling categoria:', error);
        }
    };

    const toggleProducto = async (id) => {
        try {
            const response = await fetch(`/admin/api/producto/${id}/toggle`, { method: 'PATCH' });
            if (response.ok) fetchCarta();
        } catch (error) {
            console.error('Error toggling producto:', error);
        }
    };

    const handleSaveProducto = async (producto) => {
        setSaving(true);
        const isNew = !producto.id;
        const url = isNew ? '/admin/api/producto' : `/admin/api/producto/${producto.id}`;
        const method = isNew ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(producto)
            });
            if (response.ok) {
                setEditProducto(null);
                setNewProducto(null);
                fetchCarta();
            }
        } catch (error) {
            console.error('Error saving producto:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProducto = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
        try {
            const response = await fetch(`/admin/api/producto/${id}`, { method: 'DELETE' });
            if (response.ok) fetchCarta();
        } catch (error) {
            console.error('Error deleting producto:', error);
        }
    };

    const handleCreateCategoria = async (nombre) => {
        if (!nombre) return;
        setSaving(true);
        try {
            const response = await fetch('/admin/api/categoria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            });
            if (response.ok) {
                setNewCategoria(false);
                fetchCarta();
            }
        } catch (error) {
            console.error('Error creating categoria:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategoria = async (id) => {
        if (!confirm('¿Seguro? Solo podrás borrarla si no tiene productos.')) return;
        try {
            const response = await fetch(`/admin/api/categoria/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchCarta();
            } else {
                const data = await response.json();
                alert(data.message || 'Error al eliminar');
            }
        } catch (error) {
            console.error('Error deleting categoria:', error);
        }
    };

    useEffect(() => {
        fetchCarta();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando carta...</div>;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Carta</h2>
                    <p className="text-gray-500 dark:text-gray-400">Control total sobre tus platos y secciones</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setNewCategoria(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Nueva Categoría
                    </button>
                    <button 
                        onClick={() => fetch('/admin/api/auto-translate').then(() => fetchCarta())}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
                        title="Traducir automáticamente platos vacíos"
                    >
                        <span className="material-symbols-outlined text-[20px]">translate</span>
                        Auto-Traducir
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {carta.map(categoria => (
                    <div key={categoria.id} className={`bg-white dark:bg-slate-800 rounded-2xl border ${categoria.activa ? 'border-slate-200 dark:border-slate-700' : 'border-rose-200 dark:border-rose-900/30 opacity-75'} shadow-sm flex flex-col`}>
                        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <span className={`size-3 rounded-full ${categoria.activa ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{categoria.nombre}</h3>
                                <button 
                                    onClick={() => handleDeleteCategoria(categoria.id)}
                                    className="text-slate-300 hover:text-rose-500 transition-colors"
                                    title="Eliminar categoría"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleCategoria(categoria.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                        categoria.activa ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                    }`}
                                >
                                    {categoria.activa ? 'Cerrar' : 'Activar'}
                                </button>
                                <button 
                                    onClick={() => setNewProducto({ categoriaId: categoria.id, nombre: '', precio: '0.00' })}
                                    className="size-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-3 flex-1">
                            {categoria.productos.map(producto => (
                                <div key={producto.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 relative">
                                            {producto.imagen ? (
                                                <img src={producto.imagen} alt={producto.nombre} className={`w-full h-full object-cover ${!producto.activo ? 'grayscale' : ''}`} />
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-400 absolute inset-0 flex items-center justify-center">image</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${producto.activo ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>{producto.nombre}</p>
                                            <p className="text-sm font-bold text-primary">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(producto.precio)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleProducto(producto.id)}
                                            className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                                                producto.activo 
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {producto.activo ? 'check_circle' : 'block'}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => setEditProducto({ ...producto, categoriaId: categoria.id })}
                                            className="size-10 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteProducto(producto.id)}
                                            className="size-10 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {categoria.productos.length === 0 && (
                                <div className="py-8 text-center text-slate-300 text-sm italic">Categoría vacía</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Producto (Crear/Editar) */}
            {(editProducto || newProducto) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {editProducto ? 'Editar Producto' : 'Nuevo Producto'}
                                </h3>
                                <p className="text-sm text-gray-500">Completa los datos del plato</p>
                            </div>
                            <button onClick={() => { setEditProducto(null); setNewProducto(null); }} className="size-10 rounded-full hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-sm">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1 mb-2 block">Nombre del Producto</label>
                                <input 
                                    type="text" 
                                    value={(editProducto || newProducto).nombre}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (editProducto) setEditProducto({ ...editProducto, nombre: val });
                                        else setNewProducto({ ...newProducto, nombre: val });
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold outline-none transition-all"
                                    placeholder="Ej: Hamburguesa Suprema"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1 mb-2 block">Precio (€)</label>
                                    <input 
                                        type="number" step="0.01"
                                        value={(editProducto || newProducto).precio}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (editProducto) setEditProducto({ ...editProducto, precio: val });
                                            else setNewProducto({ ...newProducto, precio: val });
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1 mb-2 block">Categoría</label>
                                    <select 
                                        value={(editProducto || newProducto).categoriaId}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (editProducto) setEditProducto({ ...editProducto, categoriaId: val });
                                            else setNewProducto({ ...newProducto, categoriaId: val });
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold outline-none transition-all appearance-none"
                                    >
                                        {carta.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Descripción (Opcional)</label>
                                <textarea 
                                    rows="2"
                                    value={(editProducto || newProducto).descripcion || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (editProducto) setEditProducto({ ...editProducto, descripcion: val });
                                        else setNewProducto({ ...newProducto, descripcion: val });
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-sm outline-none transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">URL Imagen</label>
                                <input 
                                    type="text" 
                                    value={(editProducto || newProducto).imagen || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (editProducto) setEditProducto({ ...editProducto, imagen: val });
                                        else setNewProducto({ ...newProducto, imagen: val });
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl px-5 py-3 text-xs text-gray-500 outline-none transition-all"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-900/30 flex gap-4">
                            <button 
                                onClick={() => { setEditProducto(null); setNewProducto(null); }}
                                className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => handleSaveProducto(editProducto || newProducto)}
                                disabled={saving}
                                className="flex-1 py-4 px-6 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">save</span>
                                        {editProducto ? 'Actualizar' : 'Crear Plato'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nueva Categoría */}
            {newCategoria && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-sm shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-6">Nueva Categoría</h3>
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Ej: Postres, Vinos..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold outline-none mb-6"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateCategoria(e.target.value);
                                if (e.key === 'Escape') setNewCategoria(false);
                            }}
                        />
                        <div className="flex gap-4">
                            <button onClick={() => setNewCategoria(false)} className="flex-1 py-3 font-bold text-gray-400">Cancelar</button>
                            <button 
                                onClick={(e) => handleCreateCategoria(e.target.previousSibling.previousSibling.value)}
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartaPanel;
