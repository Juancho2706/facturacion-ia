import { NextResponse, type NextRequest } from 'next/server'

// Middleware simplificado para depuración
export async function middleware(request: NextRequest) {
  console.log('Middleware ejecutándose para:', request.nextUrl.pathname);
  
  // Simplemente dejamos pasar la solicitud sin hacer nada más
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 