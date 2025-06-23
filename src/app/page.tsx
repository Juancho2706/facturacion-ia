'use client';

import { supabase } from './lib/supabaseClient';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Iconos para la UI ---
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const ProcessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 14h.01M12 10v-3m3 3h.01M15 7h.01" /></svg>;
const ManageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.02 12.02 0 0012 22a12.02 12.02 0 009-1.056A11.955 11.955 0 0121 12c0-1.268-.31-2.49-.882-3.516z" /></svg>;

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-800">
      {/* --- Header --- */}
      <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">FacturaIA 🧠</h1>
          {user ? (
            <Link href="/dashboard">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300">
                Ir al Dashboard
              </button>
            </Link>
          ) : (
            <Link href="/auth">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300">
                Iniciar Sesión
              </button>
            </Link>
          )}
        </div>
      </header>

      <main>
        {/* --- Hero Section --- */}
        <section className="pt-32 pb-20 bg-gray-50">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                Automatiza tus Facturas con Inteligencia Artificial
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Deja que nuestra IA extraiga, organice y analice los datos de tus facturas en segundos. Ahorra tiempo, reduce errores y toma el control de tus finanzas.
              </p>
              <Link href={user ? "/dashboard" : "/auth"}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-xl transform hover:scale-105 transition-transform duration-300">
                  {user ? "Ir a mi Dashboard" : "Empezar Gratis"}
                </button>
              </Link>
            </div>
            {/* Image Placeholder */}
            <div className="bg-blue-100 h-80 rounded-2xl flex items-center justify-center shadow-lg">
              <p className="text-blue-500 font-semibold">
                [Placeholder para imagen del producto]
              </p>
            </div>
          </div>
        </section>

        {/* --- Features Section --- */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold mb-4">Todo lo que necesitas, en un solo lugar</h3>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
              Desde la extracción de datos hasta el análisis de gastos, FacturaIA te ofrece las herramientas para una gestión financiera eficiente.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
                <CheckIcon />
                <h4 className="text-xl font-semibold mb-2">Extracción Automática</h4>
                <p className="text-gray-600">Nuestra IA lee cualquier factura (PDF o imagen) y extrae los datos clave sin que tengas que teclear nada.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
                <BrainIcon />
                <h4 className="text-xl font-semibold mb-2">Dashboard Inteligente</h4>
                <p className="text-gray-600">Visualiza tus gastos, identifica tendencias y obtén reportes automáticos en un dashboard interactivo.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
                <ShieldIcon />
                <h4 className="text-xl font-semibold mb-2">Almacenamiento Seguro</h4>
                <p className="text-gray-600">Todas tus facturas se guardan de forma segura en la nube, organizadas y accesibles desde cualquier lugar.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold mb-12">Tan fácil como 1, 2, 3</h3>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Decorative line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gray-300 -translate-y-1/2"></div>
              
              <div className="relative z-10 bg-white p-6 rounded-lg border border-gray-200">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                <UploadIcon />
                <h4 className="text-xl font-semibold mb-2">Sube tu Factura</h4>
                <p className="text-gray-600">Arrastra y suelta o selecciona cualquier archivo de factura.</p>
              </div>
              <div className="relative z-10 bg-white p-6 rounded-lg border border-gray-200">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                <ProcessIcon />
                <h4 className="text-xl font-semibold mb-2">La IA la Procesa</h4>
                <p className="text-gray-600">En segundos, los datos son extraídos y validados.</p>
              </div>
              <div className="relative z-10 bg-white p-6 rounded-lg border border-gray-200">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                <ManageIcon />
                <h4 className="text-xl font-semibold mb-2">Gestiona tus Datos</h4>
                <p className="text-gray-600">Visualiza, analiza y exporta tu información financiera.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Testimonials Section Placeholder --- */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold mb-12">Amado por profesionales y empresas</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl text-left">
                <p className="text-gray-600 italic mb-4">"FacturaIA ha transformado nuestra contabilidad. Lo que antes nos tomaba horas, ahora se hace en minutos. ¡Imprescindible!"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 mr-4 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold">Ana Pérez</p>
                    <p className="text-sm text-gray-500">Contadora en Tech Solutions</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl text-left">
                <p className="text-gray-600 italic mb-4">"La precisión de la IA es asombrosa. Hemos reducido los errores manuales a cero y tenemos una visión clara de nuestros gastos."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 mr-4 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold">Carlos Gómez</p>
                    <p className="text-sm text-gray-500">CEO de Innova Corp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-4xl font-bold mb-4">¿Listo para simplificar tu facturación?</h3>
            <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
              Únete a cientos de empresas que ya están ahorrando tiempo y dinero. Regístrate gratis, no se requiere tarjeta de crédito.
            </p>
            <Link href="/auth">
              <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg text-lg shadow-xl transform hover:scale-105 transition-transform duration-300">
                Crear mi Cuenta Gratis
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} FacturaIA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
