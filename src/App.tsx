import React, { useState, useEffect } from 'react';
import { MarsProvider, useMars } from './context/MarsContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';

// Screens
import { LoginScreen } from './screens/LoginScreen';
import { MainDashboardScreen } from './screens/MainDashboardScreen';
import { LandlordDashboardScreen } from './screens/LandlordDashboardScreen';
import { CaretakerHubScreen } from './screens/CaretakerHubScreen';
import { TenantPortalScreen } from './screens/TenantPortalScreen';
import { ExpensesScreen } from './screens/ExpensesScreen';
import { MaintenanceScreen } from './screens/MaintenanceScreen';
import { IncomeExpenseChartScreen } from './screens/IncomeExpenseChartScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { TenantPaymentStatusScreen } from './screens/TenantPaymentStatusScreen';
import { MonthlyBudgetPlannerScreen } from './screens/MonthlyBudgetPlannerScreen';
import { PdfExportScreen } from './screens/PdfExportScreen';
import { DocumentScannerScreen } from './screens/DocumentScannerScreen';
import { RecurringMaintenanceScreen } from './screens/RecurringMaintenanceScreen';
import { ReceiptDetailScreen } from './screens/ReceiptDetailScreen';
import { FaqScreen } from './screens/FaqScreen';
import { PropertyMapScreen } from './screens/PropertyMapScreen';
import { WorkspaceHubScreen } from './screens/WorkspaceHubScreen';

const MainAppContent: React.FC = () => {
  const { currentUser } = useMars();
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);

  // Never expose customer data screens without an authenticated Firebase profile.
  useEffect(() => {
    if (!currentUser && currentRoute !== 'login') setCurrentRoute('login');
  }, [currentUser, currentRoute]);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewReceipt = (paymentId: string) => {
    setActivePaymentId(paymentId);
    setCurrentRoute('receipt_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderScreen = () => {
    switch (currentRoute) {
      case 'login':
        return <LoginScreen onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <MainDashboardScreen
            onNavigate={handleNavigate}
            onViewReceipt={handleViewReceipt}
          />
        );
      case 'landlord':
        return (
          <LandlordDashboardScreen
            onNavigate={handleNavigate}
            onViewReceipt={handleViewReceipt}
          />
        );
      case 'caretaker':
        return (
          <CaretakerHubScreen
            onNavigate={handleNavigate}
            onViewReceipt={handleViewReceipt}
          />
        );
      case 'tenant':
        return (
          <TenantPortalScreen
            onNavigate={handleNavigate}
            onViewReceipt={handleViewReceipt}
          />
        );
      case 'expenses':
        return <ExpensesScreen onNavigate={handleNavigate} />;
      case 'maintenance':
        return <MaintenanceScreen onNavigate={handleNavigate} />;
      case 'income_expense_chart':
        return <IncomeExpenseChartScreen onNavigate={handleNavigate} />;
      case 'timeline':
        return (
          <TimelineScreen
            onNavigate={handleNavigate}
            onViewReceipt={handleViewReceipt}
          />
        );
      case 'tenant_payment_status':
        return (
          <TenantPaymentStatusScreen
            onNavigate={handleNavigate}
            onViewReceipt={handleViewReceipt}
          />
        );
      case 'budget_planner':
        return <MonthlyBudgetPlannerScreen onNavigate={handleNavigate} />;
      case 'pdf_export':
        return <PdfExportScreen onNavigate={handleNavigate} />;
      case 'document_scanner':
        return <DocumentScannerScreen onNavigate={handleNavigate} />;
      case 'recurring_maintenance':
        return <RecurringMaintenanceScreen onNavigate={handleNavigate} />;
      case 'receipt_detail':
        return (
          <ReceiptDetailScreen
            paymentId={activePaymentId || ''}
            onNavigate={handleNavigate}
          />
        );
      case 'property_map':
        return <PropertyMapScreen onNavigate={handleNavigate} />;
      case 'workspace_hub':
        return <WorkspaceHubScreen />;
      case 'faq':
        return <FaqScreen onNavigate={handleNavigate} />;
      default:
        return (
          <MainDashboardScreen
            onNavigate={handleNavigate}
            onViewReceipt={handleViewReceipt}
          />
        );
    }
  };

  const isAuthScreen = currentRoute === 'login';

  return (
    <div className="min-h-screen bg-[#F5F8F6] text-[#17231E] flex flex-col font-sans">
      {!isAuthScreen && (
        <Navbar currentRoute={currentRoute} onNavigate={handleNavigate} />
      )}

      <main className="flex-1">
        {renderScreen()}
      </main>

      {!isAuthScreen && (
        <BottomNav currentRoute={currentRoute} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

export function App() {
  return (
    <MarsProvider>
      <MainAppContent />
    </MarsProvider>
  );
}

export default App;
