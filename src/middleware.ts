import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que não exigem autenticação
const publicRoutes = ['/', '/ensino']

// Rotas que exigem autenticação
const protectedRoutes = ['/controle', '/bancada', '/supervisor', '/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has('__ml_session')

  // Se o usuário está logado e tenta acessar a página de login, redireciona para a home
  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Verifica se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Se a rota for protegida e o usuário não tiver o cookie de sessão, redireciona para login
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname) // Guardar a URL original para possível redirecionamento posterior
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Ignora api, arquivos estáticos e imagens
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.svg|.*\\.png|.*\\.jpeg).*)',
  ],
}
