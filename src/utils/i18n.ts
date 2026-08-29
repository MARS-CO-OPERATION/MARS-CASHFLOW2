export type Language = 'en' | 'lg';

export interface Translations {
  appName: string;
  tagline: string;
  trialBanner: string;
  trialDaysLeft: string;
  subscriptionRequired: string;
  subscribeNow: string;
  subscriptionPlans: string;
  standardPlan: string;
  proPlan: string;
  commercialPlan: string;
  freeTrial: string;
  month3Notice: string;
  viewPlans: string;
  
  // Navigation & Actions
  dashboard: string;
  landlordHub: string;
  caretakerDesk: string;
  tenantPortal: string;
  maintenanceAndProjects: string;
  expensesLedger: string;
  contractors: string;
  pdfReports: string;
  timelineAudit: string;
  landlordSettings: string;
  switchContext: string;
  syncNow: string;
  synced: string;
  offline: string;
  logout: string;
  
  // Dashboard Metrics & Actions
  noPropertiesTitle: string;
  noPropertiesDesc: string;
  noTenantsTitle: string;
  noTenantsDesc: string;
  onboardTenant: string;
  noExpensesTitle: string;
  noExpensesDesc: string;
  recordExpense: string;
  rentCollected: string;
  receipts: string;
  occupancy: string;
  pendingArrears: string;
  sendReminders: string;
  operatingExpenses: string;
  netCashflow: string;
  
  // Quick Actions
  addProperty: string;
  addTenant: string;
  recordPayment: string;
  logExpense: string;
  requestMaintenanceService: string;
  contactMarsProjects: string;
  addContractor: string;
  scanReceipt: string;
  logMaintenance: string;
  
  // Empty States (NON-NEGOTIABLE INTELLIGENT EMPTY STATES)
  emptyPropertiesTitle: string;
  emptyPropertiesDesc: string;
  emptyPropertiesAction: string;
  
  emptyTenantsTitle: string;
  emptyTenantsDesc: string;
  emptyTenantsAction: string;
  
  emptyPaymentsTitle: string;
  emptyPaymentsDesc: string;
  emptyPaymentsAction: string;
  
  emptyExpensesTitle: string;
  emptyExpensesDesc: string;
  emptyExpensesAction: string;
  
  emptyMaintenanceTitle: string;
  emptyMaintenanceDesc: string;
  emptyMaintenanceAction: string;
  noMaintenanceTitle: string;
  noMaintenanceDesc: string;
  
  emptyContractorsTitle: string;
  emptyContractorsDesc: string;
  emptyContractorsAction: string;
  
  emptyTimelineTitle: string;
  emptyTimelineDesc: string;
  
  emptyChartsTitle: string;
  emptyChartsDesc: string;
  
  // MARS Projects Uganda Integration
  marsProjectsTitle: string;
  marsProjectsSubtitle: string;
  quotationProvided: string;
  estimatedCost: string;
  approvedCost: string;
  actualCost: string;
  approveQuotation: string;
  declineQuotation: string;
  createExpenseVoucher: string;
  emergencyUrgency: string;
  urgentUrgency: string;
  normalUrgency: string;
  plannedProjectUrgency: string;
  
  // Placeholders / Watermarks
  placeholderPropertyName: string;
  placeholderLocation: string;
  placeholderUnitsCount: string;
  placeholderMonthlyRent: string;
  placeholderTenantName: string;
  placeholderPhone: string;
  placeholderNin: string;
  placeholderAmountUgx: string;
  placeholderNotes: string;
  placeholderSearch: string;
  placeholderIssueDescription: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'MARS CASHFLOW',
    tagline: 'Uganda Real Estate & Cashflow Operating System',
    trialBanner: '2-Month Free Trial Active',
    trialDaysLeft: 'days remaining in your 2-Month Free Trial',
    subscriptionRequired: 'Subscription Starting from Month 3',
    subscribeNow: 'Activate Full Subscription',
    subscriptionPlans: 'MARS Cashflow Uganda Plans',
    standardPlan: 'Standard Estate (Up to 15 Units)',
    proPlan: 'Portfolio Pro (Up to 50 Units)',
    commercialPlan: 'Commercial & Multi-Estate (Unlimited)',
    freeTrial: '2 Months Free',
    month3Notice: 'Access MARS completely free for your first 2 months. Official subscription starts from month 3 via MTN / Airtel Mobile Money.',
    viewPlans: 'View Subscription Plans',
    
    dashboard: 'Dashboard',
    landlordHub: 'Landlord Hub',
    caretakerDesk: 'Caretaker Desk',
    tenantPortal: 'Tenant Portal',
    maintenanceAndProjects: 'Maintenance & Projects',
    expensesLedger: 'Expenses Ledger',
    contractors: 'Artisans & Contractors',
    pdfReports: 'PDF Audit Reports',
    timelineAudit: 'Timeline Audit',
    landlordSettings: 'Landlord Controls',
    switchContext: 'Switch Role Context',
    syncNow: 'Sync to Cloud',
    synced: 'Cloud Synced',
    offline: 'Offline (Queue Active)',
    logout: 'Log Out',
    
    noPropertiesTitle: 'No Properties Registered Yet',
    noPropertiesDesc: 'Add your first real rental property or apartment complex to unlock live portfolio analytics and occupancy tracking.',
    noTenantsTitle: 'No Tenants Registered Yet',
    noTenantsDesc: 'Onboard your first tenant with room assignment, rent amount, and mobile money contact details.',
    onboardTenant: 'Onboard First Tenant',
    noExpensesTitle: 'No Expenses Logged Yet',
    noExpensesDesc: 'Record property operational expenses, utility tokens, and wages to start monitoring net cashflow yield.',
    recordExpense: 'Log Operating Expense',
    rentCollected: 'Rent Collected',
    receipts: 'Verified Receipts',
    occupancy: 'Occupancy Rate',
    pendingArrears: 'Unpaid Rent Arrears',
    sendReminders: 'Send Bulk SMS Notices',
    operatingExpenses: 'Operating Expenses',
    netCashflow: 'Net Yield Cashflow',
    
    addProperty: '+ Add Property',
    addTenant: '+ Add Tenant',
    recordPayment: 'Record Rent Payment',
    logExpense: 'Record Expense Voucher',
    requestMaintenanceService: 'Request Maintenance / Project Service',
    contactMarsProjects: 'Contact MARS Projects Uganda',
    addContractor: '+ Add Contractor',
    scanReceipt: 'Scan Receipt OCR',
    logMaintenance: 'Log Maintenance Request',
    
    emptyPropertiesTitle: 'No properties yet',
    emptyPropertiesDesc: 'Add your first rental property or estate to begin tracking units, tenants, and collections.',
    emptyPropertiesAction: 'Add Your First Property',
    
    emptyTenantsTitle: 'No tenants yet',
    emptyTenantsDesc: 'Onboard your first tenant with room assignment, rent amount, and mobile money contact details.',
    emptyTenantsAction: 'Add Your First Tenant',
    
    emptyPaymentsTitle: 'No payments recorded yet',
    emptyPaymentsDesc: 'Record tenant rent collections to issue tamper-proof receipts and update ledger balances.',
    emptyPaymentsAction: 'Record First Payment',
    
    emptyExpensesTitle: 'No expenses yet',
    emptyExpensesDesc: 'Record property operational expenses, utility tokens, and wages to start monitoring net cashflow yield.',
    emptyExpensesAction: 'Record First Expense',
    
    emptyMaintenanceTitle: 'No maintenance requests yet',
    emptyMaintenanceDesc: 'When repairs, plumbing, electrical, carpentry, or renovations are required, dispatch directly to MARS Projects Uganda.',
    emptyMaintenanceAction: 'Request Maintenance Service',
    noMaintenanceTitle: 'No maintenance requests logged',
    noMaintenanceDesc: 'All estate units are currently fully operational. Create a ticket whenever repairs or site inspections are needed.',
    
    emptyContractorsTitle: 'No contractors registered yet',
    emptyContractorsDesc: 'Register your on-call local technicians or dispatch directly to MARS Projects Uganda vetted artisans.',
    emptyContractorsAction: 'Add First Contractor',
    
    emptyTimelineTitle: 'No activity logged yet',
    emptyTimelineDesc: 'Every payment receipt, expense voucher, lease signing, and repair dispatch will appear here chronologically.',
    
    emptyChartsTitle: 'No financial records yet',
    emptyChartsDesc: 'Add real property rental income and expense transactions to generate cashflow analytics.',
    
    marsProjectsTitle: 'MARS Projects Uganda',
    marsProjectsSubtitle: 'Official Maintenance, Renovation & Capital Works Partner',
    quotationProvided: 'Quotation Ready for Landlord Review',
    estimatedCost: 'Estimated Cost',
    approvedCost: 'Approved Cost',
    actualCost: 'Actual Final Cost',
    approveQuotation: 'Approve Quotation',
    declineQuotation: 'Decline Quotation',
    createExpenseVoucher: 'Link to Cashflow Expense Voucher',
    emergencyUrgency: 'Emergency (Immediate Risk)',
    urgentUrgency: 'Urgent (Within 24 Hours)',
    normalUrgency: 'Normal (Standard Repair)',
    plannedProjectUrgency: 'Planned Project (Renovation / Upgrade)',
    
    placeholderPropertyName: 'e.g. Bukoto Heights, Plot 14, Kampala',
    placeholderLocation: 'e.g. Ntinda, Entebbe, Jinja, Gulu',
    placeholderUnitsCount: 'e.g. 12',
    placeholderMonthlyRent: 'e.g. 1,200,000',
    placeholderTenantName: 'e.g. Mukasa David',
    placeholderPhone: 'e.g. 0772 123 456 / 0701 987 654',
    placeholderNin: 'e.g. CM890123456789',
    placeholderAmountUgx: 'e.g. 850,000',
    placeholderNotes: 'e.g. Paid via MTN MoMo, full rent for current month',
    placeholderSearch: 'Search by name, estate, unit, or phone number...',
    placeholderIssueDescription: 'Describe the repair or renovation needed (e.g. Leaking master bathroom pipe, power breaker tripping)...',
  },
  lg: {
    appName: 'MARS CASHFLOW',
    tagline: 'Enteekateeka y\'Ebyamayumba n\'Ensaasaanya mu Uganda',
    trialBanner: 'Emyezi 2 Egy\'Obwereere Gyitandise',
    trialDaysLeft: 'ennaku ezisigaddeyo ku myezi 2 egy\'obwereere',
    subscriptionRequired: 'Okusasula Kw\'Omwezi Kutandika mu Mwezi Ogw\'Okusatu',
    subscribeNow: 'Sasula Omwezi Kati',
    subscriptionPlans: 'Emitendera gy\'Okusasulira MARS mu Uganda',
    standardPlan: 'Ennyumba Ezaabulijjo (Paka ku mayumba 15)',
    proPlan: 'Ebyamayumba Ebingi (Paka ku mayumba 50)',
    commercialPlan: 'Ebizimbe Ebinene (Awamu tewali kkomo)',
    freeTrial: 'Emyezi 2 gya bwereere',
    month3Notice: 'Kozesa MARS ku bwereere okumala emyezi 2 egisooka. Okusasula kw\'omwezi kutandika mu mwezi ogw\'okusatu ng\'okozesa MTN oba Airtel Mobile Money.',
    viewPlans: 'Laba Emitendera gy\'Okusasula',
    
    dashboard: 'Wankaki / Ekibangirizi',
    landlordHub: 'Ekibangirizi ky\'Omutunzi / Nnyinimu',
    caretakerDesk: 'Wafiisi y\'Omukuumi / Manegya',
    tenantPortal: 'Ekibangirizi ky\'Omupangisa',
    maintenanceAndProjects: 'Okuddaabiriza n\'Emirimu (MARS Projects)',
    expensesLedger: 'Ebiwandiiko by\'Ensaasaanya',
    contractors: 'Abakugu n\'Abafundi',
    pdfReports: 'Alipoota za PDF',
    timelineAudit: 'Ebyafaayo by\'Ebyakolebwa',
    landlordSettings: 'Enteekateeka z\'Omutunzi',
    switchContext: 'Kyusa Obuvunaanyizibwa',
    syncNow: 'Yingiza mu Tterekero Ly\'Amawulire',
    synced: 'Biterekeddwa Bulungi',
    offline: 'Tewali Yintaneeti (Biterekeddwa ku ssimu)',
    logout: 'Vaamu / Ffuluma',
    
    noPropertiesTitle: 'Tewali Mayumba Gawandiikiddwa',
    noPropertiesDesc: 'Yingiza ennyumba zo ezasooka okutandika okulaba ebibalo n\'ensuula ezisasulwa mu budde.',
    noTenantsTitle: 'Tewali Bapangisa Bawandiikiddwa',
    noTenantsDesc: 'Yingiza omupangisa wo eyasooka n\'ennyumba mw\'asula, ensuula ye, n\'essimu ye eya mobile money.',
    onboardTenant: 'Yingiza Omupangisa Esooka',
    noExpensesTitle: 'Tewali Nsaasaanya Ewandiikiddwa',
    noExpensesDesc: 'Wandiika ensimbi ezisaasaanyiziddwa ku masannyalaze, amazzi, n\'okusasula abakozi.',
    recordExpense: 'Wandiika Ensaasaanya',
    rentCollected: 'Ensuula Ezisasuddwa',
    receipts: 'Risiiti Ezakakasiddwa',
    occupancy: 'Obungi bw\'Abasulamuko',
    pendingArrears: 'Amabanja g\'Ensuula',
    sendReminders: 'Sindika Obubaka bwa SMS eri Ababanja',
    operatingExpenses: 'Ensaasaanya y\'Amayumba',
    netCashflow: 'Ensimbi Ezisigalamu Ddala',
    
    addProperty: '+ Yongezako Ennyumba',
    addTenant: '+ Yongezako Omupangisa',
    recordPayment: 'Wandiika Ensuula Esasuddwa',
    logExpense: 'Wandiika Ensaasaanya y\'Ennyumba',
    requestMaintenanceService: 'Saba Okuddaabiriza / MARS Projects',
    contactMarsProjects: 'Kwatagana ne MARS Projects Uganda',
    addContractor: '+ Yongezako Omufundi',
    scanReceipt: 'Koppa Risiiti (OCR)',
    logMaintenance: 'Wandiika Ekizibu Ekyetaaga Okuddaabiriza',
    
    emptyPropertiesTitle: 'Tewali mayumba gawandiikiddwa kyokka',
    emptyPropertiesDesc: 'Yongezako ennyumba yo eyasooka okutandika okubalirira amayumba, abapangisa, n\'ensuula.',
    emptyPropertiesAction: 'Yongezako Ennyumba Esooka',
    
    emptyTenantsTitle: 'Tewali bapangisa bawandiikiddwa kyokka',
    emptyTenantsDesc: 'Yingiza omupangisa wo eyasooka n\'ennyumba mw\'asula, ensuula ye, n\'essimu ye eya mobile money.',
    emptyTenantsAction: 'Yingiza Omupangisa Esooka',
    
    emptyPaymentsTitle: 'Tewali nsuula ewandiikiddwa kyokka',
    emptyPaymentsDesc: 'Wandiika ensuula abapangisa ze basasudde osobole okubawa risiiti n\'okulaba ezisigaddeyo.',
    emptyPaymentsAction: 'Wandiika Ensuula Esooka',
    
    emptyExpensesTitle: 'Tewali nsaasaanya ewandiikiddwa kyokka',
    emptyExpensesDesc: 'Wandiika ensimbi ezisaasaanyiziddwa ku masannyalaze, amazzi, n\'okusasula abakozi.',
    emptyExpensesAction: 'Wandiika Ensaasaanya Esooka',
    
    emptyMaintenanceTitle: 'Tewali misango gya kuddaabiriza giwandiikiddwa',
    emptyMaintenanceDesc: 'Bwe wabaawo ekinaaba kyonoonese (amazzi, amasannyalaze, ebibajje), sindika obubaka buno butereevu eri MARS Projects Uganda.',
    emptyMaintenanceAction: 'Saba Obuyambi bwa MARS Projects',
    noMaintenanceTitle: 'Tewali misango gya kuddaabiriza giriwo',
    noMaintenanceDesc: 'Amayumba gonna gali bulungi. Wandiika obubaka buno bwe wabaawo ebyetaaga okuddaabirizibwa.',
    
    emptyContractorsTitle: 'Tewali bafundi bawandiikiddwa kyokka',
    emptyContractorsDesc: 'Wandiika abafundi bo ab\'okumpi oba funa abakugu abaakakasibwa okuva mu MARS Projects Uganda.',
    emptyContractorsAction: 'Yongezako Omufundi Esooka',
    
    emptyTimelineTitle: 'Tewali bikolwa biwandiikiddwa kyokka',
    emptyTimelineDesc: 'Buli risiiti, nsaasaanya, ndagaano n\'emirimu gyonna bijja kulabikira wano mu biseera byabyo.',
    
    emptyChartsTitle: 'Tewali bibalo bya nsimbi byakafunibwa',
    emptyChartsDesc: 'Yingiza amayumba n\'ensuula ezisasuddwa okusobola okulaba ebibalo eby\'obukodyo.',
    
    marsProjectsTitle: 'MARS Projects Uganda',
    marsProjectsSubtitle: 'Abaweereza Abakugu mu Kuddaabiriza n\'Okulongoosa Amayumba',
    quotationProvided: 'Bbeeyi y\'Emirimu Eri Wano Eteekeddwa Omukono',
    estimatedCost: 'Ensimbi Ezisuubirwa',
    approvedCost: 'Ensimbi Ezikkiriziddwa',
    actualCost: 'Ensimbi Ezisaasaanyiziddwa Ddala',
    approveQuotation: 'Kkiriza Bbeeyi Eno',
    declineQuotation: 'Gana Bbeeyi Eno',
    createExpenseVoucher: 'Yingiza mu Nsaasaanya y\'Ennyumba',
    emergencyUrgency: 'Kikangabwa (Kyetaaga Amangu)',
    urgentUrgency: 'Mangu (Mu ssaawa 24)',
    normalUrgency: 'Bwa bulijjo (Okuddaabiriza)',
    plannedProjectUrgency: 'Omulimu Omutegeddwa (Okulongoosa / Okuzimba)',
    
    placeholderPropertyName: 'Okugeza: Bukoto Heights, Plot 14, Kampala',
    placeholderLocation: 'Okugeza: Ntinda, Entebbe, Jinja, Gulu',
    placeholderUnitsCount: 'Okugeza: 12',
    placeholderMonthlyRent: 'Okugeza: 1,200,000',
    placeholderTenantName: 'Okugeza: Mukasa David',
    placeholderPhone: 'Okugeza: 0772 123 456 / 0701 987 654',
    placeholderNin: 'Okugeza: CM890123456789',
    placeholderAmountUgx: 'Okugeza: 850,000',
    placeholderNotes: 'Okugeza: Zasasuddwa ku MTN MoMo, zonna ez\'omwezi guno',
    placeholderSearch: 'Noonya ng\'okozesa erinnya, ennyumba oba essimu...',
    placeholderIssueDescription: 'Nnyonnyola ekikyamu ekyetaaga okuddaabirizibwa (okugeza: Paapu y\'amazzi eyise, amasannyalaze gakatse)...',
  },
};
