import React, { useState, useEffect } from 'react';

const EquipoPanel = () => {
    const [equipo, setEquipo] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEquipo = async () => {
        try {
            const response = await fetch('/admin/api/equipo');
            if (response.ok) {
                const data = await response.json();
                setEquipo(data);
            }
        } catch (error) {
            console.error('Error fetching equipo:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipo();
    }, []);

    const getRoleBadge = (rol) => {
        const roles = {
            'gerente': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'Gerente / Admin' },
            'staff': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Camarero / Cocina' },
        };
        const config = roles[rol] || { color: 'bg-slate-100 text-slate-700', label: rol };
        return <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${config.color}`}>{config.label}</span>;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando equipo...</div>;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Equipo</h2>
                    <p className="text-gray-500 dark:text-gray-400">Administra los accesos de tus empleados al sistema</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Nuevo Miembro
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Usuario</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Email</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Rol</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {equipo.map(miembro => (
                                <tr key={miembro.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {miembro.email.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-gray-900 dark:text-white">Admin / Staff</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-400 font-mono italic">{miembro.email}</td>
                                    <td className="px-8 py-5">{getRoleBadge(miembro.rol)}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Message */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl flex gap-4">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Nota:</strong> Los miembros del equipo con rol 'Gerente' tienen acceso completo al panel administrativo. El rol 'Staff' está limitado a los terminales de Cocina y Barra.
                </p>
            </div>
        </div>
    );
};

export default EquipoPanel;
