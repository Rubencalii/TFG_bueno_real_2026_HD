import VentasPanel from './VentasPanel';
import CartaPanel from './CartaPanel';
import MesaPanel from './MesaPanel';
import EquipoPanel from './EquipoPanel';
import AnalyticsDashboard from './AnalyticsDashboard';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('ventas');

    const tabs = [
        { id: 'ventas', name: 'Ventas', icon: 'payments' },
        { id: 'carta', name: 'Carta', icon: 'restaurant_menu' },
        { id: 'mesas', name: 'Mesas', icon: 'table_restaurant' },
        { id: 'equipo', name: 'Equipo', icon: 'group' },
        { id: 'analytics', name: 'Analítica', icon: 'insights' },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm flex overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-primary text-white shadow-md'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">
                {activeTab === 'ventas' && <VentasPanel />}
                {activeTab === 'carta' && <CartaPanel />}
                {activeTab === 'mesas' && <MesaPanel />}
                {activeTab === 'equipo' && <EquipoPanel />}
                {activeTab === 'analytics' && <AnalyticsDashboard />}
            </div>
        </div>
    );
};

const PlaceholderPanel = ({ name, icon }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
            <span className="material-symbols-outlined text-4xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{name}</h3>
        <p className="text-gray-500 max-w-sm">
            Estamos preparando este módulo. Muy pronto podrás gestionar {name.toLowerCase()} desde aquí con herramientas avanzadas.
        </p>
    </div>
);

export default AdminDashboard;
