import React, { useState } from 'react';
import { inventory } from '../data/mockData';
import { Package, AlertCircle, DollarSign, Calendar, TrendingDown, Edit3, ShoppingCart, Download } from 'lucide-react';
import './Inventory.css';

const Inventory = () => {
    const [stock, setStock] = useState(inventory);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [autoSync, setAutoSync] = useState(true);
    const [showShoppingList, setShowShoppingList] = useState(false);

    // Calculate KPIs
    const totalStockValue = stock.reduce((sum, item) => sum + (item.quantityMl * item.unitCostPerMl), 0);

    // Find critical item (lowest days remaining)
    const criticalItem = stock
        .filter(item => item.dailyUsageMl > 0)
        .map(item => ({
            ...item,
            daysRemaining: Math.floor(item.quantityMl / item.dailyUsageMl)
        }))
        .sort((a, b) => a.daysRemaining - b.daysRemaining)[0];

    const monthlyProjected = stock.reduce((sum, item) => sum + (item.dailyUsageMl * 30 * item.unitCostPerMl), 0);

    // Filter by category
    const categories = ['Todos', 'Nutrientes', 'Reguladores', 'Sustrato', 'IPM', 'Herramientas'];
    const filteredStock = activeCategory === 'Todos'
        ? stock
        : stock.filter(item => item.category === activeCategory);

    // Shopping list (items with < 15 days)
    const shoppingList = stock
        .filter(item => item.dailyUsageMl > 0)
        .map(item => ({
            ...item,
            daysRemaining: Math.floor(item.quantityMl / item.dailyUsageMl),
            quantityNeeded: Math.ceil((item.maxCapacityMl - item.quantityMl) / 1000) * 1000 // Round to nearest liter
        }))
        .filter(item => item.daysRemaining < 15)
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const getProgressColor = (percentage) => {
        if (percentage > 50) return 'linear-gradient(90deg, #10b981, #059669)';
        if (percentage > 20) return 'linear-gradient(90deg, #f59e0b, #d97706)';
        return 'linear-gradient(90deg, #ef4444, #dc2626)';
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
    };

    const exportShoppingList = () => {
        const listText = shoppingList.map(item =>
            `${item.product} | ${item.quantityNeeded}ml | ${formatCurrency(item.quantityNeeded * item.unitCostPerMl)}`
        ).join('\n');

        const whatsappText = encodeURIComponent(`📋 Lista de Compras - Grow Room\n\n${listText}\n\nTotal estimado: ${formatCurrency(shoppingList.reduce((sum, item) => sum + (item.quantityNeeded * item.unitCostPerMl), 0))}`);
        window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
    };

    return (
        <div className="inventory-view">
            {/* HEADER WITH KPIs */}
            <header className="inventory-header">
                <div className="header-title-section">
                    <h2 className="view-title">Gestión de Inventario</h2>
                    <div className="sync-toggle">
                        <input
                            type="checkbox"
                            id="auto-sync"
                            checked={autoSync}
                            onChange={(e) => setAutoSync(e.target.checked)}
                        />
                        <label htmlFor="auto-sync">
                            Sincronización Automática con Salas
                        </label>
                    </div>
                </div>

                <div className="kpi-stats-bar">
                    <div className="kpi-stat">
                        <DollarSign className="kpi-icon" size={20} />
                        <div className="kpi-content">
                            <span className="kpi-label">Valor en Stock</span>
                            <span className="kpi-value">{formatCurrency(totalStockValue)}</span>
                        </div>
                    </div>

                    <div className="kpi-stat critical">
                        <Calendar className="kpi-icon" size={20} />
                        <div className="kpi-content">
                            <span className="kpi-label">Días de Autonomía</span>
                            <span className="kpi-value">
                                {criticalItem ? `${criticalItem.daysRemaining} días` : 'N/A'}
                            </span>
                            {criticalItem && (
                                <span className="kpi-subtitle">Alerta: {criticalItem.product}</span>
                            )}
                        </div>
                    </div>

                    <div className="kpi-stat">
                        <TrendingDown className="kpi-icon" size={20} />
                        <div className="kpi-content">
                            <span className="kpi-label">Gasto Mensual Proyectado</span>
                            <span className="kpi-value">{formatCurrency(monthlyProjected)}</span>
                        </div>
                    </div>

                    <button
                        className="btn-shopping-list"
                        onClick={() => setShowShoppingList(!showShoppingList)}
                    >
                        <ShoppingCart size={18} />
                        Lista de Compras ({shoppingList.length})
                    </button>
                </div>
            </header>

            {/* CATEGORY TABS */}
            <div className="category-tabs">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* AUTO SYNC NOTE */}
            {autoSync && (
                <div className="sync-note">
                    <AlertCircle size={16} />
                    <span>El stock se descuenta automáticamente según las recetas activas en Flora A, B y Vege</span>
                </div>
            )}

            {/* INVENTORY GRID */}
            <div className="inventory-grid">
                {filteredStock.map(item => {
                    const percentage = Math.min(100, (item.quantityMl / item.maxCapacityMl) * 100);
                    const isLow = item.quantityMl <= item.minAlertMl;
                    const daysRemaining = item.dailyUsageMl > 0 ? Math.floor(item.quantityMl / item.dailyUsageMl) : null;

                    return (
                        <div key={item.id} className={`inventory-card ${isLow ? 'low-stock' : ''}`}>
                            <div className="card-header">
                                <Package size={24} className="icon" />
                                <span className="product-name">{item.product}</span>
                                {isLow && <AlertCircle size={20} className="alert-icon" />}
                            </div>

                            <div className="stock-level">
                                <div className="level-bar-bg">
                                    <div
                                        className="level-bar-fill"
                                        style={{
                                            width: `${percentage}%`,
                                            background: getProgressColor(percentage)
                                        }}
                                    ></div>
                                </div>
                                <div className="level-text">
                                    <span>{item.quantityMl.toLocaleString()} ml</span>
                                    <span className="capacity">/ {item.maxCapacityMl.toLocaleString()} ml</span>
                                </div>
                            </div>

                            <div className="stock-metrics">
                                {item.dailyUsageMl > 0 && (
                                    <div className="metric-item">
                                        <span className="metric-label">Uso:</span>
                                        <span className="metric-value">{item.dailyUsageMl} ml/día</span>
                                    </div>
                                )}
                                <div className="metric-item">
                                    <span className="metric-label">Costo:</span>
                                    <span className="metric-value">{formatCurrency(item.unitCostPerMl)} /ml</span>
                                </div>
                            </div>

                            <div className="stock-footer">
                                {daysRemaining !== null && (
                                    <span className={`days-remaining ${daysRemaining < 15 ? 'critical' : ''}`}>
                                        ~{daysRemaining} días restantes
                                    </span>
                                )}
                                <button className="btn-adjust" title="Ajuste Rápido">
                                    <Edit3 size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* SHOPPING LIST SIDEBAR */}
            {showShoppingList && (
                <div className="shopping-list-sidebar">
                    <div className="sidebar-header">
                        <h3>Reabastecimiento Sugerido</h3>
                        <button className="btn-close" onClick={() => setShowShoppingList(false)}>✕</button>
                    </div>

                    {shoppingList.length === 0 ? (
                        <div className="empty-list">
                            <Package size={48} className="empty-icon" />
                            <p>No hay productos que requieran reabastecimiento</p>
                        </div>
                    ) : (
                        <>
                            <div className="shopping-items">
                                {shoppingList.map(item => (
                                    <div key={item.id} className="shopping-item">
                                        <input type="checkbox" defaultChecked />
                                        <div className="item-details">
                                            <span className="item-name">{item.product}</span>
                                            <span className="item-quantity">{item.quantityNeeded.toLocaleString()} ml</span>
                                            <span className="item-cost">{formatCurrency(item.quantityNeeded * item.unitCostPerMl)}</span>
                                            <span className="item-urgency">⚠️ {item.daysRemaining} días</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="sidebar-footer">
                                <div className="total-cost">
                                    <span>Total Estimado:</span>
                                    <span className="total-value">
                                        {formatCurrency(shoppingList.reduce((sum, item) => sum + (item.quantityNeeded * item.unitCostPerMl), 0))}
                                    </span>
                                </div>
                                <button className="btn-export" onClick={exportShoppingList}>
                                    <Download size={16} />
                                    Exportar a WhatsApp
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {showShoppingList && <div className="sidebar-overlay" onClick={() => setShowShoppingList(false)}></div>}
        </div>
    );
};

export default Inventory;
