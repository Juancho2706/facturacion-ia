'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

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
      <div className="min-h-screen flex items-center justify-center bg-[#0B0C15]">
        <div className="loader"></div>
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
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError("El usuario ya existe. Por favor, inicia sesión.");
        } else {
          alert('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
        }
      }
    } catch (err: any) {
      setError(err.message === "Invalid login credentials" ? "Credenciales inválidas. Intenta nuevamente." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C15] flex text-white font-sans selection:bg-purple-500/30 selection:text-purple-200">

      {/* --- Left Side: Visual --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#151B2D] items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-600/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 text-center px-12 animate-slide-up">
          <div className="mb-8 inline-block p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <span className="text-6xl">🧠</span>
          </div>
          <h2 className="text-5xl font-extrabold font-display mb-6 leading-tight">
            Tu Contabilidad,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Reinventada.
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Únete a la plataforma que está transformando la gestión financiera con inteligencia artificial real.
          </p>
        </div>
      </div>

      {/* --- Right Side: Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 z-0 lg:hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-md relative z-10 space-y-8 animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-display mb-2">
              {isLogin ? 'Bienvenido de Nuevo' : 'Crea tu Cuenta'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isLogin ? 'Accede al panel de control integral.' : 'Empieza tu prueba gratuita hoy mismo.'}
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 bg-[#151B2D]/50 space-y-6">
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-300 tracking-wider ml-1">Email</label>
                <input
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0B0C15]/80 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-300 tracking-wider ml-1">Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0B0C15]/80 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg shadow-lg shadow-blue-500/25 transform transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                )}
              </button>
            </form>

            {/* Demo User Shortcut */}
            <div className="pt-6 border-t border-white/5">
              <div className="bg-[#0f1219] border border-blue-500/20 rounded-xl p-5 text-center shadow-lg">
                <p className="text-xs text-blue-300 font-extrabold uppercase tracking-widest mb-3">⚡ Acceso Rápido Demo</p>
                <div className="flex justify-center space-x-4 text-xs text-gray-300 font-mono mb-4 bg-white/5 py-2 rounded-lg mx-4">
                  <span>U: demo@facturaia.com</span>
                  <span>P: demo1234</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@facturaia.com');
                    setPassword('demo1234');
                    setIsLogin(true);
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-md shadow-blue-500/20"
                >
                  Autocompletar
                </button>
              </div>
            </div>

          </div>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-500 hover:text-white transition-colors text-sm font-medium"
            >
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <span className="text-blue-400 hover:text-blue-300 ml-1">
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}