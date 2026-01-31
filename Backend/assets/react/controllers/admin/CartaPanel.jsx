import React, { useState, useEffect } from 'react';

const CartaPanel = () => {
    const [carta, setCarta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editProducto, setEditProducto] = useState(null);
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
            if (response.ok) {
                fetchCarta();
            }
        } catch (error) {
            console.error('Error toggling categoria:', error);
        }
    };

    const toggleProducto = async (id) => {
        try {
            const response = await fetch(`/admin/api/producto/${id}/toggle`, { method: 'PATCH' });
            if (response.ok) {
                fetchCarta();
            }
        } catch (error) {
            console.error('Error toggling producto:', error);
        }
    };

    const handleSaveTraduccion = async () => {
        if (!editProducto) return;
        setSaving(true);
        try {
            const response = await fetch(`/admin/api/producto/${editProducto.id}/traduccion`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreEn: editProducto.nombreEn,
                    descripcionEn: editProducto.descripcionEn
                })
            });
            if (response.ok) {
                setEditProducto(null);
                fetchCarta();
            }
        } catch (error) {
            console.error('Error saving translation:', error);
        } finally {
            setSaving(false);
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
                    <p className="text-gray-500 dark:text-gray-400">Activa o desactiva platos y categorías según disponibilidad</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Nueva Categoría
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
                                <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase rounded">
                                    {categoria.tipo}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleCategoria(categoria.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                        categoria.activa ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                    }`}
                                >
                                    {categoria.activa ? 'Desactivar' : 'Activar'}
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
                                        {producto.destacado && (
                                            <span className="material-symbols-outlined text-amber-500 text-[20px]" title="Producto destacado">star</span>
                                        )}
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
                                            onClick={() => setEditProducto({ ...producto })}
                                            className="size-10 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-primary transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Traducción */}
            {editProducto && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Editar Traducción</h3>
                                <p className="text-sm text-gray-500">Configura la versión en inglés</p>
                            </div>
                            <button onClick={() => setEditProducto(null)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Nombre Original (ES)</label>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-gray-900 dark:text-white font-medium">
                                    {editProducto.nombre}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                                <div>
                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1 mb-2 block">Nombre en Inglés (EN)</label>
                                    <input 
                                        type="text" 
                                        value={editProducto.nombreEn || ''}
                                        onChange={(e) => setEditProducto({ ...editProducto, nombreEn: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Ej: Beef Steak"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1 mb-2 block">Descripción en Inglés (EN)</label>
                                    <textarea 
                                        rows="3"
                                        value={editProducto.descripcionEn || ''}
                                        onChange={(e) => setEditProducto({ ...editProducto, descripcionEn: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-sm focus:border-primary outline-none transition-all placeholder:text-slate-300 resize-none"
                                        placeholder="Detailed description in English..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-900/30 flex gap-4">
                            <button 
                                onClick={() => setEditProducto(null)}
                                className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveTraduccion}
                                disabled={saving}
                                className="flex-1 py-4 px-6 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">save</span>
                                        Guardar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartaPanel;
