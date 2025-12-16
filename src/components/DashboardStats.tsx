'use client';

import { useMemo } from 'react';
import InfoTooltip from './InfoTooltip';
import ExpenseEvolution from './ExpenseEvolution';

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

export default function DashboardStats({ files }: Props) {
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

    // Categorías for side panel
    const categories = processedFiles.reduce((acc, file) => {
      const categoria = file.categoria || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
      upcomingInvoices: upcomingInvoices.length,
      averageAmount: processedFiles.length > 0 ? totalAmount / processedFiles.length : 0,
    };
  }, [files]);

  const getTopCategories = () => {
    return Object.entries(stats.categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
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
        {/* 2. Gráfico Principal (Timeline) - REPLACED with ExpenseEvolution */}
        <div className="lg:col-span-2">
          <ExpenseEvolution files={files} />
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
    </div>
  );
}