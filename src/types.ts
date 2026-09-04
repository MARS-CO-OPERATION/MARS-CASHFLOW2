export type AccountType = 'PLATFORM' | 'CUSTOMER';

// CLASS B — PRODUCT / CUSTOMER ROLES
export type UserRoleKey = 'LANDLORD' | 'MANAGER' | 'TENANT';

// CLASS A — PLATFORM / CORPORATE ROLES
export type PlatformRoleKey =
  | 'PRINCIPAL_FOUNDER'
  | 'CO_FOUNDER'
  | 'CORPORATE_ADMIN'
  | 'BOARD'
  | 'INVESTOR'
  | 'GOVERNMENT'
  | 'PLATFORM_ADMIN'
  | 'PRODUCT_ADMIN'
  | 'FINANCE_ADMIN'
  | 'SECURITY_ADMIN';

export type ProductId =
  | 'MARS_CASHFLOW'
  | 'MARS_PROPERTIES'
  | 'MARS_URBAN_SERVICES'
  | 'MARS_PROJECTS'
  | string;

export interface PlatformRoleInfo {
  key: PlatformRoleKey;
  title: string;
  subtitle: string;
  icon: string;
  defaultScopes: string[];
}

export const PLATFORM_ROLES: Record<PlatformRoleKey, PlatformRoleInfo> = {
  PRINCIPAL_FOUNDER: {
    key: 'PRINCIPAL_FOUNDER',
    title: 'Principal Founder / Owner',
    subtitle: 'Supreme governance over MARS Corporation & Platform HQ',
    icon: '👑',
    defaultScopes: ['*'],
  },
  CO_FOUNDER: {
    key: 'CO_FOUNDER',
    title: 'Co-Founder',
    subtitle: 'Executive platform administration & strategic product governance',
    icon: '⚡',
    defaultScopes: [
      'platform.users.read',
      'platform.users.manage',
      'platform.products.read',
      'platform.products.manage',
      'platform.subscriptions.read',
      'platform.subscriptions.manage',
      'platform.analytics.read',
      'platform.audit.read',
      'corporate.governance.read',
    ],
  },
  CORPORATE_ADMIN: {
    key: 'CORPORATE_ADMIN',
    title: 'Corporate Administrator',
    subtitle: 'Enterprise operations, workspace compliance & billing management',
    icon: '🏢',
    defaultScopes: [
      'platform.users.read',
      'platform.products.read',
      'platform.subscriptions.read',
      'platform.subscriptions.manage',
      'platform.billing.manage',
      'platform.audit.read',
    ],
  },
  BOARD: {
    key: 'BOARD',
    title: 'Board Member',
    subtitle: 'Corporate oversight, quarterly governance filings & audited reports',
    icon: '🏛️',
    defaultScopes: [
      'corporate.governance.read',
      'platform.board.read',
      'platform.analytics.read',
    ],
  },
  INVESTOR: {
    key: 'INVESTOR',
    title: 'Institutional / Angel Investor',
    subtitle: 'Financial metrics, ARR/MRR trends & ecosystem business growth',
    icon: '📈',
    defaultScopes: [
      'platform.investors.read',
      'platform.analytics.read',
    ],
  },
  GOVERNMENT: {
    key: 'GOVERNMENT',
    title: 'Government Regulatory Partner',
    subtitle: 'Authorized statistical indexing, urban density & compliance audits',
    icon: '⚖️',
    defaultScopes: [
      'platform.government.read',
      'platform.government.reports',
    ],
  },
  PLATFORM_ADMIN: {
    key: 'PLATFORM_ADMIN',
    title: 'Platform Operations Admin',
    subtitle: 'Infrastructure uptime, product deployments & system configuration',
    icon: '🛠️',
    defaultScopes: [
      'platform.users.read',
      'platform.products.read',
      'platform.products.manage',
      'platform.security.manage',
      'platform.audit.read',
    ],
  },
  PRODUCT_ADMIN: {
    key: 'PRODUCT_ADMIN',
    title: 'Product Line Administrator',
    subtitle: 'Product feature flag management, tier limits & release control',
    icon: '📦',
    defaultScopes: [
      'platform.products.read',
      'platform.products.manage',
      'platform.subscriptions.read',
    ],
  },
  FINANCE_ADMIN: {
    key: 'FINANCE_ADMIN',
    title: 'Corporate Finance Administrator',
    subtitle: 'Treasury oversight, revenue reconciliation & subscription billing',
    icon: '💰',
    defaultScopes: [
      'platform.billing.manage',
      'platform.subscriptions.read',
      'platform.subscriptions.manage',
      'platform.analytics.read',
    ],
  },
  SECURITY_ADMIN: {
    key: 'SECURITY_ADMIN',
    title: 'Security & Audit Officer',
    subtitle: 'Access logs, permission enforcement & regulatory audit inspections',
    icon: '🛡️',
    defaultScopes: [
      'platform.security.manage',
      'platform.audit.read',
      'platform.users.read',
    ],
  },
};

export interface UserRoleInfo {
  key: UserRoleKey;
  title: string;
  label?: string;
  subtitle: string;
  icon: string;
  defaultRoute: string;
}

export const USER_ROLES: Record<UserRoleKey, UserRoleInfo> = {
  LANDLORD: {
    key: 'LANDLORD',
    title: 'Landlord / Owner',
    subtitle: 'Full portfolio oversight, rent tracking, debtors & net cashflow',
    icon: '👑',
    defaultRoute: 'landlord',
  },
  MANAGER: {
    key: 'MANAGER',
    title: 'Property Manager / Caretaker',
    subtitle: 'Ground collection, verified receipts & property operating expenses',
    icon: '👨🏾‍💼',
    defaultRoute: 'caretaker',
  },
  TENANT: {
    key: 'TENANT',
    title: 'Tenant / Occupant',
    subtitle: 'Own rent balance, payment history, receipts & maintenance tickets',
    icon: '👤',
    defaultRoute: 'tenant',
  },
};

export interface RoleAssignment {
  id: string;
  roleKey: UserRoleKey;
  role?: UserRoleKey;
  propertyId?: string | null;
  unitId?: string | null;
  workspaceTitle?: string;
  permissions?: string[];
  assignedAt: number;
}
export type RoleAssignmentEntity = RoleAssignment;

// CLASS B — CUSTOMER IDENTITY
export interface UserEntity {
  id: string;
  accountType?: AccountType;
  productId?: ProductId;
  phoneNumber?: string;
  phone?: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  pinHash?: string;
  googleUid?: string;
  googleEmail?: string;
  authProvider?: 'GOOGLE' | 'PASSWORD' | 'DEMO';
  primaryRole: UserRoleKey;
  customerRole?: UserRoleKey;
  platformRole?: PlatformRoleKey;
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  isDemo?: boolean;
  organizationId?: string;
  assignedRoles: RoleAssignment[];
  activeContextId?: string;
  language?: 'en' | 'lg';
  createdAt: number;
  updatedAt?: number;
}

// CLASS A — PLATFORM IDENTITY
export interface PlatformUserEntity {
  id: string;
  email: string;
  displayName: string;
  accountType: 'PLATFORM';
  organizationId: 'MARS_CORPORATION';
  platformRole: PlatformRoleKey;
  permissionScopes: string[];
  productScopes?: string[];
  governmentScopes?: string[];
  investorScopes?: string[];
  boardScopes?: string[];
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  invitedBy?: string;
  phoneNumber?: string;
  authProvider?: 'PASSWORD' | 'GOOGLE';
  lastLoginAt?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface ProductRegistryEntity {
  id: ProductId;
  name: string;
  tagline: string;
  category: 'FINANCE' | 'REAL_ESTATE' | 'UTILITIES' | 'ENGINEERING' | 'SERVICES' | 'OTHER';
  status: 'ACTIVE' | 'BETA' | 'IN_DEVELOPMENT' | 'MAINTENANCE';
  version: string;
  customerRoles: string[];
  featureFlags: Record<string, boolean>;
  subscriptionTiers: string[];
  description: string;
  icon: string;
  stats?: {
    activeWorkspaces?: number;
    totalUsers?: number;
    monthlyThroughputUgx?: number;
  };
  config?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface PlatformSubscriptionTierEntity {
  id: string;
  productId: ProductId;
  name: string;
  code: 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'CUSTOM';
  priceUgxMonthly: number;
  priceUgxAnnual: number;
  maxProperties: number;
  maxUnits: number;
  features: string[];
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: number;
}

export interface PlatformInvitationEntity {
  id: string;
  email: string;
  displayName: string;
  platformRole: PlatformRoleKey;
  permissionScopes: string[];
  invitedByUserId: string;
  invitedByName: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: number;
  createdAt: number;
}

export interface BoardReportEntity {
  id: string;
  title: string;
  period: string;
  reportType: 'QUARTERLY_GOVERNANCE' | 'ANNUAL_FINANCIAL' | 'PRODUCT_GROWTH' | 'COMPLIANCE';
  summary: string;
  highlights: string[];
  metrics: {
    activeProducts: number;
    totalTenanciesTracked: number;
    grossLedgerUgx: number;
    mrrUgx: number;
    systemUptime: string;
  };
  publishedBy: string;
  publishedAt: number;
  status: 'PUBLISHED' | 'DRAFT';
}

export interface InvestorMetricEntity {
  id: string;
  period: string;
  arrUgx: number;
  mrrUgx: number;
  yoyGrowthPercent: number;
  activeCustomerAccounts: number;
  customerRetentionRate: number;
  totalRentProcessedUgx: number;
  grossMerchandiseValueUgx: number;
  investmentRounds: {
    roundName: string;
    targetUgx: number;
    raisedUgx: number;
    status: 'PLANNED' | 'OPEN' | 'CLOSED';
  }[];
  lastUpdated: number;
}

export interface GovernmentAccessEntity {
  id: string;
  organizationName: string;
  department: string;
  contactEmail: string;
  contactPerson: string;
  jurisdiction: string;
  authorizedScope: 'AGGREGATED_STATISTICAL_RENTAL_INDEX' | 'URBAN_HOUSING_DENSITY' | 'RENTAL_TAX_COMPLIANCE_SUMMARY';
  dataAccessLimits: string;
  status: 'ACTIVE' | 'PENDING' | 'REVOKED';
  approvedByFounderId: string;
  authorizedAt: number;
  expiresAt: number;
}

export interface PlatformAuditLogEntity {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: PlatformRoleKey;
  action: string;
  targetType: 'PLATFORM_USER' | 'PRODUCT' | 'SUBSCRIPTION' | 'INVITATION' | 'GOVERNMENT' | 'INVESTOR' | 'BOARD' | 'SYSTEM' | 'SECURITY';
  targetId: string;
  details: string;
  ipAddress?: string;
  timestamp: number;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
}

export interface PropertyEntity {
  id: string;
  ownerUserId?: string;
  ownerId?: string;
  name: string;
  location: string;
  totalUnits: number;
  occupiedUnits?: number;
  monthlyRevenue?: number;
  propertyType?: 'Residential' | 'Commercial' | 'Mixed-Use' | 'Student Hostel' | 'Industrial';
  currency?: string;
  syncStatus?: 'SYNCED' | 'PENDING' | 'FAILED';
  lastSyncedAt?: number;
  createdAt: number;
}

export interface UnitEntity {
  id: string;
  propertyId: string;
  unitName: string;
  monthlyRent: number;
  status: 'OCCUPIED' | 'VACANT' | 'MAINTENANCE';
  createdAt: number;
}

export interface TenantEntity {
  id: string;
  userId?: string;
  propertyId?: string;
  unitId?: string;
  name: string;
  phone: string;
  email?: string;
  unitName: string;
  propertyName: string;
  monthlyRent: number;
  rentDue?: number;
  arrears: number;
  advanceCredit?: number;
  advanceBalance?: number;
  depositPaid?: number;
  paymentStatus?: 'Paid' | 'Pending' | 'Overdue';
  status?: 'Paid' | 'Pending' | 'Overdue' | 'Current';
  leaseStart?: number;
  leaseEnd?: number;
  leaseStartDate?: string;
  leaseEndDate?: string;
  nextDueDate?: string;
  nin?: string;
  syncStatus?: 'SYNCED' | 'PENDING' | 'FAILED';
  createdAt: number;
}

export interface PaymentEntity {
  id: string;
  tenantId?: string;
  propertyId?: string;
  unitId?: string;
  tenantName: string;
  tenantPhone?: string;
  unitName: string;
  propertyName: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  paymentStatus?: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'REVERSED';
  externalReference?: string;
  transactionReference?: string;
  receiptNumber: string;
  recordedByUserId?: string;
  recordedBy?: string;
  issuedByName?: string;
  notes: string;
  date: string;
  paymentTimestamp: number;
  syncStatus?: 'SYNCED' | 'PENDING' | 'FAILED';
  createdAt: number;
}

export interface ExpenseEntity {
  id: string;
  propertyId?: string;
  propertyName: string;
  description: string;
  amount: number;
  currency?: string;
  category: 'Maintenance' | 'Utilities' | 'Caretaker Wage' | 'Repairs' | 'Security' | 'General';
  recipientName?: string;
  recipientPhone?: string;
  receiptPhotoUri?: string | null;
  receiptPhotoUrl?: string | null;
  receiptPhoto?: string | null;
  recordedBy?: string;
  authorizedByName?: string;
  linkedMaintenanceId?: string;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  date: string;
  expenseTimestamp: number;
  syncStatus?: 'SYNCED' | 'PENDING' | 'FAILED';
  createdAt: number;
}

export type MaintenanceUrgency = 'Emergency' | 'Urgent' | 'Normal' | 'Low';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'EMERGENCY';

export type MaintenanceStatus =
  | 'Pending'
  | 'In Progress'
  | 'Resolved'
  | 'Cancelled'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INSPECTION_SCHEDULED'
  | 'QUOTATION_PROVIDED'
  | 'APPROVED'
  | 'DECLINED'
  | 'IN_PROGRESS'
  | 'WORK_IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

export interface MaintenanceQuotation {
  id: string;
  laborCost?: number;
  labourCost?: number;
  materialCost?: number;
  materialsCost?: number;
  transportCost?: number;
  totalCost: number;
  scopeOfWork?: string;
  materialBreakdown?: string[];
  estimatedDays?: number;
  inspectorName?: string;
  inspectorPhone?: string;
  inspectorNotes?: string;
  submittedAt: number;
  validUntil?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface MaintenanceEntity {
  id: string;
  propertyId?: string;
  propertyName: string;
  buildingName?: string;
  unitId?: string;
  unitName: string;
  tenantName: string;
  tenantPhone?: string;
  serviceCategory?: string;
  issue: string;
  priority: MaintenancePriority;
  urgency?: MaintenanceUrgency;
  status: MaintenanceStatus;
  preferredDate?: string;
  preferredTime?: string;
  contactPhone?: string;
  photos?: string[];
  additionalNotes?: string;
  assignedProviderId?: string | null;
  assignedProviderName?: string | null;
  estimatedCost: number;
  approvedCost?: number;
  actualCost?: number;
  isMarsProjectsUganda?: boolean;
  marsProjectsTicketNumber?: string;
  quotation?: MaintenanceQuotation;
  linkedExpenseId?: string;
  date: string;
  reportedTimestamp: number;
  completedAt?: number;
  syncStatus?: 'SYNCED' | 'PENDING' | 'FAILED';
  syncState?: 'SYNCED' | 'PENDING' | 'FAILED';
  createdAt: number;
}

export interface ServiceProviderEntity {
  id: string;
  userId?: string | null;
  name: string;
  serviceType: 'Plumbing' | 'Electrical' | 'Security' | 'Fumigation' | 'General' | 'Masonry' | 'Painting' | 'Roofing' | 'Carpentry' | 'Tiling';
  phone: string;
  rate: string;
  rating: number;
  status: 'Available' | 'On Job' | 'Unavailable';
  assignedProperty: string;
  isVerified?: boolean;
  isVettedByMarsProjects?: boolean;
  completedJobsCount?: number;
  createdAt: number;
}

export interface ManagerPermissions {
  canCollectPayments: boolean;
  canLogPayments?: boolean;
  canLogExpenses: boolean;
  canDispatchMaintenance: boolean;
  canDispatchRepairs?: boolean;
  expenseLimitUgx: number;
  maxExpenseApprovalUgx?: number;
}

export interface ManagerEntity {
  id: string;
  name: string;
  phone: string;
  email?: string;
  pin: string;
  assignedPropertyIds: string[];
  permissions: ManagerPermissions;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: number;
}

export interface MonthlyPaymentStatusEntity {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  unitName: string;
  month: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  amountDue: number;
  amountPaid: number;
  updatedAt: number;
}

export interface AuditEventEntity {
  id: string;
  actorUserId: string;
  actorName: string;
  eventType: string;
  resourceType: 'PAYMENT' | 'TENANT' | 'PROPERTY' | 'EXPENSE' | 'AUTH' | 'SYSTEM' | 'MAINTENANCE' | 'NOTIFICATION';
  resourceId: string;
  details: string;
  timestamp: number;
}

export interface NotificationEntity {
  id: string;
  recipientPhone: string;
  recipientName: string;
  title: string;
  message: string;
  channel: 'IN_APP' | 'SMS_GATEWAY';
  deliveryStatus: 'SENT' | 'QUEUED' | 'FAILED' | 'NOT_CONNECTED';
  timestamp: number;
}

export interface RecurringTask {
  id: string;
  title: string;
  property: string;
  frequency: string;
  nextDueDate: string;
  assignedVendor: string;
  estimatedCost: number;
  category: string;
  status: 'Upcoming' | 'Due Today' | 'Overdue' | 'Completed';
  lastServiced?: string;
}

export interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface MarsBackupData {
  version: string;
  exportedAt: string;
  timestamp: number;
  app: string;
  exportedBy: {
    name: string;
    email: string;
    role: string;
  };
  summary: {
    propertiesCount: number;
    tenantsCount: number;
    paymentsCount: number;
    expensesCount: number;
    maintenanceCount: number;
    serviceProvidersCount: number;
    tasksCount: number;
    auditEventsCount: number;
  };
  properties: PropertyEntity[];
  tenants: TenantEntity[];
  payments: PaymentEntity[];
  expenses: ExpenseEntity[];
  maintenance: MaintenanceEntity[];
  serviceProviders: ServiceProviderEntity[];
  recurringTasks: RecurringTask[];
  auditTrail: AuditEventEntity[];
}

export interface GoogleDriveBackupFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  size?: string;
  modifiedTime?: string;
  summary?: MarsBackupData['summary'];
  exportedAt?: string;
}
