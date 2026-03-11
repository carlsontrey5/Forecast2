import { User, UserRole } from '@/types';
import { cookies } from 'next/headers';

const USERS: Array<{ id: string; username: string; password: string; role: UserRole }> = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: '2', username: 'analyst', password: 'analyst123', role: 'analyst' },
];

const SESSION_COOKIE = 'ct_session';

function encodeSession(user: User): string {
  return Buffer.from(JSON.stringify({ ...user, ts: Date.now() })).toString('base64');
}

function decodeSession(token: string): User | null {
  try {
    const parsed = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    return { id: parsed.id, username: parsed.username, role: parsed.role };
  } catch {
    return null;
  }
}

export function validateCredentials(username: string, password: string): User | null {
  const found = USERS.find((u) => u.username === username && u.password === password);
  if (!found) return null;
  return { id: found.id, username: found.username, role: found.role };
}

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export function createSessionCookie(user: User): string {
  return encodeSession(user);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
