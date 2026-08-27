import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../services/store';

interface MarsContextType {
  currentUser: UserEntity | null;
  currentWorkspace: RoleAssignmentEntity | null;
  userRoles: RoleAssignmentEntity[];
  properties: PropertyEntity[];
  tenants: TenantEntity[];
  payments: PaymentEntity[];
  expenses: ExpenseEntity[];
  maintenance: MaintenanceEntity[];
  serviceProviders: ServiceProviderEntity[];
  recurringTasks: RecurringTask[];
  auditTrail: AuditEventEntity[];
  notifications: NotificationEntity[];
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  syncMessage: string | null;
  isDemoMode: boolean;
  
  // Auth
  login: (identifier: string, pin: string, role?: UserRoleKey) => boolean;
  register: (data: { displayName: string; phone: string; email: string; role: UserRoleKey; orgName: string }) => boolean;
  logout: () => void;
  switchWorkspace: (roleKey: UserRoleKey, workspaceTitle?: string) => void;
  
  // Ledger operations
  recordPayment: (payment: {
    tenantName: string;
    amount: number;
    paymentMethod: string;
    notes: string;
    propertyName?: string;
    unitName?: string;
  }) => { success: boolean; paymentId?: string; message: string };
  
  addExpense: (expense: {
    propertyName: string;
    description: string;
    amount: number;
    category: ExpenseEntity['category'];
    receiptPhotoUri?: string | null;
  }) => { success: boolean; message: string };
  
  addMaintenance: (item: {
    propertyName: string;
    unitName: string;
    tenantName: string;
    issue: string;
    priority: MaintenanceEntity['priority'];
    estimatedCost: number;
    assignedProviderName?: string;
  }) => { success: boolean; message: string };
  
  updateMaintenanceStatus: (id: string, status: MaintenanceEntity['status'], actualCost?: number) => void;
  
  addProperty: (property: { name: string; location: string; totalUnits: number }) => void;
  
  addTenant: (tenant: {
    name: string;
    phone: string;
    propertyName: string;
    unitName: string;
    monthlyRent: number;
    arrears: number;
  }) => void;
  
  addServiceProvider: (provider: {
    name: string;
    serviceType: ServiceProviderEntity['serviceType'];
    phone: string;
    rate: string;
    assignedProperty: string;
  }) => void;
  
  updateServiceProviderStatus: (id: string, status: ServiceProviderEntity['status']) => void;
  
  addRecurringTask: (task: Omit<RecurringTask, 'id' | 'status'>) => void;
  
  sendTenantReminder: (
    tenantName: string,
    phone: string,
    amountDue: number,
    propertyName: string,
    unitName: string,
    onSuccess?: () => void
  ) => void;
  
  triggerSync: (callback?: (status: boolean, message: string) => void) => void;
  resetDemoData: () => void;
}

const MarsContext = createContext<MarsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'mars_cashflow_';

export const MarsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserEntity | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}user`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Default initial session is Owner/Landlord
    return {
      id: 'user-landlord-1',
      phoneNumber: '0772001122',
      email: 'landlord@marscashflow.ug',
      displayName: 'Dr. Michael Ssempa',
      primaryRole: 'LANDLORD',
      accountStatus: 'ACTIVE',
      isDemo: true,
      organizationId: 'org-mars-ug',
      createdAt: Date.now() - 365 * 86400000,
      updatedAt: Date.now(),
    };
  });

  const [currentWorkspace, setCurrentWorkspace] = useState<RoleAssignmentEntity | null>(() => {
    return {
      id: 'ws-landlord-1',
      userId: 'user-landlord-1',
      role: 'LANDLORD',
      workspaceTitle: 'Ssempa Estate Master Ledger',
      createdAt: Date.now(),
    };
  });

  const [properties, setProperties] = useState<PropertyEntity[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}properties`);
    return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
  });

  const [tenants, setTenants] = useState<TenantEntity[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}tenants`);
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [payments, setPayments] = useState<PaymentEntity[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}payments`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<ExpenseEntity[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [maintenance, setMaintenance] = useState<MaintenanceEntity[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}maintenance`);
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [serviceProviders, setServiceProviders] = useState<ServiceProviderEntity[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}service_providers`);
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_PROVIDERS;
  });

  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}recurring_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_RECURRING_TASKS;
  });

  const [auditTrail, setAuditTrail] = useState<AuditEventEntity[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}audit_trail`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_TRAIL;
  });

  const [notifications, setNotifications] = useState<NotificationEntity[]>([]);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [syncMessage, setSyncMessage] = useState<string | null>('Uganda Master Ledger Synced & Online');
  const [isDemoMode] = useState<boolean>(true);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}properties`, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}tenants`, JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}maintenance`, JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}service_providers`, JSON.stringify(serviceProviders));
  }, [serviceProviders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}recurring_tasks`, JSON.stringify(recurringTasks));
  }, [recurringTasks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}audit_trail`, JSON.stringify(auditTrail));
  }, [auditTrail]);

  const userRoles: RoleAssignmentEntity[] = [
    {
      id: 'role-1',
      userId: currentUser?.id || 'usr-1',
      role: 'LANDLORD',
      workspaceTitle: 'Owner / Landlord Portfolio',
      createdAt: Date.now(),
    },
    {
      id: 'role-2',
      userId: currentUser?.id || 'usr-1',
      role: 'MANAGER',
      workspaceTitle: 'Caretaker Ground Management',
      createdAt: Date.now(),
    },
    {
      id: 'role-3',
      userId: currentUser?.id || 'usr-1',
      role: 'TENANT',
      workspaceTitle: 'Tenant Portal (Unit 101)',
      createdAt: Date.now(),
    },
    {
      id: 'role-4',
      userId: currentUser?.id || 'usr-1',
      role: 'SERVICE_PROVIDER',
      workspaceTitle: 'Contractor Work Orders',
      createdAt: Date.now(),
    },
  ];

  const addAuditEvent = (
    eventType: string,
    resourceType: AuditEventEntity['resourceType'],
    resourceId: string,
    details: string
  ) => {
    const newEvent: AuditEventEntity = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorUserId: currentUser?.id || 'sys-anon',
      actorName: currentUser?.displayName ? `${currentUser.displayName} (${currentUser.primaryRole})` : 'System User',
      eventType,
      resourceType,
      resourceId,
      details,
      timestamp: Date.now(),
    };
    setAuditTrail((prev) => [newEvent, ...prev]);
  };

  const login = (identifier: string, _pin: string, role: UserRoleKey = 'LANDLORD'): boolean => {
    const isLandlord = identifier.includes('landlord') || role === 'LANDLORD';
    const isManager = identifier.includes('caretaker') || identifier.includes('manager') || role === 'MANAGER';
    const isTenant = identifier.includes('tenant') || role === 'TENANT';
    const isVendor = identifier.includes('vendor') || identifier.includes('contractor') || role === 'SERVICE_PROVIDER';

    const selectedRole: UserRoleKey = isLandlord
      ? 'LANDLORD'
      : isManager
      ? 'MANAGER'
      : isTenant
      ? 'TENANT'
      : isVendor
      ? 'SERVICE_PROVIDER'
      : role;

    const userObj: UserEntity = {
      id: `user-${selectedRole.toLowerCase()}-${Date.now()}`,
      phoneNumber: identifier.includes('@') ? '0772001122' : identifier,
      email: identifier.includes('@') ? identifier : `${selectedRole.toLowerCase()}@marscashflow.ug`,
      displayName: isLandlord
        ? 'Dr. Michael Ssempa'
        : isManager
        ? 'Peter Ssekandi'
        : isTenant
        ? 'John Mukasa'
        : isVendor
        ? 'Alex Kato'
        : 'Authorized User',
      primaryRole: selectedRole,
      accountStatus: 'ACTIVE',
      isDemo: true,
      organizationId: 'org-mars-ug',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setCurrentUser(userObj);
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}user`, JSON.stringify(userObj));

    setCurrentWorkspace({
      id: `ws-${Date.now()}`,
      userId: userObj.id,
      role: selectedRole,
      workspaceTitle: `${userObj.displayName} Workspace`,
      createdAt: Date.now(),
    });

    addAuditEvent('LOGIN', 'AUTH', userObj.id, `User signed in successfully via ${userObj.primaryRole} role.`);
    return true;
  };

  const register = (data: { displayName: string; phone: string; email: string; role: UserRoleKey; orgName: string }): boolean => {
    const userObj: UserEntity = {
      id: `user-${Date.now()}`,
      phoneNumber: data.phone,
      email: data.email,
      displayName: data.displayName,
      primaryRole: data.role,
      accountStatus: 'ACTIVE',
      isDemo: true,
      organizationId: data.orgName || 'MARS Uganda Properties',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setCurrentUser(userObj);
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}user`, JSON.stringify(userObj));

    setCurrentWorkspace({
      id: `ws-${Date.now()}`,
      userId: userObj.id,
      role: data.role,
      workspaceTitle: `${data.orgName || data.displayName} Workspace`,
      createdAt: Date.now(),
    });

    addAuditEvent('REGISTER', 'AUTH', userObj.id, `New user ${data.displayName} created account under ${data.role}.`);
    return true;
  };

  const logout = () => {
    if (currentUser) {
      addAuditEvent('LOGOUT', 'AUTH', currentUser.id, `User ${currentUser.displayName} signed out of session.`);
    }
    setCurrentUser(null);
    setCurrentWorkspace(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}user`);
  };

  const switchWorkspace = (roleKey: UserRoleKey, workspaceTitle?: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, primaryRole: roleKey };
    setCurrentUser(updatedUser);
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}user`, JSON.stringify(updatedUser));

    setCurrentWorkspace({
      id: `ws-${roleKey}-${Date.now()}`,
      userId: currentUser.id,
      role: roleKey,
      workspaceTitle: workspaceTitle || `${currentUser.displayName} (${roleKey})`,
      createdAt: Date.now(),
    });

    addAuditEvent('ROLE_SWITCH', 'AUTH', currentUser.id, `Switched active workspace role to ${roleKey}.`);
  };

  const recordPayment = (payment: {
    tenantName: string;
    amount: number;
    paymentMethod: string;
    notes: string;
    propertyName?: string;
    unitName?: string;
  }): { success: boolean; paymentId?: string; message: string } => {
    const matchedTenant = tenants.find((t) => t.name.toLowerCase() === payment.tenantName.toLowerCase()) || tenants[0];

    const receiptNum = `MARS-RCT-${Math.floor(100000 + Math.random() * 900000)}`;
    const prefix = payment.paymentMethod.includes('Airtel')
      ? 'AIR-UG'
      : payment.paymentMethod.includes('MTN')
      ? 'MTN-UG'
      : 'BNK-UG';
    const extRef = `${prefix}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newPaymentId = `pay-${Date.now()}`;
    const newPayment: PaymentEntity = {
      id: newPaymentId,
      tenantId: matchedTenant?.id || 'ten-anon',
      propertyId: matchedTenant?.propertyId || properties[0]?.id || 'prop-1',
      unitId: matchedTenant?.unitId || 'unit-1',
      tenantName: payment.tenantName || matchedTenant?.name || 'Valued Tenant',
      unitName: payment.unitName || matchedTenant?.unitName || 'Unit 101',
      propertyName: payment.propertyName || matchedTenant?.propertyName || 'Kampala Apartments',
      amount: payment.amount,
      currency: 'UGX',
      paymentMethod: payment.paymentMethod,
      paymentStatus: 'SUCCESSFUL',
      externalReference: extRef,
      receiptNumber: receiptNum,
      recordedBy: currentUser?.displayName ? `${currentUser.displayName} (${currentUser.primaryRole})` : 'Peter Ssekandi (Caretaker)',
      notes: payment.notes || 'Rent payment recorded via MARS Ledger',
      date: new Date().toISOString().split('T')[0],
      paymentTimestamp: Date.now(),
      syncStatus: 'SYNCED',
      createdAt: Date.now(),
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Recalculate tenant arrears
    if (matchedTenant) {
      setTenants((prevTenants) =>
        prevTenants.map((t) => {
          if (t.id === matchedTenant.id) {
            const newArrears = Math.max(0, t.arrears - payment.amount);
            const remainingRent = Math.max(0, t.rentDue - payment.amount);
            return {
              ...t,
              arrears: newArrears,
              rentDue: remainingRent,
              paymentStatus: newArrears === 0 && remainingRent === 0 ? 'Paid' : 'Pending',
            };
          }
          return t;
        })
      );
    }

    addAuditEvent(
      'PAYMENT_RECORDED',
      'PAYMENT',
      newPaymentId,
      `Recorded rent payment of UGX ${payment.amount.toLocaleString()} for ${payment.tenantName} (${matchedTenant?.unitName || 'Unit'}). Receipt #${receiptNum}`
    );

    return {
      success: true,
      paymentId: newPaymentId,
      message: `Payment of UGX ${payment.amount.toLocaleString()} recorded successfully with receipt ${receiptNum}.`,
    };
  };

  const addExpense = (expense: {
    propertyName: string;
    description: string;
    amount: number;
    category: ExpenseEntity['category'];
    receiptPhotoUri?: string | null;
  }) => {
    const matchedProp = properties.find((p) => p.name.toLowerCase() === expense.propertyName.toLowerCase()) || properties[0];
    const newExpenseId = `exp-${Date.now()}`;
    const newExpense: ExpenseEntity = {
      id: newExpenseId,
      propertyId: matchedProp?.id || 'prop-1',
      propertyName: expense.propertyName || matchedProp?.name || 'Kampala Apartments',
      description: expense.description,
      amount: expense.amount,
      currency: 'UGX',
      category: expense.category,
      receiptPhotoUri: expense.receiptPhotoUri || null,
      recordedBy: currentUser?.displayName ? `${currentUser.displayName} (${currentUser.primaryRole})` : 'Peter Ssekandi (Caretaker)',
      status: 'APPROVED',
      date: new Date().toISOString().split('T')[0],
      expenseTimestamp: Date.now(),
      syncStatus: 'SYNCED',
      createdAt: Date.now(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    addAuditEvent(
      'EXPENSE_CREATED',
      'EXPENSE',
      newExpenseId,
      `Recorded operating expense UGX ${expense.amount.toLocaleString()} [${expense.category}] for ${expense.propertyName}: ${expense.description}`
    );

    return { success: true, message: 'Expense added to ledger successfully.' };
  };

  const addMaintenance = (item: {
    propertyName: string;
    unitName: string;
    tenantName: string;
    issue: string;
    priority: MaintenanceEntity['priority'];
    estimatedCost: number;
    assignedProviderName?: string;
  }) => {
    const matchedProp = properties.find((p) => p.name.toLowerCase() === item.propertyName.toLowerCase()) || properties[0];
    const newMaintId = `maint-${Date.now()}`;
    const newMaint: MaintenanceEntity = {
      id: newMaintId,
      propertyId: matchedProp?.id || 'prop-1',
      propertyName: item.propertyName || matchedProp?.name || 'Kampala Apartments',
      unitId: 'unit-custom',
      unitName: item.unitName,
      tenantName: item.tenantName,
      issue: item.issue,
      priority: item.priority,
      status: 'Pending',
      assignedProviderName: item.assignedProviderName || 'Alex Kato (Plumber)',
      estimatedCost: item.estimatedCost,
      actualCost: 0,
      date: new Date().toISOString().split('T')[0],
      reportedTimestamp: Date.now(),
      syncStatus: 'SYNCED',
      createdAt: Date.now(),
    };

    setMaintenance((prev) => [newMaint, ...prev]);

    addAuditEvent(
      'MAINTENANCE_LOGGED',
      'MAINTENANCE',
      newMaintId,
      `Logged repair ticket [${item.priority}] at ${item.propertyName} ${item.unitName}: ${item.issue}`
    );

    return { success: true, message: 'Maintenance issue logged and technician queued.' };
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceEntity['status'], actualCost?: number) => {
    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = {
            ...m,
            status,
            actualCost: actualCost !== undefined ? actualCost : m.actualCost,
          };
          addAuditEvent('MAINTENANCE_UPDATED', 'MAINTENANCE', id, `Updated ticket status to '${status}' for issue: ${m.issue}`);
          return updated;
        }
        return m;
      })
    );
  };

  const addProperty = (property: { name: string; location: string; totalUnits: number }) => {
    const newPropId = `prop-${Date.now()}`;
    const newProp: PropertyEntity = {
      id: newPropId,
      ownerUserId: currentUser?.id || 'user-landlord-1',
      name: property.name,
      location: property.location,
      totalUnits: property.totalUnits,
      currency: 'UGX',
      syncStatus: 'SYNCED',
      lastSyncedAt: Date.now(),
      createdAt: Date.now(),
    };

    setProperties((prev) => [...prev, newProp]);

    addAuditEvent('PROPERTY_ADDED', 'PROPERTY', newPropId, `Registered new real estate property: ${property.name} (${property.totalUnits} Units).`);
  };

  const addTenant = (tenant: {
    name: string;
    phone: string;
    propertyName: string;
    unitName: string;
    monthlyRent: number;
    arrears: number;
  }) => {
    const matchedProp = properties.find((p) => p.name.toLowerCase() === tenant.propertyName.toLowerCase()) || properties[0];
    const newTenId = `ten-${Date.now()}`;
    const newTenant: TenantEntity = {
      id: newTenId,
      userId: `usr-${newTenId}`,
      propertyId: matchedProp?.id || 'prop-1',
      unitId: `unit-${Date.now()}`,
      name: tenant.name,
      phone: tenant.phone,
      unitName: tenant.unitName,
      propertyName: tenant.propertyName,
      monthlyRent: tenant.monthlyRent,
      rentDue: tenant.monthlyRent + tenant.arrears,
      arrears: tenant.arrears,
      advanceCredit: 0,
      paymentStatus: tenant.arrears > 0 ? 'Overdue' : 'Paid',
      leaseStart: Date.now(),
      leaseEnd: Date.now() + 365 * 86400000,
      syncStatus: 'SYNCED',
      createdAt: Date.now(),
    };

    setTenants((prev) => [newTenant, ...prev]);

    addAuditEvent('TENANT_REGISTERED', 'TENANT', newTenId, `Onboarded new occupant ${tenant.name} to ${tenant.propertyName} ${tenant.unitName}.`);
  };

  const addServiceProvider = (provider: {
    name: string;
    serviceType: ServiceProviderEntity['serviceType'];
    phone: string;
    rate: string;
    assignedProperty: string;
  }) => {
    const newSp: ServiceProviderEntity = {
      id: `sp-${Date.now()}`,
      name: provider.name,
      serviceType: provider.serviceType,
      phone: provider.phone,
      rate: provider.rate,
      rating: 4.8,
      status: 'Available',
      assignedProperty: provider.assignedProperty,
      isVerified: true,
      createdAt: Date.now(),
    };

    setServiceProviders((prev) => [newSp, ...prev]);
    addAuditEvent('VENDOR_ADDED', 'SYSTEM', newSp.id, `Added contractor ${provider.name} (${provider.serviceType}) to directory.`);
  };

  const updateServiceProviderStatus = (id: string, status: ServiceProviderEntity['status']) => {
    setServiceProviders((prev) =>
      prev.map((sp) => {
        if (sp.id === id) {
          return { ...sp, status };
        }
        return sp;
      })
    );
  };

  const addRecurringTask = (task: Omit<RecurringTask, 'id' | 'status'>) => {
    const newTask: RecurringTask = {
      ...task,
      id: `rec-${Date.now()}`,
      status: 'Upcoming',
    };
    setRecurringTasks((prev) => [newTask, ...prev]);
    addAuditEvent('RECURRING_MAINT_ADDED', 'MAINTENANCE', newTask.id, `Created scheduled preventative maintenance: ${task.title}`);
  };

  const sendTenantReminder = (
    tenantName: string,
    phone: string,
    amountDue: number,
    propertyName: string,
    unitName: string,
    onSuccess?: () => void
  ) => {
    const notif: NotificationEntity = {
      id: `notif-${Date.now()}`,
      recipientPhone: phone,
      recipientName: tenantName,
      title: 'Rent Payment Due Reminder',
      message: `Dear ${tenantName}, this is a gentle reminder that your rent of UGX ${amountDue.toLocaleString()} for ${propertyName} (${unitName}) is due. Please settle via MTN/Airtel MoMo. Thank you!`,
      channel: 'SMS_GATEWAY',
      deliveryStatus: 'SENT',
      timestamp: Date.now(),
    };

    setNotifications((prev) => [notif, ...prev]);

    addAuditEvent(
      'NOTIFICATION_SENT',
      'NOTIFICATION',
      notif.id,
      `Dispatched SMS payment reminder to ${tenantName} (${phone}) for outstanding UGX ${amountDue.toLocaleString()}.`
    );

    if (onSuccess) onSuccess();
  };

  const triggerSync = (callback?: (status: boolean, message: string) => void) => {
    setSyncStatus('SYNCING');
    setSyncMessage('Synchronizing local SQLite/Room offline ledger with Cloud Firestore...');

    setTimeout(() => {
      setSyncStatus('SUCCESS');
      const msg = 'Ledger synchronized successfully. 0 offline changes pending.';
      setSyncMessage(msg);
      addAuditEvent('SYNC_EXECUTED', 'SYSTEM', `sync-${Date.now()}`, 'Completed two-way cloud ledger snapshot sync.');
      if (callback) callback(true, msg);

      setTimeout(() => {
        setSyncStatus('IDLE');
      }, 4000);
    }, 1200);
  };

  const resetDemoData = () => {
    setProperties(INITIAL_PROPERTIES);
    setTenants(INITIAL_TENANTS);
    setPayments(INITIAL_PAYMENTS);
    setExpenses(INITIAL_EXPENSES);
    setMaintenance(INITIAL_MAINTENANCE);
    setServiceProviders(INITIAL_SERVICE_PROVIDERS);
    setRecurringTasks(INITIAL_RECURRING_TASKS);
    setAuditTrail(INITIAL_AUDIT_TRAIL);
    localStorage.clear();
    addAuditEvent('DEMO_RESET', 'SYSTEM', 'reset', 'Reset all property, tenant, and ledger data to default Uganda showcase demo.');
  };

  return (
    <MarsContext.Provider
      value={{
        currentUser,
        currentWorkspace,
        userRoles,
        properties,
        tenants,
        payments,
        expenses,
        maintenance,
        serviceProviders,
        recurringTasks,
        auditTrail,
        notifications,
        syncStatus,
        syncMessage,
        isDemoMode,
        login,
        register,
        logout,
        switchWorkspace,
        recordPayment,
        addExpense,
        addMaintenance,
        updateMaintenanceStatus,
        addProperty,
        addTenant,
        addServiceProvider,
        updateServiceProviderStatus,
        addRecurringTask,
        sendTenantReminder,
        triggerSync,
        resetDemoData,
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
