'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        setCheckingAuth(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    checkAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if(data.user && data.user.identities && data.user.identities.length === 0) {
            setError("El usuario ya existe. Por favor, inicia sesión.");
        } else {
            alert('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen">
        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">
                  {isLogin ? 'Bienvenido de Nuevo' : 'Crea una Cuenta'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {isLogin ? 'Ingresa tus credenciales para acceder a tu panel' : 'Completa el formulario para empezar'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contraseña
                    </label>
                    {isLogin && (
                      <Link href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    )}
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                  )}
                </button>

                <button
                  type="button"
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-gray-300 dark:border-gray-600"
                >
                  {isLogin ? 'Iniciar sesión con Google' : 'Registrarse con Google'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-600 dark:text-blue-400 hover:underline ml-1 font-medium"
                  >
                    {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 bg-blue-600/20"></div>
          <img
            src="https://images.unsplash.com/photo-1599423300746-b625ed8ba949?q=80&w=3087&auto=format&fit=crop"
            alt="Facturación IA"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h2 className="text-4xl font-bold mb-4">Sistema de Facturación IA</h2>
              <p className="text-xl opacity-90">Transforma la manera en que gestionas tus facturas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 