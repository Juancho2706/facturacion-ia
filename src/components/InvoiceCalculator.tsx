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
        <div className="relative group bg-[#151B2D]/40 backdrop-blur-xl rounded-2xl p-8 border border-white/5 animate-fade-in">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                <svg className="w-32 h-32 text-blue-500 blur-2xl" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39h-2.05c-.15-.86-.82-1.77-2.66-1.77-1.59 0-2.05.97-2.05 1.55 0 .78.5 1.63 2.65 2.15 2.5.61 4.24 1.53 4.24 3.74 0 1.91-1.59 3.11-3.29 3.48z" /></svg>
            </div>

            <h2 className="text-2xl font-bold font-display text-white mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </span>
                Calculadora de Facturas
            </h2>

            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center border ${message.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    } animate-fade-in`}>
                    {message.type === 'success' ? (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Proveedor
                    </label>
                    <input
                        type="text"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        placeholder="Nombre de la empresa"
                        className="w-full px-4 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 bg-[#0B0C15]/50 text-white placeholder-gray-600 focus:outline-none transition-all"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Moneda
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-4 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 bg-[#0B0C15]/50 text-white focus:outline-none transition-all appearance-none"
                        >
                            <option value="MXN" className="bg-[#151B2D]">MXN (Pesos Mexicanos)</option>
                            <option value="USD" className="bg-[#151B2D]">USD (Dólares)</option>
                            <option value="EUR" className="bg-[#151B2D]">EUR (Euros)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            IVA (%)
                        </label>
                        <select
                            value={taxRate}
                            onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                            className="w-full px-4 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 bg-[#0B0C15]/50 text-white focus:outline-none transition-all appearance-none"
                        >
                            <option value="0.16" className="bg-[#151B2D]">16% (Estándar)</option>
                            <option value="0.08" className="bg-[#151B2D]">8% (Fronterizo)</option>
                            <option value="0" className="bg-[#151B2D]">0% (Exento)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-lg font-bold text-white">Detalle de Conceptos</h3>
                    <button
                        onClick={addItem}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest flex items-center transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Item
                    </button>
                </div>

                {items.map((item, index) => (
                    <div key={item.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-[#0B0C15]/30 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="flex-1 w-full">
                            <label className="block text-[10px] uppercase text-gray-500 mb-1 group-hover:text-blue-400 transition-colors">Descripción</label>
                            <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-white/5 rounded-lg focus:ring-1 focus:ring-blue-500 bg-[#151B2D]/50 text-white text-sm focus:outline-none placeholder-gray-600"
                                placeholder="Producto o servicio"
                            />
                        </div>
                        <div className="w-full md:w-24">
                            <label className="block text-[10px] uppercase text-gray-500 mb-1">Cant.</label>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-white/5 rounded-lg focus:ring-1 focus:ring-blue-500 bg-[#151B2D]/50 text-white text-sm focus:outline-none"
                            />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-[10px] uppercase text-gray-500 mb-1">Precio</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-white/5 rounded-lg focus:ring-1 focus:ring-blue-500 bg-[#151B2D]/50 text-white text-sm focus:outline-none"
                            />
                        </div>
                        <div className="w-full md:w-32 pt-2 md:pt-0 text-right md:text-left">
                            <label className="block text-[10px] uppercase text-gray-500 mb-1">Total</label>
                            <div className="text-sm font-bold text-white py-2">
                                {formatCurrency(item.quantity * item.unitPrice)}
                            </div>
                        </div>
                        <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-600 hover:text-red-400 p-2 transition-colors self-end md:self-center"
                            disabled={items.length === 1}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/5 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/20 transform transition-all active:scale-95 hover:scale-[1.02] flex items-center justify-center"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
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

                    <div className="w-full md:w-80 space-y-4 bg-[#0B0C15]/50 p-6 rounded-2xl border border-white/5">
                        <div className="flex justify-between text-gray-400 text-sm">
                            <span>Subtotal:</span>
                            <span className="font-mono">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 text-sm">
                            <span>IVA ({(taxRate * 100).toFixed(0)}%):</span>
                            <span className="font-mono">{formatCurrency(taxes)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-white pt-4 border-t border-white/10">
                            <span>Total:</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
