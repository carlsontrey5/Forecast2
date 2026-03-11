import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSessionCookie, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const user = validateCredentials(username, password);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
    const token = createSessionCookie(user);
    const res = NextResponse.json({ success: true, data: user });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
