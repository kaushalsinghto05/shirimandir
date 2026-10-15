import { eq, and } from 'drizzle-orm';
import { getDb } from '../../lib/db';
import { customDomains, temples } from '../../lib/db/schema';
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from '../../lib/errors/app-error';
import crypto from 'node:crypto';

export interface RequestDomainInput {
  tenantId: string;
  templeId: string;
  domain: string;
  verificationType?: 'cname' | 'txt';
}

export class DomainService {
  /**
   * Request custom domain registration with verification token generation (FR-TEN-006, FR-WL-005)
   */
  static async requestDomain(input: RequestDomainInput) {
    const { db } = await getDb();
    const domainClean = input.domain.trim().toLowerCase();
    
    // Validate domain format
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
    if (!domainRegex.test(domainClean)) {
      throw new ValidationError(`Invalid domain name format: ${domainClean}`);
    }

    // Ensure temple exists under this tenant
    const [temple] = await db
      .select()
      .from(temples)
      .where(and(eq(temples.tenantId, input.tenantId), eq(temples.id, input.templeId)))
      .limit(1);

    if (!temple) {
      throw new NotFoundError('Temple not found in this tenant organization');
    }

    // Check if domain is already registered
    const [existing] = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.domain, domainClean))
      .limit(1);

    if (existing) {
      throw new ConflictError(`Domain ${domainClean} is already registered`);
    }

    const verificationToken = `shirimandir-verify-${crypto.randomBytes(16).toString('hex')}`;

    const [domainRecord] = await db
      .insert(customDomains)
      .values({
        tenantId: input.tenantId,
        templeId: input.templeId,
        domain: domainClean,
        verificationToken,
        verificationType: input.verificationType || 'cname',
        status: 'pending_verification',
        tlsStatus: 'pending',
      })
      .returning();

    return domainRecord;
  }

  /**
   * Verify domain ownership via simulated DNS lookup (FR-TEN-006, AT-09)
   */
  static async verifyDomain(tenantId: string, domainId: string, dnsRecordFound: boolean = true) {
    const { db } = await getDb();

    const [domainRecord] = await db
      .select()
      .from(customDomains)
      .where(and(eq(customDomains.tenantId, tenantId), eq(customDomains.id, domainId)))
      .limit(1);

    if (!domainRecord) {
      throw new NotFoundError('Custom domain record not found');
    }

    if (!dnsRecordFound) {
      await db
        .update(customDomains)
        .set({
          status: 'failed',
          tlsStatus: 'failed',
          updatedAt: new Date(),
        })
        .where(eq(customDomains.id, domainId));
      throw new ValidationError('DNS verification check failed: expected verification record not resolved');
    }

    const [verified] = await db
      .update(customDomains)
      .set({
        status: 'verified',
        tlsStatus: 'issued', // Automated TLS certificate provisioned upon verified ownership
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(customDomains.id, domainId))
      .returning();

    return verified;
  }

  /**
   * Activate custom domain for live public routing (AT-09 guarantee)
   */
  static async activateDomain(tenantId: string, domainId: string) {
    const { db } = await getDb();

    const [domainRecord] = await db
      .select()
      .from(customDomains)
      .where(and(eq(customDomains.tenantId, tenantId), eq(customDomains.id, domainId)))
      .limit(1);

    if (!domainRecord) {
      throw new NotFoundError('Custom domain record not found');
    }

    // AT-09: Unverified domain cannot become active
    if (domainRecord.status !== 'verified') {
      throw new ForbiddenError(
        `Cannot activate domain: domain status is '${domainRecord.status}'. Verification must be completed first.`
      );
    }

    if (domainRecord.tlsStatus !== 'issued') {
      throw new ForbiddenError(
        `Cannot activate domain: TLS certificate status is '${domainRecord.tlsStatus}'. Valid TLS is required.`
      );
    }

    const [activated] = await db
      .update(customDomains)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(customDomains.id, domainId))
      .returning();

    return activated;
  }

  /**
   * Public domain resolution helper (FR-WL-005)
   */
  static async resolveTempleByDomain(domain: string) {
    const { db } = await getDb();
    const cleanDomain = domain.trim().toLowerCase();

    const [domainRecord] = await db
      .select()
      .from(customDomains)
      .where(and(eq(customDomains.domain, cleanDomain), eq(customDomains.status, 'active')))
      .limit(1);

    if (!domainRecord) {
      return null;
    }

    const [temple] = await db
      .select()
      .from(temples)
      .where(
        and(
          eq(temples.tenantId, domainRecord.tenantId),
          eq(temples.id, domainRecord.templeId)
        )
      )
      .limit(1);

    return temple || null;
  }

  /**
   * List custom domains for a tenant
   */
  static async listDomains(tenantId: string, templeId?: string) {
    const { db } = await getDb();

    if (templeId) {
      return await db
        .select()
        .from(customDomains)
        .where(and(eq(customDomains.tenantId, tenantId), eq(customDomains.templeId, templeId)));
    }
    return await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.tenantId, tenantId));
  }
}
