'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from './lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0C15] text-white">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C15] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-purple-600/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/10 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse" />
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 bg-[#0B0C15]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0B0C15]/60">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
              <img src="/logo-small.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-white/90">
              Factura<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">IA</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Características</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonios</a>
            <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <button className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all hover:scale-105 active:scale-95">
                  Ir al Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/auth">
                  <button className="hidden sm:block px-5 py-2.5 text-sm text-gray-300 hover:text-white transition-colors font-medium">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/auth">
                  <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 ring-1 ring-white/10">
                    Comenzar Gratis
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* --- Hero Section --- */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-widest animate-fade-in backdrop-blur-md shadow-lg shadow-blue-500/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Nueva Generación de Contabilidad
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-display leading-[1.1] tracking-tight text-white animate-slide-up">
                El Futuro de <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                  Tus Finanzas
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Olvídate de teclear datos manualmente. Nuestra IA extrae, organiza y procesa tus facturas con una precisión sobrehumana.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Link href="/auth" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl shadow-white/10 flex items-center justify-center gap-2 group">
                    <span>Empezar Ahora</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-lg backdrop-blur-md transition-all flex items-center justify-center">
                    Ver Demo
                  </button>
                </Link>
              </div>
            </div>

            {/* Hero Visual aka "The Dashboard Hologram" */}
            <div className="mt-20 relative max-w-6xl mx-auto animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-20"></div>
              <div className="relative rounded-[2rem] bg-[#0B0C15]/90 border border-white/10 p-2 md:p-4 shadow-2xl backdrop-blur-sm overflow-hidden">
                {/* Fake Browser Header */}
                <div className="h-12 bg-[#151B2D]/50 rounded-t-2xl border-b border-white/5 flex items-center px-6 gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <div className="mx-auto w-1/3 h-6 bg-white/5 rounded-full flex items-center justify-center text-[10px] text-gray-500 font-mono">
                    factura.ai/dashboard
                  </div>
                </div>

                {/* Fake Content Preview */}
                <div className="aspect-[16/9] bg-[#0f1219] w-full rounded-b-xl relative overflow-hidden flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

                  {/* Floating UI Elements */}
                  <div className="absolute top-10 left-10 p-4 bg-[#1A1F35]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl animate-pulse">
                    <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total Ingresos</div>
                    <div className="text-3xl font-bold text-white">$124,500</div>
                    <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                      <span>▲</span> +12% vs mes anterior
                    </div>
                  </div>

                  <div className="absolute bottom-10 right-10 p-4 bg-[#1A1F35]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl animate-pulse" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div>
                      <div className="text-sm font-bold text-white">Factura #9921</div>
                    </div>
                    <div className="text-xs text-gray-400">Procesada exitosamente</div>
                  </div>

                  {/* Center Visual */}
                  <div className="text-center relative z-10">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
                      <span className="text-4xl">✨</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Tu contabilidad en piloto automático</h3>
                    <p className="text-gray-400 text-sm">Arrastra tus archivos y deja que la magia ocurra.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* --- Features Grid --- */}
        <section id="features" className="py-32 bg-[#0B0C15] relative">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white">Más allá de lo básico</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Hemos repensado cada aspecto de la gestión de facturas para hacerla instantánea y sin fricción.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  title: 'IA Contextual',
                  desc: 'Entiende la diferencia entre una factura de hotel y una compra de equipo. Categorización automática inteligente.',
                  icon: '🧠',
                  gradient: 'from-blue-500/20 to-cyan-500/20',
                  border: 'group-hover:border-blue-500/50'
                },
                {
                  title: 'Extracción Instantánea',
                  desc: 'Olvídate de esperar. Sube un PDF o una foto y obtén los datos estructurados en segundos.',
                  icon: '⚡',
                  gradient: 'from-purple-500/20 to-pink-500/20',
                  border: 'group-hover:border-purple-500/50'
                },
                {
                  title: 'Reportes en Vivo',
                  desc: 'Visualiza tus gastos e ingresos en tiempo real con gráficos interactivos y hermosos.',
                  icon: '📊',
                  gradient: 'from-orange-500/20 to-red-500/20',
                  border: 'group-hover:border-orange-500/50'
                }
              ].map((feature, i) => (
                <div key={i} className={`group relative p-8 rounded-[2rem] bg-[#151B2D]/40 backdrop-blur-sm border border-white/5 ${feature.border} transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} blur-[60px] rounded-full group-hover:opacity-100 opacity-50 transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Testimonials (Social Proof) --- */}
        <section id="testimonials" className="py-24 border-y border-white/5 bg-[#0f1219]/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-display text-white mb-4">Confianza de los mejores</h2>
              <p className="text-gray-400">Miles de freelancers y empresas ya automatizaron su caos.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Sofía R.", role: "Freelancer", text: "Antes tardaba horas en excel. Ahora subo mis facturas y listo. Es magia pura.", image: "/profile-sofia.png" },
                { name: "Carlos M.", role: "CEO TechStart", text: "La precisión de la IA es increíble. Ha simplificado totalmente nuestra contabilidad mensual.", image: "/profile-carlos.png" },
                { name: "Ana P.", role: "Diseñadora", text: "La interfaz es hermosa y muy rápida. Da gusto usar una herramienta así.", image: "/profile-ana.png" }
              ].map((t, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[#1A1F35]/50 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-1 text-yellow-500 mb-4 text-sm">
                    {'★'.repeat(5)}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    <div>
                      <div className="text-white font-bold text-sm">{t.name}</div>
                      <div className="text-gray-500 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA Footer --- */}
        <section className="py-32 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black font-display text-white mb-6">
                ¿Listo para el futuro?
              </h2>
              <p className="text-xl text-gray-400 mb-10">
                Empieza gratis hoy. Sin tarjeta de crédito requerida.
              </p>
              <Link href="/auth">
                <button className="px-10 py-5 rounded-full bg-white text-black font-bold text-xl hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                  Crear Cuenta Gratis
                </button>
              </Link>
              <p className="mt-6 text-sm text-gray-500">
                Plan gratuito incluye 20 facturas mensuales.
              </p>
            </div>
          </div>

          {/* Footer Background Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-t from-blue-900/20 to-transparent blur-[100px] pointer-events-none"></div>
        </section>

        <footer className="border-t border-white/5 bg-[#0B0C15] py-12 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} FacturaIA. Diseñado para el futuro.</p>
        </footer>

      </main>
    </div>
  );
}
