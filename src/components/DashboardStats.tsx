'use client';

import { useMemo, useState } from 'react';
import { DatosFactura } from '../app/lib/geminiClient';

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
  items: Array<{proveedor: string, monto: number, descripcion: string}>;
}

export default function DashboardStats({ files }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<{month: string, data: MonthlyData} | null>(null);
  const [showModal, setShowModal] = useState(false);

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

    // Facturas por mes (usando fecha de emisión, no fecha de subida)
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
            items: [] as Array<{proveedor: string, monto: number, descripcion: string}>
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
    }, {} as Record<string, {count: number, total: number, name: string, items: Array<{proveedor: string, monto: number, descripcion: string}>}>);

    // Facturas próximas a vencer (en los próximos 30 días)
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
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopProviders = () => {
    return Object.entries(stats.providers)
      .sort(([,a], [,b]) => b - a)
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg sm:text-xl">📄</span>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Facturas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg sm:text-xl">✅</span>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Procesadas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.processedFiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg sm:text-xl">💰</span>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Gastos</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 text-lg sm:text-xl">⚠️</span>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Por Vencer</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingInvoices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles Financieros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Desglose Financiero</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Gastos</span>
              <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Impuestos</span>
              <span className="text-sm sm:text-base font-semibold text-red-600 dark:text-red-400">{formatCurrency(stats.totalTaxes)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Descuentos</span>
              <span className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400">{formatCurrency(stats.totalDiscounts)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Promedio por Factura</span>
              <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">{formatCurrency(stats.averageAmount)}</span>
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Categorías</h3>
          <div className="space-y-2 sm:space-y-3">
            {getTopCategories().map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getCategoryColor(category)}`}></div>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{category}</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proveedores */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Proveedores Principales</h3>
          <div className="space-y-2 sm:space-y-3">
            {getTopProviders().map(([provider, count]) => (
              <div key={provider} className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{provider}</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white ml-2">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico de Facturas por Mes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Facturas por Mes</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Análisis temporal de facturas procesadas
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Cantidad</span>
            <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Monto</span>
          </div>
        </div>
        
        <div className="relative">
          {/* Grid de fondo */}
          <div className="absolute inset-0 grid grid-cols-6 gap-1 sm:gap-2 opacity-20">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-r border-gray-300 dark:border-gray-600"></div>
            ))}
          </div>
          
          <div className="h-48 sm:h-64 flex items-end justify-between space-x-1 sm:space-x-2 overflow-x-auto relative z-10">
            {Object.entries(stats.monthlyData)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-6)
              .map(([month, data]) => {
                const maxCount = Math.max(...Object.values(stats.monthlyData).map(d => d.count));
                const maxAmount = Math.max(...Object.values(stats.monthlyData).map(d => d.total));
                const heightCount = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                const heightAmount = maxAmount > 0 ? (data.total / maxAmount) * 100 : 0;
                const date = new Date(month + '-01');
                const monthName = date.toLocaleDateString('es-MX', { month: 'short' });
                const year = date.getFullYear();
                
                return (
                  <div key={month} className="flex flex-col items-center min-w-0 flex-1 group">
                    {/* Barra de cantidad */}
                    <div className="relative w-full max-w-8 sm:max-w-10">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-600 cursor-pointer relative group/bar shadow-lg hover:shadow-xl"
                        style={{ height: `${heightCount}px` }}
                        title={`${data.name}: ${data.count} facturas - ${formatCurrency(data.total)}`}
                        onClick={() => handleBarClick(month, data)}
                      >
                        {/* Efecto de brillo */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent rounded-t-lg"></div>
                        
                        {/* Tooltip simple para hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                          <div className="font-semibold">{data.name}</div>
                          <div>{data.count} facturas - {formatCurrency(data.total)}</div>
                          <div className="text-center text-gray-300 text-xs mt-1">Click para más detalles</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                      
                      {/* Barra de monto (más pequeña, superpuesta) */}
                      {heightAmount > 0 && (
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-500 rounded-t-lg opacity-80 transition-all duration-300 hover:opacity-100"
                          style={{ height: `${heightAmount * 0.6}px` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent rounded-t-lg"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Etiquetas del eje X */}
                    <div className="mt-3 text-center">
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">{monthName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{year}</div>
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">{data.count}</div>
                    </div>
                  </div>
                );
              })}
          </div>
          
          {/* Leyenda y estadísticas adicionales */}
          <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                  {Object.values(stats.monthlyData).reduce((sum, data) => sum + data.count, 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Facturas</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(Object.values(stats.monthlyData).reduce((sum, data) => sum + data.total, 0))}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Monto</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                  {Object.values(stats.monthlyData).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Meses Activos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detallado de Mes */}
      {showModal && selectedMonth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📊</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedMonth.data.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Análisis detallado del mes
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Métricas Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedMonth.data.count}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      Facturas Procesadas
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(selectedMonth.data.total)}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Total Gastado
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(selectedMonth.data.total / selectedMonth.data.count)}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                      Promedio por Factura
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Items */}
              {selectedMonth.data.items.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Items de Facturas ({selectedMonth.data.items.length})
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total: {formatCurrency(selectedMonth.data.items.reduce((sum, item) => sum + item.monto, 0))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedMonth.data.items.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                {item.descripcion}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Proveedor: {item.proveedor}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(item.monto)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Información Adicional */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Información del Mes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Período:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedMonth.data.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Facturas Únicas:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedMonth.data.count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedMonth.data.items.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Promedio por Item:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatCurrency(selectedMonth.data.items.length > 0 ? selectedMonth.data.total / selectedMonth.data.items.length : 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 