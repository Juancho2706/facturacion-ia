'use client';

import { useMemo, useState } from 'react';
import InfoTooltip from './InfoTooltip';

interface FileData {
    id: string;
    file_path: string;
    created_at: string;
    user_id: string;
    status: string;
    extracted_text: string | null;
    proveedor: string | null;
    fecha: string | null;
    monto: number | null;
    numeroFactura: string | null;
    categoria: string | null;
    moneda: string | null;
    impuestos: number | null;
    subtotal: number | null;
    descuentos: number | null;
    fechaVencimiento: string | null;
    metodoPago: string | null;
    direccionProveedor: string | null;
    rfcProveedor: string | null;
    items: any[];
}

interface Props {
    files: FileData[];
}

interface MonthlyData {
    monthKey: string;
    name: string;
    count: number;
    total: number;
    taxes: number;
    discounts: number;
    topCategory: string;
    prevTotal: number;
}

export default function ExpenseEvolution({ files }: Props) {
    const [timeRange, setTimeRange] = useState<'6m' | 'year' | 'all'>('6m');
    const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
    const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

    const processedData = useMemo(() => {
        const processedFiles = files.filter(f => f.status === 'processed' && f.fecha);

        // Agrupar por mes
        const textData: Record<string, {
            total: number,
            count: number,
            taxes: number,
            discounts: number,
            categories: Record<string, number>,
            name: string,
            date: Date
        }> = {};

        processedFiles.forEach(file => {
            if (!file.fecha) return;
            const date = new Date(file.fecha);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const name = date.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });

            if (!textData[key]) {
                textData[key] = {
                    total: 0,
                    count: 0,
                    taxes: 0,
                    discounts: 0,
                    categories: {},
                    name,
                    date
                };
            }

            const cantidad = file.monto || 0;
            textData[key].total += cantidad;
            textData[key].count += 1;
            textData[key].taxes += file.impuestos || 0;
            textData[key].discounts += file.descuentos || 0;

            const cat = file.categoria || 'Otros';
            textData[key].categories[cat] = (textData[key].categories[cat] || 0) + cantidad;
        });

        // Convertir a array y ordenar
        let dataArray = Object.entries(textData).map(([key, data]) => {
            const topCategoryEntry = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0];
            return {
                monthKey: key,
                ...data,
                topCategory: topCategoryEntry ? topCategoryEntry[0] : 'N/A'
            };
        }).sort((a, b) => a.date.getTime() - b.date.getTime());

        // Calcular cambios porcentuales y limpiar
        const enrichedData: MonthlyData[] = dataArray.map((curr, idx) => {
            const prev = dataArray[idx - 1];
            return {
                monthKey: curr.monthKey,
                name: curr.name,
                count: curr.count,
                total: curr.total,
                taxes: curr.taxes,
                discounts: curr.discounts,
                topCategory: curr.topCategory,
                prevTotal: prev ? prev.total : 0
            };
        });

        // Filtrar por rango de tiempo
        if (timeRange === '6m') {
            return enrichedData.slice(-6);
        } else if (timeRange === 'year') {
            const currentYear = new Date().getFullYear();
            return enrichedData.filter(d => d.monthKey.startsWith(String(currentYear)));
        }

        return enrichedData;
    }, [files, timeRange]);

    const maxTotal = Math.max(...processedData.map(d => d.total), 1);
    const formatCurrency = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="bg-[#151B2D]/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Evolución de Gastos
                        <InfoTooltip content="Análisis detallado de tus gastos a lo largo del tiempo." />
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Tendencias y desglose mensual
                    </p>
                </div>

                <div className="flex items-center bg-[#0B0C15]/50 rounded-lg p-1 border border-white/5">
                    {(['6m', 'year', 'all'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === range
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {range === '6m' ? '6 Meses' : range === 'year' ? 'Año Actual' : 'Histórico'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Section */}
            <div className="relative h-72 w-full p-6 sm:p-8 pb-2">
                {processedData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 flex-col">
                        <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        <p>No hay datos suficientes para mostrar</p>
                    </div>
                ) : (
                    <div className="flex items-end justify-between h-full space-x-2 sm:space-x-4">
                        {processedData.map((data, idx) => {
                            const heightPercent = (data.total / maxTotal) * 100;
                            const isHovered = hoveredMonth === data.monthKey;

                            return (
                                <div
                                    key={data.monthKey}
                                    className="flex-1 h-full flex flex-col items-center justify-end group relative"
                                    onMouseEnter={() => setHoveredMonth(data.monthKey)}
                                    onMouseLeave={() => setHoveredMonth(null)}
                                >
                                    {/* Tooltip on Hover */}
                                    <div className={`absolute bottom-full mb-2 bg-[#151B2D] border border-white/10 p-3 rounded-xl shadow-2xl z-20 pointer-events-none transition-all duration-200 w-48 text-left ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                                        <p className="font-bold text-white border-b border-white/10 pb-1 mb-2">{data.name}</p>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between"><span className="text-gray-400">Total:</span> <span className="text-white font-mono">{formatCurrency(data.total)}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-400">Impuestos:</span> <span className="text-red-300 font-mono">{formatCurrency(data.taxes)}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-400">Top Cat:</span> <span className="text-blue-300">{data.topCategory}</span></div>
                                        </div>
                                    </div>

                                    {/* Bar */}
                                    <div className="w-full flex-1 relative flex items-end justify-center">
                                        <div
                                            className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 relative overflow-hidden ${isHovered ? 'bg-gradient-to-t from-blue-500 to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-white/5 hover:bg-white/10'}`}
                                            style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                        >
                                            {/* Inner Bar Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <span className={`text-[10px] uppercase font-bold mt-3 transition-colors ${isHovered ? 'text-white' : 'text-gray-500'}`}>
                                        {data.name.split(' ')[0].substring(0, 3)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detailed Data Table */}
            <div className="p-6 sm:p-8 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Detalle Mensual</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-white/5">
                                <th className="py-2 font-medium">Mes</th>
                                <th className="py-2 font-medium text-right">Facturas</th>
                                <th className="py-2 font-medium pl-4">Categoría Principal</th>
                                <th className="py-2 font-medium text-right">Impuestos</th>
                                <th className="py-2 font-medium text-right">Total</th>
                                <th className="py-2 font-medium text-right">Tendencia</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {processedData.slice().reverse().map((row) => {
                                const growth = row.prevTotal > 0 ? ((row.total - row.prevTotal) / row.prevTotal) * 100 : 0;
                                const isPositive = growth > 0;

                                return (
                                    <tr key={row.monthKey} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-gray-300">
                                        <td className="py-3 font-medium text-white capitalize">{row.name}</td>
                                        <td className="py-3 text-right font-mono text-xs">{row.count}</td>
                                        <td className="py-3 pl-4">
                                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-xs border border-blue-500/20">
                                                {row.topCategory}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right font-mono text-xs text-red-300">{formatCurrency(row.taxes)}</td>
                                        <td className="py-3 text-right font-mono font-bold text-white">{formatCurrency(row.total)}</td>
                                        <td className="py-3 text-right">
                                            {row.prevTotal === 0 ? (
                                                <span className="text-gray-500 text-xs">-</span>
                                            ) : (
                                                <span className={`text-xs font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-red-400' : 'text-green-400'}`}>
                                                    {isPositive ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
