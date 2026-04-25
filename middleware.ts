import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/otp-login',
]

const PUBLIC_BROWSE_PREFIXES = ['/marketplace', '/vendors']
const VENDOR_PATHS = ['/dashboard/vendor', '/vendor']
const ADMIN_PATHS  = ['/dashboard/admin', '/admin']
const BUYER_PATHS  = ['/dashboard/buyer', '/buyer']

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  if (matchesPrefix(pathname, PUBLIC_BROWSE_PREFIXES)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
    const { payload } = await jwtVerify(token, secret)
    const role = (payload as any).role as string

    if (matchesPrefix(pathname, ADMIN_PATHS) && !['SUPER_ADMIN', 'SUB_ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    if (matchesPrefix(pathname, VENDOR_PATHS) && role !== 'VENDOR' && !['SUPER_ADMIN', 'SUB_ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    if (matchesPrefix(pathname, BUYER_PATHS) && role !== 'BUYER' && !['SUPER_ADMIN', 'SUB_ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const response = NextResponse.next()
    response.headers.set('x-user-id', String((payload as any).userId || (payload as any).id))
    response.headers.set('x-user-role', role)
    return response

  } catch {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('token')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
}
