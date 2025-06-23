'use client';

import { supabase } from './lib/supabaseClient';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function HomePage() {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-red-200">
          <h2 className="text-red-600 text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {user ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
                  ¡Bienvenido!
                </h1>
                <p className="text-gray-600 text-xl">
                  {user.email}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg">
                    Ir al Dashboard
                  </button>
                </Link>
                <button 
                  className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-xl"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-6">
                  Sistema de Facturación IA
                </h1>
                <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                  Procesa y gestiona tus facturas con inteligencia artificial de manera eficiente y segura
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/auth">
                  <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/auth">
                  <button className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-xl">
                    Registrarse
                  </button>
                </Link>
              </div>
              
              <div className="bg-gray-100 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Características principales:</h3>
                <ul className="text-left list-none p-0">
                  <li className="p-2">• 📄 Procesamiento automático de facturas</li>
                  <li className="p-2">• 🤖 Extracción de texto con IA</li>
                  <li className="p-2">• 📊 Gestión organizada de documentos</li>
                  <li className="p-2">• 🔒 Almacenamiento seguro en la nube</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
