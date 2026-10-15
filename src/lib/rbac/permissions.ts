/**
 * Granular permissions for Shiri Mandir SaaS platform
 * Required by FR-RBAC-002, FR-RBAC-003, and Spec Section 2.1
 */
export const Permissions = {
  // Temple & Tenant configuration
  TEMPLES_READ: 'temples.read',
  TEMPLES_WRITE: 'temples.write',
  
  // Puja catalog & schedules
  PUJAS_READ: 'pujas.read',
  PUJAS_WRITE: 'pujas.write',
  SLOTS_READ: 'slots.read',
  SLOTS_WRITE: 'slots.write',
  
  // Bookings & Fulfillment
  BOOKINGS_READ: 'bookings.read',
  BOOKINGS_WRITE: 'bookings.write',
  BOOKINGS_CHECK_IN: 'bookings.check_in',
  BOOKINGS_CANCEL: 'bookings.cancel',
  
  // Donations & Campaigns
  CAMPAIGNS_READ: 'campaigns.read',
  CAMPAIGNS_WRITE: 'campaigns.write',
  DONATIONS_READ: 'donations.read',
  DONATIONS_WRITE: 'donations.write',
  
  // Receipts & Financial adjustments
  RECEIPTS_READ: 'receipts.read',
  RECEIPTS_VOID: 'receipts.void',
  PAYMENTS_REFUND: 'payments.refund',
  
  // Financial & Operational reports
  REPORTS_BOOKINGS_READ: 'reports.bookings.read',
  REPORTS_FINANCE_READ: 'reports.finance.read',
  
  // Membership & Access administration
  MEMBERS_READ: 'members.read',
  MEMBERS_INVITE: 'members.invite',
  MEMBERS_MANAGE: 'members.manage',
  
  // Platform Super-Controls
  PLATFORM_TENANTS_MANAGE: 'platform.tenants.manage',
  PLATFORM_SUPPORT: 'platform.support',
  PLATFORM_FINANCE: 'platform.finance',
  AUDIT_READ: 'audit.read',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
