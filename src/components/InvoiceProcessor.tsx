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
        className="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-xl shadow-blue-500/20 active:scale-95 overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
        <div className="relative flex items-center justify-center space-x-3">
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Procesando factura...</span>
            </>
          ) : (
            <>
              <span className="text-xl filter drop-shadow">⚡</span>
              <span>Procesar con IA</span>
            </>
          )}
        </div>
      </button>

      {processing && (
        <div className="bg-[#151B2D]/60 backdrop-blur-md p-6 rounded-2xl border border-blue-500/30 shadow-lg animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl -mr-10 -mt-10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-300 font-bold text-sm uppercase tracking-wider">
                Extrayendo texto de la imagen...
              </span>
            </div>
            <div className="w-full bg-[#0B0C15] rounded-full h-3 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
            <p className="text-blue-400 text-xs mt-2 text-right font-mono">
              {Math.round(progress * 100)}%
            </p>
          </div>
        </div>
      )}

      {processingAI && (
        <div className="bg-[#151B2D]/60 backdrop-blur-md p-6 rounded-2xl border border-purple-500/30 shadow-lg animate-fade-in relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-2xl -ml-10 -mb-10 rounded-full"></div>
          <div className="relative z-10 flex flex-col items-center py-4">
            <div className="w-12 h-12 mb-4 relative">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <span className="text-purple-300 font-bold text-sm uppercase tracking-wider text-center">
              🧠 Analizando con IA...
            </span>
            <p className="text-purple-400/60 text-xs mt-2 text-center max-w-xs">
              Detectando estructura inteligente y validando datos fiscales
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 backdrop-blur-md p-6 rounded-2xl border border-red-500/30 shadow-lg animate-shake">
          <div className="flex items-start space-x-4">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <div>
              <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-1">Error de Procesamiento</h4>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {text && !processing && (
        <div className="bg-[#151B2D]/40 backdrop-blur-md p-6 rounded-2xl border border-green-500/20 shadow-lg animate-fade-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-500/20 p-1.5 rounded-lg">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider">Texto Extraído</h4>
              <p className="text-green-400/60 text-xs">OCR completado correctamente</p>
            </div>
          </div>
          <div className="bg-[#0B0C15]/50 p-4 rounded-xl border border-white/5 max-h-48 overflow-auto custom-scrollbar">
            <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
              {text}
            </pre>
          </div>
        </div>
      )}

      {processedData && !processingAI && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-4 rounded-2xl border border-emerald-500/30 flex items-center space-x-4">
            <div className="bg-emerald-500/20 p-2 rounded-xl shadow-lg shadow-emerald-500/10">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <h4 className="text-emerald-300 font-bold text-sm uppercase tracking-wider">¡Procesamiento Completado!</h4>
              <p className="text-emerald-400/70 text-xs">Datos extraídos y estructurados por IA</p>
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
