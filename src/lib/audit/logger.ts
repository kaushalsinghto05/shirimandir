import { auditLogs } from '../db/schema';
import type { DrizzleDbOrTx } from '../db';

export interface AuditEventInput {
  tenantId?: string | null;
  actorUserId?: string | null;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  requestId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  changeSummary?: Record<string, unknown>;
}

const REDACTED = '[REDACTED]';
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'password_hash',
  'token',
  'accesstoken',
  'access_token',
  'secret',
  'mfasecret',
  'mfa_secret',
  'apikey',
  'api_key',
  'cardnumber',
  'card_number',
  'cvv',
  'signature',
]);

/**
 * Recursively redacts sensitive fields from audit log payloads (FR-AUD-003)
 */
export function sanitizeChangeSummary(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeChangeSummary);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = REDACTED;
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeChangeSummary(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Records an immutable audit log entry (FR-AUD-001, FR-AUD-002, FR-AUD-003)
 */
export async function logAuditEvent(
  dbOrTx: DrizzleDbOrTx,
  input: AuditEventInput
): Promise<void> {
  const sanitizedSummary = sanitizeChangeSummary(input.changeSummary || {});

  await dbOrTx.insert(auditLogs).values({
    tenantId: input.tenantId ?? null,
    actorUserId: input.actorUserId ?? null,
    actorRole: input.actorRole,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: String(input.resourceId),
    requestId: input.requestId,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    changeSummary: sanitizedSummary as Record<string, unknown>,
  });
}
