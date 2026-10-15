import * as OTPAuth from 'otpauth';

const ISSUER = 'Shiri Mandir SaaS';

export interface MfaSetupResult {
  secret: string;
  uri: string;
}

export function generateMfaSecret(accountName: string): MfaSetupResult {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: accountName,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  });

  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  };
}

export function verifyMfaToken(secretBase32: string, token: string): boolean {
  if (!secretBase32 || !token) return false;

  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });

  // window = 1 allows 1 period backward and forward (tolerance for clock drift)
  const delta = totp.validate({ token: token.trim(), window: 1 });
  return delta !== null;
}
