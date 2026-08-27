import { getCachedAccessToken } from './firebase';
import { MarsBackupData } from '../types';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
}

export interface ContactItem {
  resourceName?: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  jobTitle?: string;
}

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
}

export interface FormQuestionDef {
  title: string;
  description?: string;
  type: 'TEXT' | 'PARAGRAPH' | 'RADIO' | 'CHECKBOX' | 'DROP_DOWN';
  options?: string[];
  required?: boolean;
}

export interface GoogleFormItem {
  formId: string;
  title: string;
  description?: string;
  responderUri?: string;
  editUri?: string;
  items?: any[];
  modifiedTime?: string;
}

export interface FormResponseAnswer {
  questionTitle?: string;
  values: string[];
}

export interface FormResponseRecord {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  answers: Record<string, FormResponseAnswer>;
}

const checkAccessToken = (): string => {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google Workspace Access Token not found. Please sign in with your Google Account.');
  }
  return token;
};

// ==========================================
// 1. GOOGLE DRIVE API & CLOUD BACKUP
// ==========================================
export const listDriveFiles = async (folderName?: string): Promise<DriveFileItem[]> => {
  const token = checkAccessToken();
  let query = "trashed = false";
  if (folderName) {
    query += ` and name contains '${folderName}'`;
  }
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,webViewLink,iconLink,size,modifiedTime,parents)&pageSize=50&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to list Google Drive files');
  }

  const data = await res.json();
  return data.files || [];
};

export const findOrCreateBackupsFolder = async (): Promise<string> => {
  const token = checkAccessToken();
  const folderName = 'MARS Cashflow Cloud Backups';
  
  // Search for existing folder
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  )}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  }

  // Create folder if not found
  const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'MARS Cashflow Uganda automated and manual database cloud backups.',
    }),
  });

  if (!createFolderRes.ok) {
    const err = await createFolderRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Drive backups folder');
  }

  const folderData = await createFolderRes.json();
  return folderData.id;
};

export const createDriveFile = async (
  name: string,
  content: string,
  mimeType = 'text/plain',
  parentFolderId?: string
): Promise<DriveFileItem> => {
  const token = checkAccessToken();
  const metadata: Record<string, any> = {
    name,
    mimeType,
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,modifiedTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to upload file to Google Drive');
  }

  return await res.json();
};

export const backupMarsDataToGoogleDrive = async (
  backupData: MarsBackupData
): Promise<{ file: DriveFileItem; folderId: string; timestamp: string }> => {
  const token = checkAccessToken();
  const folderId = await findOrCreateBackupsFolder();
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `MARS_Cashflow_Backup_${dateStr}.json`;
  const jsonContent = JSON.stringify(backupData, null, 2);

  const file = await createDriveFile(fileName, jsonContent, 'application/json', folderId);
  return { file, folderId, timestamp: dateStr };
};

export const listMarsDriveBackups = async (): Promise<DriveFileItem[]> => {
  const token = checkAccessToken();
  const query = "(name contains 'MARS_Cashflow_Backup' or name contains 'MARS_Cashflow_Master_Ledger') and trashed = false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,webViewLink,iconLink,size,modifiedTime,parents)&pageSize=40&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to list Google Drive backups');
  }

  const data = await res.json();
  return data.files || [];
};

export const downloadDriveFileContent = async (fileId: string): Promise<string> => {
  const token = checkAccessToken();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to download file from Google Drive (Status: ${res.status}): ${err}`);
  }

  return await res.text();
};

export const restoreMarsDataFromDrive = async (fileId: string): Promise<MarsBackupData> => {
  const content = await downloadDriveFileContent(fileId);
  try {
    const parsed = JSON.parse(content);
    if (!parsed.properties || !Array.isArray(parsed.properties)) {
      throw new Error('Selected file does not match MARS Cashflow backup structure (missing properties array).');
    }
    return parsed as MarsBackupData;
  } catch (e: any) {
    throw new Error(`Invalid backup JSON file: ${e.message}`);
  }
};

export const deleteDriveFile = async (fileId: string, fileName: string): Promise<boolean> => {
  const token = checkAccessToken();
  const confirmed = window.confirm(`Are you sure you want to delete "${fileName}" from Google Drive? This action cannot be undone.`);
  if (!confirmed) return false;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to delete file from Google Drive');
  }
  return true;
};

// ==========================================
// 2. GMAIL API
// ==========================================
export const sendGmailMessage = async (to: string, subject: string, bodyText: string): Promise<any> => {
  const token = checkAccessToken();
  
  // Format RFC 2822 email
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    bodyText,
  ];
  const message = messageParts.join('\r\n');
  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to send Gmail message');
  }

  return await res.json();
};

export const listRecentEmails = async (maxResults = 10): Promise<GmailMessageItem[]> => {
  const token = checkAccessToken();
  const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!listRes.ok) {
    const err = await listRes.json();
    throw new Error(err.error?.message || 'Failed to fetch Gmail messages');
  }

  const listData = await listRes.json();
  const messages: GmailMessageItem[] = [];

  if (listData.messages && Array.isArray(listData.messages)) {
    for (const msg of listData.messages.slice(0, 8)) {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
          const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
          const date = headers.find((h: any) => h.name === 'Date')?.value || '';
          messages.push({
            id: detail.id,
            threadId: detail.threadId,
            snippet: detail.snippet,
            subject,
            from,
            date,
          });
        }
      } catch (e) {
        // continue
      }
    }
  }

  return messages;
};

// ==========================================
// 3. GOOGLE CONTACTS (PEOPLE API)
// ==========================================
export const listGoogleContacts = async (): Promise<ContactItem[]> => {
  const token = checkAccessToken();
  const url = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations&pageSize=30';

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to load Google Contacts');
  }

  const data = await res.json();
  const connections = data.connections || [];

  return connections.map((person: any) => {
    const displayName = person.names?.[0]?.displayName || 'Unnamed Contact';
    const email = person.emailAddresses?.[0]?.value || '';
    const phoneNumber = person.phoneNumbers?.[0]?.value || '';
    const jobTitle = person.organizations?.[0]?.title || '';
    return {
      resourceName: person.resourceName,
      displayName,
      email,
      phoneNumber,
      jobTitle,
    };
  });
};

export const createGoogleContact = async (contact: {
  givenName: string;
  familyName?: string;
  email?: string;
  phoneNumber?: string;
  jobTitle?: string;
}): Promise<ContactItem> => {
  const token = checkAccessToken();
  const payload = {
    names: [{ givenName: contact.givenName, familyName: contact.familyName || '' }],
    emailAddresses: contact.email ? [{ value: contact.email }] : [],
    phoneNumbers: contact.phoneNumber ? [{ value: contact.phoneNumber }] : [],
    organizations: contact.jobTitle ? [{ title: contact.jobTitle }] : [],
  };

  const res = await fetch('https://people.googleapis.com/v1/people:createContact?personFields=names,emailAddresses,phoneNumbers,organizations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create Google Contact');
  }

  const created = await res.json();
  return {
    resourceName: created.resourceName,
    displayName: created.names?.[0]?.displayName || contact.givenName,
    email: contact.email,
    phoneNumber: contact.phoneNumber,
    jobTitle: contact.jobTitle,
  };
};

// ==========================================
// 4. GOOGLE CALENDAR API
// ==========================================
export const listCalendarEvents = async (): Promise<CalendarEventItem[]> => {
  const token = checkAccessToken();
  const timeMin = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    timeMin
  )}&maxResults=15&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to list Google Calendar events');
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || 'Scheduled Item',
    description: item.description || '',
    start: item.start || {},
    end: item.end || {},
    htmlLink: item.htmlLink,
  }));
};

export const createCalendarEvent = async (event: {
  summary: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
}): Promise<CalendarEventItem> => {
  const token = checkAccessToken();
  const eventPayload = {
    summary: event.summary,
    description: event.description,
    start: {
      date: event.startDate,
    },
    end: {
      date: event.endDate || event.startDate,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 },
      ],
    },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create Google Calendar event');
  }

  return await res.json();
};

// ==========================================
// 5. GOOGLE DOCS API
// ==========================================
export const createLeaseAgreementDoc = async (data: {
  title: string;
  tenantName: string;
  propertyName: string;
  unitName: string;
  monthlyRent: number;
  currency: string;
  startDate: string;
  endDate: string;
}): Promise<{ documentId: string; documentUrl: string }> => {
  const token = checkAccessToken();

  // 1. Create blank doc
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: data.title,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Doc');
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // 2. Insert lease content
  const leaseText = `MARS REAL ESTATE RESIDENTIAL LEASE AGREEMENT\n\n` +
    `Document Ref: MARS-DOC-${Date.now()}\n` +
    `Date Generated: ${new Date().toLocaleDateString()}\n\n` +
    `1. PARTIES & PREMISES\n` +
    `Landlord/Estate: MARS Property Management Ltd.\n` +
    `Tenant: ${data.tenantName}\n` +
    `Premises: ${data.propertyName}, ${data.unitName}\n\n` +
    `2. RENT & FINANCIAL TERMS\n` +
    `Agreed Monthly Rent: ${data.currency} ${data.monthlyRent.toLocaleString()}\n` +
    `Rent Payment Due Date: 1st day of each calendar month.\n` +
    `Accepted Payment Methods: Mobile Money (MTN MoMo, Airtel Money) or Stanbic Bank EFT.\n\n` +
    `3. LEASE TENURE\n` +
    `Commencement Date: ${data.startDate}\n` +
    `Expiration Date: ${data.endDate}\n\n` +
    `4. RULES & OCCUPANCY\n` +
    `- The Tenant agrees to keep the premises in clean condition and notify the Caretaker of plumbing or electrical faults.\n` +
    `- Sub-letting is strictly prohibited without prior written consent of the Landlord.\n\n` +
    `SIGNATURES\n\n` +
    `Tenant: ___________________________      Date: ______________\n\n` +
    `Landlord/Agent: ____________________     Date: ______________\n`;

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: leaseText,
          },
        },
      ],
    }),
  });

  return {
    documentId,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
  };
};

// ==========================================
// 6. GOOGLE SHEETS API
// ==========================================
export const exportCashFlowSpreadsheet = async (data: {
  title: string;
  properties: any[];
  tenants: any[];
  payments: any[];
  expenses: any[];
}): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = checkAccessToken();

  // Create spreadsheet with sheets
  const createPayload = {
    properties: {
      title: data.title,
    },
    sheets: [
      {
        properties: { title: 'Executive Summary' },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              { values: [{ userEnteredValue: { stringValue: 'MARS REAL ESTATE FINANCIAL SUMMARY' } }] },
              { values: [{ userEnteredValue: { stringValue: `Generated: ${new Date().toLocaleString()}` } }] },
              { values: [{ userEnteredValue: { stringValue: '' } }] },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Metric' } },
                  { userEnteredValue: { stringValue: 'Value (UGX)' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Total Rent Collected' } },
                  { userEnteredValue: { numberValue: data.payments.reduce((acc, p) => acc + p.amount, 0) } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Total Operating Expenses' } },
                  { userEnteredValue: { numberValue: data.expenses.reduce((acc, e) => acc + e.amount, 0) } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Net Property Cashflow' } },
                  {
                    userEnteredValue: {
                      numberValue:
                        data.payments.reduce((acc, p) => acc + p.amount, 0) -
                        data.expenses.reduce((acc, e) => acc + e.amount, 0),
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        properties: { title: 'Payment Ledger' },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Receipt #' } },
                  { userEnteredValue: { stringValue: 'Tenant' } },
                  { userEnteredValue: { stringValue: 'Property' } },
                  { userEnteredValue: { stringValue: 'Unit' } },
                  { userEnteredValue: { stringValue: 'Amount (UGX)' } },
                  { userEnteredValue: { stringValue: 'Payment Method' } },
                  { userEnteredValue: { stringValue: 'Reference' } },
                  { userEnteredValue: { stringValue: 'Date' } },
                ],
              },
              ...data.payments.map((p) => ({
                values: [
                  { userEnteredValue: { stringValue: p.receiptNumber } },
                  { userEnteredValue: { stringValue: p.tenantName } },
                  { userEnteredValue: { stringValue: p.propertyName } },
                  { userEnteredValue: { stringValue: p.unitName } },
                  { userEnteredValue: { numberValue: p.amount } },
                  { userEnteredValue: { stringValue: p.paymentMethod } },
                  { userEnteredValue: { stringValue: p.externalReference } },
                  { userEnteredValue: { stringValue: p.date } },
                ],
              })),
            ],
          },
        ],
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
  }

  const sheetData = await res.json();
  return {
    spreadsheetId: sheetData.spreadsheetId,
    spreadsheetUrl: sheetData.spreadsheetUrl,
  };
};

export const backupMarsLedgerSpreadsheetToDrive = async (
  backupData: MarsBackupData
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> => {
  const token = checkAccessToken();
  const dateStr = new Date().toISOString().split('T')[0];
  const title = `MARS_Cashflow_Master_Ledger_${dateStr}`;

  const totalCollected = backupData.payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = backupData.expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalArrears = backupData.tenants.reduce((acc, t) => acc + t.arrears, 0);
  const netOperating = totalCollected - totalExpenses;

  const createPayload = {
    properties: { title },
    sheets: [
      {
        properties: { title: 'Executive Summary' },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              { values: [{ userEnteredValue: { stringValue: 'MARS CASHFLOW UGANDA - ESTATE MASTER LEDGER' } }] },
              { values: [{ userEnteredValue: { stringValue: `Backup Timestamp: ${backupData.exportedAt}` } }] },
              { values: [{ userEnteredValue: { stringValue: `Exported by: ${backupData.exportedBy.name} (${backupData.exportedBy.email})` } }] },
              { values: [{ userEnteredValue: { stringValue: '' } }] },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Portfolio Key Performance Metric' } },
                  { userEnteredValue: { stringValue: 'Value (UGX / Count)' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Total Properties Managed' } },
                  { userEnteredValue: { numberValue: backupData.properties.length } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Total Active Tenants' } },
                  { userEnteredValue: { numberValue: backupData.tenants.length } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Total Verified Collections' } },
                  { userEnteredValue: { numberValue: totalCollected } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Total Outstanding Arrears' } },
                  { userEnteredValue: { numberValue: totalArrears } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Total Property Expenses' } },
                  { userEnteredValue: { numberValue: totalExpenses } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'Net Operating Income (NOI)' } },
                  { userEnteredValue: { numberValue: netOperating } },
                ],
              },
            ],
          },
        ],
      },
      {
        properties: { title: 'Properties' },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Property ID' } },
                  { userEnteredValue: { stringValue: 'Name' } },
                  { userEnteredValue: { stringValue: 'Location' } },
                  { userEnteredValue: { stringValue: 'Total Units' } },
                  { userEnteredValue: { stringValue: 'Currency' } },
                ],
              },
              ...backupData.properties.map((prop) => ({
                values: [
                  { userEnteredValue: { stringValue: prop.id } },
                  { userEnteredValue: { stringValue: prop.name } },
                  { userEnteredValue: { stringValue: prop.location } },
                  { userEnteredValue: { numberValue: prop.totalUnits } },
                  { userEnteredValue: { stringValue: prop.currency || 'UGX' } },
                ],
              })),
            ],
          },
        ],
      },
      {
        properties: { title: 'Tenants & Arrears' },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Tenant Name' } },
                  { userEnteredValue: { stringValue: 'Uganda Phone' } },
                  { userEnteredValue: { stringValue: 'Estate / Property' } },
                  { userEnteredValue: { stringValue: 'Unit' } },
                  { userEnteredValue: { stringValue: 'Monthly Rent (UGX)' } },
                  { userEnteredValue: { stringValue: 'Arrears Balance (UGX)' } },
                  { userEnteredValue: { stringValue: 'Payment Status' } },
                ],
              },
              ...backupData.tenants.map((t) => ({
                values: [
                  { userEnteredValue: { stringValue: t.name } },
                  { userEnteredValue: { stringValue: t.phone } },
                  { userEnteredValue: { stringValue: t.propertyName } },
                  { userEnteredValue: { stringValue: t.unitName } },
                  { userEnteredValue: { numberValue: t.monthlyRent } },
                  { userEnteredValue: { numberValue: t.arrears } },
                  { userEnteredValue: { stringValue: t.status } },
                ],
              })),
            ],
          },
        ],
      },
      {
        properties: { title: 'Payments Ledger' },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Receipt Number' } },
                  { userEnteredValue: { stringValue: 'Date' } },
                  { userEnteredValue: { stringValue: 'Tenant' } },
                  { userEnteredValue: { stringValue: 'Property' } },
                  { userEnteredValue: { stringValue: 'Unit' } },
                  { userEnteredValue: { stringValue: 'Amount (UGX)' } },
                  { userEnteredValue: { stringValue: 'Method' } },
                  { userEnteredValue: { stringValue: 'Reference' } },
                  { userEnteredValue: { stringValue: 'Verification' } },
                ],
              },
              ...backupData.payments.map((p) => ({
                values: [
                  { userEnteredValue: { stringValue: p.receiptNumber } },
                  { userEnteredValue: { stringValue: p.date } },
                  { userEnteredValue: { stringValue: p.tenantName } },
                  { userEnteredValue: { stringValue: p.propertyName } },
                  { userEnteredValue: { stringValue: p.unitName } },
                  { userEnteredValue: { numberValue: p.amount } },
                  { userEnteredValue: { stringValue: p.paymentMethod } },
                  { userEnteredValue: { stringValue: p.externalReference || '' } },
                  { userEnteredValue: { stringValue: p.verificationStatus } },
                ],
              })),
            ],
          },
        ],
      },
      {
        properties: { title: 'Expenses & Maintenance' },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Record ID' } },
                  { userEnteredValue: { stringValue: 'Type' } },
                  { userEnteredValue: { stringValue: 'Date' } },
                  { userEnteredValue: { stringValue: 'Property' } },
                  { userEnteredValue: { stringValue: 'Category / Issue' } },
                  { userEnteredValue: { stringValue: 'Amount / Cost (UGX)' } },
                  { userEnteredValue: { stringValue: 'Status' } },
                ],
              },
              ...backupData.expenses.map((e) => ({
                values: [
                  { userEnteredValue: { stringValue: e.id } },
                  { userEnteredValue: { stringValue: 'Operating Expense' } },
                  { userEnteredValue: { stringValue: e.date } },
                  { userEnteredValue: { stringValue: e.propertyName } },
                  { userEnteredValue: { stringValue: `${e.category}: ${e.description}` } },
                  { userEnteredValue: { numberValue: e.amount } },
                  { userEnteredValue: { stringValue: e.status } },
                ],
              })),
              ...backupData.maintenance.map((m) => ({
                values: [
                  { userEnteredValue: { stringValue: m.id } },
                  { userEnteredValue: { stringValue: 'Maintenance Work Order' } },
                  { userEnteredValue: { stringValue: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '' } },
                  { userEnteredValue: { stringValue: `${m.propertyName} - ${m.unitName}` } },
                  { userEnteredValue: { stringValue: `[${m.priority}] ${m.issue}` } },
                  { userEnteredValue: { numberValue: m.actualCost || m.estimatedCost } },
                  { userEnteredValue: { stringValue: m.status } },
                ],
              })),
            ],
          },
        ],
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create Google Spreadsheet backup');
  }

  const sheetData = await res.json();
  return {
    spreadsheetId: sheetData.spreadsheetId,
    spreadsheetUrl: sheetData.spreadsheetUrl,
    title,
  };
};

// ==========================================
// 7. GOOGLE SLIDES API
// ==========================================
export const createPortfolioPresentation = async (data: {
  title: string;
  landlordName: string;
  propertiesCount: number;
  unitsCount: number;
  totalIncome: number;
  currency: string;
}): Promise<{ presentationId: string; presentationUrl: string }> => {
  const token = checkAccessToken();

  const res = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: data.title,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create Google Slides Presentation');
  }

  const pres = await res.json();
  const presentationId = pres.presentationId;

  return {
    presentationId,
    presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
};

// ==========================================
// 8. GOOGLE FORMS API
// ==========================================
export const listGoogleForms = async (): Promise<GoogleFormItem[]> => {
  const token = checkAccessToken();
  const query = "mimeType = 'application/vnd.google-apps.form' and trashed = false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,webViewLink,iconLink,modifiedTime)&pageSize=30&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to list Google Forms');
  }

  const data = await res.json();
  const files = data.files || [];

  return files.map((f: any) => ({
    formId: f.id,
    title: f.name,
    responderUri: `https://docs.google.com/forms/d/e/${f.id}/viewform`,
    editUri: `https://docs.google.com/forms/d/${f.id}/edit`,
    modifiedTime: f.modifiedTime,
  }));
};

export const getGoogleForm = async (formId: string): Promise<GoogleFormItem> => {
  const token = checkAccessToken();
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch Google Form details');
  }

  const data = await res.json();
  return {
    formId: data.formId,
    title: data.info?.title || 'Untitled Form',
    description: data.info?.description || '',
    responderUri: data.responderUri || `https://docs.google.com/forms/d/e/${data.formId}/viewform`,
    editUri: `https://docs.google.com/forms/d/${data.formId}/edit`,
    items: data.items || [],
  };
};

export const getGoogleFormResponses = async (formId: string): Promise<FormResponseRecord[]> => {
  const token = checkAccessToken();
  
  // 1. First fetch the form structure to map question IDs to question titles
  let questionMap: Record<string, string> = {};
  try {
    const formMeta = await getGoogleForm(formId);
    if (formMeta.items && Array.isArray(formMeta.items)) {
      formMeta.items.forEach((item: any) => {
        const qId = item.questionItem?.question?.questionId;
        if (qId && item.title) {
          questionMap[qId] = item.title;
        }
      });
    }
  } catch (e) {
    // Continue with fallback question IDs
  }

  // 2. Fetch responses
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch form responses');
  }

  const data = await res.json();
  const rawResponses = data.responses || [];

  return rawResponses.map((r: any) => {
    const parsedAnswers: Record<string, FormResponseAnswer> = {};
    if (r.answers) {
      Object.keys(r.answers).forEach((qId) => {
        const ansObj = r.answers[qId];
        const rawVals = ansObj?.textAnswers?.answers?.map((a: any) => a.value) || [];
        const qTitle = questionMap[qId] || `Question (${qId.slice(0, 6)}...)`;
        parsedAnswers[qId] = {
          questionTitle: qTitle,
          values: rawVals,
        };
      });
    }

    return {
      responseId: r.responseId,
      createTime: r.createTime,
      lastSubmittedTime: r.lastSubmittedTime || r.createTime,
      answers: parsedAnswers,
    };
  });
};

export const createCustomGoogleForm = async (
  title: string,
  description: string,
  questions: FormQuestionDef[]
): Promise<GoogleFormItem> => {
  const token = checkAccessToken();

  // 1. Create base form
  const res = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title,
        documentTitle: title,
        description,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create Google Form');
  }

  const created = await res.json();
  const formId = created.formId;

  // 2. Build question items batch update
  if (questions && questions.length > 0) {
    const requests = questions.map((q, index) => {
      let questionConfig: any = {
        required: q.required !== false,
      };

      if (q.type === 'PARAGRAPH') {
        questionConfig.textQuestion = { paragraph: true };
      } else if (q.type === 'RADIO') {
        questionConfig.choiceQuestion = {
          type: 'RADIO',
          options: (q.options || ['Yes', 'No']).map((opt) => ({ value: opt })),
        };
      } else if (q.type === 'CHECKBOX') {
        questionConfig.choiceQuestion = {
          type: 'CHECKBOX',
          options: (q.options || ['Option 1', 'Option 2']).map((opt) => ({ value: opt })),
        };
      } else if (q.type === 'DROP_DOWN') {
        questionConfig.choiceQuestion = {
          type: 'DROP_DOWN',
          options: (q.options || ['Option 1', 'Option 2']).map((opt) => ({ value: opt })),
        };
      } else {
        // default TEXT
        questionConfig.textQuestion = { paragraph: false };
      }

      return {
        createItem: {
          item: {
            title: q.title,
            description: q.description || undefined,
            questionItem: {
              question: questionConfig,
            },
          },
          location: { index },
        },
      };
    });

    const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      console.warn('Batch update questions notice:', err);
    }
  }

  return {
    formId,
    title: created.info?.title || title,
    description: created.info?.description || description,
    responderUri: created.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`,
    editUri: `https://docs.google.com/forms/d/${formId}/edit`,
  };
};

export const createTenantIntakeForm = async (
  estateName = 'MARS Estates Uganda',
  unitOptions: string[] = ['Unit 101', 'Unit 102', 'Unit 201', 'Unit 202', 'Unit 301']
): Promise<GoogleFormItem> => {
  const questions: FormQuestionDef[] = [
    {
      title: 'Full Legal Name (as on National ID / Passport)',
      type: 'TEXT',
      required: true,
      description: 'Enter your legal first name, middle name, and surname.',
    },
    {
      title: 'Primary Contact & Mobile Money Phone Number',
      type: 'TEXT',
      required: true,
      description: 'Ugandan format: e.g. 0782 123456 (MTN) or 0701 654321 (Airtel)',
    },
    {
      title: 'National Identification Number (NIN) / Passport Number',
      type: 'TEXT',
      required: true,
      description: '14-digit Ugandan NIN or valid passport number for KYC clearance.',
    },
    {
      title: 'Assigned Estate & Unit Applied For',
      type: 'DROP_DOWN',
      required: true,
      options: unitOptions,
      description: 'Select the residential or commercial unit for this tenancy agreement.',
    },
    {
      title: 'Proposed Tenancy Commencement Date',
      type: 'TEXT',
      required: true,
      description: 'Date you intend to occupy (e.g. 1st September 2026)',
    },
    {
      title: 'Employer / Business Name & Place of Work',
      type: 'TEXT',
      required: false,
      description: 'Company name, job role, or registered business in Uganda.',
    },
    {
      title: 'Next of Kin / Emergency Contact Name & Phone',
      type: 'TEXT',
      required: true,
      description: 'Full name, relationship, and reachable telephone number.',
    },
    {
      title: 'Agreement to MARS Cashflow Electronic Digital Ledger & Estate By-laws',
      type: 'RADIO',
      required: true,
      options: [
        'I Agree and accept the tenancy rules & digital MoMo ledger receipts',
        'I Request a physical hardcopy agreement review',
      ],
    },
  ];

  return createCustomGoogleForm(
    `${estateName} - Digital Tenant Onboarding & KYC Form`,
    'Official digital onboarding form powered by MARS Cashflow Property Management System. Please fill in all details accurately.',
    questions
  );
};

export const createMaintenanceRequestForm = async (
  estateName = 'MARS Estates Uganda',
  unitOptions: string[] = ['Unit 101', 'Unit 102', 'Unit 201', 'Unit 202', 'Unit 301']
): Promise<GoogleFormItem> => {
  const questions: FormQuestionDef[] = [
    {
      title: 'Tenant Full Name',
      type: 'TEXT',
      required: true,
    },
    {
      title: 'Property & Unit Number',
      type: 'DROP_DOWN',
      required: true,
      options: unitOptions,
    },
    {
      title: 'Contact Phone Number',
      type: 'TEXT',
      required: true,
    },
    {
      title: 'Category of Maintenance / Repair Issue',
      type: 'RADIO',
      required: true,
      options: [
        'Plumbing (Leaks, Taps, Siphons, Water Pressure)',
        'Electrical (Yaka Meter, Sockets, Circuit Breakers, Lighting)',
        'Carpentry & Locks (Doors, Windows, Cabinets, Keys)',
        'Roofing & Ceiling (Leaks, Paint Peeling, Dampness)',
        'Security / Compound (Gate, Intercom, Perimeter)',
        'Other General Maintenance',
      ],
    },
    {
      title: 'Urgency Level',
      type: 'RADIO',
      required: true,
      options: [
        'Emergency (Active water leak, power outage, security risk)',
        'High Priority (Needs attention within 24-48 hours)',
        'Standard Routine (Within 3-5 business days)',
      ],
    },
    {
      title: 'Detailed Description of Fault & Location in Unit',
      type: 'PARAGRAPH',
      required: true,
      description: 'Describe the issue clearly so our caretaker and verified contractor can prepare the right tools and spare parts.',
    },
    {
      title: 'Preferred Inspection & Contractor Access Time',
      type: 'RADIO',
      required: true,
      options: [
        'Morning (8:00 AM - 12:00 PM)',
        'Afternoon (12:00 PM - 5:00 PM)',
        'Anytime with Caretaker Supervision',
      ],
    },
  ];

  return createCustomGoogleForm(
    `${estateName} - Tenant Maintenance & Repair Ticket`,
    'Official maintenance dispatch request form. Tickets submitted here are routed directly to estate caretakers and contracted technicians.',
    questions
  );
};

export const createMoveInspectionForm = async (
  estateName = 'MARS Estates Uganda',
  unitOptions: string[] = ['Unit 101', 'Unit 102', 'Unit 201', 'Unit 202', 'Unit 301']
): Promise<GoogleFormItem> => {
  const questions: FormQuestionDef[] = [
    {
      title: 'Inspection Type',
      type: 'RADIO',
      required: true,
      options: ['Move-In Check-In (New Tenancy)', 'Move-Out Check-Out (Exit Clearance)'],
    },
    {
      title: 'Tenant Full Name',
      type: 'TEXT',
      required: true,
    },
    {
      title: 'Property & Unit',
      type: 'DROP_DOWN',
      required: true,
      options: unitOptions,
    },
    {
      title: 'UMEME Yaka Electricity Meter Number & Current Units Balance',
      type: 'TEXT',
      required: true,
      description: 'Record current meter balance (e.g. Meter # 042918239 - 14.2 kWh)',
    },
    {
      title: 'NWSC Water Meter Reading (Units / Cubic Meters)',
      type: 'TEXT',
      required: true,
      description: 'Record current water dial numbers.',
    },
    {
      title: 'Keys & Remote Controls Handover Count',
      type: 'TEXT',
      required: true,
      description: 'Number of front door keys, bedroom keys, and gate remotes provided/returned.',
    },
    {
      title: 'Condition of Walls, Paint & Ceilings',
      type: 'RADIO',
      required: true,
      options: ['Excellent / Freshly Painted', 'Good (Minor wear)', 'Requires Painting / Patching'],
    },
    {
      title: 'Condition of Plumbing Fixtures & Bathroom Tiles',
      type: 'RADIO',
      required: true,
      options: ['All Functional & Spotless', 'Minor Issues Noted', 'Defective / Requires Repair'],
    },
    {
      title: 'Inspector & Tenant Additional Remarks',
      type: 'PARAGRAPH',
      required: false,
    },
  ];

  return createCustomGoogleForm(
    `${estateName} - Move-In & Move-Out Condition Checklist`,
    'Official property condition handover and security deposit clearance form.',
    questions
  );
};

export const createTenantFeedbackForm = async (
  estateName = 'MARS Estates Uganda'
): Promise<GoogleFormItem> => {
  const questions: FormQuestionDef[] = [
    {
      title: 'Your Property & Unit (Optional for Anonymous Feedback)',
      type: 'TEXT',
      required: false,
    },
    {
      title: 'Overall Satisfaction with MARS Estate Management',
      type: 'RADIO',
      required: true,
      options: [
        '⭐ ⭐ ⭐ ⭐ ⭐ - Highly Satisfied',
        '⭐ ⭐ ⭐ ⭐ - Satisfied',
        '⭐ ⭐ ⭐ - Neutral',
        '⭐ ⭐ - Dissatisfied',
        '⭐ - Very Dissatisfied',
      ],
    },
    {
      title: 'Water Supply Reliability (NWSC & Storage Tanks)',
      type: 'RADIO',
      required: true,
      options: ['Always Available (24/7)', 'Occasional Short Outages', 'Frequent Shortages'],
    },
    {
      title: 'Compound Cleanliness & Garbage Collection',
      type: 'RADIO',
      required: true,
      options: ['Clean & Timely Pickups', 'Satisfactory', 'Needs Improvement'],
    },
    {
      title: 'Caretaker Responsiveness & Communication',
      type: 'RADIO',
      required: true,
      options: ['Very Quick & Helpful', 'Acceptable Response Times', 'Slow to Respond'],
    },
    {
      title: 'Suggestions for Community Improvements & Amenities',
      type: 'PARAGRAPH',
      required: false,
      description: 'What can we upgrade to make your living experience even better?',
    },
  ];

  return createCustomGoogleForm(
    `${estateName} - Tenant Satisfaction & Experience Survey`,
    'Help us improve your estate living environment. We value your honest feedback.',
    questions
  );
};

// ==========================================
// 9. GOOGLE TASKS API
// ==========================================
export const listGoogleTasks = async (): Promise<GoogleTaskItem[]> => {
  const token = checkAccessToken();
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?maxResults=20', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to list Google Tasks');
  }

  const data = await res.json();
  return (data.items || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    due: t.due,
    status: t.status,
  }));
};

export const createGoogleTask = async (task: {
  title: string;
  notes?: string;
  due?: string;
}): Promise<GoogleTaskItem> => {
  const token = checkAccessToken();
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create Google Task');
  }

  return await res.json();
};

export const completeGoogleTask = async (taskId: string): Promise<boolean> => {
  const token = checkAccessToken();
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'completed' }),
  });

  return res.ok;
};
