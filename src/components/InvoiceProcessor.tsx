'use client';

import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { DatosFactura } from '../app/lib/geminiClient';
import InvoiceDataDisplay from './InvoiceDataDisplay';

interface Props {
  fileUrl: string;
  onTextExtracted: (text: string) => void;
}

export default function InvoiceProcessor({ fileUrl, onTextExtracted }: Props) {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [processedData, setProcessedData] = useState<DatosFactura | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async () => {
    setProcessing(true);
    setError(null);
    setProgress(0);
    setText('');
    setProcessedData(null);

    try {
      const result = await Tesseract.recognize(fileUrl, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress);
          }
        },
      });

      const extractedText = result.data.text;
      setText(extractedText);
      onTextExtracted(extractedText);

      // Procesar con Gemini AI automáticamente
      await processWithAI(extractedText);
    } catch (err) {
      console.error(err);
      setError('Error al procesar la imagen. Intenta con una imagen más clara.');
    } finally {
      setProcessing(false);
    }
  };

  const processWithAI = async (textoExtraido: string) => {
    setProcessingAI(true);
    try {
      // Usar la API route en lugar del cliente directo
      const response = await fetch('/api/process-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textoExtraido }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar con IA');
      }

      const { data } = await response.json();
      setProcessedData(data);

      // Mostrar información sobre campos encontrados
      const camposEncontrados = Object.values(data).filter(valor =>
        valor !== null && valor !== undefined && valor !== ''
      ).length;
      const totalCampos = Object.keys(data).length;

      console.log(`✅ IA completada: ${camposEncontrados}/${totalCampos} campos encontrados`);

      if (camposEncontrados < 3) {
        console.warn('⚠️ Pocos campos encontrados. La factura puede ser muy simple o la imagen no es clara.');
      }
    } catch (err) {
      console.error('Error al procesar con AI:', err);

      // Mensaje de error más específico
      if (err instanceof Error && err.message.includes('API key')) {
        setError('Error de configuración del servidor: ' + err.message);
      } else if (err instanceof Error && err.message.includes('JSON')) {
        setError('Error al procesar respuesta de IA. La factura puede ser muy compleja o la imagen no es clara.');
      } else {
        setError('Error al procesar con IA. Verifica la configuración del servidor.');
      }
    } finally {
      setProcessingAI(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <button
        onClick={processImage}
        disabled={processing}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
      >
        {processing ? (
          <>
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Procesando factura...</span>
          </>
        ) : (
          <>
            <span className="text-lg sm:text-xl">🤖</span>
            <span>Procesar con IA</span>
          </>
        )}
      </button>

      {processing && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
              Extrayendo texto de la imagen...
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2 sm:h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress * 100}%` }}
            ></div>
          </div>
          <p className="text-blue-600 dark:text-blue-300 text-xs sm:text-sm mt-2 text-center">
            {Math.round(progress * 100)}% completado
          </p>
        </div>
      )}

      {processingAI && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6 rounded-xl border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-purple-800 dark:text-purple-200 font-medium text-sm sm:text-base">
              🧠 Analizando con IA...
            </span>
          </div>
          <p className="text-purple-600 dark:text-purple-300 text-xs sm:text-sm mt-2 text-center">
            Extrayendo datos estructurados de la factura
          </p>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 sm:p-6 rounded-xl border border-red-200 dark:border-red-700">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <span className="text-xl sm:text-2xl mt-1">❌</span>
            <div>
              <h4 className="text-red-800 dark:text-red-200 font-semibold text-sm sm:text-base">Error de Procesamiento</h4>
              <p className="text-red-600 dark:text-red-300 text-xs sm:text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {text && !processing && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-green-700">
          <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl mt-1">✅</span>
            <div>
              <h4 className="text-green-800 dark:text-green-200 font-semibold text-sm sm:text-base">Texto Extraído Exitosamente</h4>
              <p className="text-green-600 dark:text-green-300 text-xs sm:text-sm">El OCR ha procesado la imagen correctamente</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-600 max-h-32 sm:max-h-48 overflow-auto">
            <pre className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
              {text}
            </pre>
          </div>
        </div>
      )}

      {processedData && !processingAI && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 sm:p-4 rounded-xl border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <span className="text-xl sm:text-2xl mt-1">🎉</span>
              <div>
                <h4 className="text-emerald-800 dark:text-emerald-200 font-semibold text-sm sm:text-base">¡Procesamiento Completado!</h4>
                <p className="text-emerald-600 dark:text-emerald-300 text-xs sm:text-sm">Los datos han sido extraídos y estructurados correctamente</p>
              </div>
            </div>
          </div>

          <InvoiceDataDisplay
            datos={processedData}
            onSave={(datos) => {
              setProcessedData(datos);
              console.log('Datos actualizados:', datos);
            }}
          />
        </div>
      )}
    </div>
  );
}
