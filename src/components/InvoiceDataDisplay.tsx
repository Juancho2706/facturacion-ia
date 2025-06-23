'use client';

import { useState } from 'react';
import { DatosFactura } from '../app/lib/geminiClient';

interface Props {
  datos: DatosFactura;
  onEdit?: (datos: DatosFactura) => void;
  onSave?: (datos: DatosFactura) => void;
  isEditing?: boolean;
}

export default function InvoiceDataDisplay({ datos, onEdit, onSave, isEditing = false }: Props) {
  const [editData, setEditData] = useState<DatosFactura>(datos);
  const [isEditMode, setIsEditMode] = useState(isEditing);

  const handleSave = () => {
    if (onSave) {
      onSave(editData);
    }
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditData(datos);
    setIsEditMode(false);
  };

  const formatCurrency = (amount: number | null, currency: string | null = 'MXN') => {
    if (amount === null) return 'N/A';
    const formatter = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN',
    });
    return formatter.format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string | null) => {
    const colors = {
      'Servicios': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Productos': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Impuestos': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Transporte': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Oficina': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Marketing': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Otros': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[category as keyof typeof colors] || colors['Otros'];
  };

  // Contar campos encontrados
  const camposEncontrados = Object.values(datos).filter(valor => 
    valor !== null && valor !== undefined && valor !== ''
  ).length;
  const totalCampos = Object.keys(datos).length;

  const getResumenColor = () => {
    const porcentaje = (camposEncontrados / totalCampos) * 100;
    if (porcentaje >= 80) return 'text-green-600 dark:text-green-400';
    if (porcentaje >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const renderField = (label: string, value: string | number | null, type: 'text' | 'currency' | 'date' = 'text') => {
    let displayValue = 'No encontrado';
    let hasValue = false;
    
    if (value !== null && value !== undefined && value !== '') {
      hasValue = true;
      switch (type) {
        case 'currency':
          displayValue = formatCurrency(value as number, datos.moneda);
          break;
        case 'date':
          displayValue = formatDate(value as string);
          break;
        default:
          displayValue = String(value);
      }
    }

    return (
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-2">
          <span>{label}</span>
          {hasValue ? (
            <span className="text-green-500 text-xs">✓</span>
          ) : (
            <span className="text-gray-400 text-xs">○</span>
          )}
        </label>
        <span className={`text-sm font-medium ${
          hasValue 
            ? 'text-gray-900 dark:text-white' 
            : 'text-gray-400 dark:text-gray-500 italic'
        }`}>
          {displayValue}
        </span>
      </div>
    );
  };

  const renderEditField = (label: string, value: string | number | null, field: keyof DatosFactura, type: 'text' | 'number' = 'text') => {
    return (
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </label>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => setEditData(prev => ({ ...prev, [field]: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-base sm:text-lg">📄</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-base sm:text-lg">Datos Extraídos</h3>
              <p className="text-blue-100 text-xs sm:text-sm">Información procesada por IA</p>
            </div>
          </div>
          
          {!isEditMode && onEdit && (
            <button
              onClick={() => setIsEditMode(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 self-start sm:self-auto"
            >
              ✏️ Editar
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Resumen de campos encontrados */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm">📊</span>
              </div>
              <div>
                <h4 className="text-blue-800 dark:text-blue-200 font-semibold text-xs sm:text-sm">
                  Resumen de Extracción
                </h4>
                <p className={`text-xs font-medium ${getResumenColor()}`}>
                  {camposEncontrados} de {totalCampos} campos encontrados 
                  ({Math.round((camposEncontrados / totalCampos) * 100)}%)
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {camposEncontrados}
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-300">
                campos
              </div>
            </div>
          </div>
        </div>

        {isEditMode ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Información Principal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {renderEditField('Proveedor', editData.proveedor, 'proveedor')}
              {renderEditField('Número de Factura', editData.numeroFactura, 'numeroFactura')}
              {renderEditField('Fecha', editData.fecha, 'fecha')}
              {renderEditField('Fecha de Vencimiento', editData.fechaVencimiento, 'fechaVencimiento')}
            </div>

            {/* Montos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {renderEditField('Subtotal', editData.subtotal, 'subtotal', 'number')}
              {renderEditField('Impuestos', editData.impuestos, 'impuestos', 'number')}
              {renderEditField('Descuentos', editData.descuentos, 'descuentos', 'number')}
            </div>

            {/* Información Adicional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {renderEditField('Categoría', editData.categoria, 'categoria')}
              {renderEditField('Método de Pago', editData.metodoPago, 'metodoPago')}
              {renderEditField('Moneda', editData.moneda, 'moneda')}
              {renderEditField('RFC Proveedor', editData.rfcProveedor, 'rfcProveedor')}
            </div>

            {/* Dirección */}
            <div>
              {renderEditField('Dirección del Proveedor', editData.direccionProveedor, 'direccionProveedor')}
            </div>

            {/* Items de la Factura */}
            {editData.items && editData.items.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Items de la Factura</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3">
                    {editData.items.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{item.descripcion}</p>
                          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.cantidad && <span>Cantidad: {item.cantidad}</span>}
                            {item.precioUnitario && <span>Precio: {formatCurrency(item.precioUnitario, editData.moneda)}</span>}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                            {formatCurrency(item.subtotal || 0, editData.moneda)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                💾 Guardar Cambios
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Monto Total - Destacado */}
            {datos.monto && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-green-700">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Monto Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(datos.monto, datos.moneda)}
                  </p>
                </div>
              </div>
            )}

            {/* Información Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                {renderField('Proveedor', datos.proveedor)}
                {renderField('Número de Factura', datos.numeroFactura)}
                {renderField('Fecha', datos.fecha, 'date')}
                {renderField('Fecha de Vencimiento', datos.fechaVencimiento, 'date')}
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {datos.categoria && (
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      Categoría
                    </label>
                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(datos.categoria)}`}>
                      {datos.categoria}
                    </span>
                  </div>
                )}
                {renderField('Método de Pago', datos.metodoPago)}
                {renderField('Moneda', datos.moneda)}
                {renderField('RFC Proveedor', datos.rfcProveedor)}
              </div>
            </div>

            {/* Desglose de Montos */}
            {(datos.subtotal || datos.impuestos || datos.descuentos) && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Desglose de Montos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {renderField('Subtotal', datos.subtotal, 'currency')}
                  {renderField('Impuestos', datos.impuestos, 'currency')}
                  {renderField('Descuentos', datos.descuentos, 'currency')}
                </div>
              </div>
            )}

            {/* Dirección del Proveedor */}
            {datos.direccionProveedor && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dirección del Proveedor</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{datos.direccionProveedor}</p>
              </div>
            )}

            {/* Items de la Factura */}
            {datos.items && datos.items.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Items de la Factura</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3">
                    {datos.items.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{item.descripcion}</p>
                          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.cantidad && <span>Cantidad: {item.cantidad}</span>}
                            {item.precioUnitario && <span>Precio: {formatCurrency(item.precioUnitario, datos.moneda)}</span>}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                            {formatCurrency(item.subtotal || 0, datos.moneda)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 