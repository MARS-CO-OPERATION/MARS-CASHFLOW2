import React, { useState, useEffect } from 'react';
import { useMars } from '../context/MarsContext';
import {
  googleSignIn,
  googleLogout,
  getCachedAccessToken,
} from '../services/firebase';
import {
  listDriveFiles,
  createDriveFile,
  deleteDriveFile,
  sendGmailMessage,
  listRecentEmails,
  listGoogleContacts,
  createGoogleContact,
  listCalendarEvents,
  createCalendarEvent,
  createLeaseAgreementDoc,
  exportCashFlowSpreadsheet,
  createPortfolioPresentation,
  createTenantIntakeForm,
  createMaintenanceRequestForm,
  createMoveInspectionForm,
  createTenantFeedbackForm,
  listGoogleForms,
  getGoogleForm,
  getGoogleFormResponses,
  createCustomGoogleForm,
  listGoogleTasks,
  createGoogleTask,
  completeGoogleTask,
  DriveFileItem,
  GmailMessageItem,
  ContactItem,
  CalendarEventItem,
  GoogleTaskItem,
  GoogleFormItem,
  FormResponseRecord,
  FormQuestionDef,
} from '../services/googleWorkspace';
import {
  FolderOpen,
  Mail,
  Users,
  Calendar as CalendarIcon,
  FileText,
  FileSpreadsheet,
  Presentation,
  ClipboardList,
  CheckSquare,
  Upload,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  Copy,
  Check,
  Eye,
  Share2,
  Wrench,
  HelpCircle,
  FilePlus,
  Layers,
} from 'lucide-react';

type WorkspaceTab =
  | 'DRIVE'
  | 'GMAIL'
  | 'CONTACTS'
  | 'CALENDAR'
  | 'DOCS_SHEETS'
  | 'FORMS'
  | 'TASKS';

export const WorkspaceHubScreen: React.FC = () => {
  const { properties, tenants, payments, expenses, serviceProviders } = useMars();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('DRIVE');
  const [isSignedIn, setIsSignedIn] = useState<boolean>(!!getCachedAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [driveSearch, setDriveSearch] = useState('');

  // Gmail state
  const [emails, setEmails] = useState<GmailMessageItem[]>([]);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Contacts state
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactRole, setNewContactRole] = useState('Tenant');

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [eventSummary, setEventSummary] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventDesc, setEventDesc] = useState('');

  // Docs / Sheets / Slides generated items
  const [generatedDocUrl, setGeneratedDocUrl] = useState<string | null>(null);
  const [generatedSheetUrl, setGeneratedSheetUrl] = useState<string | null>(null);
  const [generatedSlideUrl, setGeneratedSlideUrl] = useState<string | null>(null);
  const [selectedTenantForDoc, setSelectedTenantForDoc] = useState(tenants[0]?.id || '');

  // Forms state
  const [googleForms, setGoogleForms] = useState<GoogleFormItem[]>([]);
  const [activeFormsSubtab, setActiveFormsSubtab] = useState<'TEMPLATES' | 'DRIVE_FORMS' | 'CUSTOM_BUILDER'>('TEMPLATES');
  const [createdForm, setCreatedForm] = useState<GoogleFormItem | null>(null);
  const [selectedFormForResponses, setSelectedFormForResponses] = useState<GoogleFormItem | null>(null);
  const [formResponses, setFormResponses] = useState<FormResponseRecord[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [copiedFormUrl, setCopiedFormUrl] = useState<string | null>(null);

  // Custom form builder state
  const [customFormTitle, setCustomFormTitle] = useState('');
  const [customFormDesc, setCustomFormDesc] = useState('');
  const [customQuestions, setCustomQuestions] = useState<FormQuestionDef[]>([
    { title: 'Full Legal Name', type: 'TEXT', required: true },
    { title: 'Mobile Money Phone Number', type: 'TEXT', required: true },
    {
      title: 'Assigned Estate & Unit Choice',
      type: 'DROP_DOWN',
      options: properties.length > 0 ? properties.map((p) => `${p.name} - All Units`) : ['Residential Building - Main Unit'],
      required: true,
    },
  ]);

  // Share form modal state
  const [shareTargetForm, setShareTargetForm] = useState<GoogleFormItem | null>(null);
  const [shareRecipientEmail, setShareRecipientEmail] = useState('');
  const [isSendingShareEmail, setIsSendingShareEmail] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Check auth on mount
  useEffect(() => {
    setIsSignedIn(!!getCachedAccessToken());
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await googleSignIn();
      setIsSignedIn(true);
      setStatusMessage({ type: 'success', text: 'Connected to Google Workspace successfully.' });
      loadTabData(activeTab);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Google Workspace sign in failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await googleLogout();
    setIsSignedIn(false);
    setStatusMessage({ type: 'success', text: 'Disconnected from Google Workspace.' });
  };

  const loadTabData = async (tab: WorkspaceTab) => {
    if (!getCachedAccessToken()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      switch (tab) {
        case 'DRIVE':
          const files = await listDriveFiles();
          setDriveFiles(files);
          break;
        case 'GMAIL':
          const msgs = await listRecentEmails();
          setEmails(msgs);
          break;
        case 'CONTACTS':
          const cts = await listGoogleContacts();
          setContacts(cts);
          break;
        case 'CALENDAR':
          const evts = await listCalendarEvents();
          setCalendarEvents(evts);
          break;
        case 'FORMS':
          const fms = await listGoogleForms();
          setGoogleForms(fms);
          break;
        case 'TASKS':
          const tks = await listGoogleTasks();
          setTasks(tks);
          break;
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load Workspace data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      loadTabData(activeTab);
    }
  }, [activeTab, isSignedIn]);

  // Drive Actions
  const handleUploadDriveFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName || !newFileContent) return;
    setIsLoading(true);
    try {
      const file = await createDriveFile(newFileName, newFileContent);
      setDriveFiles((prev) => [file, ...prev]);
      setNewFileName('');
      setNewFileContent('');
      setStatusMessage({ type: 'success', text: `Uploaded "${file.name}" to Google Drive successfully!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to upload to Google Drive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDriveFile = async (file: DriveFileItem) => {
    try {
      const success = await deleteDriveFile(file.id, file.name);
      if (success) {
        setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
        setStatusMessage({ type: 'success', text: `Deleted "${file.name}" from Google Drive.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete file' });
    }
  };

  // Gmail Actions
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo || !emailSubject || !emailBody) return;
    setIsLoading(true);
    try {
      await sendGmailMessage(emailTo, emailSubject, emailBody);
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      setStatusMessage({ type: 'success', text: 'Email dispatched via official Gmail API.' });
      loadTabData('GMAIL');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to send Gmail message' });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset email templates
  const applyEmailPreset = (type: 'RENT_REMINDER' | 'PAYMENT_RECEIPT' | 'MAINTENANCE_ORDER') => {
    if (type === 'RENT_REMINDER') {
      const target = tenants[0];
      setEmailTo(target ? `${target.name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'tenant@example.com');
      setEmailSubject(`Notice: Rent Payment Due for ${target?.propertyName || 'Kampala Apartments'} Unit 101`);
      setEmailBody(
        `Dear ${target?.name || 'Valued Occupant'},\n\n` +
        `This is a formal notification from MARS Real Estate Management regarding your upcoming rent balance of UGX ${(target?.rentDue || 1200000).toLocaleString()}.\n\n` +
        `Please remit funds via MTN MoMo / Airtel Money merchant code or bank transfer by the 5th.\n\n` +
        `Kind regards,\nMARS Cashflow Estate Office`
      );
    } else if (type === 'PAYMENT_RECEIPT') {
      const payment = payments[0];
      setEmailTo('tenant@example.com');
      setEmailSubject(`Official Digital Receipt #${payment?.receiptNumber || 'MARS-RCT-884921'}`);
      setEmailBody(
        `Dear ${payment?.tenantName || 'Tenant'},\n\n` +
        `We acknowledge receipt of UGX ${(payment?.amount || 1200000).toLocaleString()} for ${payment?.propertyName || 'Kampala Apartments'} on ${payment?.date || '2026-08-05'}.\n\n` +
        `Payment Reference: ${payment?.externalReference || 'MTN-UG-9823145'}\n` +
        `Receipt Code: ${payment?.receiptNumber || 'MARS-RCT-884921'}\n\n` +
        `Thank you for your prompt settlement.`
      );
    } else if (type === 'MAINTENANCE_ORDER') {
      const sp = serviceProviders[0];
      setEmailTo('contractor@serviceuganda.com');
      setEmailSubject(`Work Order Dispatch: Plumbing Repair at Kampala Apartments Unit 102`);
      setEmailBody(
        `Dear ${sp?.name || 'Alex Kato'},\n\n` +
        `You have been assigned to service ticket #maint-001 (Leaking kitchen sink valve & drain siphon clogging) at Kampala Apartments Unit 102.\n\n` +
        `Please contact the caretaker upon arrival.`
      );
    }
  };

  // Contacts Actions
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName) return;
    setIsLoading(true);
    try {
      const newC = await createGoogleContact({
        givenName: newContactName,
        email: newContactEmail,
        phoneNumber: newContactPhone,
        jobTitle: newContactRole,
      });
      setContacts((prev) => [newC, ...prev]);
      setNewContactName('');
      setNewContactPhone('');
      setNewContactEmail('');
      setStatusMessage({ type: 'success', text: `Saved "${newC.displayName}" to Google Contacts!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save contact' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAllTenantsToContacts = async () => {
    setIsLoading(true);
    try {
      let count = 0;
      for (const t of tenants.slice(0, 3)) {
        await createGoogleContact({
          givenName: t.name,
          phoneNumber: t.phone,
          jobTitle: `Tenant - ${t.propertyName} ${t.unitName}`,
        });
        count++;
      }
      setStatusMessage({ type: 'success', text: `Synced ${count} tenants to your Google Contacts account!` });
      loadTabData('CONTACTS');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to sync tenants' });
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar Actions
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventSummary || !eventDate) return;
    setIsLoading(true);
    try {
      const newEvt = await createCalendarEvent({
        summary: eventSummary,
        description: eventDesc,
        startDate: eventDate,
      });
      setCalendarEvents((prev) => [newEvt, ...prev]);
      setEventSummary('');
      setEventDesc('');
      setStatusMessage({ type: 'success', text: `Scheduled "${newEvt.summary}" on Google Calendar!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to schedule event' });
    } finally {
      setIsLoading(false);
    }
  };

  // Docs / Sheets / Slides Generation
  const handleGenerateLeaseDoc = async () => {
    const tenant = tenants.find((t) => t.id === selectedTenantForDoc) || tenants[0];
    if (!tenant) return;
    setIsLoading(true);
    try {
      const res = await createLeaseAgreementDoc({
        title: `Residential Lease - ${tenant.name} (${tenant.unitName})`,
        tenantName: tenant.name,
        propertyName: tenant.propertyName,
        unitName: tenant.unitName,
        monthlyRent: tenant.monthlyRent,
        currency: 'UGX',
        startDate: tenant.leaseStartDate || (tenant.leaseStart ? new Date(tenant.leaseStart).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        endDate: tenant.leaseEndDate || (tenant.leaseEnd ? new Date(tenant.leaseEnd).toISOString().split('T')[0] : new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]),
      });
      setGeneratedDocUrl(res.documentUrl);
      setStatusMessage({ type: 'success', text: 'Generated official Google Doc lease agreement!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to generate Google Doc' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSheets = async () => {
    setIsLoading(true);
    try {
      const res = await exportCashFlowSpreadsheet({
        title: `MARS Cashflow Master Financial Ledger - ${new Date().toLocaleDateString()}`,
        properties,
        tenants,
        payments,
        expenses,
      });
      setGeneratedSheetUrl(res.spreadsheetUrl);
      setStatusMessage({ type: 'success', text: 'Exported portfolio ledger to Google Sheets!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to export to Google Sheets' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSlides = async () => {
    setIsLoading(true);
    try {
      const totalIncome = payments.reduce((acc, p) => acc + p.amount, 0);
      const totalUnits = properties.reduce((acc, p) => acc + p.totalUnits, 0);
      const res = await createPortfolioPresentation({
        title: 'MARS Real Estate Uganda Portfolio Presentation',
        landlordName: 'Dr. Michael Ssempa',
        propertiesCount: properties.length,
        unitsCount: totalUnits,
        totalIncome,
        currency: 'UGX',
      });
      setGeneratedSlideUrl(res.presentationUrl);
      setStatusMessage({ type: 'success', text: 'Created presentation in Google Slides!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to generate Google Slides' });
    } finally {
      setIsLoading(false);
    }
  };

  // Forms Actions
  const handleCreateTemplateForm = async (
    type: 'KYC' | 'MAINTENANCE' | 'INSPECTION' | 'FEEDBACK'
  ) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const estateName = properties[0]?.name || 'MARS Estates Uganda';
      const unitOptions = tenants.map((t) => `${t.propertyName} - ${t.unitName}`).slice(0, 8);
      const safeUnits = unitOptions.length > 0 ? unitOptions : ['Unit 101', 'Unit 102', 'Unit 201', 'Unit 301'];

      let form: GoogleFormItem;
      if (type === 'KYC') {
        form = await createTenantIntakeForm(estateName, safeUnits);
      } else if (type === 'MAINTENANCE') {
        form = await createMaintenanceRequestForm(estateName, safeUnits);
      } else if (type === 'INSPECTION') {
        form = await createMoveInspectionForm(estateName, safeUnits);
      } else {
        form = await createTenantFeedbackForm(estateName);
      }

      setCreatedForm(form);
      setGoogleForms((prev) => [form, ...prev]);
      setStatusMessage({ type: 'success', text: `Published "${form.title}" to Google Forms!` });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to publish Google Form' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishCustomForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormTitle.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const form = await createCustomGoogleForm(
        customFormTitle,
        customFormDesc || 'Created with MARS Cashflow Property Management System',
        customQuestions
      );
      setCreatedForm(form);
      setGoogleForms((prev) => [form, ...prev]);
      setStatusMessage({ type: 'success', text: `Custom form "${form.title}" published to Google Forms!` });
      setCustomFormTitle('');
      setCustomFormDesc('');
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to publish custom Google Form' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchResponses = async (form: GoogleFormItem) => {
    setSelectedFormForResponses(form);
    setIsLoadingResponses(true);
    setStatusMessage(null);
    try {
      const responses = await getGoogleFormResponses(form.formId);
      setFormResponses(responses);
      if (responses.length === 0) {
        setStatusMessage({ type: 'success', text: `Connected to "${form.title}". No responses submitted yet.` });
      } else {
        setStatusMessage({ type: 'success', text: `Loaded ${responses.length} live response(s) for "${form.title}".` });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load form responses.' });
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const handleCopyFormLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedFormUrl(url);
    setTimeout(() => setCopiedFormUrl(null), 2500);
    setStatusMessage({ type: 'success', text: 'Form shareable link copied to clipboard!' });
  };

  const handleSendFormEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareTargetForm || !shareRecipientEmail) return;
    setIsSendingShareEmail(true);
    try {
      const subject = `Official Form: ${shareTargetForm.title}`;
      const responderLink = shareTargetForm.responderUri || `https://docs.google.com/forms/d/e/${shareTargetForm.formId}/viewform`;
      const body = `Dear Resident / Applicant,\n\nPlease complete the following official form by clicking the link below:\n\n${responderLink}\n\nThank you for choosing MARS Estates Uganda.\nMARS Property Management Team`;

      await sendGmailMessage(
        shareRecipientEmail,
        subject,
        body
      );
      setStatusMessage({ type: 'success', text: `Dispatched form link to ${shareRecipientEmail} via Gmail!` });
      setShareTargetForm(null);
      setShareRecipientEmail('');
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to dispatch form email via Gmail' });
    } finally {
      setIsSendingShareEmail(false);
    }
  };

  // Tasks Actions
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    setIsLoading(true);
    try {
      const t = await createGoogleTask({ title: newTaskTitle });
      setTasks((prev) => [t, ...prev]);
      setNewTaskTitle('');
      setStatusMessage({ type: 'success', text: 'Created item in Google Tasks!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create task' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeGoogleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
      );
      setStatusMessage({ type: 'success', text: 'Task completed!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update task' });
    }
  };

  return (
    <div id="workspace-hub-screen" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-[#D8E2DC]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00A86B] mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Google Workspace Enterprise Cloud</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D3B2E]">
            Workspace Integration Hub
          </h1>
          <p className="text-sm text-[#4A5D53] mt-1">
            Unified control center for Google Drive, Gmail, Google Contacts, Google Calendar, Docs, Sheets, Slides, Forms, and Tasks.
          </p>
        </div>

        {/* Auth status & Connection Toggle */}
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Google Account Connected</span>
              <button
                onClick={handleGoogleSignOut}
                title="Disconnect Google Account"
                className="ml-2 text-emerald-700 hover:text-emerald-900"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#D8E2DC] rounded-xl text-xs font-semibold text-[#0D3B2E] hover:bg-[#F5F8F6] transition shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Connect Google Account'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-6 scrollbar-none border-b border-[#D8E2DC]">
        {[
          { key: 'DRIVE', label: 'Google Drive & Vault', icon: FolderOpen },
          { key: 'GMAIL', label: 'Gmail Communications', icon: Mail },
          { key: 'CONTACTS', label: 'Google Contacts', icon: Users },
          { key: 'CALENDAR', label: 'Google Calendar', icon: CalendarIcon },
          { key: 'DOCS_SHEETS', label: 'Docs, Sheets & Slides', icon: FileText },
          { key: 'FORMS', label: 'Google Forms', icon: ClipboardList },
          { key: 'TASKS', label: 'Google Tasks', icon: CheckSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as WorkspaceTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#0D3B2E] text-white shadow-sm'
                  : 'bg-white text-[#4A5D53] hover:bg-[#F5F8F6] border border-[#D8E2DC]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Non-authenticated prompt */}
      {!isSignedIn && (
        <div className="bg-white rounded-2xl border border-[#D8E2DC] p-8 text-center max-w-xl mx-auto shadow-sm my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#0D3B2E] mb-2">
            Connect Your Google Workspace
          </h2>
          <p className="text-sm text-[#4A5D53] mb-6">
            Sign in with Google to enable seamless real-time syncing of property title deeds in Drive, rent notices via Gmail, phonebook contacts, due date calendars, auto-generated lease docs, and financial spreadsheets.
          </p>
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#0D3B2E] text-white rounded-xl text-sm font-semibold hover:bg-[#134e3f] transition shadow-sm"
          >
            <span>{isLoading ? 'Authorizing...' : 'Authorize Google Account'}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Panels */}
      {isSignedIn && (
        <div className="space-y-6">
          {/* TAB 1: GOOGLE DRIVE */}
          {activeTab === 'DRIVE' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upload to Drive Card */}
              <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <h3 className="text-base font-serif font-bold text-[#0D3B2E] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#00A86B]" />
                  <span>Upload Document to Drive</span>
                </h3>
                <form onSubmit={handleUploadDriveFile} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      File Name (e.g. Lease_Unit101.txt)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Title_Deed_Kampala_Plot42.txt"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      File Document Content
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Enter legal terms, tenant notes, inspection logs, or verification IDs..."
                      value={newFileContent}
                      onChange={(e) => setNewFileContent(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#00A86B] text-white rounded-xl text-xs font-semibold hover:bg-[#008f5b] transition flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload to Drive Vault</span>
                  </button>
                </form>

                {/* Preset Fast Uploads */}
                <div className="pt-3 border-t border-[#D8E2DC]">
                  <p className="text-xs font-semibold text-[#4A5D53] mb-2">Preset Real Estate Documents</p>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNewFileName('Kampala_Apartments_Inspection_Report_Aug2026.txt');
                        setNewFileContent('MARS Quarterly Inspection: Roof water tanks chlorination checked, electrical meter rooms secured.');
                      }}
                      className="text-left text-xs p-2 rounded-lg bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC] transition font-medium"
                    >
                      + Quarterly Inspection Log
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewFileName('Entebbe_Heights_Security_Gate_Contract.txt');
                        setNewFileContent('Vendor Agreement: Automated gate maintenance service contract with Securitas Uganda.');
                      }}
                      className="text-left text-xs p-2 rounded-lg bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC] transition font-medium"
                    >
                      + Service Provider Contract
                    </button>
                  </div>
                </div>
              </div>

              {/* Drive Vault File List */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#0D3B2E]">
                      Google Drive Estate Documents
                    </h3>
                    <p className="text-xs text-[#4A5D53]">
                      Securely synchronized cloud file storage in your Google Drive account.
                    </p>
                  </div>
                  <button
                    onClick={() => loadTabData('DRIVE')}
                    className="p-2 rounded-xl bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC]"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {driveFiles.length === 0 ? (
                    <div className="text-center py-12 text-[#4A5D53] text-sm">
                      <FolderOpen className="w-8 h-8 mx-auto text-[#00A86B]/40 mb-2" />
                      <p>No documents found in Google Drive.</p>
                      <p className="text-xs text-gray-400 mt-1">Upload a lease or log using the form on the left.</p>
                    </div>
                  ) : (
                    driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl border border-[#D8E2DC] bg-[#F9FBFA] flex items-center justify-between hover:border-[#00A86B]/40 transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B] flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-[#0D3B2E] truncate">{file.name}</p>
                            <p className="text-[11px] text-[#4A5D53] truncate">{file.mimeType}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white border border-[#D8E2DC] text-[#0D3B2E] hover:bg-[#F5F8F6] text-xs font-medium inline-flex items-center gap-1"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteDriveFile(file)}
                            title="Delete file"
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GMAIL */}
          {activeTab === 'GMAIL' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Compose Card */}
              <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <h3 className="text-base font-serif font-bold text-[#0D3B2E] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#00A86B]" />
                  <span>Dispatch Email via Gmail</span>
                </h3>

                {/* Quick preset buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyEmailPreset('RENT_REMINDER')}
                    className="px-2.5 py-1 rounded-lg bg-[#F5F8F6] border border-[#D8E2DC] text-[11px] font-semibold text-[#0D3B2E] hover:bg-[#E8F1EC]"
                  >
                    + Rent Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailPreset('PAYMENT_RECEIPT')}
                    className="px-2.5 py-1 rounded-lg bg-[#F5F8F6] border border-[#D8E2DC] text-[11px] font-semibold text-[#0D3B2E] hover:bg-[#E8F1EC]"
                  >
                    + Digital Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailPreset('MAINTENANCE_ORDER')}
                    className="px-2.5 py-1 rounded-lg bg-[#F5F8F6] border border-[#D8E2DC] text-[11px] font-semibold text-[#0D3B2E] hover:bg-[#E8F1EC]"
                  >
                    + Work Order
                  </button>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Recipient Email (Tenant / Contractor)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tenant@example.com"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MARS Rent Reminder"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Email Message Content
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Type your official estate message..."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#0D3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#134e3f] transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send via Official Gmail API</span>
                  </button>
                </form>
              </div>

              {/* Inbound / Recent Gmail list */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#0D3B2E]">
                      Recent Inbound Communications
                    </h3>
                    <p className="text-xs text-[#4A5D53]">
                      Tenant inquiries, payment confirmations, and maintenance tickets in Gmail.
                    </p>
                  </div>
                  <button
                    onClick={() => loadTabData('GMAIL')}
                    className="p-2 rounded-xl bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC]"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {emails.length === 0 ? (
                    <div className="text-center py-12 text-[#4A5D53] text-sm">
                      <Mail className="w-8 h-8 mx-auto text-[#00A86B]/40 mb-2" />
                      <p>No recent messages found or loading mailbox...</p>
                    </div>
                  ) : (
                    emails.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3.5 rounded-xl border border-[#D8E2DC] bg-[#F9FBFA] hover:border-[#00A86B]/40 transition space-y-1.5"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-bold text-[#0D3B2E]">{msg.from}</span>
                          <span className="text-[11px] text-[#4A5D53]">{msg.date}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#00A86B]">{msg.subject}</p>
                        <p className="text-xs text-[#4A5D53] line-clamp-2">{msg.snippet}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACTS */}
          {activeTab === 'CONTACTS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Contact Card */}
              <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <h3 className="text-base font-serif font-bold text-[#0D3B2E] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00A86B]" />
                  <span>Add to Google Contacts</span>
                </h3>
                <form onSubmit={handleCreateContact} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Namubiru"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="0788765432"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="sarah@example.com"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Role / Tag
                    </label>
                    <select
                      value={newContactRole}
                      onChange={(e) => setNewContactRole(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    >
                      <option value="Tenant">Tenant</option>
                      <option value="Caretaker / Property Manager">Caretaker / Property Manager</option>
                      <option value="Service Contractor (Plumber/Electrician)">Service Contractor</option>
                      <option value="Property Owner">Property Owner</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#00A86B] text-white rounded-xl text-xs font-semibold hover:bg-[#008f5b] transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save to Google Contacts</span>
                  </button>
                </form>

                <div className="pt-3 border-t border-[#D8E2DC]">
                  <button
                    onClick={handleSyncAllTenantsToContacts}
                    disabled={isLoading}
                    className="w-full py-2 bg-white border border-[#D8E2DC] text-[#0D3B2E] rounded-xl text-xs font-semibold hover:bg-[#F5F8F6] transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#00A86B]" />
                    <span>Auto-Sync MARS Tenants ({tenants.length})</span>
                  </button>
                </div>
              </div>

              {/* Contacts Directory */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#0D3B2E]">
                      Google Phonebook Directory
                    </h3>
                    <p className="text-xs text-[#4A5D53]">
                      Connected People API contacts synchronized with your Google profile.
                    </p>
                  </div>
                  <button
                    onClick={() => loadTabData('CONTACTS')}
                    className="p-2 rounded-xl bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC]"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {contacts.length === 0 ? (
                    <div className="sm:col-span-2 text-center py-12 text-[#4A5D53] text-sm">
                      <Users className="w-8 h-8 mx-auto text-[#00A86B]/40 mb-2" />
                      <p>No contacts loaded from Google People API yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Use the left form or auto-sync tenants button.</p>
                    </div>
                  ) : (
                    contacts.map((c, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border border-[#D8E2DC] bg-[#F9FBFA] hover:border-[#00A86B]/40 transition space-y-1"
                      >
                        <p className="text-xs font-bold text-[#0D3B2E]">{c.displayName}</p>
                        {c.jobTitle && <p className="text-[11px] text-[#00A86B] font-medium">{c.jobTitle}</p>}
                        {c.phoneNumber && <p className="text-xs text-[#4A5D53]">{c.phoneNumber}</p>}
                        {c.email && <p className="text-xs text-[#4A5D53]">{c.email}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CALENDAR */}
          {activeTab === 'CALENDAR' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Schedule Event Card */}
              <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <h3 className="text-base font-serif font-bold text-[#0D3B2E] flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#00A86B]" />
                  <span>Schedule Estate Reminder</span>
                </h3>
                <form onSubmit={handleCreateEvent} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Event Summary
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. September Rent Due Date"
                      value={eventSummary}
                      onChange={(e) => setEventSummary(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Description & Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Remind caretakers to reconcile MTN & Airtel MoMo balances..."
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#00A86B] text-white rounded-xl text-xs font-semibold hover:bg-[#008f5b] transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Google Calendar</span>
                  </button>
                </form>
              </div>

              {/* Calendar Events List */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#0D3B2E]">
                      Upcoming Calendar Schedules
                    </h3>
                    <p className="text-xs text-[#4A5D53]">
                      Rent collection deadlines, lease expiries, and preventative maintenance dates.
                    </p>
                  </div>
                  <button
                    onClick={() => loadTabData('CALENDAR')}
                    className="p-2 rounded-xl bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC]"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {calendarEvents.length === 0 ? (
                    <div className="text-center py-12 text-[#4A5D53] text-sm">
                      <CalendarIcon className="w-8 h-8 mx-auto text-[#00A86B]/40 mb-2" />
                      <p>No upcoming calendar events found.</p>
                    </div>
                  ) : (
                    calendarEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3.5 rounded-xl border border-[#D8E2DC] bg-[#F9FBFA] hover:border-[#00A86B]/40 transition flex items-start justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#0D3B2E]">{evt.summary}</p>
                          <p className="text-[11px] text-[#00A86B] font-semibold mt-0.5">
                            {evt.start.dateTime || evt.start.date}
                          </p>
                          {evt.description && <p className="text-xs text-[#4A5D53] mt-1">{evt.description}</p>}
                        </div>

                        {evt.htmlLink && (
                          <a
                            href={evt.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white border border-[#D8E2DC] text-[#0D3B2E] hover:bg-[#F5F8F6] text-xs font-medium inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCS, SHEETS & SLIDES */}
          {activeTab === 'DOCS_SHEETS' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Google Docs Lease Generator */}
              <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#0D3B2E]">Google Docs Lease</h3>
                  <p className="text-xs text-[#4A5D53] mt-1">
                    Auto-generate a standardized Ugandan residential tenancy contract in Google Docs.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                    Select Tenant
                  </label>
                  <select
                    value={selectedTenantForDoc}
                    onChange={(e) => setSelectedTenantForDoc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-xs focus:outline-none focus:border-[#00A86B]"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.propertyName} - {t.unitName})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerateLeaseDoc}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Lease Doc</span>
                </button>

                {generatedDocUrl && (
                  <a
                    href={generatedDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-2 px-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition"
                  >
                    Open Document in Docs →
                  </a>
                )}
              </div>

              {/* Google Sheets Cashflow Export */}
              <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#0D3B2E]">Google Sheets Cashflow</h3>
                  <p className="text-xs text-[#4A5D53] mt-1">
                    Export real-time payment ledgers, operating expense tables, and net yield metrics to Google Sheets.
                  </p>
                </div>

                <div className="p-3 bg-[#F9FBFA] rounded-xl border border-[#D8E2DC] text-xs text-[#4A5D53] space-y-1">
                  <p>• {payments.length} Verified Payment Records</p>
                  <p>• {expenses.length} Approved Expense Entries</p>
                  <p>• Multi-property portfolio summary</p>
                </div>

                <button
                  onClick={handleExportSheets}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export to Google Sheets</span>
                </button>

                {generatedSheetUrl && (
                  <a
                    href={generatedSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-2 px-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    Open Spreadsheet in Sheets →
                  </a>
                )}
              </div>

              {/* Google Slides Presentation */}
              <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#0D3B2E]">Google Slides Deck</h3>
                  <p className="text-xs text-[#4A5D53] mt-1">
                    Build an executive property portfolio presentation deck in Google Slides for banking & investors.
                  </p>
                </div>

                <div className="p-3 bg-[#F9FBFA] rounded-xl border border-[#D8E2DC] text-xs text-[#4A5D53] space-y-1">
                  <p>• {properties.length} Ugandan Estates</p>
                  <p>• Occupancy breakdown & yields</p>
                  <p>• Ssempa Estate Executive Deck</p>
                </div>

                <button
                  onClick={handleGenerateSlides}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition flex items-center justify-center gap-2"
                >
                  <Presentation className="w-4 h-4" />
                  <span>Create Slides Deck</span>
                </button>

                {generatedSlideUrl && (
                  <a
                    href={generatedSlideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-2 px-3 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200 hover:bg-amber-100 transition"
                  >
                    Open Deck in Slides →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: FORMS */}
          {activeTab === 'FORMS' && (
            <div className="space-y-6">
              {/* Top Sub-navigation & Header */}
              <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#0D3B2E]">
                      Google Forms Portal & Response Hub
                    </h3>
                    <p className="text-xs text-[#4A5D53]">
                      Create digital KYC onboarding, maintenance tickets, and inspection forms, with live response synchronization.
                    </p>
                  </div>
                </div>

                {/* Sub-tab pills */}
                <div className="flex items-center gap-1.5 p-1 bg-[#F5F8F6] rounded-xl border border-[#D8E2DC]">
                  <button
                    onClick={() => setActiveFormsSubtab('TEMPLATES')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeFormsSubtab === 'TEMPLATES'
                        ? 'bg-[#0D3B2E] text-white shadow-xs'
                        : 'text-[#4A5D53] hover:text-[#0D3B2E]'
                    }`}
                  >
                    Preset Templates
                  </button>
                  <button
                    onClick={() => {
                      setActiveFormsSubtab('DRIVE_FORMS');
                      loadTabData('FORMS');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      activeFormsSubtab === 'DRIVE_FORMS'
                        ? 'bg-[#0D3B2E] text-white shadow-xs'
                        : 'text-[#4A5D53] hover:text-[#0D3B2E]'
                    }`}
                  >
                    <span>Drive Forms</span>
                    {googleForms.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded-full text-[10px]">
                        {googleForms.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveFormsSubtab('CUSTOM_BUILDER')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeFormsSubtab === 'CUSTOM_BUILDER'
                        ? 'bg-[#0D3B2E] text-white shadow-xs'
                        : 'text-[#4A5D53] hover:text-[#0D3B2E]'
                    }`}
                  >
                    Custom Builder
                  </button>
                </div>
              </div>

              {/* SUBTAB 1: PRESET TEMPLATES */}
              {activeFormsSubtab === 'TEMPLATES' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Template 1: Tenant KYC Onboarding */}
                  <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold">
                          Tenant Onboarding
                        </span>
                        <FilePlus className="w-5 h-5 text-purple-600" />
                      </div>
                      <h4 className="text-base font-serif font-bold text-[#0D3B2E]">
                        Tenant KYC Onboarding & Tenancy Intake
                      </h4>
                      <p className="text-xs text-[#4A5D53]">
                        Gathers full legal names, NIN / Passport ID, MTN/Airtel Mobile Money phone numbers, Next of Kin, and digital tenancy agreement acceptance.
                      </p>
                      <div className="p-3 bg-[#F9FBFA] rounded-xl border border-[#D8E2DC] text-[11px] text-[#4A5D53] space-y-1">
                        <p className="font-semibold text-[#0D3B2E]">Includes Questions:</p>
                        <p>• Full Legal Name & NIN / Passport Verification</p>
                        <p>• Mobile Money number for rent and approved property transactions</p>
                        <p>• Assigned Property & Unit selection</p>
                        <p>• Next of Kin & Tenancy Start Date</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateTemplateForm('KYC')}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish KYC Onboarding Form</span>
                    </button>
                  </div>

                  {/* Template 2: Maintenance & Repair Ticket */}
                  <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold">
                          Repairs & Dispatch
                        </span>
                        <Wrench className="w-5 h-5 text-amber-600" />
                      </div>
                      <h4 className="text-base font-serif font-bold text-[#0D3B2E]">
                        Tenant Maintenance & Defect Ticket
                      </h4>
                      <p className="text-xs text-[#4A5D53]">
                        Allows tenants to report emergency plumbing, electrical (Yaka), carpentry, or compound maintenance with urgency classification.
                      </p>
                      <div className="p-3 bg-[#F9FBFA] rounded-xl border border-[#D8E2DC] text-[11px] text-[#4A5D53] space-y-1">
                        <p className="font-semibold text-[#0D3B2E]">Includes Questions:</p>
                        <p>• Issue Category (Plumbing, Electrical, Roofing, etc.)</p>
                        <p>• Urgency Level (Emergency, High, Routine)</p>
                        <p>• Fault description & Preferred inspection time</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateTemplateForm('MAINTENANCE')}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish Maintenance Form</span>
                    </button>
                  </div>

                  {/* Template 3: Move-In / Move-Out Inspection */}
                  <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold">
                          Handover & Clearance
                        </span>
                        <Layers className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-base font-serif font-bold text-[#0D3B2E]">
                        Move-In & Move-Out Condition Checklist
                      </h4>
                      <p className="text-xs text-[#4A5D53]">
                        Records initial and exit meter readings (UMEME Yaka kWh, NWSC Water), key counts, and fixture conditions for deposit clearance.
                      </p>
                      <div className="p-3 bg-[#F9FBFA] rounded-xl border border-[#D8E2DC] text-[11px] text-[#4A5D53] space-y-1">
                        <p className="font-semibold text-[#0D3B2E]">Includes Questions:</p>
                        <p>• UMEME Yaka Meter # & Units Balance</p>
                        <p>• NWSC Water Meter Dial Reading</p>
                        <p>• Keys Handover Count & Wall/Tile Condition</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateTemplateForm('INSPECTION')}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish Inspection Form</span>
                    </button>
                  </div>

                  {/* Template 4: Tenant Satisfaction Survey */}
                  <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                          Community Feedback
                        </span>
                        <HelpCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h4 className="text-base font-serif font-bold text-[#0D3B2E]">
                        Tenant Satisfaction & Community Survey
                      </h4>
                      <p className="text-xs text-[#4A5D53]">
                        Gauges tenant satisfaction on water supply reliability, compound cleanliness, security, and caretaker response rates.
                      </p>
                      <div className="p-3 bg-[#F9FBFA] rounded-xl border border-[#D8E2DC] text-[11px] text-[#4A5D53] space-y-1">
                        <p className="font-semibold text-[#0D3B2E]">Includes Questions:</p>
                        <p>• 5-Star Management Quality Rating</p>
                        <p>• Water Supply (NWSC/Tanks) & Cleanliness</p>
                        <p>• Caretaker Service & Improvement suggestions</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateTemplateForm('FEEDBACK')}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish Satisfaction Survey</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: DRIVE GOOGLE FORMS & RESPONSE VIEWER */}
              {activeFormsSubtab === 'DRIVE_FORMS' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Google Forms List */}
                  <div className="lg:col-span-1 bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-serif font-bold text-[#0D3B2E]">
                        Your Google Forms
                      </h4>
                      <button
                        onClick={() => loadTabData('FORMS')}
                        className="p-1.5 rounded-lg bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC] transition"
                        title="Refresh Google Forms list"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {googleForms.length === 0 ? (
                        <div className="text-center py-12 text-[#4A5D53] text-xs">
                          <ClipboardList className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                          <p>No Google Forms found in your Google Drive.</p>
                          <button
                            onClick={() => setActiveFormsSubtab('TEMPLATES')}
                            className="mt-3 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-semibold hover:bg-purple-100 transition"
                          >
                            Create from Template
                          </button>
                        </div>
                      ) : (
                        googleForms.map((f) => {
                          const isSelected = selectedFormForResponses?.formId === f.formId;
                          return (
                            <div
                              key={f.formId}
                              className={`p-3.5 rounded-xl border transition space-y-2.5 ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                                  : 'border-[#D8E2DC] bg-[#F9FBFA] hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-xs font-bold text-[#0D3B2E] line-clamp-2">
                                    {f.title}
                                  </p>
                                  {f.modifiedTime && (
                                    <p className="text-[10px] text-[#4A5D53] mt-0.5">
                                      Modified: {new Date(f.modifiedTime).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#D8E2DC]">
                                <button
                                  onClick={() => handleFetchResponses(f)}
                                  className="px-2 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-semibold hover:bg-purple-700 transition flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Responses</span>
                                </button>

                                <button
                                  onClick={() => handleCopyFormLink(f.responderUri || `https://docs.google.com/forms/d/e/${f.formId}/viewform`)}
                                  className="px-2 py-1 rounded-lg bg-white border border-[#D8E2DC] text-[#0D3B2E] text-[11px] font-medium hover:bg-[#F5F8F6] transition flex items-center gap-1"
                                  title="Copy shareable link"
                                >
                                  {copiedFormUrl === f.responderUri ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Link</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => {
                                    setShareTargetForm(f);
                                    setShareRecipientEmail('');
                                  }}
                                  className="px-2 py-1 rounded-lg bg-white border border-[#D8E2DC] text-[#0D3B2E] text-[11px] font-medium hover:bg-[#F5F8F6] transition flex items-center gap-1"
                                  title="Email form link to tenant"
                                >
                                  <Share2 className="w-3 h-3 text-purple-600" />
                                  <span>Email</span>
                                </button>

                                <a
                                  href={f.editUri || `https://docs.google.com/forms/d/${f.formId}/edit`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-lg text-[#4A5D53] hover:text-[#0D3B2E] ml-auto"
                                  title="Edit in Google Forms"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right: Responses Inspector */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                    {selectedFormForResponses ? (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8E2DC] pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                                Live Responses
                              </span>
                              <h4 className="text-base font-serif font-bold text-[#0D3B2E]">
                                {selectedFormForResponses.title}
                              </h4>
                            </div>
                            <p className="text-xs text-[#4A5D53] mt-0.5">
                              {formResponses.length} Submissions Synchronized via Google Forms API
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFetchResponses(selectedFormForResponses)}
                              disabled={isLoadingResponses}
                              className="px-3 py-1.5 rounded-xl bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC] text-xs font-semibold transition flex items-center gap-1.5"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingResponses ? 'animate-spin' : ''}`} />
                              <span>Refresh</span>
                            </button>

                            <a
                              href={selectedFormForResponses.responderUri || `https://docs.google.com/forms/d/e/${selectedFormForResponses.formId}/viewform`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition flex items-center gap-1"
                            >
                              <span>Open Form</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        {/* Responses List */}
                        {isLoadingResponses ? (
                          <div className="py-12 text-center text-[#4A5D53] text-xs flex flex-col items-center gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                            <p>Loading real-time Google Form submissions...</p>
                          </div>
                        ) : formResponses.length === 0 ? (
                          <div className="py-12 text-center text-[#4A5D53] text-xs space-y-3">
                            <ClipboardList className="w-10 h-10 mx-auto text-purple-300" />
                            <p className="font-semibold text-[#0D3B2E]">No responses recorded yet for this form.</p>
                            <p className="text-[11px] max-w-sm mx-auto">
                              Distribute the responder link to tenants or applicants. Once submitted, their answers will appear here in real-time.
                            </p>
                            <button
                              onClick={() => handleCopyFormLink(selectedFormForResponses.responderUri || `https://docs.google.com/forms/d/e/${selectedFormForResponses.formId}/viewform`)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition"
                            >
                              Copy Public Form Link
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                            {formResponses.map((r, idx) => (
                              <div
                                key={r.responseId || idx}
                                className="p-4 rounded-xl border border-[#D8E2DC] bg-[#F9FBFA] space-y-3"
                              >
                                <div className="flex items-center justify-between border-b border-[#D8E2DC] pb-2">
                                  <span className="text-xs font-bold text-[#0D3B2E]">
                                    Submission #{idx + 1}
                                  </span>
                                  <span className="text-[11px] text-[#4A5D53]">
                                    {new Date(r.lastSubmittedTime || r.createTime).toLocaleString()}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {Object.keys(r.answers).map((qKey) => {
                                    const ans = r.answers[qKey];
                                    return (
                                      <div key={qKey} className="space-y-0.5">
                                        <p className="text-[11px] font-semibold text-[#4A5D53]">
                                          {ans.questionTitle}
                                        </p>
                                        <p className="text-xs font-medium text-[#0D3B2E] bg-white p-2 rounded-lg border border-[#D8E2DC]">
                                          {ans.values.join(', ') || '—'}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-16 text-center text-[#4A5D53] text-xs space-y-2">
                        <ClipboardList className="w-10 h-10 mx-auto text-[#00A86B]/40" />
                        <p className="font-semibold text-sm text-[#0D3B2E]">Select a Google Form to Inspect Responses</p>
                        <p className="max-w-md mx-auto">
                          Click "Responses" on any form in the left sidebar to view submitted tenant questionnaires, KYC applications, and defect tickets.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: CUSTOM FORM BUILDER */}
              {activeFormsSubtab === 'CUSTOM_BUILDER' && (
                <div className="bg-white rounded-2xl border border-[#D8E2DC] p-6 shadow-sm max-w-3xl mx-auto space-y-6">
                  <div>
                    <h4 className="text-lg font-serif font-bold text-[#0D3B2E]">
                      Dynamic Google Form Designer
                    </h4>
                    <p className="text-xs text-[#4A5D53] mt-1">
                      Configure custom questionnaires, choice questions, and field validations, then publish directly to your Google Forms account.
                    </p>
                  </div>

                  <form onSubmit={handlePublishCustomForm} className="space-y-5">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                          Form Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ssempa Estates - Commercial Lease Renewal Survey"
                          value={customFormTitle}
                          onChange={(e) => setCustomFormTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                          Form Description / Instructions
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Please complete all required fields regarding your tenancy."
                          value={customFormDesc}
                          onChange={(e) => setCustomFormDesc(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-xs focus:outline-none focus:border-[#00A86B]"
                        />
                      </div>
                    </div>

                    {/* Questions Builder */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0D3B2E]">
                          Form Questions ({customQuestions.length})
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomQuestions((prev) => [
                              ...prev,
                              { title: `New Question ${prev.length + 1}`, type: 'TEXT', required: true },
                            ])
                          }
                          className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-100 transition flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Question</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {customQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl border border-[#D8E2DC] bg-[#F9FBFA] space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-purple-800">Q{idx + 1}</span>
                              <button
                                type="button"
                                disabled={customQuestions.length <= 1}
                                onClick={() =>
                                  setCustomQuestions((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="text-red-500 hover:text-red-700 text-xs font-semibold disabled:opacity-30"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-[#4A5D53] mb-1">
                                  Question Title
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={q.title}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCustomQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#D8E2DC] rounded-lg text-xs focus:outline-none focus:border-[#00A86B]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-[#4A5D53] mb-1">
                                  Type
                                </label>
                                <select
                                  value={q.type}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    setCustomQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, type: val } : item))
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#D8E2DC] rounded-lg text-xs focus:outline-none focus:border-[#00A86B]"
                                >
                                  <option value="TEXT">Short Text</option>
                                  <option value="PARAGRAPH">Paragraph</option>
                                  <option value="RADIO">Multiple Choice (Radio)</option>
                                  <option value="CHECKBOX">Checkboxes</option>
                                  <option value="DROP_DOWN">Dropdown</option>
                                </select>
                              </div>
                            </div>

                            {/* Options if choice */}
                            {['RADIO', 'CHECKBOX', 'DROP_DOWN'].includes(q.type) && (
                              <div>
                                <label className="block text-[11px] font-semibold text-[#4A5D53] mb-1">
                                  Choices / Options (comma separated)
                                </label>
                                <input
                                  type="text"
                                  value={(q.options || []).join(', ')}
                                  onChange={(e) => {
                                    const opts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                    setCustomQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, options: opts } : item))
                                    );
                                  }}
                                  placeholder="e.g. Unit 101, Unit 102, Unit 201"
                                  className="w-full px-3 py-1.5 bg-white border border-[#D8E2DC] rounded-lg text-xs focus:outline-none focus:border-[#00A86B]"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish Custom Google Form</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Created Form Success Banner */}
              {createdForm && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold">Published: {createdForm.title}</p>
                      <p className="text-[11px] text-purple-700">
                        Live Google Form is ready for public distribution and responses.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyFormLink(createdForm.responderUri || `https://docs.google.com/forms/d/e/${createdForm.formId}/viewform`)}
                      className="px-3 py-2 rounded-xl bg-white border border-purple-200 text-purple-900 text-xs font-semibold hover:bg-purple-100 transition flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </button>

                    <a
                      href={createdForm.responderUri || `https://docs.google.com/forms/d/e/${createdForm.formId}/viewform`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition flex items-center gap-1.5"
                    >
                      <span>Open Live Form</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Share via Gmail Modal */}
              {shareTargetForm && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl border border-[#D8E2DC] p-6 max-w-md w-full shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-serif font-bold text-[#0D3B2E]">
                        Email Form via Gmail
                      </h4>
                      <button
                        onClick={() => setShareTargetForm(null)}
                        className="text-[#4A5D53] hover:text-[#0D3B2E] text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs text-[#4A5D53]">
                      Send a direct invitation link for <strong>"{shareTargetForm.title}"</strong> to a prospective tenant or resident.
                    </p>

                    <form onSubmit={handleSendFormEmail} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                          Tenant / Recipient Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="tenant@example.com"
                          value={shareRecipientEmail}
                          onChange={(e) => setShareRecipientEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-xs focus:outline-none focus:border-[#00A86B]"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShareTargetForm(null)}
                          className="px-3 py-2 rounded-xl bg-[#F5F8F6] text-[#4A5D53] text-xs font-semibold hover:bg-[#E8F1EC]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSendingShareEmail}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSendingShareEmail ? 'Sending...' : 'Send via Gmail'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: TASKS */}
          {activeTab === 'TASKS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Task Card */}
              <div className="bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <h3 className="text-base font-serif font-bold text-[#0D3B2E] flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#00A86B]" />
                  <span>Create Google Task</span>
                </h3>
                <form onSubmit={handleCreateTask} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A5D53] mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Inspect Entebbe Heights water pump"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9FBFA] border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#00A86B] text-white rounded-xl text-xs font-semibold hover:bg-[#008f5b] transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Google Tasks</span>
                  </button>
                </form>

                {/* Presets */}
                <div className="pt-3 border-t border-[#D8E2DC]">
                  <p className="text-xs font-semibold text-[#4A5D53] mb-2">Quick Presets</p>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewTaskTitle('Reconcile August MTN MoMo Cashflow Ledger')}
                      className="text-left text-xs p-2 rounded-lg bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC] transition font-medium"
                    >
                      + Reconcile Mobile Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTaskTitle('Dispatch Plumber Alex Kato to Unit 102')}
                      className="text-left text-xs p-2 rounded-lg bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC] transition font-medium"
                    >
                      + Dispatch Contractor
                    </button>
                  </div>
                </div>
              </div>

              {/* Task List */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E2DC] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#0D3B2E]">
                      Google Tasks Checklist
                    </h3>
                    <p className="text-xs text-[#4A5D53]">
                      Synchronized property management to-do items from Google Tasks.
                    </p>
                  </div>
                  <button
                    onClick={() => loadTabData('TASKS')}
                    className="p-2 rounded-xl bg-[#F5F8F6] text-[#0D3B2E] hover:bg-[#E8F1EC]"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-[#4A5D53] text-sm">
                      <CheckSquare className="w-8 h-8 mx-auto text-[#00A86B]/40 mb-2" />
                      <p>No tasks found in default Google Tasks list.</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                          task.status === 'completed'
                            ? 'bg-emerald-50/50 border-emerald-200 opacity-60'
                            : 'bg-[#F9FBFA] border-[#D8E2DC] hover:border-[#00A86B]/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            disabled={task.status === 'completed'}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                              task.status === 'completed'
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-[#D8E2DC] bg-white hover:border-[#00A86B]'
                            }`}
                          >
                            {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <span
                            className={`text-xs font-semibold ${
                              task.status === 'completed'
                                ? 'line-through text-gray-500'
                                : 'text-[#0D3B2E]'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        {task.due && (
                          <span className="text-[11px] text-[#4A5D53]">Due: {task.due}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
