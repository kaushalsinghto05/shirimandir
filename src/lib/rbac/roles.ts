import { Permissions, type Permission } from './permissions';

export type TenantRole =
  | 'trust_admin'
  | 'temple_admin'
  | 'puja_manager'
  | 'priest'
  | 'temple_accountant'
  | 'devotee';

export type PlatformRole =
  | 'none'
  | 'platform_super_admin'
  | 'platform_support'
  | 'platform_finance';

export const RolePermissions: Record<TenantRole, Permission[]> = {
  trust_admin: [
    Permissions.TEMPLES_READ,
    Permissions.TEMPLES_WRITE,
    Permissions.PUJAS_READ,
    Permissions.PUJAS_WRITE,
    Permissions.SLOTS_READ,
    Permissions.SLOTS_WRITE,
    Permissions.BOOKINGS_READ,
    Permissions.BOOKINGS_WRITE,
    Permissions.BOOKINGS_CHECK_IN,
    Permissions.BOOKINGS_CANCEL,
    Permissions.CAMPAIGNS_READ,
    Permissions.CAMPAIGNS_WRITE,
    Permissions.DONATIONS_READ,
    Permissions.DONATIONS_WRITE,
    Permissions.RECEIPTS_READ,
    Permissions.RECEIPTS_VOID,
    Permissions.PAYMENTS_REFUND,
    Permissions.REPORTS_BOOKINGS_READ,
    Permissions.REPORTS_FINANCE_READ,
    Permissions.MEMBERS_READ,
    Permissions.MEMBERS_INVITE,
    Permissions.MEMBERS_MANAGE,
    Permissions.AUDIT_READ,
  ],
  temple_admin: [
    Permissions.TEMPLES_READ,
    Permissions.TEMPLES_WRITE,
    Permissions.PUJAS_READ,
    Permissions.PUJAS_WRITE,
    Permissions.SLOTS_READ,
    Permissions.SLOTS_WRITE,
    Permissions.BOOKINGS_READ,
    Permissions.BOOKINGS_WRITE,
    Permissions.BOOKINGS_CHECK_IN,
    Permissions.BOOKINGS_CANCEL,
    Permissions.CAMPAIGNS_READ,
    Permissions.CAMPAIGNS_WRITE,
    Permissions.DONATIONS_READ,
    Permissions.RECEIPTS_READ,
    Permissions.REPORTS_BOOKINGS_READ,
    Permissions.REPORTS_FINANCE_READ,
    Permissions.MEMBERS_READ,
    Permissions.AUDIT_READ,
  ],
  puja_manager: [
    Permissions.TEMPLES_READ,
    Permissions.PUJAS_READ,
    Permissions.PUJAS_WRITE,
    Permissions.SLOTS_READ,
    Permissions.SLOTS_WRITE,
    Permissions.BOOKINGS_READ,
    Permissions.BOOKINGS_CHECK_IN,
    Permissions.BOOKINGS_CANCEL,
    Permissions.REPORTS_BOOKINGS_READ,
  ],
  priest: [
    Permissions.TEMPLES_READ,
    Permissions.PUJAS_READ,
    Permissions.SLOTS_READ,
    Permissions.BOOKINGS_READ,
    Permissions.BOOKINGS_CHECK_IN,
  ],
  temple_accountant: [
    Permissions.TEMPLES_READ,
    Permissions.CAMPAIGNS_READ,
    Permissions.DONATIONS_READ,
    Permissions.RECEIPTS_READ,
    Permissions.REPORTS_FINANCE_READ,
  ],
  devotee: [
    Permissions.TEMPLES_READ,
    Permissions.PUJAS_READ,
    Permissions.SLOTS_READ,
    Permissions.CAMPAIGNS_READ,
  ],
};

export const PlatformRolePermissions: Record<PlatformRole, Permission[]> = {
  none: [],
  platform_super_admin: Object.values(Permissions),
  platform_support: [
    Permissions.TEMPLES_READ,
    Permissions.PLATFORM_SUPPORT,
    Permissions.AUDIT_READ,
  ],
  platform_finance: [
    Permissions.PLATFORM_FINANCE,
  ],
};

export function hasPermission(
  role: TenantRole | null | undefined,
  platformRole: PlatformRole | null | undefined,
  permission: Permission
): boolean {
  if (platformRole === 'platform_super_admin') {
    return true;
  }
  if (platformRole && PlatformRolePermissions[platformRole]?.includes(permission)) {
    return true;
  }
  if (role && RolePermissions[role]?.includes(permission)) {
    return true;
  }
  return false;
}
