'use client';

import { useState } from 'react';
import Tesseract from 'tesseract.js';

interface Props {
  file: File;
  onTextExtracted: (text: string) => void;
}

export default function InvoiceProcessor({ file, onTextExtracted }: Props) {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async () => {
    setProcessing(true);
    setError(null);
    setProgress(0);
    setText('');

    try {
      const result = await Tesseract.recognize(file, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress);
          }
        },
      });

      setText(result.data.text);
      onTextExtracted(result.data.text);
    } catch (err) {
      console.error(err);
      setError('Error al procesar la imagen. Intenta con una imagen más clara.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button 
        onClick={processImage} 
        disabled={processing}
        className="btn btn-primary"
        style={{ width: '100%' }}
      >
        {processing ? (
          <>
            <div className="spinner"></div>
            Procesando factura...
          </>
        ) : (
          <>
            🤖 Procesar con IA
          </>
        )}
      </button>

      {processing && (
        <div style={{ 
          background: 'var(--background-secondary)', 
          padding: '1rem', 
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div className="spinner"></div>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              Extrayendo texto...
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            background: 'var(--border)', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: 'var(--primary)',
              transition: 'width 0.3s ease',
              borderRadius: '4px'
            }}></div>
          </div>
          <p style={{ 
            fontSize: '0.75rem', 
            color: 'var(--foreground-muted)', 
            margin: '0.5rem 0 0 0',
            textAlign: 'center'
          }}>
            {Math.round(progress * 100)}% completado
          </p>
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '0.75rem', 
          background: 'var(--error)', 
          color: 'white', 
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem'
        }}>
          ❌ {error}
        </div>
      )}

      {text && !processing && (
        <div style={{ 
          background: 'var(--background-secondary)', 
          padding: '1rem', 
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              Texto extraído exitosamente
            </span>
          </div>
          <div style={{ 
            background: 'var(--background)', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            maxHeight: '200px',
            overflow: 'auto',
            fontSize: '0.75rem',
            lineHeight: '1.4'
          }}>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              margin: 0,
              fontFamily: 'inherit'
            }}>
              {text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
