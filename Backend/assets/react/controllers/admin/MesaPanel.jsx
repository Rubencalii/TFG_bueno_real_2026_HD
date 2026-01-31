import React, { useState, useEffect } from 'react';

const MesaPanel = () => {
    const [mesas, setMesas] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMesas = async () => {
        try {
            const response = await fetch('/admin/api/mesas');
            if (response.ok) {
                const data = await response.json();
                setMesas(data);
            }
        } catch (error) {
            console.error('Error fetching mesas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMesas();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando mesas...</div>;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Mesas</h2>
                    <p className="text-gray-500 dark:text-gray-400">Controla el estado de las mesas y descarga sus códigos QR de acceso</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Añadir Mesa
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {mesas.map(mesa => (
                    <div key={mesa.id} className={`group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 transition-all duration-300 ${
                        mesa.activa 
                        ? 'border-slate-100 dark:border-slate-700 hover:border-primary/50' 
                        : 'border-slate-100 dark:border-slate-700 opacity-50'
                    } shadow-sm hover:shadow-xl`}>
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className={`size-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-colors ${
                                mesa.pideCuenta ? 'bg-rose-100 text-rose-600 animate-pulse' :
                                mesa.llamando ? 'bg-amber-100 text-amber-600 animate-bounce' :
                                'bg-slate-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                            }`}>
                                {mesa.numero}
                            </div>
                            
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Mesa {mesa.numero}</p>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                    <span className={`size-2 rounded-full ${mesa.activa ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">{mesa.activa ? 'Activa' : 'Inactiva'}</p>
                                </div>
                            </div>

                            <div className="w-full pt-4 mt-2 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-3">
                                <button className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-primary rounded-xl transition-colors" title="Descargar QR">
                                    <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                                </button>
                                <button className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-primary rounded-xl transition-colors" title="Ver pedido">
                                    <span className="material-symbols-outlined text-[20px]">receipt</span>
                                </button>
                                <button className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-primary rounded-xl transition-colors" title="Configurar">
                                    <span className="material-symbols-outlined text-[20px]">settings</span>
                                </button>
                            </div>
                        </div>

                        {/* Badges for active requests */}
                        {(mesa.llamando || mesa.pideCuenta) && (
                            <div className="absolute -top-3 -right-3 flex flex-col gap-1 items-end">
                                {mesa.llamando && (
                                    <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg shadow-lg flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                                        LLAMADA
                                    </span>
                                )}
                                {mesa.pideCuenta && (
                                    <span className="px-2 py-1 bg-rose-500 text-white text-[10px] font-black rounded-lg shadow-lg flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">payments</span>
                                        CUENTA
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MesaPanel;
