'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface CalculatorItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

interface Props {
    user: User | null;
    onInvoiceSaved?: () => void;
}

export default function InvoiceCalculator({ user, onInvoiceSaved }: Props) {
    const supabase = createClient();
    const [items, setItems] = useState<CalculatorItem[]>([
        { id: '1', description: '', quantity: 1, unitPrice: 0 }
    ]);
    const [provider, setProvider] = useState('');
    const [currency, setCurrency] = useState('MXN');
    const [taxRate, setTaxRate] = useState(0.16); // 16% IVA default
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const addItem = () => {
        setItems([
            ...items,
            { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }
        ]);
    };

    const removeItem = (id: string) => {
        if (items.length === 1) return;
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof CalculatorItem, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxes = subtotal * taxRate;
        const total = subtotal + taxes;
        return { subtotal, taxes, total };
    };

    const { subtotal, taxes, total } = calculateTotals();

    const handleSave = async () => {
        if (!user) return;
        if (!provider.trim()) {
            setMessage({ type: 'error', text: 'El nombre del proveedor es requerido' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            // 1. Crear registro en la base de datos
            const { error } = await supabase.from('files').insert({
                user_id: user.id,
                file_path: `manual/${Date.now()}_calculator.pdf`, // Placeholder path
                status: 'processed',
                proveedor: provider,
                fecha: new Date().toISOString().split('T')[0],
                monto: total,
                moneda: currency,
                impuestos: taxes,
                subtotal: subtotal,
                items: items.map(item => ({
                    descripcion: item.description,
                    cantidad: item.quantity,
                    precioUnitario: item.unitPrice,
                    subtotal: item.quantity * item.unitPrice
                })),
                categoria: 'Manual',
                metodoPago: 'Por definir'
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Factura guardada exitosamente' });

            // Reset form
            setItems([{ id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
            setProvider('');

            if (onInvoiceSaved) {
                onInvoiceSaved();
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
            setMessage({ type: 'error', text: 'Error al guardar la factura' });
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Calculadora de Facturas</h2>

            {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Proveedor
                    </label>
                    <input
                        type="text"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        placeholder="Nombre de la empresa"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Moneda
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="MXN">MXN</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            IVA (%)
                        </label>
                        <select
                            value={taxRate}
                            onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="0.16">16%</option>
                            <option value="0.08">8%</option>
                            <option value="0">0%</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
                    <button
                        onClick={addItem}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Item
                    </button>
                </div>

                {items.map((item, index) => (
                    <div key={item.id} className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <div className="flex-1 w-full">
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Descripción</label>
                            <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="Producto o servicio"
                            />
                        </div>
                        <div className="w-full md:w-24">
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Cant.</label>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Precio Unit.</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                        </div>
                        <div className="w-full md:w-32 pt-2 md:pt-0 text-right md:text-left">
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Total</label>
                            <div className="text-sm font-medium text-gray-900 dark:text-white py-2">
                                {formatCurrency(item.quantity * item.unitPrice)}
                            </div>
                        </div>
                        <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                            disabled={items.length === 1}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Guardar Factura
                            </>
                        )}
                    </button>

                    <div className="w-full md:w-64 space-y-3">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>IVA ({(taxRate * 100).toFixed(0)}%):</span>
                            <span>{formatCurrency(taxes)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-600">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
