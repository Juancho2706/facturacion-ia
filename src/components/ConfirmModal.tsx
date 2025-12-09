'use client';

import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false
}: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0B0C15]/80 backdrop-blur-md animate-fade-in"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative bg-[#151B2D]/90 border border-white/10 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full mx-2 sm:mx-4 transform transition-all animate-scale-in overflow-hidden group">
        <div className={`absolute top-0 left-0 w-full h-1 ${isDestructive ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${isDestructive
                ? 'bg-red-500/10 text-red-500 shadow-red-500/10'
                : 'bg-blue-500/10 text-blue-500 shadow-blue-500/20'
              }`}>
              <span className="text-2xl">
                {isDestructive ? '⚠️' : '❓'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors duration-200 p-2 hover:bg-white/5 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 leading-relaxed text-sm">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 p-6 bg-[#0B0C15]/30 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all duration-200 text-sm border border-white/5"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`w-full sm:w-auto px-6 py-2.5 text-white rounded-xl font-bold transition-all duration-200 text-sm shadow-lg transform hover:scale-105 active:scale-95 ${isDestructive
                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/20'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/20'
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 