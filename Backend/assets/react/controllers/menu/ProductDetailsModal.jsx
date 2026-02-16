import React from "react";

export default function ProductDetailsModal({
    producto,
    isOpen,
    onClose,
    onAddToCart,
    onRemoveFromCart,
    quantity,
    t,
    isAuthenticated,
}) {
    if (!isOpen || !producto) return null;

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-slide-up relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 size-10 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Content Container (Scrollable) */}
                <div className="overflow-y-auto custom-scrollbar">
                    {/* Hero Image Section */}
                    <div
                        className="h-64 sm:h-96 bg-cover bg-center relative"
                        style={{
                            backgroundImage: `url("${producto.imagen || "/placeholder-food.jpg"}")`,
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-800 via-transparent to-transparent"></div>

                        {/* Featured Badge */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            {producto.destacado && (
                                <span className="bg-secondary px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-white orange-glow w-fit">
                                    {t("TOP SELLER") || "TOP SELLER"}
                                </span>
                            )}
                            {producto.vegetariano && (
                                <span className="bg-primary px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-white neon-glow w-fit">
                                    {t("VEGETARIANA") || "VEGETARIANA"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="px-6 sm:px-10 pb-10 -mt-10 relative">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                            <div className="space-y-1">
                                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                                    {producto.nombre}
                                </h2>
                                <p className="text-primary font-black text-2xl">
                                    {parseFloat(producto.precio).toFixed(2)}€
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose dark:prose-invert max-w-none mb-8">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                                {t("Descripción") || "Descripción"}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                                {producto.descripcion ||
                                    t("Sin descripción disponible") ||
                                    "Sin descripción disponible"}
                            </p>
                        </div>

                        {/* Allergens */}
                        {producto.alergenos &&
                            producto.alergenos.length > 0 && (
                                <div className="mb-10">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                                        {t("Alérgenos") || "Alérgenos"}
                                    </h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {producto.alergenos.map((alergeno) => (
                                            <div
                                                key={alergeno}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700"
                                            >
                                                <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                                                    {t(alergeno) || alergeno}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Order Controls */}
                        {isAuthenticated && (
                            <div className="sticky bottom-0 pt-6 pb-2 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
                                {quantity > 0 ? (
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] p-2 border-2 border-primary shadow-sm w-full sm:w-48 transition-all">
                                        <button
                                            onClick={() =>
                                                onRemoveFromCart(producto.id)
                                            }
                                            className="size-12 flex items-center justify-center text-primary hover:bg-primary/5 rounded-2xl transition-colors"
                                        >
                                            <span className="text-3xl font-bold">
                                                −
                                            </span>
                                        </button>

                                        <div className="flex flex-col items-center justify-center leading-none">
                                            <span className="text-gray-900 dark:text-white font-black text-xl">
                                                {quantity}
                                            </span>
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">
                                                {t("en carrito") ||
                                                    "en carrito"}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() =>
                                                onAddToCart(producto, "")
                                            }
                                            className="size-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 transition-transform active:scale-95"
                                        >
                                            <span className="text-3xl font-bold">
                                                +
                                            </span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            onAddToCart(producto, "");
                                            // Optional: close on add? user likely wants to see more or add notes
                                        }}
                                        className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:translate-y-[-2px] hover:shadow-primary/40 transition-all active:scale-95 neon-glow"
                                    >
                                        <span className="material-symbols-outlined">
                                            add_shopping_cart
                                        </span>
                                        {t("Añadir al pedido") ||
                                            "Añadir al pedido"}
                                    </button>
                                )}

                                {quantity === 0 && (
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-center px-4">
                                        {t("Pulsa para añadir a tu comanda") ||
                                            "Pulsa para añadir a tu comanda"}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
