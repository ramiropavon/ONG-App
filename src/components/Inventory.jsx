import React, { useState } from 'react';
import { inventory } from '../data/mockData';
import { Package, AlertCircle } from 'lucide-react';
import './Inventory.css';

const Inventory = () => {
    const [stock, setStock] = useState(inventory);

    const simulateIrrigation = () => {
        // Mock deduction: -100ml for 'Base A', -100ml for 'Base B', -50ml for 'CalMag'
        const newStock = stock.map(item => {
            let deduction = 0;
            if (item.product.includes('Base')) deduction = 100;
            if (item.product === 'CalMag') deduction = 50;

            return { ...item, quantityMl: Math.max(0, item.quantityMl - deduction) };
        });
        setStock(newStock);
        alert('Riego registrado. Stock actualizado.');
    };

    return (
        <div className="inventory-view">
            <header className="inventory-header">
                <h2 className="view-title">Inventario de Insumos</h2>
                <button className="btn-primary" onClick={simulateIrrigation}>
                    + Registrar Riego (Simulación)
                </button>
            </header>

            <div className="inventory-grid">
                {stock.map(item => {
                    const percentage = Math.min(100, (item.quantityMl / 5000) * 100); // Assuming 5L bottle max for visuals
                    const isLow = item.quantityMl <= item.minAlertMl;

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
                                        style={{ width: `${percentage}%`, backgroundColor: isLow ? 'var(--accent-danger)' : 'var(--accent-primary)' }}
                                    ></div>
                                </div>
                                <div className="level-text">
                                    <span>{item.quantityMl} ml</span>
                                    <span className="capacity">/ 5000 ml</span>
                                </div>
                            </div>

                            <div className="stock-footer">
                                <span className="min-alert">Alerta Mín: {item.minAlertMl} ml</span>
                                {item.dailyUsageMl && (
                                    <span className="days-remaining">
                                        ~{Math.floor(item.quantityMl / item.dailyUsageMl)} días
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Inventory;
