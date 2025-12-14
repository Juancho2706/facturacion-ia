'use client';

import { useMemo, useState } from 'react';
import { DatosFactura } from '../app/lib/geminiClient';
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
  count: number;
  total: number;
  name: string;
  items: Array<{ proveedor: string, monto: number, descripcion: string }>;
}

export default function DashboardStats({ files }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<{ month: string, data: MonthlyData } | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Tips dictionary
  const tips = {
    totalFiles: "Número total de documentos que has subido a la plataforma, incluyendo pendientes y procesados.",
    processedFiles: "Facturas que han sido analizadas exitosamente por la Inteligencia Artificial.",
    totalAmount: "Suma de todos los montos totales de las facturas procesadas.",
    upcoming: "Facturas cuya fecha de vencimiento es en los próximos 30 días.",
    financials: "Desglose de los costos reales (subtotal), carga fiscal (impuestos) y ahorros (descuentos)."
  };

  const stats = useMemo(() => {
    const processedFiles = files.filter(f => f.status === 'processed');
    const totalAmount = processedFiles.reduce((sum, file) => {
      const monto = parseFloat(file.monto?.toString() || '0');
      return sum + monto;
    }, 0);

    const totalTaxes = processedFiles.reduce((sum, file) => {
      const impuestos = parseFloat(file.impuestos?.toString() || '0');
      return sum + impuestos;
    }, 0);

    const totalDiscounts = processedFiles.reduce((sum, file) => {
      const descuentos = parseFloat(file.descuentos?.toString() || '0');
      return sum + descuentos;
    }, 0);

    // Categorías
    const categories = processedFiles.reduce((acc, file) => {
      const categoria = file.categoria || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Proveedores más frecuentes
    const providers = processedFiles.reduce((acc, file) => {
      const proveedor = file.proveedor || 'Sin proveedor';
      acc[proveedor] = (acc[proveedor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Facturas por mes
    const monthlyData = processedFiles.reduce((acc, file) => {
      if (file.fecha) {
        const date = new Date(file.fecha);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
        if (!acc[monthKey]) {
          acc[monthKey] = {
            count: 0,
            total: 0,
            name: monthName,
            items: [] as Array<{ proveedor: string, monto: number, descripcion: string }>
          };
        }
        acc[monthKey].count += 1;
        acc[monthKey].total += file.monto || 0;

        // Agregar items para el tooltip
        if (file.items && Array.isArray(file.items)) {
          file.items.forEach((item: any) => {
            acc[monthKey].items.push({
              proveedor: file.proveedor || 'Sin proveedor',
              monto: item.subtotal || 0,
              descripcion: item.descripcion || 'Sin descripción'
            });
          });
        } else {
          // Si no hay items, agregar la factura completa
          acc[monthKey].items.push({
            proveedor: file.proveedor || 'Sin proveedor',
            monto: file.monto || 0,
            descripcion: file.numeroFactura || 'Factura sin número'
          });
        }
      }
      return acc;
    }, {} as Record<string, { count: number, total: number, name: string, items: Array<{ proveedor: string, monto: number, descripcion: string }> }>);

    // Facturas próximas a vencer
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingInvoices = processedFiles.filter(file => {
      if (!file.fechaVencimiento) return false;
      const dueDate = new Date(file.fechaVencimiento);
      return dueDate >= today && dueDate <= thirtyDaysFromNow;
    });

    return {
      totalFiles: files.length,
      processedFiles: processedFiles.length,
      totalAmount,
      totalTaxes,
      totalDiscounts,
      categories,
      providers,
      monthlyData,
      upcomingInvoices: upcomingInvoices.length,
      averageAmount: processedFiles.length > 0 ? totalAmount / processedFiles.length : 0,
    };
  }, [files]);

  const getTopCategories = () => {
    return Object.entries(stats.categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getTopProviders = () => {
    return Object.entries(stats.providers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Servicios': 'bg-blue-500',
      'Productos': 'bg-green-500',
      'Impuestos': 'bg-red-500',
      'Transporte': 'bg-yellow-500',
      'Oficina': 'bg-purple-500',
      'Marketing': 'bg-pink-500',
      'Sin categoría': 'bg-gray-500',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const handleBarClick = (month: string, data: MonthlyData) => {
    setSelectedMonth({ month, data });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMonth(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, subValue, tip, color = "blue", delay = 0, tooltipPlacement = "bottom-end" }: any) => (
    <div className={`relative group bg-[#151B2D]/40 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-[#151B2D]/60 transition-all duration-300 animate-fade-in-up`} style={{ animationDelay: `${delay}ms` }}>
      {/* Background & Decoration Layer (Clipped) */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl select-none filter blur-sm`}>
          {icon}
        </div>
      </div>

      {/* Content Layer (Visible Overflow for Tooltips) */}
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg ${color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
            color === 'green' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
              color === 'orange' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                'bg-gray-500/10 text-gray-400 border border-gray-500/20'
            }`}>
            {icon}
          </div>
          <InfoTooltip content={tip} placement={tooltipPlacement} />
        </div>

        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-xl sm:text-3xl font-bold text-white tracking-tight truncate" title={value}>{value}</h3>
          {subValue && (
            <p className="text-xs text-blue-300/80 mt-2 font-medium flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* 1. Métricas Principales (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Facturas"
          value={stats.totalFiles}
          subValue={`${stats.processedFiles} procesadas`}
          icon="📄"
          tip={tips.totalFiles}
          delay={0}
          tooltipPlacement="bottom-start"
        />
        <StatCard
          title="Gastos Totales"
          value={formatCurrency(stats.totalAmount)}
          icon="💰"
          color="green"
          tip={tips.totalAmount}
          delay={100}
        />
        <StatCard
          title="Por Vencer (30d)"
          value={stats.upcomingInvoices}
          subValue="Requieren atención"
          icon="⚠️"
          color="orange"
          tip={tips.upcoming}
          delay={200}
        />
        <StatCard
          title="Promedio Gasto"
          value={formatCurrency(stats.averageAmount)}
          subValue="Por factura procesada"
          icon="📈"
          color="gray"
          tip="Monto promedio por factura. Útil para detectar desviaciones."
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Gráfico Principal (Timeline) */}
        <div className="lg:col-span-2 bg-[#151B2D]/40 backdrop-blur-xl rounded-2xl border border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none rounded-2xl overflow-hidden" />

          <div className="relative z-10 flex items-center justify-between mb-8 p-6 sm:p-8 pb-0">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center">
                Evolución de Gastos
                <InfoTooltip content="Historial de gastos acumulados por mes." size="md" />
              </h3>
              <p className="text-sm text-gray-400 mt-1">Análisis mensual de facturación</p>
            </div>
          </div>

          <div className="relative z-10 h-64 flex items-end justify-between space-x-4 p-6 sm:p-8 pt-0">
            {Object.entries(stats.monthlyData)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-6)
              .map(([month, data], index) => {
                const maxAmount = Math.max(...Object.values(stats.monthlyData).map(d => d.total));
                const heightPercent = maxAmount > 0 ? (data.total / maxAmount) * 100 : 0;
                const date = new Date(month + '-01');

                return (
                  <div key={month} className="flex-1 flex flex-col items-center group cursor-pointer" onClick={() => handleBarClick(month, data)}>
                    <div className="w-full bg-white/5 rounded-2xl relative h-48 overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-purple-600 group-hover:to-purple-400 transition-all duration-500 rounded-t-lg flex items-end justify-center pb-2 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]"
                        style={{ height: `${heightPercent}%`, transitionDelay: `${index * 50}ms` }}
                      >
                        <span className="text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity transformtranslate-y-2 group-hover:translate-y-0 duration-300 drop-shadow-md">
                          {formatCurrency(data.total)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 mt-3 group-hover:text-white transition-colors">
                      {date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 3. Desglose Financiero (Side Panel) */}
        <div className="relative bg-[#151B2D] rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="relative z-10 p-6 sm:p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center text-white">
              Balance Fiscal
              <div className="ml-2 bg-white/10 rounded-full p-1 hover:bg-white/20 transition-colors">
                <InfoTooltip content={tips.financials} placement="bottom-end" />
              </div>
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-3">
                <span className="text-gray-400 text-sm">Impuestos (IVA/ISR)</span>
                <span className="text-xl font-mono font-bold text-red-400">{formatCurrency(stats.totalTaxes)}</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-3">
                <span className="text-gray-400 text-sm">Descuentos</span>
                <span className="text-xl font-mono font-bold text-green-400">{formatCurrency(stats.totalDiscounts)}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-white font-medium">Neto Pagado</span>
                <span className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {formatCurrency(stats.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 p-6 sm:p-8 pt-0">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Top Categorías</h4>
            <div className="flex flex-wrap gap-2">
              {getTopCategories().map(([cat, count]) => (
                <span key={cat} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium border border-white/5 transition-all cursor-default text-gray-300">
                  {cat} <span className="text-blue-400 font-bold ml-1">{count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detallado de Mes */}
      {showModal && selectedMonth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#151B2D] border border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col relative">
            {/* Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 blur-sm mix-blend-screen" />

            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0B0C15]/50">
              <div>
                <h3 className="text-2xl font-bold font-display text-white">
                  {selectedMonth.data.name}
                </h3>
                <p className="text-sm text-gray-400">Detalle de movimientos</p>
              </div>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenido (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                  <span className="text-blue-400 text-3xl font-bold font-mono block">{selectedMonth.data.count}</span>
                  <span className="text-blue-300/60 text-xs font-bold uppercase">Facturas</span>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl text-center">
                  <span className="text-green-400 text-3xl font-bold font-mono block truncate" title={formatCurrency(selectedMonth.data.total)}>{formatCurrency(selectedMonth.data.total)}</span>
                  <span className="text-green-300/60 text-xs font-bold uppercase">Total</span>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl text-center">
                  <span className="text-purple-400 text-3xl font-bold font-mono block truncate" title={formatCurrency(selectedMonth.data.total / selectedMonth.data.count)}>{formatCurrency(selectedMonth.data.total / selectedMonth.data.count)}</span>
                  <span className="text-purple-300/60 text-xs font-bold uppercase">Promedio</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Transacciones</h4>
              <div className="space-y-3">
                {selectedMonth.data.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                    <div>
                      <p className="font-bold text-white mb-1">{item.proveedor}</p>
                      <p className="text-xs text-gray-400">{item.descripcion}</p>
                    </div>
                    <span className="font-mono font-bold text-white ml-4">{formatCurrency(item.monto)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 