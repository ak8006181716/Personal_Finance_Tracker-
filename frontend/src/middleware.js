import { NextResponse } from 'next/server';

export function middleware(req) {
  // Let pages render; 401s from the API will redirect via Axios interceptor.
  return NextResponse.next();
}

export const config = {
  matcher: [],
};


