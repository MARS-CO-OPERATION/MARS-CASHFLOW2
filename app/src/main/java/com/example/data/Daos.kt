package com.example.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface MarsDao {
  // Users & Auth
  @Query("SELECT * FROM users WHERE phoneNumber = :phone LIMIT 1")
  suspend fun getUserByPhone(phone: String): UserEntity?

  @Query("SELECT * FROM users WHERE id = :id LIMIT 1")
  suspend fun getUserById(id: String): UserEntity?

  @Query("SELECT * FROM users")
  fun getAllUsers(): Flow<List<UserEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertUser(user: UserEntity)

  @Update
  suspend fun updateUser(user: UserEntity)

  // Role Assignments
  @Query("SELECT * FROM role_assignments WHERE userId = :userId")
  fun getRoleAssignments(userId: String): Flow<List<RoleAssignmentEntity>>

  @Query("SELECT * FROM role_assignments WHERE userId = :userId")
  suspend fun getRoleAssignmentsList(userId: String): List<RoleAssignmentEntity>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertRoleAssignment(roleAssignment: RoleAssignmentEntity)

  @Query("DELETE FROM role_assignments WHERE userId = :userId")
  suspend fun clearRoleAssignments(userId: String)

  // Properties
  @Query("SELECT * FROM properties ORDER BY createdAt DESC")
  fun getAllProperties(): Flow<List<PropertyEntity>>

  @Query("SELECT * FROM properties ORDER BY createdAt DESC")
  suspend fun getAllPropertiesList(): List<PropertyEntity>

  @Query("SELECT * FROM properties WHERE syncStatus = 'PENDING'")
  suspend fun getPendingPropertiesList(): List<PropertyEntity>

  @Query("SELECT * FROM properties WHERE ownerUserId = :ownerId ORDER BY createdAt DESC")
  fun getPropertiesByOwner(ownerId: String): Flow<List<PropertyEntity>>

  @Query("SELECT * FROM properties WHERE id = :id LIMIT 1")
  fun getPropertyById(id: String): Flow<PropertyEntity?>

  @Query("SELECT * FROM properties WHERE id = :id LIMIT 1")
  suspend fun getPropertyByIdDirect(id: String): PropertyEntity?

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertProperty(property: PropertyEntity)

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertProperties(properties: List<PropertyEntity>)

  @Update
  suspend fun updateProperty(property: PropertyEntity)

  @Delete
  suspend fun deleteProperty(property: PropertyEntity)

  @Query("DELETE FROM properties WHERE id = :id")
  suspend fun deletePropertyById(id: String)

  // Units
  @Query("SELECT * FROM units WHERE propertyId = :propertyId ORDER BY unitName ASC")
  fun getUnitsByProperty(propertyId: String): Flow<List<UnitEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertUnit(unit: UnitEntity)

  // Tenants
  @Query("SELECT * FROM tenants ORDER BY createdAt DESC")
  fun getAllTenants(): Flow<List<TenantEntity>>

  @Query("SELECT * FROM tenants ORDER BY createdAt DESC")
  suspend fun getAllTenantsList(): List<TenantEntity>

  @Query("SELECT * FROM tenants WHERE syncStatus = 'PENDING'")
  suspend fun getPendingTenantsList(): List<TenantEntity>

  @Query("SELECT * FROM tenants WHERE propertyId = :propertyId ORDER BY unitName ASC")
  fun getTenantsByPropertyId(propertyId: String): Flow<List<TenantEntity>>

  @Query("SELECT * FROM tenants WHERE propertyName = :propertyName ORDER BY unitName ASC")
  fun getTenantsByProperty(propertyName: String): Flow<List<TenantEntity>>

  @Query("SELECT * FROM tenants WHERE id = :id LIMIT 1")
  fun getTenantById(id: String): Flow<TenantEntity?>

  @Query("SELECT * FROM tenants WHERE id = :id LIMIT 1")
  suspend fun getTenantByIdDirect(id: String): TenantEntity?

  @Query("SELECT * FROM tenants WHERE userId = :userId LIMIT 1")
  fun getTenantByUserId(userId: String): Flow<TenantEntity?>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertTenant(tenant: TenantEntity)

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertTenants(tenants: List<TenantEntity>)

  @Update
  suspend fun updateTenant(tenant: TenantEntity)

  @Delete
  suspend fun deleteTenant(tenant: TenantEntity)

  @Query("DELETE FROM tenants WHERE id = :id")
  suspend fun deleteTenantById(id: String)

  @Query("SELECT SUM(arrears) FROM tenants")
  fun getTotalArrears(): Flow<Long?>

  // Payments (Ledger Inflow)
  @Query("SELECT * FROM payments ORDER BY paymentTimestamp DESC")
  fun getAllPayments(): Flow<List<PaymentEntity>>

  @Query("SELECT * FROM payments ORDER BY paymentTimestamp DESC")
  suspend fun getAllPaymentsList(): List<PaymentEntity>

  @Query("SELECT * FROM payments WHERE syncStatus = 'PENDING'")
  suspend fun getPendingPaymentsList(): List<PaymentEntity>

  @Query("SELECT * FROM payments WHERE propertyId = :propertyId ORDER BY paymentTimestamp DESC")
  fun getPaymentsByPropertyId(propertyId: String): Flow<List<PaymentEntity>>

  @Query("SELECT * FROM payments WHERE propertyName = :propertyName ORDER BY paymentTimestamp DESC")
  fun getPaymentsByProperty(propertyName: String): Flow<List<PaymentEntity>>

  @Query("SELECT * FROM payments WHERE tenantId = :tenantId ORDER BY paymentTimestamp DESC")
  fun getPaymentsByTenantId(tenantId: String): Flow<List<PaymentEntity>>

  @Query("SELECT * FROM payments WHERE tenantName = :tenantName ORDER BY paymentTimestamp DESC")
  fun getPaymentsByTenant(tenantName: String): Flow<List<PaymentEntity>>

  @Query("SELECT * FROM payments WHERE id = :id LIMIT 1")
  fun getPaymentById(id: String): Flow<PaymentEntity?>

  @Query("SELECT * FROM payments WHERE id = :id LIMIT 1")
  suspend fun getPaymentByIdDirect(id: String): PaymentEntity?

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertPayment(payment: PaymentEntity)

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertPayments(payments: List<PaymentEntity>)

  @Update
  suspend fun updatePayment(payment: PaymentEntity)

  @Delete
  suspend fun deletePayment(payment: PaymentEntity)

  @Query("DELETE FROM payments WHERE id = :id")
  suspend fun deletePaymentById(id: String)

  @Query("SELECT SUM(amount) FROM payments WHERE paymentStatus = 'SUCCESSFUL'")
  fun getTotalCollected(): Flow<Long?>

  // Expenses (Ledger Outflow)
  @Query("SELECT * FROM expenses ORDER BY expenseTimestamp DESC")
  fun getAllExpenses(): Flow<List<ExpenseEntity>>

  @Query("SELECT * FROM expenses ORDER BY expenseTimestamp DESC")
  suspend fun getAllExpensesList(): List<ExpenseEntity>

  @Query("SELECT * FROM expenses WHERE syncStatus = 'PENDING'")
  suspend fun getPendingExpensesList(): List<ExpenseEntity>

  @Query("SELECT * FROM expenses WHERE propertyName = :propertyName ORDER BY expenseTimestamp DESC")
  fun getExpensesByProperty(propertyName: String): Flow<List<ExpenseEntity>>

  @Query("SELECT * FROM expenses WHERE id = :id LIMIT 1")
  fun getExpenseById(id: String): Flow<ExpenseEntity?>

  @Query("SELECT * FROM expenses WHERE id = :id LIMIT 1")
  suspend fun getExpenseByIdDirect(id: String): ExpenseEntity?

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertExpense(expense: ExpenseEntity)

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertExpenses(expenses: List<ExpenseEntity>)

  @Update
  suspend fun updateExpense(expense: ExpenseEntity)

  @Delete
  suspend fun deleteExpense(expense: ExpenseEntity)

  @Query("DELETE FROM expenses WHERE id = :id")
  suspend fun deleteExpenseById(id: String)

  @Query("SELECT SUM(amount) FROM expenses")
  fun getTotalExpenses(): Flow<Long?>

  // Maintenance Requests
  @Query("SELECT * FROM maintenance ORDER BY reportedTimestamp DESC")
  fun getAllMaintenance(): Flow<List<MaintenanceEntity>>

  @Query("SELECT * FROM maintenance WHERE propertyName = :propertyName ORDER BY reportedTimestamp DESC")
  fun getMaintenanceByProperty(propertyName: String): Flow<List<MaintenanceEntity>>

  @Query("SELECT * FROM maintenance WHERE tenantName = :tenantName ORDER BY reportedTimestamp DESC")
  fun getMaintenanceByTenant(tenantName: String): Flow<List<MaintenanceEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertMaintenance(maintenance: MaintenanceEntity)

  @Update
  suspend fun updateMaintenance(maintenance: MaintenanceEntity)

  @Delete
  suspend fun deleteMaintenance(maintenance: MaintenanceEntity)

  // Service Providers
  @Query("SELECT * FROM service_providers ORDER BY rating DESC")
  fun getAllServiceProviders(): Flow<List<ServiceProviderEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertServiceProvider(provider: ServiceProviderEntity)

  @Update
  suspend fun updateServiceProvider(provider: ServiceProviderEntity)

  @Delete
  suspend fun deleteServiceProvider(provider: ServiceProviderEntity)

  // Monthly Statuses
  @Query("SELECT * FROM monthly_payment_status ORDER BY id ASC")
  fun getAllMonthlyStatuses(): Flow<List<MonthlyPaymentStatusEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertMonthlyStatus(status: MonthlyPaymentStatusEntity)

  @Update
  suspend fun updateMonthlyStatus(status: MonthlyPaymentStatusEntity)

  // Audit Log
  @Query("SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT 200")
  fun getAllAuditEvents(): Flow<List<AuditEventEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAuditEvent(event: AuditEventEntity)

  // Notifications
  @Query("SELECT * FROM notifications ORDER BY timestamp DESC")
  fun getAllNotifications(): Flow<List<NotificationEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertNotification(notification: NotificationEntity)

  // Sync Queue / Offline Records
  @Query("SELECT COUNT(*) FROM payments WHERE syncStatus = 'PENDING'")
  fun getPendingPaymentSyncCount(): Flow<Int>

  @Query("SELECT COUNT(*) FROM expenses WHERE syncStatus = 'PENDING'")
  fun getPendingExpenseSyncCount(): Flow<Int>

  @Query("UPDATE payments SET syncStatus = 'SYNCED' WHERE syncStatus = 'PENDING'")
  suspend fun markAllPaymentsSynced()

  @Query("UPDATE expenses SET syncStatus = 'SYNCED' WHERE syncStatus = 'PENDING'")
  suspend fun markAllExpensesSynced()

  @Query("UPDATE properties SET syncStatus = 'SYNCED' WHERE syncStatus = 'PENDING'")
  suspend fun markAllPropertiesSynced()

  @Query("UPDATE tenants SET syncStatus = 'SYNCED' WHERE syncStatus = 'PENDING'")
  suspend fun markAllTenantsSynced()

  @Query("UPDATE maintenance SET syncStatus = 'SYNCED' WHERE syncStatus = 'PENDING'")
  suspend fun markAllMaintenanceSynced()
}
