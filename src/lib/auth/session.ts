import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shirimandir_sacred_jwt_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  platformRole: string;
}

// In-memory revocation set (or persistent in DB for enterprise)
const revokedTokens = new Set<string>();

export function createSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || revokedTokens.has(token)) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function revokeSessionToken(token: string): void {
  if (token) {
    revokedTokens.add(token);
  }
}
