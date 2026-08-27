export type UserRoleKey = 'LANDLORD' | 'MANAGER' | 'TENANT' | 'SERVICE_PROVIDER' | 'MULTIROLE';

export interface UserRoleInfo {
  key: UserRoleKey;
  title: string;
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
  SERVICE_PROVIDER: {
    key: 'SERVICE_PROVIDER',
    title: 'Service Provider / Contractor',
    subtitle: 'Dispatched repair jobs, work order status & verified service history',
    icon: '🛠️',
    defaultRoute: 'service_providers',
  },
  MULTIROLE: {
    key: 'MULTIROLE',
    title: 'Multi-Role Account',
    subtitle: 'One MARS account with multiple authorized roles & workspaces',
    icon: '🔀',
    defaultRoute: 'multi_role_selection',
  },
};

export interface UserEntity {
  id: string;
  phoneNumber: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  pinHash?: string;
  googleUid?: string;
  googleEmail?: string;
  authProvider?: 'GOOGLE' | 'PASSWORD' | 'DEMO';
  primaryRole: UserRoleKey;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  isDemo: boolean;
  organizationId: string;
  createdAt: number;
  updatedAt: number;
}

export interface RoleAssignmentEntity {
  id: string;
  userId: string;
  role: UserRoleKey;
  propertyId?: string | null;
  unitId?: string | null;
  workspaceTitle: string;
  createdAt: number;
}

export interface PropertyEntity {
  id: string;
  ownerUserId: string;
  name: string;
  location: string;
  totalUnits: number;
  currency: string;
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
  lastSyncedAt: number;
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
  userId: string;
  propertyId: string;
  unitId: string;
  name: string;
  phone: string;
  unitName: string;
  propertyName: string;
  monthlyRent: number;
  rentDue: number;
  arrears: number;
  advanceCredit: number;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  leaseStart: number;
  leaseEnd: number;
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
  createdAt: number;
}

export interface PaymentEntity {
  id: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  tenantName: string;
  unitName: string;
  propertyName: string;
  amount: number;
  currency: string;
  paymentMethod: string; // e.g. "Mobile Money (MTN)", "Mobile Money (Airtel)", "Bank Transfer", "Cash"
  paymentStatus: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'REVERSED';
  externalReference: string;
  receiptNumber: string;
  recordedByUserId?: string;
  recordedBy: string;
  notes: string;
  date: string;
  paymentTimestamp: number;
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
  createdAt: number;
}

export interface ExpenseEntity {
  id: string;
  propertyId: string;
  propertyName: string;
  description: string;
  amount: number;
  currency: string;
  category: 'Maintenance' | 'Utilities' | 'Caretaker Wage' | 'Repairs' | 'Security' | 'General';
  receiptPhotoUri?: string | null;
  recordedBy: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  date: string;
  expenseTimestamp: number;
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
  createdAt: number;
}

export interface MaintenanceEntity {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitName: string;
  tenantName: string;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Cancelled';
  assignedProviderId?: string | null;
  assignedProviderName?: string | null;
  estimatedCost: number;
  actualCost: number;
  date: string;
  reportedTimestamp: number;
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
  createdAt: number;
}

export interface ServiceProviderEntity {
  id: string;
  userId?: string | null;
  name: string;
  serviceType: 'Plumbing' | 'Electrical' | 'Security' | 'Fumigation' | 'General' | 'Masonry' | 'Painting';
  phone: string;
  rate: string;
  rating: number;
  status: 'Available' | 'On Job' | 'Unavailable';
  assignedProperty: string;
  isVerified: boolean;
  createdAt: number;
}

export interface MonthlyPaymentStatusEntity {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  unitName: string;
  month: string; // e.g. "August 2026"
  status: 'Paid' | 'Pending' | 'Overdue';
  amountDue: number;
  amountPaid: number;
  updatedAt: number;
}

export interface AuditEventEntity {
  id: string;
  actorUserId: string;
  actorName: string;
  eventType: string; // "LOGIN", "LOGOUT", "PAYMENT_RECORDED", "PAYMENT_REVERSED", "EXPENSE_CREATED", "MAINTENANCE_LOGGED", "ROLE_SWITCH", "SYNC_EXECUTED", "PROPERTY_ADDED", "TENANT_REGISTERED", etc.
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
  frequency: string; // "Weekly", "Bi-weekly", "Monthly", "Quarterly", "Bi-annually"
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

