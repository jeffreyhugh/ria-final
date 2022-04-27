import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export default async function Middleware(req: NextRequest, _: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  // redirect for /puzzle/random
  if (pathname === '/puzzle/random') {
    // seed is a random integer between 1111 and 999999
    const seed = Math.floor(Math.random() * (999999 - 1111 + 1)) + 1111;
    const url = req.nextUrl.clone();
    url.pathname = `/puzzle/${seed}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
