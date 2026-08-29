export type UserRoleKey = 'LANDLORD' | 'MANAGER' | 'TENANT' | 'SERVICE_PROVIDER';

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
  SERVICE_PROVIDER: {
    key: 'SERVICE_PROVIDER',
    title: 'Service Provider / Contractor',
    subtitle: 'Dispatched repair jobs, work order status & verified service history',
    icon: '🛠️',
    defaultRoute: 'service_providers',
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

export interface UserEntity {
  id: string;
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
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  isDemo?: boolean;
  organizationId?: string;
  assignedRoles: RoleAssignment[];
  activeContextId?: string;
  language?: 'en' | 'lg';
  createdAt: number;
  updatedAt?: number;
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
