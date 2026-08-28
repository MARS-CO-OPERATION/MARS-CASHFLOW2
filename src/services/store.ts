import {
  UserEntity,
  RoleAssignmentEntity,
  PropertyEntity,
  TenantEntity,
  PaymentEntity,
  ExpenseEntity,
  MaintenanceEntity,
  ServiceProviderEntity,
  AuditEventEntity,
  NotificationEntity,
  RecurringTask,
  UserRoleKey,
  MonthlyPaymentStatusEntity,
} from '../types';

// ZERO-SAMPLE-DATA: Non-negotiable clean production initial arrays.
export const INITIAL_PROPERTIES: PropertyEntity[] = [];
export const INITIAL_TENANTS: TenantEntity[] = [];
export const INITIAL_PAYMENTS: PaymentEntity[] = [];
export const INITIAL_EXPENSES: ExpenseEntity[] = [];
export const INITIAL_MAINTENANCE: MaintenanceEntity[] = [];
export const INITIAL_SERVICE_PROVIDERS: ServiceProviderEntity[] = [];
export const INITIAL_RECURRING_TASKS: RecurringTask[] = [];
export const INITIAL_AUDIT_TRAIL: AuditEventEntity[] = [];

// MARS Projects Uganda Official Contact & Directory Configurations
export const MARS_PROJECTS_CONTACT = {
  name: 'MARS Projects Uganda',
  tagline: 'Official Maintenance, Renovation & Capital Works Partner',
  phone: '+256 700 123 456',
  phoneRaw: '+256700123456',
  whatsapp: '256700123456',
  email: 'services@marsprojects.ug',
  website: 'https://marsprojects.ug',
  headquarters: 'Kampala, Uganda',
  operatingHours: '24/7 Emergency Response & Standard Field Service (Mon-Sat 8:00 AM - 6:00 PM)',
};

export const MARS_PROJECT_CATEGORIES = [
  'Repairs & Maintenance',
  'Plumbing',
  'Electrical',
  'Painting',
  'Carpentry',
  'Masonry',
  'Roofing',
  'Tiling',
  'Renovation',
  'Property Improvements',
  'Cleaning / Property Services',
  'General Repairs',
  'Other',
] as const;

export const MARS_SUBSCRIPTION_PLANS = [
  {
    id: 'FREE_TRIAL',
    name: '2-Month Free Trial',
    nameLg: 'Emyezi 2 egy\'Obwereere',
    priceUgx: 0,
    period: 'First 60 Days Free',
    periodLg: 'Ennaku 60 Ezisooka za Bwereere',
    description: 'Full unrestricted access to all MARS Cashflow & MARS Projects features with zero charges.',
    maxProperties: 'Unlimited',
    maxUnits: 'Unlimited',
    badge: 'FREE TRIAL',
  },
  {
    id: 'STANDARD_ESTATE',
    name: 'Standard Estate Plan',
    nameLg: 'Enteekateeka ya Bwabulijjo',
    priceUgx: 35000,
    period: 'per month (from Month 3)',
    periodLg: 'buli mwezi (okuva mu mwezi ogw\'3)',
    description: 'Ideal for single residential rental estates and standalone apartments up to 15 units.',
    maxProperties: '1 - 2 Estates',
    maxUnits: 'Up to 15 Units',
    badge: 'POPULAR',
  },
  {
    id: 'PORTFOLIO_PRO',
    name: 'Portfolio Pro Plan',
    nameLg: 'Enteekateeka y\'Ebyamayumba Ebingi',
    priceUgx: 75000,
    period: 'per month (from Month 3)',
    periodLg: 'buli mwezi (okuva mu mwezi ogw\'3)',
    description: 'Advanced multi-property management, caretaker permissions, SMS notifications, and priority MARS Projects dispatch.',
    maxProperties: 'Up to 8 Estates',
    maxUnits: 'Up to 50 Units',
    badge: 'RECOMMENDED',
  },
  {
    id: 'COMMERCIAL_SCALE',
    name: 'Commercial & Multi-Estate Plan',
    nameLg: 'Enteekateeka y\'Ebizimbe Ebinene',
    priceUgx: 150000,
    period: 'per month (from Month 3)',
    periodLg: 'buli mwezi (okuva mu mwezi ogw\'3)',
    description: 'Unlimited properties, commercial plazas, student hostels, bank audit export, and dedicated account manager.',
    maxProperties: 'Unlimited',
    maxUnits: 'Unlimited',
    badge: 'ENTERPRISE',
  },
];

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'mars_user_session_v2',
  PROPERTIES: 'mars_properties_v2',
  TENANTS: 'mars_tenants_v2',
  PAYMENTS: 'mars_payments_v2',
  EXPENSES: 'mars_expenses_v2',
  MAINTENANCE: 'mars_maintenance_v2',
  SERVICE_PROVIDERS: 'mars_service_providers_v2',
  RECURRING_TASKS: 'mars_recurring_tasks_v2',
  AUDIT_TRAIL: 'mars_audit_trail_v2',
  MANAGERS: 'mars_managers_v2',
  ACTIVE_CONTEXT: 'mars_active_context_v2',
  LANGUAGE: 'mars_language_v2',
};

// Safe Local Storage Helpers
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

export function clearMarsStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('Error clearing MARS storage:', err);
  }
}
