'use client';

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">🔍 Diagnóstico de Variables de Entorno</h1>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL</h2>
            <p className={`text-sm ${supabaseUrl ? 'text-green-600' : 'text-red-600'}`}>
              {supabaseUrl ? '✅ Configurada' : '❌ No configurada'}
            </p>
            {supabaseUrl && (
              <p className="text-xs text-gray-500 mt-1 break-all">
                {supabaseUrl.substring(0, 50)}...
              </p>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</h2>
            <p className={`text-sm ${supabaseKey ? 'text-green-600' : 'text-red-600'}`}>
              {supabaseKey ? '✅ Configurada' : '❌ No configurada'}
            </p>
            {supabaseKey && (
              <p className="text-xs text-gray-500 mt-1 break-all">
                {supabaseKey.substring(0, 50)}...
              </p>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">GOOGLE_API_KEY</h2>
            <p className={`text-sm ${googleKey ? 'text-green-600' : 'text-red-600'}`}>
              {googleKey ? '✅ Configurada (solo servidor)' : '❌ No configurada'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Esta variable solo está disponible en el servidor
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Instrucciones para Vercel</h3>
          <ol className="text-sm space-y-1">
            <li>1. Ve a tu proyecto en Vercel Dashboard</li>
            <li>2. Settings → Environment Variables</li>
            <li>3. Agrega las variables faltantes</li>
            <li>4. Redeploy automático</li>
          </ol>
        </div>

        <div className="mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🔄 Recargar
          </button>
        </div>
      </div>
    </div>
  );
} 