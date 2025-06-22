'use client';

import { supabase } from './lib/supabaseClient';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (error: any) {
        console.error('Error getting session:', error);
        if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px', borderColor: 'var(--error)' }}>
          <h2 style={{ color: 'var(--error)' }}>Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        {user ? (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h1>¡Bienvenido!</h1>
              <p style={{ color: 'var(--foreground-secondary)', fontSize: '1.1rem' }}>
                {user.email}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/dashboard">
                <button className="btn btn-primary">
                  Ir al Dashboard
                </button>
              </Link>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h1>Sistema de Facturación IA</h1>
              <p style={{ color: 'var(--foreground-secondary)', fontSize: '1.1rem' }}>
                Procesa y gestiona tus facturas con inteligencia artificial
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth">
                <button className="btn btn-primary">
                  Iniciar Sesión
                </button>
              </Link>
              <Link href="/auth">
                <button className="btn btn-secondary">
                  Registrarse
                </button>
              </Link>
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--background-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Características principales:</h3>
              <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '0.25rem 0' }}>• 📄 Procesamiento automático de facturas</li>
                <li style={{ padding: '0.25rem 0' }}>• 🤖 Extracción de texto con IA</li>
                <li style={{ padding: '0.25rem 0' }}>• 📊 Gestión organizada de documentos</li>
                <li style={{ padding: '0.25rem 0' }}>• 🔒 Almacenamiento seguro en la nube</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
