import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PlatformUserEntity,
  PlatformRoleKey,
  PLATFORM_ROLES,
  ProductRegistryEntity,
  PlatformSubscriptionTierEntity,
  PlatformInvitationEntity,
  BoardReportEntity,
  InvestorMetricEntity,
  GovernmentAccessEntity,
  PlatformAuditLogEntity,
  ProductId,
} from '../types';
import {
  INITIAL_REGISTERED_PRODUCTS,
  INITIAL_SUBSCRIPTION_TIERS,
  MARS_CORPORATION_INFO,
} from './constants';
import { db, auth } from '../services/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

interface PlatformContextValue {
  platformUser: PlatformUserEntity | null;
  isLoading: boolean;
  error: string | null;
  products: ProductRegistryEntity[];
  platformUsers: PlatformUserEntity[];
  invitations: PlatformInvitationEntity[];
  subscriptions: PlatformSubscriptionTierEntity[];
  boardReports: BoardReportEntity[];
  investorMetrics: InvestorMetricEntity | null;
  governmentAccesses: GovernmentAccessEntity[];
  auditLogs: PlatformAuditLogEntity[];
  
  // Auth & Permissions
  hasScope: (scope: string) => boolean;
  isPrincipalFounder: () => boolean;
  isCoFounder: () => boolean;
  isBoardMember: () => boolean;
  isInvestor: () => boolean;
  isGovernmentPartner: () => boolean;
  platformLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  platformLogout: () => Promise<void>;
  
  // Platform User & Invitation Management
  createPlatformInvitation: (data: {
    email: string;
    displayName: string;
    platformRole: PlatformRoleKey;
    permissionScopes?: string[];
  }) => Promise<{ success: boolean; token?: string; message?: string }>;
  revokeInvitation: (invitationId: string) => Promise<{ success: boolean }>;
  acceptInvitation: (
    token: string,
    password: string,
    displayName: string
  ) => Promise<{ success: boolean; message?: string }>;
  updatePlatformUserRole: (
    targetUserId: string,
    newRole: PlatformRoleKey,
    scopes: string[]
  ) => Promise<{ success: boolean }>;
  revokePlatformUser: (targetUserId: string) => Promise<{ success: boolean }>;

  // Product Registry Management
  updateProduct: (productId: ProductId, updates: Partial<ProductRegistryEntity>) => Promise<{ success: boolean }>;
  toggleProductFeatureFlag: (productId: ProductId, flagKey: string, value: boolean) => Promise<{ success: boolean }>;
  registerNewProduct: (product: Omit<ProductRegistryEntity, 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean }>;

  // Subscriptions Management
  updateSubscriptionTier: (tierId: string, updates: Partial<PlatformSubscriptionTierEntity>) => Promise<{ success: boolean }>;
  createSubscriptionTier: (tier: Omit<PlatformSubscriptionTierEntity, 'id' | 'createdAt'>) => Promise<{ success: boolean }>;

  // Corporate Governance / Board
  publishBoardReport: (report: Omit<BoardReportEntity, 'id' | 'publishedAt' | 'publishedBy'>) => Promise<{ success: boolean }>;

  // Investor Relations
  updateInvestorKpis: (kpis: Partial<InvestorMetricEntity>) => Promise<{ success: boolean }>;

  // Government Gateway
  authorizeGovernmentPartner: (data: Omit<GovernmentAccessEntity, 'id' | 'approvedByFounderId' | 'authorizedAt'>) => Promise<{ success: boolean }>;
  revokeGovernmentAccess: (id: string) => Promise<{ success: boolean }>;

  // Audit Logging
  recordPlatformAudit: (
    action: string,
    targetType: PlatformAuditLogEntity['targetType'],
    targetId: string,
    details: string,
    result?: 'SUCCESS' | 'FAILURE' | 'DENIED'
  ) => Promise<void>;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

const STORAGE_KEYS = {
  PLATFORM_USER: 'mars_platform_user_session_v1',
  PRODUCTS: 'mars_platform_products_v1',
  USERS: 'mars_platform_users_v1',
  INVITATIONS: 'mars_platform_invitations_v1',
  SUBSCRIPTIONS: 'mars_platform_subscriptions_v1',
  BOARD_REPORTS: 'mars_platform_board_reports_v1',
  INVESTOR_METRICS: 'mars_platform_investor_metrics_v1',
  GOV_ACCESS: 'mars_platform_gov_access_v1',
  AUDIT_LOGS: 'mars_platform_audit_logs_v1',
};

const DEFAULT_BOARD_REPORT: BoardReportEntity = {
  id: 'board_rep_q2_2026',
  title: 'Q2 2026 Corporate Governance & Ecosystem Report',
  period: 'Q2 2026',
  reportType: 'QUARTERLY_GOVERNANCE',
  summary:
    'MARS Corporation maintains strict platform ledger integrity across all products. Production metrics reflect real-time validated tenant collections and verified operations.',
  highlights: [
    'Real-time verified rental throughput ledgered without fabrication',
    'Zero data breach or unauthorized tenant PII exposure incidents',
    'Uganda Revenue Authority (URA) aggregated housing index compliance framework configured',
    'Real-time MTN MoMo and Airtel Money mobile money ledger synchronization active',
  ],
  metrics: {
    activeProducts: 4,
    totalTenanciesTracked: 0,
    grossLedgerUgx: 0,
    mrrUgx: 0,
    systemUptime: '100%',
  },
  publishedBy: 'Governance Committee',
  publishedAt: Date.now(),
  status: 'PUBLISHED',
};

const DEFAULT_INVESTOR_METRICS: InvestorMetricEntity = {
  id: 'investor_metrics_2026',
  period: 'FY 2026 YTD',
  arrUgx: 0,
  mrrUgx: 0,
  yoyGrowthPercent: 0,
  activeCustomerAccounts: 0,
  customerRetentionRate: 100,
  totalRentProcessedUgx: 0,
  grossMerchandiseValueUgx: 0,
  investmentRounds: [],
  lastUpdated: Date.now(),
};

const DEFAULT_GOV_ACCESS: GovernmentAccessEntity[] = [
  {
    id: 'gov_ura_01',
    organizationName: 'Uganda Revenue Authority (URA)',
    department: 'Rental Income Tax & Digital Economy Directorate',
    contactEmail: 'rentaltax@ura.go.ug',
    contactPerson: 'Commissioner of Domestic Taxes',
    jurisdiction: 'Republic of Uganda',
    authorizedScope: 'RENTAL_TAX_COMPLIANCE_SUMMARY',
    dataAccessLimits: 'Aggregated anonymized rental yields and compliance statistics only. No tenant phone numbers or private IDs.',
    status: 'ACTIVE',
    approvedByFounderId: 'FOUNDER_MARS_001',
    authorizedAt: Date.now() - 40 * 24 * 60 * 60 * 1000,
    expiresAt: Date.now() + 325 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'gov_kcca_02',
    organizationName: 'Kampala Capital City Authority (KCCA)',
    department: 'Directorate of Physical Planning & Urban Housing',
    contactEmail: 'planning@kcca.go.ug',
    contactPerson: 'Director of Physical Planning',
    jurisdiction: 'Kampala Metropolitan Area',
    authorizedScope: 'URBAN_HOUSING_DENSITY',
    dataAccessLimits: 'Statistical dwelling unit distribution and municipal zoning densities by parish.',
    status: 'ACTIVE',
    approvedByFounderId: 'FOUNDER_MARS_001',
    authorizedAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
    expiresAt: Date.now() + 340 * 24 * 60 * 60 * 1000,
  },
];

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platformUser, setPlatformUser] = useState<PlatformUserEntity | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLATFORM_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductRegistryEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_REGISTERED_PRODUCTS;
    } catch {
      return INITIAL_REGISTERED_PRODUCTS;
    }
  });

  const [platformUsers, setPlatformUsers] = useState<PlatformUserEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [invitations, setInvitations] = useState<PlatformInvitationEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [subscriptions, setSubscriptions] = useState<PlatformSubscriptionTierEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTION_TIERS;
    } catch {
      return INITIAL_SUBSCRIPTION_TIERS;
    }
  });

  const [boardReports, setBoardReports] = useState<BoardReportEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOARD_REPORTS);
      return saved ? JSON.parse(saved) : [DEFAULT_BOARD_REPORT];
    } catch {
      return [DEFAULT_BOARD_REPORT];
    }
  });

  const [investorMetrics, setInvestorMetrics] = useState<InvestorMetricEntity | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVESTOR_METRICS);
      return saved ? JSON.parse(saved) : DEFAULT_INVESTOR_METRICS;
    } catch {
      return DEFAULT_INVESTOR_METRICS;
    }
  });

  const [governmentAccesses, setGovernmentAccesses] = useState<GovernmentAccessEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOV_ACCESS);
      return saved ? JSON.parse(saved) : DEFAULT_GOV_ACCESS;
    } catch {
      return DEFAULT_GOV_ACCESS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<PlatformAuditLogEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state changes to local storage for offline resiliency
  useEffect(() => {
    if (platformUser) {
      localStorage.setItem(STORAGE_KEYS.PLATFORM_USER, JSON.stringify(platformUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PLATFORM_USER);
    }
  }, [platformUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(platformUsers));
  }, [platformUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOARD_REPORTS, JSON.stringify(boardReports));
  }, [boardReports]);

  useEffect(() => {
    if (investorMetrics) {
      localStorage.setItem(STORAGE_KEYS.INVESTOR_METRICS, JSON.stringify(investorMetrics));
    }
  }, [investorMetrics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOV_ACCESS, JSON.stringify(governmentAccesses));
  }, [governmentAccesses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Record audit log helper
  const recordPlatformAudit = useCallback(
    async (
      action: string,
      targetType: PlatformAuditLogEntity['targetType'],
      targetId: string,
      details: string,
      result: 'SUCCESS' | 'FAILURE' | 'DENIED' = 'SUCCESS'
    ) => {
      const newLog: PlatformAuditLogEntity = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        actorId: platformUser?.id || 'UNAUTHENTICATED',
        actorEmail: platformUser?.email || 'unknown@marscorporation.com',
        actorRole: platformUser?.platformRole || 'PRINCIPAL_FOUNDER',
        action,
        targetType,
        targetId,
        details,
        timestamp: Date.now(),
        result,
      };

      setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);

      try {
        if (db) {
          const logRef = doc(collection(db, 'platform_audit_logs'), newLog.id);
          await setDoc(logRef, newLog);
        }
      } catch (err) {
        console.warn('Could not persist platform audit log to cloud:', err);
      }
    },
    [platformUser]
  );

  // Permission Scope checker
  const hasScope = useCallback(
    (scope: string): boolean => {
      if (!platformUser) return false;
      if (platformUser.platformRole === 'PRINCIPAL_FOUNDER') return true;
      if (platformUser.permissionScopes.includes('*')) return true;
      return platformUser.permissionScopes.includes(scope);
    },
    [platformUser]
  );

  const isPrincipalFounder = useCallback(() => {
    return platformUser?.platformRole === 'PRINCIPAL_FOUNDER';
  }, [platformUser]);

  const isCoFounder = useCallback(() => {
    return platformUser?.platformRole === 'CO_FOUNDER';
  }, [platformUser]);

  const isBoardMember = useCallback(() => {
    return platformUser?.platformRole === 'BOARD';
  }, [platformUser]);

  const isInvestor = useCallback(() => {
    return platformUser?.platformRole === 'INVESTOR';
  }, [platformUser]);

  const isGovernmentPartner = useCallback(() => {
    return platformUser?.platformRole === 'GOVERNMENT';
  }, [platformUser]);

  // Platform Login
  const platformLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Check local platform list first
      const existingUser = platformUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (existingUser && existingUser.status === 'SUSPENDED') {
        await recordPlatformAudit('LOGIN_ATTEMPT', 'PLATFORM_USER', existingUser.id, 'Account suspended', 'DENIED');
        setIsLoading(false);
        return { success: false, message: 'Your platform credentials have been suspended by MARS Corporation.' };
      }

      // Firebase Auth is the mandatory source of truth
      if (auth) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          const uid = userCredential.user.uid;
          
          if (db) {
            const userDoc = await getDoc(doc(db, 'platform_users', uid));
            if (userDoc.exists()) {
              const data = userDoc.data() as PlatformUserEntity;
              if (data.accountType === 'PLATFORM' && data.status !== 'SUSPENDED') {
                setPlatformUser(data);
                await recordPlatformAudit('LOGIN', 'PLATFORM_USER', uid, 'Successful Firebase corporate authentication', 'SUCCESS');
                setIsLoading(false);
                return { success: true };
              } else {
                await recordPlatformAudit('LOGIN_ATTEMPT', 'PLATFORM_USER', uid, 'Unauthorized account attempted platform access', 'DENIED');
                setIsLoading(false);
                return { success: false, message: 'Access Denied: Non-platform accounts cannot access MARS Platform HQ.' };
              }
            }
          }
          setIsLoading(false);
          return { success: false, message: 'No registered corporate platform clearance found for this Firebase identity.' };
        } catch (firebaseErr: any) {
          setIsLoading(false);
          return { success: false, message: firebaseErr.message || 'Invalid corporate credentials.' };
        }
      }

      setIsLoading(false);
      return { success: false, message: 'Authentication service unavailable. Firebase authentication is required.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'Platform authentication failed.' };
    }
  };

  // Platform Logout
  const platformLogout = async () => {
    if (platformUser) {
      await recordPlatformAudit('LOGOUT', 'PLATFORM_USER', platformUser.id, 'Signed out of Platform HQ', 'SUCCESS');
    }
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch {
        // ignore
      }
    }
    setPlatformUser(null);
  };

  // Invite Co-Founder, Board, Investor, Gov, Admin
  const createPlatformInvitation = async (data: {
    email: string;
    displayName: string;
    platformRole: PlatformRoleKey;
    permissionScopes?: string[];
  }): Promise<{ success: boolean; token?: string; message?: string }> => {
    if (!hasScope('platform.users.manage') && !isPrincipalFounder()) {
      return { success: false, message: 'Unauthorized: You do not have permission to invite platform personnel.' };
    }

    const cleanEmail = data.email.toLowerCase().trim();
    if (!cleanEmail.includes('@')) {
      return { success: false, message: 'Please provide a valid corporate email.' };
    }

    const defaultScopes = PLATFORM_ROLES[data.platformRole]?.defaultScopes || ['platform.users.read'];
    const assignedScopes = data.permissionScopes || defaultScopes;
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const newInvitation: PlatformInvitationEntity = {
      id: `inv_${Date.now()}`,
      email: cleanEmail,
      displayName: data.displayName.trim(),
      platformRole: data.platformRole,
      permissionScopes: assignedScopes,
      invitedByUserId: platformUser?.id || 'FOUNDER_MARS_001',
      invitedByName: platformUser?.displayName || 'Principal Founder',
      token,
      status: 'PENDING',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      createdAt: Date.now(),
    };

    setInvitations((prev) => [newInvitation, ...prev]);

    await recordPlatformAudit(
      'INVITATION_CREATED',
      'INVITATION',
      newInvitation.id,
      `Invited ${data.displayName} (${cleanEmail}) as ${data.platformRole}`
    );

    try {
      if (db) {
        await setDoc(doc(db, 'platform_invitations', newInvitation.id), newInvitation);
      }
    } catch (err) {
      console.warn('Could not sync invitation to Firestore:', err);
    }

    return { success: true, token, message: `Invitation created successfully for ${cleanEmail}.` };
  };

  // Revoke Invitation
  const revokeInvitation = async (invitationId: string): Promise<{ success: boolean }> => {
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === invitationId ? { ...inv, status: 'REVOKED' } : inv))
    );
    await recordPlatformAudit('INVITATION_REVOKED', 'INVITATION', invitationId, 'Invitation was revoked');
    return { success: true };
  };

  // Accept Invitation & Activate Account
  const acceptInvitation = async (
    token: string,
    _password: string,
    displayName: string
  ): Promise<{ success: boolean; message?: string }> => {
    const targetInv = invitations.find((i) => i.token === token && i.status === 'PENDING');
    if (!targetInv) {
      return { success: false, message: 'Invalid, expired, or already used invitation token.' };
    }
    if (Date.now() > targetInv.expiresAt) {
      return { success: false, message: 'This platform invitation token has expired. Contact the Principal Founder.' };
    }

    const newPlatformUser: PlatformUserEntity = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: targetInv.email,
      displayName: displayName.trim() || targetInv.displayName,
      accountType: 'PLATFORM',
      organizationId: 'MARS_CORPORATION',
      platformRole: targetInv.platformRole,
      permissionScopes: targetInv.permissionScopes,
      status: 'ACTIVE',
      invitedBy: targetInv.invitedByName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setPlatformUsers((prev) => [...prev, newPlatformUser]);
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === targetInv.id ? { ...inv, status: 'ACCEPTED' } : inv))
    );
    setPlatformUser(newPlatformUser);

    await recordPlatformAudit(
      'INVITATION_ACCEPTED',
      'PLATFORM_USER',
      newPlatformUser.id,
      `Platform account activated for ${newPlatformUser.email} as ${newPlatformUser.platformRole}`
    );

    return { success: true, message: 'Platform corporate account successfully activated.' };
  };

  // Update User Role & Scopes
  const updatePlatformUserRole = async (
    targetUserId: string,
    newRole: PlatformRoleKey,
    scopes: string[]
  ): Promise<{ success: boolean }> => {
    if (!isPrincipalFounder()) {
      return { success: false };
    }

    setPlatformUsers((prev) =>
      prev.map((u) =>
        u.id === targetUserId
          ? { ...u, platformRole: newRole, permissionScopes: scopes, updatedAt: Date.now() }
          : u
      )
    );

    await recordPlatformAudit(
      'ROLE_UPDATED',
      'PLATFORM_USER',
      targetUserId,
      `Role updated to ${newRole} with ${scopes.length} scopes`
    );

    return { success: true };
  };

  // Revoke / Suspend Platform User
  const revokePlatformUser = async (targetUserId: string): Promise<{ success: boolean }> => {
    if (!isPrincipalFounder()) {
      return { success: false };
    }
    setPlatformUsers((prev) =>
      prev.map((u) =>
        u.id === targetUserId ? { ...u, status: 'SUSPENDED', updatedAt: Date.now() } : u
      )
    );
    await recordPlatformAudit('ACCOUNT_SUSPENDED', 'PLATFORM_USER', targetUserId, 'Account access suspended');
    return { success: true };
  };

  // Update Product Registry
  const updateProduct = async (
    productId: ProductId,
    updates: Partial<ProductRegistryEntity>
  ): Promise<{ success: boolean }> => {
    if (!hasScope('platform.products.manage') && !isPrincipalFounder()) {
      return { success: false };
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, ...updates, updatedAt: Date.now() } : p
      )
    );

    await recordPlatformAudit(
      'PRODUCT_UPDATED',
      'PRODUCT',
      productId,
      `Updated product config: ${Object.keys(updates).join(', ')}`
    );

    return { success: true };
  };

  // Toggle Feature Flag
  const toggleProductFeatureFlag = async (
    productId: ProductId,
    flagKey: string,
    value: boolean
  ): Promise<{ success: boolean }> => {
    if (!hasScope('platform.products.manage') && !isPrincipalFounder()) {
      return { success: false };
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            featureFlags: {
              ...p.featureFlags,
              [flagKey]: value,
            },
            updatedAt: Date.now(),
          };
        }
        return p;
      })
    );

    await recordPlatformAudit(
      'FEATURE_FLAG_TOGGLED',
      'PRODUCT',
      productId,
      `Flag ${flagKey} set to ${value}`
    );

    return { success: true };
  };

  // Register New Future Product
  const registerNewProduct = async (
    productData: Omit<ProductRegistryEntity, 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean }> => {
    if (!hasScope('platform.products.manage') && !isPrincipalFounder()) {
      return { success: false };
    }

    const newProd: ProductRegistryEntity = {
      ...productData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setProducts((prev) => [...prev, newProd]);

    await recordPlatformAudit(
      'PRODUCT_REGISTERED',
      'PRODUCT',
      newProd.id,
      `Registered new ecosystem product: ${newProd.name}`
    );

    return { success: true };
  };

  // Subscriptions
  const updateSubscriptionTier = async (
    tierId: string,
    updates: Partial<PlatformSubscriptionTierEntity>
  ): Promise<{ success: boolean }> => {
    if (!hasScope('platform.subscriptions.manage') && !isPrincipalFounder()) {
      return { success: false };
    }

    setSubscriptions((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, ...updates } : t))
    );

    await recordPlatformAudit(
      'SUBSCRIPTION_TIER_UPDATED',
      'SUBSCRIPTION',
      tierId,
      `Tier updated: ${Object.keys(updates).join(', ')}`
    );

    return { success: true };
  };

  const createSubscriptionTier = async (
    tierData: Omit<PlatformSubscriptionTierEntity, 'id' | 'createdAt'>
  ): Promise<{ success: boolean }> => {
    if (!hasScope('platform.subscriptions.manage') && !isPrincipalFounder()) {
      return { success: false };
    }

    const newTier: PlatformSubscriptionTierEntity = {
      ...tierData,
      id: `tier_${Date.now()}`,
      createdAt: Date.now(),
    };

    setSubscriptions((prev) => [...prev, newTier]);

    await recordPlatformAudit(
      'SUBSCRIPTION_TIER_CREATED',
      'SUBSCRIPTION',
      newTier.id,
      `Created tier ${newTier.name} for ${newTier.productId}`
    );

    return { success: true };
  };

  // Board
  const publishBoardReport = async (
    reportData: Omit<BoardReportEntity, 'id' | 'publishedAt' | 'publishedBy'>
  ): Promise<{ success: boolean }> => {
    if (!isPrincipalFounder() && !hasScope('corporate.governance.manage')) {
      return { success: false };
    }

    const newReport: BoardReportEntity = {
      ...reportData,
      id: `board_rep_${Date.now()}`,
      publishedBy: platformUser?.displayName || 'Principal Founder',
      publishedAt: Date.now(),
    };

    setBoardReports((prev) => [newReport, ...prev]);

    await recordPlatformAudit(
      'BOARD_REPORT_PUBLISHED',
      'BOARD',
      newReport.id,
      `Published board governance memo: ${newReport.title}`
    );

    return { success: true };
  };

  // Investor
  const updateInvestorKpis = async (
    kpis: Partial<InvestorMetricEntity>
  ): Promise<{ success: boolean }> => {
    if (!isPrincipalFounder() && !hasScope('platform.analytics.read')) {
      return { success: false };
    }

    setInvestorMetrics((prev) => (prev ? { ...prev, ...kpis, lastUpdated: Date.now() } : null));

    await recordPlatformAudit(
      'INVESTOR_METRICS_UPDATED',
      'INVESTOR',
      'investor_metrics',
      'Updated corporate investment KPIs and round data'
    );

    return { success: true };
  };

  // Government
  const authorizeGovernmentPartner = async (
    data: Omit<GovernmentAccessEntity, 'id' | 'approvedByFounderId' | 'authorizedAt'>
  ): Promise<{ success: boolean }> => {
    if (!isPrincipalFounder() && !hasScope('platform.government.manage')) {
      return { success: false };
    }

    const newAccess: GovernmentAccessEntity = {
      ...data,
      id: `gov_${Date.now()}`,
      approvedByFounderId: platformUser?.id || 'FOUNDER_MARS_001',
      authorizedAt: Date.now(),
    };

    setGovernmentAccesses((prev) => [...prev, newAccess]);

    await recordPlatformAudit(
      'GOVERNMENT_ACCESS_AUTHORIZED',
      'GOVERNMENT',
      newAccess.id,
      `Authorized regulatory scope for ${newAccess.organizationName} (${newAccess.authorizedScope})`
    );

    return { success: true };
  };

  const revokeGovernmentAccess = async (id: string): Promise<{ success: boolean }> => {
    if (!isPrincipalFounder()) {
      return { success: false };
    }
    setGovernmentAccesses((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'REVOKED' } : g))
    );
    await recordPlatformAudit('GOVERNMENT_ACCESS_REVOKED', 'GOVERNMENT', id, 'Regulatory authorization revoked');
    return { success: true };
  };

  return (
    <PlatformContext.Provider
      value={{
        platformUser,
        isLoading,
        error,
        products,
        platformUsers,
        invitations,
        subscriptions,
        boardReports,
        investorMetrics,
        governmentAccesses,
        auditLogs,
        hasScope,
        isPrincipalFounder,
        isCoFounder,
        isBoardMember,
        isInvestor,
        isGovernmentPartner,
        platformLogin,
        platformLogout,
        createPlatformInvitation,
        revokeInvitation,
        acceptInvitation,
        updatePlatformUserRole,
        revokePlatformUser,
        updateProduct,
        toggleProductFeatureFlag,
        registerNewProduct,
        updateSubscriptionTier,
        createSubscriptionTier,
        publishBoardReport,
        updateInvestorKpis,
        authorizeGovernmentPartner,
        revokeGovernmentAccess,
        recordPlatformAudit,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = (): PlatformContextValue => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
