'use client';

import React, { useState } from 'react';
import { DatosFactura } from '../app/lib/geminiClient';
import InfoTooltip from './InfoTooltip';

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

  const tips = {
    proveedor: "Entidad comercial que emitió esta factura.",
    numero: "Folio fiscal único que identifica esta transacción.",
    fecha: "Fecha oficial de emisión del documento.",
    vencimiento: "Fecha límite para realizar el pago.",
    monto: "Suma total a pagar (Subtotal + Impuestos - Descuentos).",
    subtotal: "Costo antes de impuestos y descuentos.",
    impuestos: "Monto de impuestos (IVA, ISR, etc.).",
    descuentos: "Reducciones aplicadas al precio.",
    categoria: "Clasificación del gasto.",
    metodo: "Método de pago utilizado.",
    moneda: "Divisa de la transacción.",
    rfc: "RFC del emisor.",
    items: "Lista de productos o servicios."
  };

  const renderEditField = (label: string, value: string | number | null, field: keyof DatosFactura, tip: string, type: 'text' | 'number' = 'text') => {
    return (
      <div className="flex flex-col space-y-2">
        <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center">
          {label}
          <div className="ml-1 text-blue-400">
            <InfoTooltip content={tip} />
          </div>
        </div>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => setEditData(prev => ({ ...prev, [field]: e.target.value }))}
          className="px-4 py-3 border border-white/10 rounded-xl text-sm bg-[#0B0C15]/50 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all outline-none placeholder-gray-600"
        />
      </div>
    );
  };

  const renderInfoCard = (label: string, value: string | null, tip: string, icon: React.ReactNode) => (
    <div className="bg-[#0B0C15]/30 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 flex items-start space-x-4 hover:bg-[#0B0C15]/50 transition-all duration-300 min-w-0 group">
      <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 flex items-center mb-1 group-hover:text-blue-300 transition-colors">
          {label}
          <div className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <InfoTooltip content={tip} />
          </div>
        </div>
        <div className="font-bold text-white text-sm sm:text-base break-words truncate" title={value || ''}>
          {value || '---'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-[#151B2D]/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl animate-fade-in">
      <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 bg-[#151B2D]/60 px-6 py-4 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <span className="text-2xl filter drop-shadow-md">🧾</span>
          <h3 className="text-lg font-bold text-white tracking-tight">Detalle de Factura</h3>
        </div>
        {!isEditMode && onEdit && (
          <button
            onClick={() => setIsEditMode(true)}
            className="text-blue-400 hover:text-blue-300 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <span>✏️</span>
            <span className="hidden sm:inline">Editar</span>
          </button>
        )}
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {isEditMode ? (
          // ====== MODO EDICIÓN ======
          <div className="animate-fade-in-up space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {renderEditField('Proveedor', editData.proveedor, 'proveedor', tips.proveedor)}
              {renderEditField('Folio', editData.numeroFactura, 'numeroFactura', tips.numero)}
              {renderEditField('Fecha', editData.fecha, 'fecha', tips.fecha)}
              {renderEditField('Vencimiento', editData.fechaVencimiento, 'fechaVencimiento', tips.vencimiento)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {renderEditField('Subtotal', editData.subtotal, 'subtotal', tips.subtotal, 'number')}
              {renderEditField('Impuestos', editData.impuestos, 'impuestos', tips.impuestos, 'number')}
              {renderEditField('Total', editData.monto, 'monto', tips.monto, 'number')}
            </div>
            <div className="flex space-x-4 pt-6 border-t border-white/5">
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transform transition-all active:scale-95 hover:scale-[1.02]"
              >
                Guardar Cambios
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl font-bold transition-all hover:text-white border border-white/5"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          // ====== MODO VISUALIZACIÓN (HERO LAYOUT) ======
          <div className="animate-fade-in space-y-8">

            {/* 1. HERO TOTAL SECTION - Full Width */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-center text-white shadow-xl shadow-blue-900/40 group">
              <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[200%] bg-white/10 rotate-12 blur-3xl group-hover:rotate-45 transition-transform duration-1000 ease-in-out pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-blue-200/80 text-xs font-bold uppercase tracking-[0.3em] mb-4 flex items-center justify-center">
                  Monto Total
                  <div className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
                    <InfoTooltip content={tips.monto} />
                  </div>
                </div>
                {/* Responsive Typography */}
                <div className="text-5xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter drop-shadow-2xl mb-6 break-words w-full px-2">
                  {formatCurrency(datos.monto, datos.moneda)}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-lg ${datos.status === 'paid' ? 'bg-green-500/20 border-green-500/30 text-green-200' : 'bg-blue-400/20 border-blue-400/30 text-blue-100'
                  }`}>
                  {datos.status === 'paid' ? 'Pagado' : 'Procesado Exitosamente'}
                </div>
              </div>
            </div>

            {/* 2. MAIN DETAILS - Grid for Cards (Mobile: 2 cols, Desktop: 4 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderInfoCard('Proveedor', datos.proveedor, tips.proveedor,
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              )}
              {renderInfoCard('Fecha', formatDate(datos.fecha), tips.fecha,
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
              {renderInfoCard('Categoría', datos.categoria, tips.categoria,
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              )}
              {renderInfoCard('RFC / ID', datos.rfcProveedor, tips.rfc,
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .667.333 1 1 1v1m2-2c0 .667-.333 1-1 1v1" /></svg>
              )}
            </div>

            {/* 3. FINANCIAL BREAKDOWN STRIP - Mini Cards in Grid */}
            <div className="bg-[#0B0C15]/30 rounded-2xl p-6 border border-white/5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                <span className="w-8 h-[1px] bg-blue-500 mr-2"></span>
                Desglose Financiero
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex flex-col p-4 bg-[#151B2D]/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">Subtotal</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-white break-words">{formatCurrency(datos.subtotal, datos.moneda)}</div>
                </div>
                <div className="flex flex-col p-4 bg-[#151B2D]/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">Impuestos</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-red-400 break-words">{formatCurrency(datos.impuestos, datos.moneda)}</div>
                </div>
                <div className="flex flex-col p-4 bg-[#151B2D]/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">Descuentos</div>
                  <div className="text-base sm:text-lg font-mono font-bold text-green-400 break-words">{formatCurrency(datos.descuentos, datos.moneda)}</div>
                </div>
                <div className="flex flex-col p-4 bg-[#151B2D]/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">Método</div>
                  <div className="text-base sm:text-lg font-bold text-white break-words">{datos.metodoPago || '---'}</div>
                </div>
              </div>
            </div>

            {/* 4. ITEMS TABLE */}
            {datos.items && datos.items.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-white/5 bg-[#151B2D]/30">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-[#0B0C15]/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cant.</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Precio</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {datos.items.map((item, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm text-white font-medium break-words max-w-[200px]">{item.descripcion}</td>
                          <td className="px-6 py-4 text-sm text-gray-400 text-right font-mono">{item.cantidad}</td>
                          <td className="px-6 py-4 text-sm text-gray-400 text-right whitespace-nowrap font-mono">{formatCurrency(item.precioUnitario, datos.moneda)}</td>
                          <td className="px-6 py-4 text-sm text-blue-300 font-bold text-right whitespace-nowrap font-mono">{formatCurrency(item.subtotal || 0, datos.moneda)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}