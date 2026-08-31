import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserEntity,
  RoleAssignment,
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
  ManagerEntity,
  MaintenanceStatus,
  MaintenanceUrgency,
  MaintenanceQuotation,
} from '../types';
import {
  INITIAL_PROPERTIES,
  INITIAL_TENANTS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_MAINTENANCE,
  INITIAL_SERVICE_PROVIDERS,
  INITIAL_RECURRING_TASKS,
  INITIAL_AUDIT_TRAIL,
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
  MARS_PROJECTS_CONTACT,
  clearMarsStorage,
} from '../services/store';
import { Language, translations, Translations } from '../utils/i18n';
import { auth, onAuthStateChanged, emailSignIn, emailSignUp, logout as firebaseLogout } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

interface MarsContextType {
  currentUser: UserEntity | null;
  currentRole: UserRoleKey;
  activeContext: RoleAssignment | null;
  authorizedRoles: RoleAssignment[];
  
  // Collections (Filtered to active context where appropriate)
  properties: PropertyEntity[];
  allProperties: PropertyEntity[];
  tenants: TenantEntity[];
  allTenants: TenantEntity[];
  payments: PaymentEntity[];
  allPayments: PaymentEntity[];
  expenses: ExpenseEntity[];
  allExpenses: ExpenseEntity[];
  maintenance: MaintenanceEntity[];
  allMaintenance: MaintenanceEntity[];
  serviceProviders: ServiceProviderEntity[];
  recurringTasks: RecurringTask[];
  auditTrail: AuditEventEntity[];
  managers: ManagerEntity[];
  notifications: NotificationEntity[];
  
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  
  // Sync
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  syncMessage: string | null;
  triggerSync: (callback?: (status: boolean, message: string) => void) => void;
  
  // Auth & Identity
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (data: { displayName: string; phone: string; email: string; password: string; role: UserRoleKey; propertyName?: string }) => Promise<boolean>;
  logout: () => void;
  switchWorkspace: (roleKey: UserRoleKey, workspaceTitle?: string) => void;
  switchContext: (contextId: string) => void;
  
  // Property & Tenant Management
  addProperty: (property: { name: string; location: string; totalUnits: number; propertyType?: PropertyEntity['propertyType'] }) => { success: boolean; propertyId: string };
  addTenant: (tenant: {
    name: string;
    phone: string;
    propertyName: string;
    propertyId?: string;
    unitName: string;
    unitId?: string;
    monthlyRent: number;
    arrears?: number;
    advanceBalance?: number;
    nin?: string;
  }) => { success: boolean; tenantId: string };
  
  // Financial Operations
  recordPayment: (payment: {
    tenantName: string;
    tenantPhone?: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    propertyName?: string;
    unitName?: string;
    periodCovered?: string;
  }) => { success: boolean; paymentId?: string; message: string };
  
  processMobileMoneyPayment: (params: {
    provider: 'MTN_MOMO' | 'AIRTEL_MONEY';
    phone: string;
    amount: number;
    tenantName: string;
    propertyName: string;
    unitName: string;
    notes?: string;
  }) => Promise<{ success: boolean; paymentId?: string; receiptNumber?: string; message: string }>;
  
  addExpense: (expense: {
    propertyName: string;
    description: string;
    amount: number;
    category: ExpenseEntity['category'];
    recipientName?: string;
    recipientPhone?: string;
    receiptPhotoUrl?: string;
    linkedMaintenanceId?: string;
  }) => { success: boolean; expenseId: string; message: string };
  
  // MARS Projects Uganda Maintenance & Project Service Integration
  requestMarsProjectsService: (request: {
    propertyName: string;
    buildingName?: string;
    unitName: string;
    tenantName: string;
    tenantPhone?: string;
    serviceCategory: string;
    issue: string;
    urgency: MaintenanceUrgency;
    priority?: MaintenanceEntity['priority'];
    preferredDate?: string;
    preferredTime?: string;
    contactPhone?: string;
    photos?: string[];
    additionalNotes?: string;
    estimatedCost?: number;
  }) => { success: boolean; ticketId: string; ticketNumber: string; message: string };
  
  addMaintenance: (item: {
    propertyName: string;
    unitName: string;
    tenantName: string;
    issue: string;
    priority?: MaintenanceEntity['priority'];
    estimatedCost?: number;
    assignedProviderName?: string;
  }) => { success: boolean; message: string };
  
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus, actualCost?: number) => void;
  submitMaintenanceQuotation: (maintenanceId: string, quotation: Omit<MaintenanceQuotation, 'id' | 'submittedAt' | 'status'>) => void;
  approveMaintenanceQuotation: (maintenanceId: string) => void;
  declineMaintenanceQuotation: (maintenanceId: string, reason?: string) => void;
  linkMaintenanceToCashflowExpense: (maintenanceId: string) => { success: boolean; expenseId?: string; message: string };
  
  // Contractors & Recurring Tasks
  addServiceProvider: (provider: {
    name: string;
    serviceType: ServiceProviderEntity['serviceType'];
    phone: string;
    rate: string;
    assignedProperty: string;
  }) => void;
  updateServiceProviderStatus: (id: string, status: ServiceProviderEntity['status']) => void;
  addRecurringTask: (task: Omit<RecurringTask, 'id' | 'status'>) => void;
  
  // Landlord-Only Controls
  addManager: (manager: Omit<ManagerEntity, 'id' | 'createdAt'>) => void;
  updateManagerStatus: (managerId: string, status: 'ACTIVE' | 'DISABLED') => void;
  resetManagerPin: (managerId: string, newPin: string) => void;
  updateManagerPermissions: (managerId: string, permissions: ManagerEntity['permissions']) => void;
  removeManager: (managerId: string) => void;
  
  // Reminders & Utilities
  sendTenantReminder: (
    tenantName: string,
    phone: string,
    amountDue: number,
    propertyName: string,
    unitName: string,
    onSuccess?: () => void
  ) => void;
  resetToCleanDatabase: () => void;
  isDemoMode: boolean;
}

const MarsContext = createContext<MarsContextType | undefined>(undefined);

export const MarsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current logged in user loaded from the authenticated Firebase profile.
  const [currentUser, setCurrentUser] = useState<UserEntity | null>(() =>
    loadFromStorage<UserEntity | null>(STORAGE_KEYS.USER, null)
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: import('firebase/auth').User | null) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
        return;
      }
      const profile = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!profile.exists()) {
        setCurrentUser(null);
        return;
      }
      const data = profile.data() as UserEntity;
      setCurrentUser({ ...data, id: firebaseUser.uid, email: firebaseUser.email || data.email });
    });
    return unsubscribe;
  }, []);

  // Language state
  const [language, setLanguageState] = useState<Language>(() => {
    return loadFromStorage<Language>(STORAGE_KEYS.LANGUAGE, 'en');
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveToStorage(STORAGE_KEYS.LANGUAGE, lang);
    if (currentUser) {
      const updated = { ...currentUser, language: lang };
      setCurrentUser(updated);
      saveToStorage(STORAGE_KEYS.USER, updated);
    }
  };

  const t = useMemo(() => translations[language], [language]);

  // Active Role & Context
  const authorizedRoles = useMemo(() => {
    if (!currentUser) return [];
    return currentUser.assignedRoles || [];
  }, [currentUser]);

  const activeContext = useMemo(() => {
    if (!currentUser || !currentUser.assignedRoles.length) return null;
    const found = currentUser.assignedRoles.find((r) => r.id === currentUser.activeContextId);
    return found || currentUser.assignedRoles[0] || null;
  }, [currentUser]);

  const currentRole: UserRoleKey = activeContext?.roleKey || currentUser?.primaryRole || 'LANDLORD';

  // Core Collections (initialized with ZERO sample data by default)
  const [properties, setProperties] = useState<PropertyEntity[]>(() =>
    loadFromStorage<PropertyEntity[]>(STORAGE_KEYS.PROPERTIES, [])
  );

  const [tenants, setTenants] = useState<TenantEntity[]>(() =>
    loadFromStorage<TenantEntity[]>(STORAGE_KEYS.TENANTS, [])
  );

  const [payments, setPayments] = useState<PaymentEntity[]>(() =>
    loadFromStorage<PaymentEntity[]>(STORAGE_KEYS.PAYMENTS, [])
  );

  const [expenses, setExpenses] = useState<ExpenseEntity[]>(() =>
    loadFromStorage<ExpenseEntity[]>(STORAGE_KEYS.EXPENSES, [])
  );

  const [maintenance, setMaintenance] = useState<MaintenanceEntity[]>(() =>
    loadFromStorage<MaintenanceEntity[]>(STORAGE_KEYS.MAINTENANCE, [])
  );

  const [serviceProviders, setServiceProviders] = useState<ServiceProviderEntity[]>(() =>
    loadFromStorage<ServiceProviderEntity[]>(STORAGE_KEYS.SERVICE_PROVIDERS, INITIAL_SERVICE_PROVIDERS)
  );

  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>(() =>
    loadFromStorage<RecurringTask[]>(STORAGE_KEYS.RECURRING_TASKS, INITIAL_RECURRING_TASKS)
  );

  const [auditTrail, setAuditTrail] = useState<AuditEventEntity[]>(() =>
    loadFromStorage<AuditEventEntity[]>(STORAGE_KEYS.AUDIT_TRAIL, INITIAL_AUDIT_TRAIL)
  );

  const [managers, setManagers] = useState<ManagerEntity[]>(() =>
    loadFromStorage<ManagerEntity[]>(STORAGE_KEYS.MANAGERS, [])
  );

  const [notifications, setNotifications] = useState<NotificationEntity[]>([]);

  // Scope every client-visible collection by the authenticated user and assignment.
  // Firestore rules remain the source of truth; this prevents accidental cross-property UI exposure.
  const scopedPropertyIds = useMemo(() => {
    if (!currentUser) return new Set<string>();
    if (currentRole === 'LANDLORD') return new Set(properties.filter((property) => (property.ownerUserId || property.ownerId) === currentUser.id).map((property) => property.id));
    if (currentRole === 'MANAGER') return new Set(currentUser.assignedRoles.filter((role) => role.roleKey === 'MANAGER' && role.propertyId).map((role) => role.propertyId as string));
    if (activeContext?.propertyId) return new Set([activeContext.propertyId]);
    return new Set<string>();
  }, [activeContext?.propertyId, currentRole, currentUser, properties]);
  const visibleProperties = useMemo(() => properties.filter((property) => scopedPropertyIds.has(property.id)), [properties, scopedPropertyIds]);
  const visibleTenants = useMemo(() => tenants.filter((tenant) => currentRole === 'TENANT' ? tenant.userId === currentUser?.id : Boolean(tenant.propertyId && scopedPropertyIds.has(tenant.propertyId))), [currentRole, currentUser?.id, scopedPropertyIds, tenants]);
  const visiblePayments = useMemo(() => payments.filter((payment) => Boolean(payment.propertyId && scopedPropertyIds.has(payment.propertyId))), [payments, scopedPropertyIds]);
  const visibleExpenses = useMemo(() => expenses.filter((expense) => Boolean(expense.propertyId && scopedPropertyIds.has(expense.propertyId))), [expenses, scopedPropertyIds]);
  const visibleMaintenance = useMemo(() => maintenance.filter((item) => Boolean(item.propertyId && scopedPropertyIds.has(item.propertyId))), [maintenance, scopedPropertyIds]);

  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [syncMessage, setSyncMessage] = useState<string | null>('Local changes are pending cloud synchronization');

  // Persistence hooks
  useEffect(() => saveToStorage(STORAGE_KEYS.PROPERTIES, properties), [properties]);
  useEffect(() => saveToStorage(STORAGE_KEYS.TENANTS, tenants), [tenants]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PAYMENTS, payments), [payments]);
  useEffect(() => saveToStorage(STORAGE_KEYS.EXPENSES, expenses), [expenses]);
  useEffect(() => saveToStorage(STORAGE_KEYS.MAINTENANCE, maintenance), [maintenance]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SERVICE_PROVIDERS, serviceProviders), [serviceProviders]);
  useEffect(() => saveToStorage(STORAGE_KEYS.RECURRING_TASKS, recurringTasks), [recurringTasks]);
  useEffect(() => saveToStorage(STORAGE_KEYS.AUDIT_TRAIL, auditTrail), [auditTrail]);
  useEffect(() => saveToStorage(STORAGE_KEYS.MANAGERS, managers), [managers]);

  // Subscription monetization intentionally disabled for the current MARS Cashflow release.
  // Future billing may be introduced without changing the core property, tenant, payment,
  // expense, maintenance, or authorization architecture.

  // Audit Logging
  const addAuditEvent = (
    eventType: string,
    resourceType: AuditEventEntity['resourceType'],
    resourceId: string,
    details: string
  ) => {
    const newEvent: AuditEventEntity = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorUserId: currentUser?.id || 'sys-anon',
      actorName: currentUser?.displayName ? `${currentUser.displayName} (${currentRole})` : 'System User',
      eventType,
      resourceType,
      resourceId,
      details,
      timestamp: Date.now(),
    };
    setAuditTrail((prev) => [newEvent, ...prev]);
  };

  // Context Switcher & Auth
  const switchContext = (contextId: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, activeContextId: contextId };
    setCurrentUser(updated);
    saveToStorage(STORAGE_KEYS.USER, updated);
    addAuditEvent('CONTEXT_SWITCHED', 'SYSTEM', contextId, `Switched working context to ${contextId}`);
  };

  const switchWorkspace = (roleKey: UserRoleKey, _title?: string) => {
    if (!currentUser) return;
    // A workspace is granted by the authenticated profile, never created by the client.
    const targetRole = currentUser.assignedRoles.find((r) => r.roleKey === roleKey);
    if (targetRole) switchContext(targetRole.id);
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    if (!identifier.includes('@') || password.length < 8) return false;
    try {
      await emailSignIn(identifier, password);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (data: { displayName: string; phone: string; email: string; password: string; role?: UserRoleKey; propertyName?: string }): Promise<boolean> => {
    if (!data.email.includes('@') || data.password.length < 8) return false;
    // Strict production rule: Only landlords can self-register. Managers & tenants are invited/created by authorized landlords.
    const assignedRole: UserRoleKey = 'LANDLORD';
    try {
      const firebaseUser = await emailSignUp(data.email, data.password);
      const now = Date.now();
      const roleAssignment: RoleAssignment = { id: `role-primary-${firebaseUser.uid}`, roleKey: assignedRole, assignedAt: now, permissions: ['ALL'] };
      const newUser: UserEntity = { id: firebaseUser.uid, phone: data.phone, email: data.email, displayName: data.displayName, primaryRole: assignedRole, accountStatus: 'ACTIVE', authProvider: 'PASSWORD', assignedRoles: [roleAssignment], activeContextId: roleAssignment.id, createdAt: now, language };
      await setDoc(doc(db, 'users', firebaseUser.uid), { ...newUser, createdAt: serverTimestamp() });
      setCurrentUser(newUser);
      saveToStorage(STORAGE_KEYS.USER, newUser);
      // Property creation happens after the authenticated profile is established, through the landlord workflow.
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    void firebaseLogout();
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  // Property & Tenant Actions
  const addProperty = (property: { name: string; location: string; totalUnits: number; propertyType?: PropertyEntity['propertyType'] }) => {
    const id = `prop-${Date.now()}`;
    const newProp: PropertyEntity = {
      id,
      name: property.name,
      location: property.location,
      totalUnits: Number(property.totalUnits) || 1,
      occupiedUnits: 0,
      monthlyRevenue: 0,
      propertyType: property.propertyType || 'Residential',
      createdAt: Date.now(),
      ownerUserId: currentUser?.id,
      ownerId: currentUser?.id,
      currency: 'UGX',
      syncStatus: 'PENDING',
    };
    setProperties((prev) => [newProp, ...prev]);
    addAuditEvent('PROPERTY_ADDED', 'PROPERTY', id, `Added property "${property.name}" with ${property.totalUnits} units`);
    return { success: true, propertyId: id };
  };

  const addTenant = (tenant: {
    name: string;
    phone: string;
    propertyName: string;
    propertyId?: string;
    unitName: string;
    unitId?: string;
    monthlyRent: number;
    arrears?: number;
    advanceBalance?: number;
    nin?: string;
  }) => {
    const id = `ten-${Date.now()}`;
    const newTenant: TenantEntity = {
      id,
      name: tenant.name,
      phone: tenant.phone,
      propertyName: tenant.propertyName,
      propertyId: tenant.propertyId,
      unitName: tenant.unitName,
      unitId: tenant.unitId,
      monthlyRent: Number(tenant.monthlyRent) || 0,
      depositPaid: 0,
      arrears: Number(tenant.arrears) || 0,
      advanceBalance: Number(tenant.advanceBalance) || 0,
      leaseStartDate: new Date().toISOString().split('T')[0],
      leaseEndDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: (Number(tenant.arrears) || 0) > 0 ? 'Overdue' : 'Current',
      nextDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      nin: tenant.nin,
      createdAt: Date.now(),
    };

    setTenants((prev) => [newTenant, ...prev]);

    // Update property occupied units count
    setProperties((prev) =>
      prev.map((p) => {
        if (p.name === tenant.propertyName || p.id === tenant.propertyId) {
          return {
            ...p,
            occupiedUnits: (p.occupiedUnits || 0) + 1,
            monthlyRevenue: (p.monthlyRevenue || 0) + newTenant.monthlyRent,
          };
        }
        return p;
      })
    );

    addAuditEvent('TENANT_ADDED', 'TENANT', id, `Onboarded tenant ${tenant.name} to ${tenant.propertyName} (${tenant.unitName})`);
    return { success: true, tenantId: id };
  };

  // Payment Recording
  const recordPayment = (payment: {
    tenantName: string;
    tenantPhone?: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    propertyName?: string;
    unitName?: string;
    periodCovered?: string;
  }) => {
    const id = `pay-${Date.now()}`;
    const receiptNumber = `MARS-RCT-${Math.floor(100000 + Math.random() * 900000)}`;

    const targetTenant = tenants.find((t) => t.name === payment.tenantName);
    const propertyName = payment.propertyName || targetTenant?.propertyName || 'Estate Property';
    const unitName = payment.unitName || targetTenant?.unitName || 'Unit';

    const newPayment: PaymentEntity = {
      id,
      receiptNumber,
      tenantName: payment.tenantName,
      tenantPhone: payment.tenantPhone || targetTenant?.phone,
      tenantId: targetTenant?.id,
      propertyName,
      unitName,
      amount: Number(payment.amount),
      date: new Date().toISOString().split('T')[0],
      paymentTimestamp: Date.now(),
      paymentMethod: payment.paymentMethod,
      transactionReference: `UGX-${Date.now().toString().slice(-6)}`,
      notes: payment.notes || 'Verified rent collection',
      issuedByName: currentUser?.displayName || 'Caretaker Desk',
      paymentStatus: 'PENDING',
      syncStatus: 'PENDING',
      createdAt: Date.now(),
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Adjust tenant arrears or advance balance
    if (targetTenant) {
      setTenants((prev) =>
        prev.map((t) => {
          if (t.id === targetTenant.id) {
            const remainingArrears = Math.max(0, t.arrears - payment.amount);
            const extra = Math.max(0, payment.amount - t.arrears);
            return {
              ...t,
              arrears: remainingArrears,
              advanceBalance: (t.advanceBalance || 0) + extra,
              status: remainingArrears === 0 ? 'Current' : 'Overdue',
            };
          }
          return t;
        })
      );
    }

    addAuditEvent('PAYMENT_RECORDED', 'PAYMENT', id, `Recorded payment UGX ${payment.amount.toLocaleString()} from ${payment.tenantName}. Receipt: ${receiptNumber}`);

    return {
      success: true,
      paymentId: id,
      message: `Payment of UGX ${payment.amount.toLocaleString()} recorded. Receipt #${receiptNumber} generated.`,
    };
  };

  // Mobile Money Backend Adapter Simulation
  const processMobileMoneyPayment = async (params: {
    provider: 'MTN_MOMO' | 'AIRTEL_MONEY';
    phone: string;
    amount: number;
    tenantName: string;
    propertyName: string;
    unitName: string;
    notes?: string;
  }): Promise<{ success: boolean; paymentId?: string; receiptNumber?: string; message: string }> => {
    const methodLabel = params.provider === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Airtel Money';
    return {
      success: false,
      message: `${methodLabel} collection is pending provider configuration. No payment was recorded or marked as verified.`,
    };
  };

  // Expense Recording
  const addExpense = (expense: {
    propertyName: string;
    description: string;
    amount: number;
    category: ExpenseEntity['category'];
    recipientName?: string;
    recipientPhone?: string;
    receiptPhotoUrl?: string;
    linkedMaintenanceId?: string;
  }) => {
    const id = `exp-${Date.now()}`;
    const newExpense: ExpenseEntity = {
      id,
      propertyName: expense.propertyName,
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      date: new Date().toISOString().split('T')[0],
      expenseTimestamp: Date.now(),
      recipientName: expense.recipientName || 'Contractor / Vendor',
      recipientPhone: expense.recipientPhone,
      receiptPhotoUrl: expense.receiptPhotoUrl,
      authorizedByName: currentUser?.displayName || 'Authorized Landlord',
      linkedMaintenanceId: expense.linkedMaintenanceId,
      syncStatus: 'SYNCED',
      createdAt: Date.now(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    addAuditEvent('EXPENSE_CREATED', 'EXPENSE', id, `Logged expense UGX ${expense.amount.toLocaleString()} for "${expense.description}" under ${expense.category}`);

    return { success: true, expenseId: id, message: 'Expense voucher successfully approved and logged to ledger.' };
  };

  // MARS Projects Uganda Maintenance & Project Service Integration
  const requestMarsProjectsService = (request: {
    propertyName: string;
    buildingName?: string;
    unitName: string;
    tenantName: string;
    tenantPhone?: string;
    serviceCategory: string;
    issue: string;
    urgency: MaintenanceUrgency;
    priority?: MaintenanceEntity['priority'];
    preferredDate?: string;
    preferredTime?: string;
    contactPhone?: string;
    photos?: string[];
    additionalNotes?: string;
    estimatedCost?: number;
  }) => {
    const id = `maint-${Date.now()}`;
    const ticketNumber = `MPU-TK-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTicket: MaintenanceEntity = {
      id,
      propertyName: request.propertyName,
      buildingName: request.buildingName,
      unitName: request.unitName,
      tenantName: request.tenantName,
      tenantPhone: request.tenantPhone || request.contactPhone,
      serviceCategory: request.serviceCategory,
      issue: request.issue,
      priority: request.priority || (request.urgency === 'Emergency' ? 'EMERGENCY' : request.urgency === 'Urgent' ? 'HIGH' : 'MEDIUM'),
      urgency: request.urgency,
      preferredDate: request.preferredDate,
      preferredTime: request.preferredTime,
      contactPhone: request.contactPhone,
      photos: request.photos || [],
      additionalNotes: request.additionalNotes,
      status: 'SUBMITTED',
      estimatedCost: request.estimatedCost || 0,
      isMarsProjectsUganda: true,
      marsProjectsTicketNumber: ticketNumber,
      syncState: 'SYNCED',
      reportedTimestamp: Date.now(),
      createdAt: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };

    setMaintenance((prev) => [newTicket, ...prev]);

    addAuditEvent(
      'MAINTENANCE_SUBMITTED',
      'MAINTENANCE',
      id,
      `Service request ${ticketNumber} (${request.serviceCategory}) dispatched to MARS Projects Uganda for ${request.propertyName} ${request.unitName}`
    );

    return {
      success: true,
      ticketId: id,
      ticketNumber,
      message: `Maintenance & Project Request #${ticketNumber} submitted directly to MARS Projects Uganda. Inspection & quotation dispatch pending.`,
    };
  };

  const addMaintenance = (item: {
    propertyName: string;
    unitName: string;
    tenantName: string;
    issue: string;
    priority?: MaintenanceEntity['priority'];
    estimatedCost?: number;
    assignedProviderName?: string;
  }) => {
    const res = requestMarsProjectsService({
      propertyName: item.propertyName,
      unitName: item.unitName,
      tenantName: item.tenantName,
      serviceCategory: 'General Repairs',
      issue: item.issue,
      urgency: item.priority === 'HIGH' ? 'Urgent' : 'Normal',
      priority: item.priority || 'MEDIUM',
      estimatedCost: item.estimatedCost || 0,
    });
    return { success: res.success, message: res.message };
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceStatus, actualCost?: number) => {
    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            status,
            actualCost: actualCost !== undefined ? actualCost : m.actualCost,
            completedAt: status === 'COMPLETED' || status === 'CLOSED' ? Date.now() : m.completedAt,
          };
        }
        return m;
      })
    );
    addAuditEvent('MAINTENANCE_STATUS_UPDATED', 'MAINTENANCE', id, `Updated ticket status to ${status}`);
  };

  const submitMaintenanceQuotation = (
    maintenanceId: string,
    quotationData: Omit<MaintenanceQuotation, 'id' | 'submittedAt' | 'status'>
  ) => {
    const quoteId = `quote-${Date.now()}`;
    const fullQuotation: MaintenanceQuotation = {
      ...quotationData,
      id: quoteId,
      submittedAt: Date.now(),
      status: 'PENDING',
    };

    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id === maintenanceId) {
          return {
            ...m,
            status: 'QUOTATION_PROVIDED',
            quotation: fullQuotation,
            estimatedCost: fullQuotation.totalCost,
          };
        }
        return m;
      })
    );

    addAuditEvent(
      'QUOTATION_SUBMITTED',
      'MAINTENANCE',
      maintenanceId,
      `MARS Projects Uganda provided quotation of UGX ${fullQuotation.totalCost.toLocaleString()} for ticket #${maintenanceId}`
    );
  };

  const approveMaintenanceQuotation = (maintenanceId: string) => {
    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id === maintenanceId && m.quotation) {
          return {
            ...m,
            status: 'APPROVED',
            approvedCost: m.quotation.totalCost,
            quotation: {
              ...m.quotation,
              status: 'APPROVED',
            },
          };
        }
        return m;
      })
    );

    addAuditEvent('QUOTATION_APPROVED', 'MAINTENANCE', maintenanceId, `Landlord approved MARS Projects Uganda quotation`);
  };

  const declineMaintenanceQuotation = (maintenanceId: string, reason?: string) => {
    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id === maintenanceId && m.quotation) {
          return {
            ...m,
            status: 'DECLINED',
            quotation: {
              ...m.quotation,
              status: 'REJECTED',
              inspectorNotes: reason ? `Declined by Landlord: ${reason}` : 'Declined by Landlord',
            },
          };
        }
        return m;
      })
    );

    addAuditEvent('QUOTATION_DECLINED', 'MAINTENANCE', maintenanceId, `Landlord declined quotation: ${reason || 'No reason provided'}`);
  };

  const linkMaintenanceToCashflowExpense = (maintenanceId: string) => {
    const ticket = maintenance.find((m) => m.id === maintenanceId);
    if (!ticket) return { success: false, message: 'Ticket not found' };
    if (ticket.linkedExpenseId) {
      return { success: false, message: 'This maintenance ticket is already linked to an expense voucher.' };
    }

    const expenseAmount = ticket.actualCost || ticket.approvedCost || ticket.estimatedCost;
    if (expenseAmount <= 0) {
      return { success: false, message: 'Cannot create an expense voucher with zero amount. Enter approved or actual cost first.' };
    }

    const res = addExpense({
      propertyName: ticket.propertyName,
      description: `[MARS Projects ${ticket.marsProjectsTicketNumber || ticket.id}] ${ticket.serviceCategory} - ${ticket.issue}`,
      amount: expenseAmount,
      category: 'Maintenance',
      recipientName: 'MARS Projects Uganda',
      recipientPhone: MARS_PROJECTS_CONTACT.phone,
      linkedMaintenanceId: ticket.id,
    });

    if (res.success) {
      setMaintenance((prev) =>
        prev.map((m) => (m.id === maintenanceId ? { ...m, linkedExpenseId: res.expenseId } : m))
      );
    }

    return {
      success: true,
      expenseId: res.expenseId,
      message: `Expense voucher for UGX ${expenseAmount.toLocaleString()} generated and linked to maintenance record #${ticket.marsProjectsTicketNumber || ticket.id}.`,
    };
  };

  // Service Provider & Contractor Management
  const addServiceProvider = (provider: {
    name: string;
    serviceType: ServiceProviderEntity['serviceType'];
    phone: string;
    rate: string;
    assignedProperty: string;
  }) => {
    const id = `sp-${Date.now()}`;
    const newSp: ServiceProviderEntity = {
      id,
      name: provider.name,
      serviceType: provider.serviceType,
      phone: provider.phone,
      rate: provider.rate,
      assignedProperty: provider.assignedProperty,
      status: 'Available',
      rating: 5.0,
      completedJobsCount: 0,
      isVettedByMarsProjects: true,
      createdAt: Date.now(),
    };
    setServiceProviders((prev) => [newSp, ...prev]);
    addAuditEvent('CONTRACTOR_ADDED', 'AUTH', id, `Registered contractor ${provider.name} (${provider.serviceType})`);
  };

  const updateServiceProviderStatus = (id: string, status: ServiceProviderEntity['status']) => {
    setServiceProviders((prev) =>
      prev.map((sp) => (sp.id === id ? { ...sp, status } : sp))
    );
  };

  const addRecurringTask = (task: Omit<RecurringTask, 'id' | 'status'>) => {
    const id = `rec-${Date.now()}`;
    const newTask: RecurringTask = {
      ...task,
      id,
      status: 'Upcoming',
    };
    setRecurringTasks((prev) => [newTask, ...prev]);
    addAuditEvent('RECURRING_TASK_ADDED', 'MAINTENANCE', id, `Added recurring schedule: "${task.title}"`);
  };

  // Landlord-Only Manager Controls
  const addManager = (managerData: Omit<ManagerEntity, 'id' | 'createdAt'>) => {
    const id = `mgr-${Date.now()}`;
    const newManager: ManagerEntity = {
      ...managerData,
      id,
      createdAt: Date.now(),
    };
    setManagers((prev) => [newManager, ...prev]);
    addAuditEvent('MANAGER_ADDED', 'AUTH', id, `Landlord assigned new manager ${managerData.name} (${managerData.phone})`);
  };

  const updateManagerStatus = (managerId: string, status: 'ACTIVE' | 'DISABLED') => {
    setManagers((prev) =>
      prev.map((m) => (m.id === managerId ? { ...m, status } : m))
    );
    addAuditEvent('MANAGER_STATUS_CHANGED', 'AUTH', managerId, `Manager status changed to ${status}`);
  };

  const resetManagerPin = (managerId: string, newPin: string) => {
    setManagers((prev) =>
      prev.map((m) => (m.id === managerId ? { ...m, pin: newPin } : m))
    );
    addAuditEvent('MANAGER_PIN_RESET', 'AUTH', managerId, `Landlord reset PIN for manager #${managerId}`);
  };

  const updateManagerPermissions = (managerId: string, permissions: ManagerEntity['permissions']) => {
    setManagers((prev) =>
      prev.map((m) => (m.id === managerId ? { ...m, permissions } : m))
    );
    addAuditEvent('MANAGER_PERMISSIONS_UPDATED', 'AUTH', managerId, `Updated manager authority & expense cap`);
  };

  const removeManager = (managerId: string) => {
    setManagers((prev) => prev.filter((m) => m.id !== managerId));
    addAuditEvent('MANAGER_REMOVED', 'AUTH', managerId, `Removed manager #${managerId}`);
  };

  // Tenant Reminder & Sync
  const sendTenantReminder = (
    tenantName: string,
    phone: string,
    amountDue: number,
    propertyName: string,
    unitName: string,
    onSuccess?: () => void
  ) => {
    const msg = `Dear ${tenantName}, this is a gentle reminder regarding outstanding rent balance of UGX ${amountDue.toLocaleString()} for ${propertyName} (${unitName}). Please settle promptly via Mobile Money to receive your official MARS receipt.`;

    const newNotification: NotificationEntity = {
      id: `notif-${Date.now()}`,
      recipientName: tenantName,
      recipientPhone: phone,
      title: 'Rent Balance Notice',
      message: msg,
      channel: 'IN_APP',
      deliveryStatus: 'SENT',
      timestamp: Date.now(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
    addAuditEvent('NOTIFICATION_DISPATCHED', 'NOTIFICATION', newNotification.id, `In-app rent reminder recorded for ${tenantName} (${phone}) for UGX ${amountDue.toLocaleString()}`);

    if (onSuccess) onSuccess();
  };

  const triggerSync = (callback?: (status: boolean, message: string) => void) => {
    setSyncStatus('SYNCING');
    setSyncMessage('Syncing with Uganda Master Cloud Ledger...');

    setTimeout(() => {
      setSyncStatus('SUCCESS');
      const msg = 'Sync queue processed locally. Firebase confirmation is required before records are marked synced.';
      setSyncMessage(msg);
      addAuditEvent('SYNC_EXECUTED', 'SYSTEM', 'sync-now', msg);
      if (callback) callback(true, msg);
    }, 1200);
  };

  const resetToCleanDatabase = () => {
    clearMarsStorage();
    setProperties([]);
    setTenants([]);
    setPayments([]);
    setExpenses([]);
    setMaintenance([]);
    setServiceProviders([]);
    setRecurringTasks([]);
    setAuditTrail([]);
    setManagers([]);
    window.location.reload();
  };

  return (
    <MarsContext.Provider
      value={{
        currentUser,
        currentRole,
        activeContext,
        authorizedRoles,
        properties: visibleProperties,
        allProperties: visibleProperties,
        tenants: visibleTenants,
        allTenants: visibleTenants,
        payments: visiblePayments,
        allPayments: visiblePayments,
        expenses: visibleExpenses,
        allExpenses: visibleExpenses,
        maintenance: visibleMaintenance,
        allMaintenance: visibleMaintenance,
        serviceProviders,
        recurringTasks,
        auditTrail,
        managers,
        notifications,
        language,
        setLanguage,
        t,
        syncStatus,
        syncMessage,
        triggerSync,
        login,
        register,
        logout,
        switchWorkspace,
        switchContext,
        addProperty,
        addTenant,
        recordPayment,
        processMobileMoneyPayment,
        addExpense,
        requestMarsProjectsService,
        addMaintenance,
        updateMaintenanceStatus,
        submitMaintenanceQuotation,
        approveMaintenanceQuotation,
        declineMaintenanceQuotation,
        linkMaintenanceToCashflowExpense,
        addServiceProvider,
        updateServiceProviderStatus,
        addRecurringTask,
        addManager,
        updateManagerStatus,
        resetManagerPin,
        updateManagerPermissions,
        removeManager,
        sendTenantReminder,
        resetToCleanDatabase,
        isDemoMode: false,
      }}
    >
      {children}
    </MarsContext.Provider>
  );
};

export const useMars = () => {
  const context = useContext(MarsContext);
  if (!context) {
    throw new Error('useMars must be used within a MarsProvider');
  }
  return context;
};
