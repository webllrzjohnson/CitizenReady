import { NextResponse, type NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/session-edge'

export async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  const path = request.nextUrl.pathname

  if (!session && path.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!session && path.startsWith('/dashboard/settings')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && path.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (session && (path === '/login' || path === '/signup' || path === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/signup', '/'],
}