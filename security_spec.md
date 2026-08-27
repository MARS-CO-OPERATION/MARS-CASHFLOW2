# Mars CashFlow Security Specification

## 1. Data Invariants & Zero-Trust Architecture
1. **Ownership & Tenant Isolation**: A tenant may only read their own profile, rent schedule, payment records, maintenance requests, and digital receipts. They have zero access to other tenants' PII, records, or properties.
2. **Landlord Portfolio Oversight**: A landlord can create, read, update, and manage properties they own, along with associated units, tenant leases, financial flows (payments/expenses), maintenance dispatches, and audit events.
3. **Property Manager / Caretaker Scoping**: A property manager or caretaker is granted scoped operational access (logging payments, logging expenses, dispatching contractors) strictly for properties where their UID is listed in `managerIds` or where assigned by the property owner.
4. **Service Provider / Contractor Scoping**: A contractor can only read maintenance tickets assigned to their UID and update status/completion details. They cannot access financial records or other unrelated properties.
5. **Ledger Immutability**: Payments, digital receipts, and audit log events are strictly append-only and tamper-proof. No user, regardless of role, can delete a payment record or modify financial amount fields after creation.
6. **Privilege Escalation Defense**: Users cannot elevate their own role (`primaryRole`, `isAdmin`) upon account update.

---

## 2. The "Dirty Dozen" Threat Vectors & Rejection Payloads

### Payload 1: Tenant Privilege Escalation
- **Attack**: Tenant attempts to update their own user profile to set `primaryRole: "ADMIN"`.
- **Expected Outcome**: `PERMISSION_DENIED` - User profile update rules prohibit modifying `primaryRole` or `accountStatus` by non-admins.

### Payload 2: Cross-Tenant PII Exfiltration
- **Attack**: Tenant A attempts a direct `get()` or query against Tenant B's document in `/tenants/{tenantId}`.
- **Expected Outcome**: `PERMISSION_DENIED` - Tenant reads require `resource.data.userId == request.auth.uid` or authorized property management role.

### Payload 3: Retroactive Payment Ledger Tampering
- **Attack**: Caretaker or Landlord attempts to modify the `amount` of a recorded payment in `/payments/{paymentId}`.
- **Expected Outcome**: `PERMISSION_DENIED` - Updates to `/payments` restrict `affectedKeys()` strictly to reconciliation/audit flags; financial amounts are immutable.

### Payload 4: Deletion of Financial Inflow Records
- **Attack**: User attempts `delete()` on `/payments/{paymentId}`.
- **Expected Outcome**: `PERMISSION_DENIED` - Payments have `allow delete: if false;`.

### Payload 5: Unauthorized Expense Logging
- **Attack**: Tenant attempts to create an expense record under `/expenses/{expenseId}`.
- **Expected Outcome**: `PERMISSION_DENIED` - Only authenticated Landlords and assigned Managers can log operating expenses.

### Payload 6: Property Spoofing by Unassigned Manager
- **Attack**: Manager A attempts to update or delete a property owned by Landlord B without being listed in `managerIds`.
- **Expected Outcome**: `PERMISSION_DENIED` - Rules verify `resource.data.ownerUserId == request.auth.uid` or `request.auth.uid in resource.data.managerIds`.

### Payload 7: Denial-of-Wallet Payload Injection
- **Attack**: Attacker attempts to create a maintenance ticket with a 500KB junk description string.
- **Expected Outcome**: `PERMISSION_DENIED` - Static validation helpers enforce `description.size() <= 1000`.

### Payload 8: Illegal Document ID Poisoning
- **Attack**: Attacker sends document writes with illegal characters or excessive lengths like `projects/../../admin`.
- **Expected Outcome**: `PERMISSION_DENIED` - `isValidId()` regex guard `^[a-zA-Z0-9_\-]+$` rejects invalid path variables.

### Payload 9: Digital Receipt Alteration
- **Attack**: User attempts `update` or `delete` on an issued digital receipt in `/receipts/{receiptId}`.
- **Expected Outcome**: `PERMISSION_DENIED` - `allow update, delete: if false;` enforces strict receipt immutability.

### Payload 10: Audit Log Tampering
- **Attack**: User attempts to delete or alter an event in `/audit_events/{eventId}`.
- **Expected Outcome**: `PERMISSION_DENIED` - Audit logs are append-only (`allow update, delete: if false;`).

### Payload 11: Contractor Maintenance Scope Escape
- **Attack**: Contractor logs in and attempts to read rental payments or landlord expenses.
- **Expected Outcome**: `PERMISSION_DENIED` - Contractor role is only authorized for assigned `/maintenance` work orders.

### Payload 12: Orphaned Unit Creation
- **Attack**: User attempts to create a rental unit under a nonexistent or un-owned `propertyId`.
- **Expected Outcome**: `PERMISSION_DENIED` - `create` rule validates `isAuthorizedForProperty(request.resource.data.propertyId)`.
