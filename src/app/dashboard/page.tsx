'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import InvoiceProcessor from '../../components/InvoiceProcessor';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/auth');
      } else {
        setUser(data.session.user);
        fetchFiles(data.session.user.id);
      }
    });
  }, [router]);

  async function fetchFiles(userId: string) {
    const { data, error } = await supabase
      .storage
      .from('facturas')
      .list(userId, { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      console.error('Error al listar facturas:', error.message);
    } else {
      setFiles(data || []);
    }
  }

  async function uploadFile(file: File) {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage.from('facturas').upload(filePath, file);

      if (error) {
        alert('Error al subir archivo: ' + error.message);
      } else {
        alert('Archivo subido con éxito');
        fetchFiles(user.id);
      }
    } catch (error) {
      alert('Error inesperado: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        uploadFile(acceptedFiles[0]);
        setExtractedText('');
      }
    },
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--foreground-secondary)', margin: 0 }}>
            Bienvenido, {user.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/">
            <button className="btn btn-secondary">
              Inicio
            </button>
          </Link>
          <button className="btn btn-danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }} className="dashboard-grid">
        {/* Panel izquierdo - Subida de archivos */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Subir Factura</h2>
          
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '1rem',
              background: isDragActive ? 'var(--primary-light)' : 'var(--background-secondary)',
              transition: 'var(--transition)',
            }}
          >
            <input {...getInputProps()} />
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              📄
            </div>
            {isDragActive ? (
              <p style={{ color: 'var(--primary)', fontWeight: '500' }}>
                Suelta los archivos aquí...
              </p>
            ) : (
              <div>
                <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                  Arrastra y suelta facturas aquí
                </p>
                <p style={{ color: 'var(--foreground-secondary)', fontSize: '0.875rem' }}>
                  o haz clic para seleccionar archivos
                </p>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  Formatos soportados: PDF, JPG, PNG
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'var(--primary-light)',
              borderRadius: 'var(--radius)',
              color: 'var(--primary)'
            }}>
              <div className="spinner"></div>
              Subiendo archivo...
            </div>
          )}

          {selectedFile && (
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem',
              background: 'var(--background-secondary)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
                Archivo seleccionado: {selectedFile.name}
              </h3>
              <InvoiceProcessor
                file={selectedFile}
                onTextExtracted={(text) => setExtractedText(text)}
              />
            </div>
          )}
        </div>

        {/* Panel derecho - Texto extraído y archivos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Texto extraído */}
          {extractedText && (
            <div className="card">
              <h3>Texto Extraído</h3>
              <div style={{ 
                background: 'var(--background-secondary)', 
                padding: '1rem', 
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                maxHeight: '300px',
                overflow: 'auto',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  margin: 0,
                  fontFamily: 'inherit'
                }}>
                  {extractedText}
                </pre>
              </div>
            </div>
          )}

          {/* Lista de archivos */}
          <div className="card">
            <h3>Facturas Recientes</h3>
            {files.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: 'var(--foreground-muted)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                <p>No hay facturas aún</p>
                <p style={{ fontSize: '0.875rem' }}>Sube tu primera factura para empezar</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {files.map((file) => (
                  <div key={file.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--background-secondary)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    transition: 'var(--transition)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>📄</span>
                      <span style={{ fontSize: '0.875rem' }}>{file.name}</span>
                    </div>
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/facturas/${user.id}/${file.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      Ver
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

