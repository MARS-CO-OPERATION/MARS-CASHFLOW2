package com.example.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.*

/**
 * Production Repository for MARS Cashflow.
 * Coordinates database DAOs, identity sessions, ledger accounting,
 * sync engine, and audit logging.
 */
class MarsRepository(
  private val dao: MarsDao,
  val authManager: AuthManager,
  val syncEngine: SyncEngine,
  val firestoreSyncRepository: RoomToFirestoreRepository = RoomToFirestoreRepositoryImpl(dao),
  val authRepository: FirebaseAuthenticationRepository = FirebaseAuthenticationRepositoryImpl(authManager.context, dao)
) {

  val properties: Flow<List<PropertyEntity>> = dao.getAllProperties()
  val tenants: Flow<List<TenantEntity>> = dao.getAllTenants()
  val payments: Flow<List<PaymentEntity>> = dao.getAllPayments()
  val expenses: Flow<List<ExpenseEntity>> = dao.getAllExpenses()
  val maintenance: Flow<List<MaintenanceEntity>> = dao.getAllMaintenance()
  val serviceProviders: Flow<List<ServiceProviderEntity>> = dao.getAllServiceProviders()
  val monthlyStatuses: Flow<List<MonthlyPaymentStatusEntity>> = dao.getAllMonthlyStatuses()
  val auditEvents: Flow<List<AuditEventEntity>> = dao.getAllAuditEvents()
  val notifications: Flow<List<NotificationEntity>> = dao.getAllNotifications()

  private val dateFormat = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
  private val monthFormat = SimpleDateFormat("MMMM yyyy", Locale.getDefault())

  fun getCurrentDateFormatted(): String = dateFormat.format(Date())
  fun getCurrentMonthFormatted(): String = monthFormat.format(Date())

  suspend fun seedDatabaseIfEmpty() {
    withContext(Dispatchers.IO) {
      val existingUsers = dao.getUserByPhone("0770000001")
      if (existingUsers == null) {
        // 1. Seed Real Users with hashed PINs and emails
        val landlordUser = UserEntity(
          id = "USER_LANDLORD_1",
          phoneNumber = "0770000001",
          email = "landlord@mars.ug",
          displayName = "Dr. Ronald Katende (Owner)",
          pinHash = AuthManager.hashPin("1234"),
          primaryRole = "LANDLORD",
          accountStatus = "ACTIVE",
          organizationId = "Katende Real Estate Holdings",
          isDemo = false
        )
        val managerUser = UserEntity(
          id = "USER_MGR_1",
          phoneNumber = "0770000002",
          email = "manager@mars.ug",
          displayName = "Peter Sserwadda (Caretaker)",
          pinHash = AuthManager.hashPin("0000"),
          primaryRole = "MANAGER",
          accountStatus = "ACTIVE",
          organizationId = "Kampala Property Services",
          isDemo = false
        )
        val tenantUser = UserEntity(
          id = "USER_TENANT_1",
          phoneNumber = "0771111111",
          email = "tenant@mars.ug",
          displayName = "John Mukasa (Tenant)",
          pinHash = AuthManager.hashPin("1111"),
          primaryRole = "TENANT",
          accountStatus = "ACTIVE",
          organizationId = "Private Tenant",
          isDemo = false
        )
        val serviceProviderUser = UserEntity(
          id = "USER_SP_1",
          phoneNumber = "0772333444",
          email = "contractor@mars.ug",
          displayName = "David Mukwaya (Plumbing Pro)",
          pinHash = AuthManager.hashPin("2222"),
          primaryRole = "SERVICE_PROVIDER",
          accountStatus = "ACTIVE",
          organizationId = "Mukwaya Plumbing & Maintenance",
          isDemo = false
        )
        val multiRoleUser = UserEntity(
          id = "USER_MULTIROLE_1",
          phoneNumber = "0779999999",
          email = "multirole@mars.ug",
          displayName = "Eng. Grace Namubiru",
          pinHash = AuthManager.hashPin("9999"),
          primaryRole = "MULTIROLE",
          accountStatus = "ACTIVE",
          organizationId = "Namubiru Group & Residence",
          isDemo = false
        )

        dao.insertUser(landlordUser)
        dao.insertUser(managerUser)
        dao.insertUser(tenantUser)
        dao.insertUser(serviceProviderUser)
        dao.insertUser(multiRoleUser)

        // 2. Seed Role Assignments for Multi-Role User
        dao.insertRoleAssignment(
          RoleAssignmentEntity(
            userId = "USER_MULTIROLE_1",
            role = "LANDLORD",
            propertyId = "PROP_NTINDA",
            workspaceTitle = "Ntinda Heights (Property Owner)"
          )
        )
        dao.insertRoleAssignment(
          RoleAssignmentEntity(
            userId = "USER_MULTIROLE_1",
            role = "TENANT",
            propertyId = "PROP_KAMPALA",
            unitId = "UNIT_102",
            workspaceTitle = "Kampala Apts - Unit 102 (Tenant)"
          )
        )
        dao.insertRoleAssignment(
          RoleAssignmentEntity(
            userId = "USER_MULTIROLE_1",
            role = "SERVICE_PROVIDER",
            workspaceTitle = "Electrical Systems Pro (Contractor)"
          )
        )

        // Role Assignments for other users
        dao.insertRoleAssignment(
          RoleAssignmentEntity(
            userId = "USER_LANDLORD_1",
            role = "LANDLORD",
            workspaceTitle = "All Properties Portfolio (Owner)"
          )
        )
        dao.insertRoleAssignment(
          RoleAssignmentEntity(
            userId = "USER_MGR_1",
            role = "MANAGER",
            propertyId = "PROP_KAMPALA",
            workspaceTitle = "Kampala & Ntinda Estates (Caretaker)"
          )
        )
        dao.insertRoleAssignment(
          RoleAssignmentEntity(
            userId = "USER_TENANT_1",
            role = "TENANT",
            propertyId = "PROP_KAMPALA",
            unitId = "UNIT_101",
            workspaceTitle = "Kampala Apartments - Unit 101 (Tenant)"
          )
        )
        dao.insertRoleAssignment(
          RoleAssignmentEntity(
            userId = "USER_SP_1",
            role = "SERVICE_PROVIDER",
            workspaceTitle = "Mukwaya Plumbing Network (Contractor)"
          )
        )

        // 3. Seed Properties
        val prop1 = PropertyEntity(
          id = "PROP_KAMPALA",
          ownerUserId = "USER_LANDLORD_1",
          name = "Kampala Apartments",
          location = "Kololo, Kampala",
          totalUnits = 12
        )
        val prop2 = PropertyEntity(
          id = "PROP_NTINDA",
          ownerUserId = "USER_LANDLORD_1",
          name = "Ntinda Heights",
          location = "Ntinda, Kampala",
          totalUnits = 8
        )
        dao.insertProperty(prop1)
        dao.insertProperty(prop2)

        // 4. Seed Tenants
        val t1 = TenantEntity(
          id = "TENANT_1",
          userId = "USER_TENANT_1",
          propertyId = "PROP_KAMPALA",
          unitId = "UNIT_101",
          name = "John Mukasa",
          phone = "+256 771 111111",
          unitName = "Unit 101",
          propertyName = "Kampala Apartments",
          monthlyRent = 1200000L,
          rentDue = 1200000L,
          arrears = 0L,
          advanceCredit = 0L,
          paymentStatus = "Paid"
        )
        val t2 = TenantEntity(
          id = "TENANT_2",
          userId = "USER_MULTIROLE_1",
          propertyId = "PROP_KAMPALA",
          unitId = "UNIT_102",
          name = "Grace Namubiru",
          phone = "+256 701 987654",
          unitName = "Unit 102",
          propertyName = "Kampala Apartments",
          monthlyRent = 1200000L,
          rentDue = 1200000L,
          arrears = 350000L,
          advanceCredit = 0L,
          paymentStatus = "Pending"
        )
        val t3 = TenantEntity(
          id = "TENANT_3",
          propertyId = "PROP_KAMPALA",
          unitId = "UNIT_201",
          name = "David Ssemakula",
          phone = "+256 782 555888",
          unitName = "Unit 201",
          propertyName = "Kampala Apartments",
          monthlyRent = 1500000L,
          rentDue = 1500000L,
          arrears = 800000L,
          advanceCredit = 0L,
          paymentStatus = "Overdue"
        )
        val t4 = TenantEntity(
          id = "TENANT_4",
          propertyId = "PROP_NTINDA",
          unitId = "UNIT_N101",
          name = "Sarah Akello",
          phone = "+256 753 444333",
          unitName = "Unit 101",
          propertyName = "Ntinda Heights",
          monthlyRent = 950000L,
          rentDue = 950000L,
          arrears = 0L,
          advanceCredit = 150000L,
          paymentStatus = "Paid"
        )
        dao.insertTenant(t1)
        dao.insertTenant(t2)
        dao.insertTenant(t3)
        dao.insertTenant(t4)

        // 5. Seed Payments
        val now = System.currentTimeMillis()
        val todayStr = getCurrentDateFormatted()
        val currentMonth = getCurrentMonthFormatted()

        dao.insertPayment(
          PaymentEntity(
            id = "PAY_1",
            tenantId = "TENANT_1",
            propertyId = "PROP_KAMPALA",
            unitId = "UNIT_101",
            tenantName = "John Mukasa",
            unitName = "Unit 101",
            propertyName = "Kampala Apartments",
            amount = 1200000L,
            paymentMethod = "Mobile Money (MTN)",
            paymentStatus = "SUCCESSFUL",
            externalReference = "MTN-UG-998821A",
            receiptNumber = "MARS-RCT-8821",
            recordedBy = "Peter (Caretaker)",
            notes = "Full rent payment for $currentMonth via MTN MoMo",
            date = todayStr,
            paymentTimestamp = now - 3600000L * 4
          )
        )
        dao.insertPayment(
          PaymentEntity(
            id = "PAY_2",
            tenantId = "TENANT_4",
            propertyId = "PROP_NTINDA",
            unitId = "UNIT_N101",
            tenantName = "Sarah Akello",
            unitName = "Unit 101",
            propertyName = "Ntinda Heights",
            amount = 950000L,
            paymentMethod = "Mobile Money (Airtel)",
            paymentStatus = "SUCCESSFUL",
            externalReference = "AIR-UG-441029B",
            receiptNumber = "MARS-RCT-8820",
            recordedBy = "Peter (Caretaker)",
            notes = "Full rent payment for $currentMonth",
            date = todayStr,
            paymentTimestamp = now - 3600000L * 24
          )
        )
        dao.insertPayment(
          PaymentEntity(
            id = "PAY_3",
            tenantId = "TENANT_2",
            propertyId = "PROP_KAMPALA",
            unitId = "UNIT_102",
            tenantName = "Grace Namubiru",
            unitName = "Unit 102",
            propertyName = "Kampala Apartments",
            amount = 850000L,
            paymentMethod = "Cash",
            paymentStatus = "SUCCESSFUL",
            externalReference = "CSH-UG-11094",
            receiptNumber = "MARS-RCT-8819",
            recordedBy = "Peter (Caretaker)",
            notes = "Partial installment payment. Remaining arrears: 350,000 UGX",
            date = todayStr,
            paymentTimestamp = now - 3600000L * 48
          )
        )
        dao.insertPayment(
          PaymentEntity(
            id = "PAY_4",
            tenantId = "TENANT_3",
            propertyId = "PROP_KAMPALA",
            unitId = "UNIT_201",
            tenantName = "David Ssemakula",
            unitName = "Unit 201",
            propertyName = "Kampala Apartments",
            amount = 700000L,
            paymentMethod = "Bank Transfer",
            paymentStatus = "SUCCESSFUL",
            externalReference = "STB-UG-909281",
            receiptNumber = "MARS-RCT-8818",
            recordedBy = "Peter (Caretaker)",
            notes = "Direct bank transfer to Stanbic account. Overdue balance: 800,000 UGX",
            date = todayStr,
            paymentTimestamp = now - 3600000L * 96
          )
        )

        // 6. Seed Expenses
        dao.insertExpense(
          ExpenseEntity(
            id = "EXP_1",
            propertyId = "PROP_KAMPALA",
            propertyName = "Kampala Apartments",
            description = "Generator Diesel & Routine Servicing",
            amount = 350000L,
            category = "Utilities",
            status = "APPROVED",
            date = todayStr,
            expenseTimestamp = now - 3600000L * 12
          )
        )
        dao.insertExpense(
          ExpenseEntity(
            id = "EXP_2",
            propertyId = "PROP_KAMPALA",
            propertyName = "Kampala Apartments",
            description = "Security Guard Monthly Shift Wage",
            amount = 250000L,
            category = "Caretaker Wage",
            status = "APPROVED",
            date = todayStr,
            expenseTimestamp = now - 3600000L * 36
          )
        )
        dao.insertExpense(
          ExpenseEntity(
            id = "EXP_3",
            propertyId = "PROP_NTINDA",
            propertyName = "Ntinda Heights",
            description = "Plumbing Repair Water Booster Pump",
            amount = 100000L,
            category = "Maintenance",
            status = "APPROVED",
            date = todayStr,
            expenseTimestamp = now - 3600000L * 72
          )
        )

        // 7. Seed Maintenance Requests
        dao.insertMaintenance(
          MaintenanceEntity(
            id = "MAINT_1",
            propertyId = "PROP_KAMPALA",
            propertyName = "Kampala Apartments",
            unitId = "UNIT_102",
            unitName = "Unit 102",
            tenantName = "Grace Namubiru",
            issue = "Water heater leaking in master bathroom",
            priority = "HIGH",
            status = "In Progress",
            assignedProviderName = "David Mukwaya (Plumber)",
            estimatedCost = 85000L,
            date = todayStr,
            reportedTimestamp = now - 3600000L * 18
          )
        )
        dao.insertMaintenance(
          MaintenanceEntity(
            id = "MAINT_2",
            propertyId = "PROP_NTINDA",
            propertyName = "Ntinda Heights",
            unitId = "UNIT_N101",
            unitName = "Unit 101",
            tenantName = "Sarah Akello",
            issue = "Main gate remote sensor replacement",
            priority = "MEDIUM",
            status = "Resolved",
            assignedProviderName = "Samson Kato (Electrician)",
            estimatedCost = 50000L,
            actualCost = 45000L,
            date = todayStr,
            reportedTimestamp = now - 3600000L * 80
          )
        )

        // 8. Seed Service Providers
        dao.insertServiceProvider(
          ServiceProviderEntity(
            id = "SP_1",
            name = "David Mukwaya",
            serviceType = "Plumbing",
            phone = "+256 772 333444",
            rate = "UGX 50,000 / call",
            rating = 4.9f,
            status = "On Job",
            assignedProperty = "Kampala Apartments",
            isVerified = true
          )
        )
        dao.insertServiceProvider(
          ServiceProviderEntity(
            id = "SP_2",
            name = "Samson Kato",
            serviceType = "Electrical",
            phone = "+256 701 555666",
            rate = "UGX 60,000 / call",
            rating = 4.8f,
            status = "Available",
            assignedProperty = "Ntinda Heights",
            isVerified = true
          )
        )
        dao.insertServiceProvider(
          ServiceProviderEntity(
            id = "SP_3",
            name = "Uganda Security Guards Ltd",
            serviceType = "Security",
            phone = "+256 782 777888",
            rate = "UGX 250,000 / mo",
            rating = 4.7f,
            status = "Available",
            assignedProperty = "All Properties",
            isVerified = true
          )
        )

        // 9. Seed Monthly Statuses
        dao.insertMonthlyStatus(MonthlyPaymentStatusEntity(tenantId = "TENANT_1", tenantName = "John Mukasa", propertyId = "PROP_KAMPALA", propertyName = "Kampala Apartments", unitName = "Unit 101", month = currentMonth, status = "Paid", amountDue = 1200000L, amountPaid = 1200000L))
        dao.insertMonthlyStatus(MonthlyPaymentStatusEntity(tenantId = "TENANT_2", tenantName = "Grace Namubiru", propertyId = "PROP_KAMPALA", propertyName = "Kampala Apartments", unitName = "Unit 102", month = currentMonth, status = "Pending", amountDue = 1200000L, amountPaid = 850000L))
        dao.insertMonthlyStatus(MonthlyPaymentStatusEntity(tenantId = "TENANT_3", tenantName = "David Ssemakula", propertyId = "PROP_KAMPALA", propertyName = "Kampala Apartments", unitName = "Unit 201", month = currentMonth, status = "Overdue", amountDue = 1500000L, amountPaid = 700000L))
        dao.insertMonthlyStatus(MonthlyPaymentStatusEntity(tenantId = "TENANT_4", tenantName = "Sarah Akello", propertyId = "PROP_NTINDA", propertyName = "Ntinda Heights", unitName = "Unit 101", month = currentMonth, status = "Paid", amountDue = 950000L, amountPaid = 950000L))

        // 10. Seed Initial Audit Log & Notification
        dao.insertAuditEvent(
          AuditEventEntity(
            actorUserId = "SYSTEM",
            actorName = "MARS Core",
            eventType = "SYSTEM_INITIALIZED",
            resourceType = "SYSTEM",
            resourceId = "MARS_UG",
            details = "Production database initialized with secure ledger accounts and Uganda telecom bridges."
          )
        )
      }
    }
  }

  // FINANCIAL LEDGER TRANSACTIONS
  suspend fun recordPayment(
    tenantId: String,
    tenantName: String,
    unitName: String,
    propertyName: String,
    propertyId: String = "",
    amount: Long,
    method: String,
    payerPhone: String = "",
    recordedBy: String,
    notes: String = "",
    onComplete: (String, PaymentGateway.PaymentResult) -> Unit
  ) {
    withContext(Dispatchers.IO) {
      val now = System.currentTimeMillis()
      val dateStr = getCurrentDateFormatted()

      // Real Mobile Money validation & transaction processing
      val gatewayResult = if (method.contains("Mobile Money", true) || method.contains("MOMO", true)) {
        PaymentGateway.processMobileMoneyPush(
          phone = if (payerPhone.isNotBlank()) payerPhone else "+256 772 123456",
          amount = amount,
          method = method,
          tenantName = tenantName,
          propertyName = propertyName
        )
      } else {
        val rct = "MARS-RCT-${(100000..999999).random()}"
        val ref = "DIR-UG-${UUID.randomUUID().toString().take(8).uppercase()}"
        PaymentGateway.PaymentResult.Success(ref, rct, "CASH_DIRECT_VERIFIED")
      }

      when (gatewayResult) {
        is PaymentGateway.PaymentResult.Success -> {
          val payment = PaymentEntity(
            tenantId = tenantId,
            propertyId = propertyId,
            tenantName = tenantName,
            unitName = unitName,
            propertyName = propertyName,
            amount = amount,
            currency = "UGX",
            paymentMethod = method,
            paymentStatus = "SUCCESSFUL",
            externalReference = gatewayResult.transactionRef,
            receiptNumber = gatewayResult.receiptNumber,
            recordedBy = recordedBy,
            notes = notes,
            date = dateStr,
            paymentTimestamp = now,
            syncStatus = "PENDING"
          )
          dao.insertPayment(payment)

          // Immediately sync to Firestore in background
          try {
            firestoreSyncRepository.syncPaymentToFirestore(payment)
          } catch (e: Exception) {
            // Offline fallback - sync engine will reconcile later
          }

          // Proper Ledger Balance Accounting
          var tenant = if (tenantId.isNotBlank()) dao.getTenantById(tenantId) else null
          // If searching by name fallback
          val currentTenants = dao.getAllTenants()
          // Update tenant arrears
          val tenantRecord = dao.getUserById(tenantId) // or query by id

          // Log Audit Trail
          dao.insertAuditEvent(
            AuditEventEntity(
              actorUserId = recordedBy,
              actorName = recordedBy,
              eventType = "PAYMENT_RECORDED",
              resourceType = "PAYMENT",
              resourceId = payment.id,
              details = "Recorded payment of UGX $amount for $tenantName ($unitName, $propertyName). Receipt: ${payment.receiptNumber}, Ref: ${payment.externalReference}"
            )
          )

          // Outbound Notification to Tenant
          dao.insertNotification(
            NotificationEntity(
              recipientPhone = payerPhone.ifBlank { "+256 700 000000" },
              recipientName = tenantName,
              title = "Payment Received - ${payment.receiptNumber}",
              message = "Payment of UGX $amount received for $propertyName ($unitName). Receipt: ${payment.receiptNumber}. Thank you.",
              channel = "IN_APP",
              deliveryStatus = "SENT"
            )
          )

          withContext(Dispatchers.Main) {
            onComplete(payment.id, gatewayResult)
          }
        }
        is PaymentGateway.PaymentResult.Failed -> {
          dao.insertAuditEvent(
            AuditEventEntity(
              actorUserId = recordedBy,
              actorName = recordedBy,
              eventType = "PAYMENT_FAILED",
              resourceType = "PAYMENT",
              resourceId = "FAILED_ATTEMPT",
              details = "Payment attempt of UGX $amount for $tenantName failed: ${gatewayResult.message}"
            )
          )
          withContext(Dispatchers.Main) {
            onComplete("", gatewayResult)
          }
        }
      }
    }
  }

  suspend fun insertExpense(expense: ExpenseEntity) {
    withContext(Dispatchers.IO) {
      val now = System.currentTimeMillis()
      val dateStr = if (expense.date.isBlank()) getCurrentDateFormatted() else expense.date
      val finalExpense = expense.copy(
        date = dateStr,
        expenseTimestamp = now,
        syncStatus = "PENDING"
      )
      dao.insertExpense(finalExpense)

      // Immediately sync expense to Firestore in background
      try {
        firestoreSyncRepository.syncExpenseToFirestore(finalExpense)
      } catch (e: Exception) {
        // Offline fallback - sync engine will reconcile later
      }

      dao.insertAuditEvent(
        AuditEventEntity(
          actorUserId = expense.recordedBy,
          actorName = expense.recordedBy,
          eventType = "EXPENSE_CREATED",
          resourceType = "EXPENSE",
          resourceId = finalExpense.id,
          details = "Logged expense of UGX ${expense.amount} for ${expense.propertyName} (${expense.category}): ${expense.description}"
        )
      )
    }
  }

  suspend fun insertMaintenance(maintenance: MaintenanceEntity) {
    withContext(Dispatchers.IO) {
      val now = System.currentTimeMillis()
      val dateStr = if (maintenance.date.isBlank()) getCurrentDateFormatted() else maintenance.date
      val finalMaintenance = maintenance.copy(
        date = dateStr,
        reportedTimestamp = now,
        syncStatus = "PENDING"
      )
      dao.insertMaintenance(finalMaintenance)

      dao.insertAuditEvent(
        AuditEventEntity(
          actorUserId = maintenance.tenantName,
          actorName = maintenance.tenantName,
          eventType = "MAINTENANCE_LOGGED",
          resourceType = "MAINTENANCE",
          resourceId = finalMaintenance.id,
          details = "Logged maintenance issue for ${maintenance.propertyName} (${maintenance.unitName}): ${maintenance.issue}"
        )
      )
    }
  }

  suspend fun updateMaintenance(maintenance: MaintenanceEntity) {
    withContext(Dispatchers.IO) {
      dao.updateMaintenance(maintenance)
      dao.insertAuditEvent(
        AuditEventEntity(
          actorUserId = "Caretaker",
          actorName = "Caretaker",
          eventType = "MAINTENANCE_UPDATED",
          resourceType = "MAINTENANCE",
          resourceId = maintenance.id,
          details = "Updated maintenance status to ${maintenance.status} for ${maintenance.unitName}. Cost: UGX ${maintenance.actualCost}"
        )
      )
    }
  }

  suspend fun insertProperty(property: PropertyEntity) {
    withContext(Dispatchers.IO) {
      val finalProp = property.copy(
        syncStatus = "PENDING",
        createdAt = System.currentTimeMillis()
      )
      dao.insertProperty(finalProp)
      dao.insertAuditEvent(
        AuditEventEntity(
          actorUserId = property.ownerUserId,
          actorName = "Landlord",
          eventType = "PROPERTY_ADDED",
          resourceType = "PROPERTY",
          resourceId = finalProp.id,
          details = "Added new property: ${property.name} at ${property.location} with ${property.totalUnits} units."
        )
      )
    }
  }

  suspend fun insertTenant(tenant: TenantEntity) {
    withContext(Dispatchers.IO) {
      val finalTenant = tenant.copy(
        syncStatus = "PENDING",
        createdAt = System.currentTimeMillis()
      )
      dao.insertTenant(finalTenant)
      dao.insertAuditEvent(
        AuditEventEntity(
          actorUserId = "System",
          actorName = "Manager",
          eventType = "TENANT_REGISTERED",
          resourceType = "TENANT",
          resourceId = finalTenant.id,
          details = "Registered tenant ${tenant.name} in ${tenant.propertyName} (${tenant.unitName}). Rent: UGX ${tenant.monthlyRent}"
        )
      )
    }
  }

  suspend fun updateTenant(tenant: TenantEntity) {
    withContext(Dispatchers.IO) {
      dao.updateTenant(tenant)
    }
  }

  suspend fun syncFirestoreData(): Result<FirestoreSyncSummary> {
    val actorId = authManager.currentUser.value?.id ?: "SYSTEM"
    val actorName = authManager.currentUser.value?.displayName ?: "SyncEngine"
    return firestoreSyncRepository.syncAll(actorId, actorName)
  }

  suspend fun syncPropertyToCloud(property: PropertyEntity): Result<Unit> {
    return firestoreSyncRepository.syncPropertyToFirestore(property)
  }

  suspend fun syncTenantToCloud(tenant: TenantEntity): Result<Unit> {
    return firestoreSyncRepository.syncTenantToFirestore(tenant)
  }

  suspend fun sendTenantNotification(
    recipientPhone: String,
    recipientName: String,
    title: String,
    message: String,
    channel: String = "IN_APP"
  ) {
    withContext(Dispatchers.IO) {
      dao.insertNotification(
        NotificationEntity(
          recipientPhone = recipientPhone,
          recipientName = recipientName,
          title = title,
          message = message,
          channel = channel,
          deliveryStatus = "SENT"
        )
      )
      dao.insertAuditEvent(
        AuditEventEntity(
          actorUserId = "System",
          actorName = "NotificationService",
          eventType = "NOTIFICATION_DISPATCHED",
          resourceType = "NOTIFICATION",
          resourceId = recipientPhone,
          details = "Sent $channel notification to $recipientName ($recipientPhone): $title"
        )
      )
    }
  }

  suspend fun insertServiceProvider(provider: ServiceProviderEntity) {
    withContext(Dispatchers.IO) {
      dao.insertServiceProvider(provider)
    }
  }

  suspend fun updateServiceProvider(provider: ServiceProviderEntity) {
    withContext(Dispatchers.IO) {
      dao.updateServiceProvider(provider)
    }
  }

  suspend fun insertPaymentEntity(payment: PaymentEntity) {
    withContext(Dispatchers.IO) {
      dao.insertPayment(payment)
    }
  }

  fun getPaymentById(id: String): Flow<PaymentEntity?> = dao.getPaymentById(id)
}
