'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccess('¡Inicio de sesión exitoso!');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Registro exitoso. Revisa tu email para confirmar tu cuenta.');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h1>
          <p style={{ color: 'var(--foreground-secondary)' }}>
            {isLogin ? 'Accede a tu cuenta para gestionar tus facturas' : 'Crea una cuenta para empezar a procesar facturas'}
          </p>
        </div>

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '0.75rem', 
              marginBottom: '1rem', 
              background: 'var(--error)', 
              color: 'white', 
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ 
              padding: '0.75rem', 
              marginBottom: '1rem', 
              background: 'var(--success)', 
              color: 'white', 
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem'
            }}>
              {success}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Procesando...
              </>
            ) : (
              isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ marginBottom: '0.5rem', color: 'var(--foreground-secondary)' }}>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </p>
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccess(null);
            }} 
            className="btn btn-secondary"
            style={{ fontSize: '0.875rem' }}
          >
            {isLogin ? 'Crear cuenta nueva' : 'Iniciar sesión'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--foreground-secondary)', fontSize: '0.875rem' }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
} 