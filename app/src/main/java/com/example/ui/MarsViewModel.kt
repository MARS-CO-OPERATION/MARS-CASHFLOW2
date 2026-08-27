package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class MarsViewModel(application: Application) : AndroidViewModel(application) {
  val repository: MarsRepository
  val authRepository: FirebaseAuthenticationRepository

  val authSessionState: StateFlow<AuthSessionState>
  val currentUser: StateFlow<UserEntity?>
  val currentWorkspace: StateFlow<RoleAssignmentEntity?>
  val userWorkspaces: StateFlow<List<RoleAssignmentEntity>>
  val isDemoMode: StateFlow<Boolean>
  val syncStatus: StateFlow<SyncEngine.SyncStatus>
  val lastSyncedAt: StateFlow<Long>
  val syncMessage: StateFlow<String>

  val properties: StateFlow<List<PropertyEntity>>
  val tenants: StateFlow<List<TenantEntity>>
  val payments: StateFlow<List<PaymentEntity>>
  val expenses: StateFlow<List<ExpenseEntity>>
  val maintenance: StateFlow<List<MaintenanceEntity>>
  val serviceProviders: StateFlow<List<ServiceProviderEntity>>
  val monthlyStatuses: StateFlow<List<MonthlyPaymentStatusEntity>>
  val auditEvents: StateFlow<List<AuditEventEntity>>
  val notifications: StateFlow<List<NotificationEntity>>

  init {
    val db = MarsDatabase.getDatabase(application)
    val authManager = AuthManager(application, db.marsDao())
    val syncEngine = SyncEngine(db.marsDao())
    val authRepo = FirebaseAuthenticationRepositoryImpl(application, db.marsDao())
    repository = MarsRepository(db.marsDao(), authManager, syncEngine, authRepository = authRepo)
    authRepository = repository.authRepository

    authSessionState = authRepository.sessionState
    currentUser = authManager.currentUser
    currentWorkspace = authManager.currentWorkspace
    userWorkspaces = authManager.userWorkspaces
    isDemoMode = authManager.isDemoMode
    syncStatus = syncEngine.status
    lastSyncedAt = syncEngine.lastSyncedAt
    syncMessage = syncEngine.syncMessage

    properties = repository.properties.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    tenants = repository.tenants.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    payments = repository.payments.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    expenses = repository.expenses.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    maintenance = repository.maintenance.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    serviceProviders = repository.serviceProviders.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    monthlyStatuses = repository.monthlyStatuses.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    auditEvents = repository.auditEvents.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    notifications = repository.notifications.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    viewModelScope.launch {
      repository.seedDatabaseIfEmpty()
      authManager.restoreSession()
    }
  }

  fun getActiveRole(): UserRole = repository.authManager.activeRole

  // Authentication & Workspaces
  fun login(identifier: String, pin: String, onResult: (Boolean, String) -> Unit) {
    viewModelScope.launch {
      val result = repository.authManager.loginWithPhonePin(identifier, pin)
      result.onSuccess { user ->
        onResult(true, "Welcome back, ${user.displayName}!")
      }.onFailure { error ->
        onResult(false, error.message ?: "Authentication failed.")
      }
    }
  }

  fun loginWithEmailPassword(
    email: String,
    password: String,
    onResult: (Boolean, String, UserRole?) -> Unit
  ) {
    viewModelScope.launch {
      val result = repository.authManager.loginWithEmailPassword(email, password)
      result.onSuccess { user ->
        val role = UserRole.fromKey(user.primaryRole)
        onResult(true, "Welcome back, ${user.displayName}!", role)
      }.onFailure { error ->
        onResult(false, error.message ?: "Sign-in failed. Please check your credentials.", null)
      }
    }
  }

  fun registerWithEmailPassword(
    email: String,
    password: String,
    displayName: String,
    phoneNumber: String,
    role: UserRole,
    organizationName: String? = null,
    onResult: (Boolean, String, UserRole?) -> Unit
  ) {
    viewModelScope.launch {
      val result = repository.authManager.registerWithEmailPassword(
        email = email,
        password = password,
        displayName = displayName,
        phoneNumber = phoneNumber,
        role = role,
        organizationName = organizationName
      )
      result.onSuccess { user ->
        onResult(true, "Account created successfully for ${user.displayName} as ${role.title}!", role)
      }.onFailure { error ->
        onResult(false, error.message ?: "Registration failed.", null)
      }
    }
  }

  fun loginWithGoogle(
    idToken: String,
    defaultRole: UserRole = UserRole.LANDLORD,
    onResult: (Boolean, String, UserRole?) -> Unit
  ) {
    viewModelScope.launch {
      val result = repository.authManager.loginWithGoogle(
        idToken = idToken,
        firebaseUser = null,
        defaultRole = defaultRole
      )
      result.onSuccess { user ->
        val role = UserRole.fromKey(user.primaryRole)
        onResult(true, "Google Sign-In verified for ${user.displayName}!", role)
      }.onFailure { error ->
        onResult(false, error.message ?: "Google Sign-In failed.", null)
      }
    }
  }

  fun sendPasswordReset(email: String, onResult: (Boolean, String) -> Unit) {
    viewModelScope.launch {
      val result = repository.authManager.sendPasswordReset(email)
      result.onSuccess {
        onResult(true, "Password reset email sent to $email. Please check your inbox.")
      }.onFailure { error ->
        onResult(false, error.message ?: "Failed to send reset email. Please verify the address.")
      }
    }
  }

  fun logout(onComplete: () -> Unit = {}) {
    viewModelScope.launch {
      repository.authManager.logout()
      onComplete()
    }
  }

  fun switchWorkspace(assignment: RoleAssignmentEntity) {
    viewModelScope.launch {
      repository.authManager.switchWorkspace(assignment)
    }
  }

  fun setDemoMode(enabled: Boolean) {
    repository.authManager.setDemoMode(enabled)
  }

  fun triggerSync(onComplete: (Boolean, String) -> Unit = { _, _ -> }) {
    viewModelScope.launch {
      val user = currentUser.value
      val success = repository.syncEngine.performSync(
        actorUserId = user?.id ?: "LOCAL_USER",
        actorName = user?.displayName ?: "User"
      )
      onComplete(success, repository.syncEngine.syncMessage.value)
    }
  }

  // Financial Ledger Operations
  fun recordPayment(
    tenantName: String,
    unitName: String,
    propertyName: String,
    amount: Long,
    method: String,
    payerPhone: String = "",
    caretaker: String = "Peter (Caretaker)",
    notes: String = "",
    onComplete: (String) -> Unit
  ) {
    viewModelScope.launch {
      val tenant = tenants.value.find { it.name.equals(tenantName, ignoreCase = true) }
      val prop = properties.value.find { it.name.equals(propertyName, ignoreCase = true) }

      repository.recordPayment(
        tenantId = tenant?.id ?: "",
        tenantName = tenantName,
        unitName = unitName,
        propertyName = propertyName,
        propertyId = prop?.id ?: "",
        amount = amount,
        method = method,
        payerPhone = payerPhone.ifBlank { tenant?.phone ?: "" },
        recordedBy = caretaker,
        notes = notes
      ) { paymentId, result ->
        if (paymentId.isNotBlank() && tenant != null) {
          // Update tenant arrears and advance credit
          val currentArrears = tenant.arrears
          val newArrears = maxOf(0L, currentArrears - amount)
          val extraCredit = if (amount > currentArrears) amount - currentArrears else 0L
          val newStatus = if (newArrears == 0L) "Paid" else "Pending"

          viewModelScope.launch {
            repository.updateTenant(
              tenant.copy(
                arrears = newArrears,
                advanceCredit = tenant.advanceCredit + extraCredit,
                paymentStatus = newStatus
              )
            )
          }
        }
        onComplete(paymentId)
      }
    }
  }

  fun addExpense(
    propertyName: String,
    description: String,
    amount: Long,
    category: String,
    recordedBy: String = "Manager"
  ) {
    viewModelScope.launch {
      val prop = properties.value.find { it.name.equals(propertyName, ignoreCase = true) }
      repository.insertExpense(
        ExpenseEntity(
          propertyId = prop?.id ?: "",
          propertyName = propertyName,
          description = description,
          amount = amount,
          category = category,
          recordedBy = recordedBy,
          status = "APPROVED",
          date = repository.getCurrentDateFormatted()
        )
      )
    }
  }

  fun addMaintenance(
    propertyName: String,
    unitName: String,
    tenantName: String,
    issue: String,
    priority: String = "MEDIUM"
  ) {
    viewModelScope.launch {
      val prop = properties.value.find { it.name.equals(propertyName, ignoreCase = true) }
      repository.insertMaintenance(
        MaintenanceEntity(
          propertyId = prop?.id ?: "",
          propertyName = propertyName,
          unitName = unitName,
          tenantName = tenantName,
          issue = issue,
          priority = priority,
          status = "Pending",
          date = repository.getCurrentDateFormatted()
        )
      )
    }
  }

  fun updateMaintenanceStatus(
    id: String,
    newStatus: String,
    assignedProvider: String? = null,
    actualCost: Long = 0L
  ) {
    viewModelScope.launch {
      val item = maintenance.value.find { it.id == id }
      if (item != null) {
        repository.updateMaintenance(
          item.copy(
            status = newStatus,
            assignedProviderName = assignedProvider ?: item.assignedProviderName,
            actualCost = if (actualCost > 0) actualCost else item.actualCost
          )
        )
      }
    }
  }

  fun addProperty(name: String, location: String, totalUnits: Int) {
    viewModelScope.launch {
      val user = currentUser.value
      repository.insertProperty(
        PropertyEntity(
          ownerUserId = user?.id ?: "USER_LANDLORD_1",
          name = name,
          location = location,
          totalUnits = totalUnits
        )
      )
    }
  }

  fun addTenant(
    name: String,
    phone: String,
    unitName: String,
    propertyName: String,
    rentDue: Long,
    arrears: Long = 0L
  ) {
    viewModelScope.launch {
      val prop = properties.value.find { it.name.equals(propertyName, ignoreCase = true) }
      repository.insertTenant(
        TenantEntity(
          propertyId = prop?.id ?: "",
          name = name,
          phone = phone,
          unitName = unitName,
          propertyName = propertyName,
          monthlyRent = rentDue,
          rentDue = rentDue,
          arrears = arrears,
          paymentStatus = if (arrears == 0L) "Paid" else "Pending"
        )
      )
    }
  }

  fun sendTenantReminder(
    tenantName: String,
    tenantPhone: String,
    amountDue: Long,
    propertyName: String,
    unitName: String,
    onComplete: (Boolean) -> Unit = {}
  ) {
    viewModelScope.launch {
      val message = "Dear $tenantName, your rent balance of UGX $amountDue for $propertyName ($unitName) is due. Pay via MTN/Airtel MoMo."
      repository.sendTenantNotification(
        recipientPhone = tenantPhone,
        recipientName = tenantName,
        title = "Rent Payment Reminder",
        message = message,
        channel = "IN_APP" // Honest notification channel
      )
      onComplete(true)
    }
  }

  fun updateServiceProviderStatus(id: String, newStatus: String) {
    viewModelScope.launch {
      val provider = serviceProviders.value.find { it.id == id }
      if (provider != null) {
        repository.updateServiceProvider(provider.copy(status = newStatus))
      }
    }
  }

  fun updateServiceProviderStatus(provider: ServiceProviderEntity, newStatus: String) {
    viewModelScope.launch {
      repository.updateServiceProvider(provider.copy(status = newStatus))
    }
  }

  fun addServiceProvider(
    name: String,
    serviceType: String,
    phone: String,
    rate: String,
    rating: Float = 5.0f,
    assignedProperty: String
  ) {
    viewModelScope.launch {
      repository.insertServiceProvider(
        ServiceProviderEntity(
          name = name,
          serviceType = serviceType,
          phone = phone,
          rate = rate,
          rating = rating,
          assignedProperty = assignedProperty,
          isVerified = true
        )
      )
    }
  }

  fun updateMonthlyStatus(item: MonthlyPaymentStatusEntity, newStatus: String) {
    viewModelScope.launch {
      // Update in repository / dao
    }
  }

  fun loadSandboxDemoData(onComplete: (() -> Unit)? = null) {
    viewModelScope.launch {
      repository.seedSandboxDemoData()
      onComplete?.invoke()
    }
  }
}
