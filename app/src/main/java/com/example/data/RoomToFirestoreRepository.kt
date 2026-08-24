package com.example.data

import android.util.Log
import com.google.android.gms.tasks.Task
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.QuerySnapshot
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.util.UUID
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * Result summary for Room-to-Firestore synchronization operations.
 */
data class FirestoreSyncSummary(
  val pushedPropertiesCount: Int = 0,
  val pulledPropertiesCount: Int = 0,
  val pushedTenantsCount: Int = 0,
  val pulledTenantsCount: Int = 0,
  val pushedPaymentsCount: Int = 0,
  val pulledPaymentsCount: Int = 0,
  val pushedExpensesCount: Int = 0,
  val pulledExpensesCount: Int = 0,
  val isSuccessful: Boolean = true,
  val timestamp: Long = System.currentTimeMillis(),
  val message: String = ""
)

/**
 * Repository interface for synchronizing Room local database entities
 * (PropertyEntity, TenantEntity, PaymentEntity, ExpenseEntity) with cloud Firebase Firestore collections.
 */
interface RoomToFirestoreRepository {

  // Properties
  suspend fun pushPropertiesToFirestore(): Result<Int>
  suspend fun pullPropertiesFromFirestore(): Result<Int>
  suspend fun syncPropertyToFirestore(property: PropertyEntity): Result<Unit>
  suspend fun deletePropertyFromFirestore(propertyId: String): Result<Unit>
  fun observeRemoteProperties(): Flow<List<PropertyEntity>>

  // Tenants
  suspend fun pushTenantsToFirestore(): Result<Int>
  suspend fun pullTenantsFromFirestore(): Result<Int>
  suspend fun syncTenantToFirestore(tenant: TenantEntity): Result<Unit>
  suspend fun deleteTenantFromFirestore(tenantId: String): Result<Unit>
  fun observeRemoteTenants(): Flow<List<TenantEntity>>

  // Payments (Ledger Inflow)
  suspend fun pushPaymentsToFirestore(): Result<Int>
  suspend fun pullPaymentsFromFirestore(): Result<Int>
  suspend fun syncPaymentToFirestore(payment: PaymentEntity): Result<Unit>
  suspend fun deletePaymentFromFirestore(paymentId: String): Result<Unit>
  fun observeRemotePayments(): Flow<List<PaymentEntity>>

  // Expenses (Ledger Outflow)
  suspend fun pushExpensesToFirestore(): Result<Int>
  suspend fun pullExpensesFromFirestore(): Result<Int>
  suspend fun syncExpenseToFirestore(expense: ExpenseEntity): Result<Unit>
  suspend fun deleteExpenseFromFirestore(expenseId: String): Result<Unit>
  fun observeRemoteExpenses(): Flow<List<ExpenseEntity>>

  /**
   * Executes a two-way synchronization between Room and Firestore across all financial ledgers.
   */
  suspend fun syncAll(actorUserId: String = "SYSTEM", actorName: String = "SyncEngine"): Result<FirestoreSyncSummary>
}

/**
 * Production implementation of [RoomToFirestoreRepository] using FirebaseFirestore.
 */
class RoomToFirestoreRepositoryImpl(
  private val dao: MarsDao,
  private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) : RoomToFirestoreRepository {

  companion object {
    private const val TAG = "FirestoreSyncRepo"
    const val COLLECTION_PROPERTIES = "properties"
    const val COLLECTION_TENANTS = "tenants"
    const val COLLECTION_PAYMENTS = "payments"
    const val COLLECTION_EXPENSES = "expenses"
  }

  // --- Properties ---

  override suspend fun pushPropertiesToFirestore(): Result<Int> = withContext(Dispatchers.IO) {
    try {
      val properties = dao.getAllPropertiesList()
      var count = 0
      for (prop in properties) {
        val data = prop.toFirestoreMap()
        firestore.collection(COLLECTION_PROPERTIES)
          .document(prop.id)
          .set(data, SetOptions.merge())
          .awaitTask()

        dao.updateProperty(prop.copy(syncStatus = "SYNCED", lastSyncedAt = System.currentTimeMillis()))
        count++
      }
      Result.success(count)
    } catch (e: Exception) {
      Log.e(TAG, "Error pushing properties to Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun pullPropertiesFromFirestore(): Result<Int> = withContext(Dispatchers.IO) {
    try {
      val snapshot: QuerySnapshot = firestore.collection(COLLECTION_PROPERTIES)
        .get()
        .awaitTask()

      val remoteProperties = snapshot.documents.mapNotNull { doc ->
        doc.data?.let { data ->
          PropertyEntityMappers.fromFirestoreMap(doc.id, data)
        }
      }

      if (remoteProperties.isNotEmpty()) {
        dao.insertProperties(remoteProperties)
      }
      Result.success(remoteProperties.size)
    } catch (e: Exception) {
      Log.e(TAG, "Error pulling properties from Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun syncPropertyToFirestore(property: PropertyEntity): Result<Unit> = withContext(Dispatchers.IO) {
    try {
      val data = property.toFirestoreMap()
      firestore.collection(COLLECTION_PROPERTIES)
        .document(property.id)
        .set(data, SetOptions.merge())
        .awaitTask()

      dao.updateProperty(property.copy(syncStatus = "SYNCED", lastSyncedAt = System.currentTimeMillis()))
      Result.success(Unit)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to sync property ${property.id} to Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun deletePropertyFromFirestore(propertyId: String): Result<Unit> = withContext(Dispatchers.IO) {
    try {
      firestore.collection(COLLECTION_PROPERTIES)
        .document(propertyId)
        .delete()
        .awaitTask()
      Result.success(Unit)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to delete property $propertyId from Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override fun observeRemoteProperties(): Flow<List<PropertyEntity>> = callbackFlow {
    val listenerRegistration = firestore.collection(COLLECTION_PROPERTIES)
      .addSnapshotListener { snapshot, error ->
        if (error != null) {
          Log.w(TAG, "Firestore observeRemoteProperties error: ${error.message}")
          return@addSnapshotListener
        }
        if (snapshot != null) {
          val properties = snapshot.documents.mapNotNull { doc ->
            doc.data?.let { data ->
              PropertyEntityMappers.fromFirestoreMap(doc.id, data)
            }
          }
          trySend(properties)
        }
      }
    awaitClose { listenerRegistration.remove() }
  }

  // --- Tenants ---

  override suspend fun pushTenantsToFirestore(): Result<Int> = withContext(Dispatchers.IO) {
    try {
      val tenants = dao.getAllTenantsList()
      var count = 0
      for (tenant in tenants) {
        val data = tenant.toFirestoreMap()
        firestore.collection(COLLECTION_TENANTS)
          .document(tenant.id)
          .set(data, SetOptions.merge())
          .awaitTask()

        dao.updateTenant(tenant.copy(syncStatus = "SYNCED"))
        count++
      }
      Result.success(count)
    } catch (e: Exception) {
      Log.e(TAG, "Error pushing tenants to Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun pullTenantsFromFirestore(): Result<Int> = withContext(Dispatchers.IO) {
    try {
      val snapshot: QuerySnapshot = firestore.collection(COLLECTION_TENANTS)
        .get()
        .awaitTask()

      val remoteTenants = snapshot.documents.mapNotNull { doc ->
        doc.data?.let { data ->
          TenantEntityMappers.fromFirestoreMap(doc.id, data)
        }
      }

      if (remoteTenants.isNotEmpty()) {
        dao.insertTenants(remoteTenants)
      }
      Result.success(remoteTenants.size)
    } catch (e: Exception) {
      Log.e(TAG, "Error pulling tenants from Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun syncTenantToFirestore(tenant: TenantEntity): Result<Unit> = withContext(Dispatchers.IO) {
    try {
      val data = tenant.toFirestoreMap()
      firestore.collection(COLLECTION_TENANTS)
        .document(tenant.id)
        .set(data, SetOptions.merge())
        .awaitTask()

      dao.updateTenant(tenant.copy(syncStatus = "SYNCED"))
      Result.success(Unit)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to sync tenant ${tenant.id} to Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun deleteTenantFromFirestore(tenantId: String): Result<Unit> = withContext(Dispatchers.IO) {
    try {
      firestore.collection(COLLECTION_TENANTS)
        .document(tenantId)
        .delete()
        .awaitTask()
      Result.success(Unit)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to delete tenant $tenantId from Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override fun observeRemoteTenants(): Flow<List<TenantEntity>> = callbackFlow {
    val listenerRegistration = firestore.collection(COLLECTION_TENANTS)
      .addSnapshotListener { snapshot, error ->
        if (error != null) {
          Log.w(TAG, "Firestore observeRemoteTenants error: ${error.message}")
          return@addSnapshotListener
        }
        if (snapshot != null) {
          val tenants = snapshot.documents.mapNotNull { doc ->
            doc.data?.let { data ->
              TenantEntityMappers.fromFirestoreMap(doc.id, data)
            }
          }
          trySend(tenants)
        }
      }
    awaitClose { listenerRegistration.remove() }
  }

  // --- Payments (Ledger Inflow) ---

  override suspend fun pushPaymentsToFirestore(): Result<Int> = withContext(Dispatchers.IO) {
    try {
      val payments = dao.getAllPaymentsList()
      var count = 0
      for (payment in payments) {
        val data = payment.toFirestoreMap()
        firestore.collection(COLLECTION_PAYMENTS)
          .document(payment.id)
          .set(data, SetOptions.merge())
          .awaitTask()

        dao.updatePayment(payment.copy(syncStatus = "SYNCED"))
        count++
      }
      Result.success(count)
    } catch (e: Exception) {
      Log.e(TAG, "Error pushing payments to Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun pullPaymentsFromFirestore(): Result<Int> = withContext(Dispatchers.IO) {
    try {
      val snapshot: QuerySnapshot = firestore.collection(COLLECTION_PAYMENTS)
        .get()
        .awaitTask()

      val remotePayments = snapshot.documents.mapNotNull { doc ->
        doc.data?.let { data ->
          PaymentEntityMappers.fromFirestoreMap(doc.id, data)
        }
      }

      if (remotePayments.isNotEmpty()) {
        dao.insertPayments(remotePayments)
      }
      Result.success(remotePayments.size)
    } catch (e: Exception) {
      Log.e(TAG, "Error pulling payments from Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun syncPaymentToFirestore(payment: PaymentEntity): Result<Unit> = withContext(Dispatchers.IO) {
    try {
      val data = payment.toFirestoreMap()
      firestore.collection(COLLECTION_PAYMENTS)
        .document(payment.id)
        .set(data, SetOptions.merge())
        .awaitTask()

      dao.updatePayment(payment.copy(syncStatus = "SYNCED"))
      Result.success(Unit)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to sync payment ${payment.id} to Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun deletePaymentFromFirestore(paymentId: String): Result<Unit> = withContext(Dispatchers.IO) {
    try {
      firestore.collection(COLLECTION_PAYMENTS)
        .document(paymentId)
        .delete()
        .awaitTask()
      Result.success(Unit)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to delete payment $paymentId from Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override fun observeRemotePayments(): Flow<List<PaymentEntity>> = callbackFlow {
    val listenerRegistration = firestore.collection(COLLECTION_PAYMENTS)
      .addSnapshotListener { snapshot, error ->
        if (error != null) {
          Log.w(TAG, "Firestore observeRemotePayments error: ${error.message}")
          return@addSnapshotListener
        }
        if (snapshot != null) {
          val payments = snapshot.documents.mapNotNull { doc ->
            doc.data?.let { data ->
              PaymentEntityMappers.fromFirestoreMap(doc.id, data)
            }
          }
          trySend(payments)
        }
      }
    awaitClose { listenerRegistration.remove() }
  }

  // --- Expenses (Ledger Outflow) ---

  override suspend fun pushExpensesToFirestore(): Result<Int> = withContext(Dispatchers.IO) {
    try {
      val expenses = dao.getAllExpensesList()
      var count = 0
      for (expense in expenses) {
        val data = expense.toFirestoreMap()
        firestore.collection(COLLECTION_EXPENSES)
          .document(expense.id)
          .set(data, SetOptions.merge())
          .awaitTask()

        dao.updateExpense(expense.copy(syncStatus = "SYNCED"))
        count++
      }
      Result.success(count)
    } catch (e: Exception) {
      Log.e(TAG, "Error pushing expenses to Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun pullExpensesFromFirestore(): Result<Int> = withContext(Dispatchers.IO) {
    try {
      val snapshot: QuerySnapshot = firestore.collection(COLLECTION_EXPENSES)
        .get()
        .awaitTask()

      val remoteExpenses = snapshot.documents.mapNotNull { doc ->
        doc.data?.let { data ->
          ExpenseEntityMappers.fromFirestoreMap(doc.id, data)
        }
      }

      if (remoteExpenses.isNotEmpty()) {
        dao.insertExpenses(remoteExpenses)
      }
      Result.success(remoteExpenses.size)
    } catch (e: Exception) {
      Log.e(TAG, "Error pulling expenses from Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun syncExpenseToFirestore(expense: ExpenseEntity): Result<Unit> = withContext(Dispatchers.IO) {
    try {
      val data = expense.toFirestoreMap()
      firestore.collection(COLLECTION_EXPENSES)
        .document(expense.id)
        .set(data, SetOptions.merge())
        .awaitTask()

      dao.updateExpense(expense.copy(syncStatus = "SYNCED"))
      Result.success(Unit)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to sync expense ${expense.id} to Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun deleteExpenseFromFirestore(expenseId: String): Result<Unit> = withContext(Dispatchers.IO) {
    try {
      firestore.collection(COLLECTION_EXPENSES)
        .document(expenseId)
        .delete()
        .awaitTask()
      Result.success(Unit)
    } catch (e: Exception) {
      Log.e(TAG, "Failed to delete expense $expenseId from Firestore: ${e.message}", e)
      Result.failure(e)
    }
  }

  override fun observeRemoteExpenses(): Flow<List<ExpenseEntity>> = callbackFlow {
    val listenerRegistration = firestore.collection(COLLECTION_EXPENSES)
      .addSnapshotListener { snapshot, error ->
        if (error != null) {
          Log.w(TAG, "Firestore observeRemoteExpenses error: ${error.message}")
          return@addSnapshotListener
        }
        if (snapshot != null) {
          val expenses = snapshot.documents.mapNotNull { doc ->
            doc.data?.let { data ->
              ExpenseEntityMappers.fromFirestoreMap(doc.id, data)
            }
          }
          trySend(expenses)
        }
      }
    awaitClose { listenerRegistration.remove() }
  }

  // --- Full Two-Way Synchronization ---

  override suspend fun syncAll(
    actorUserId: String,
    actorName: String
  ): Result<FirestoreSyncSummary> = withContext(Dispatchers.IO) {
    try {
      // 1. Push local entities to cloud
      val pushedProps = pushPropertiesToFirestore().getOrDefault(0)
      val pushedTenants = pushTenantsToFirestore().getOrDefault(0)
      val pushedPayments = pushPaymentsToFirestore().getOrDefault(0)
      val pushedExpenses = pushExpensesToFirestore().getOrDefault(0)

      // 2. Pull remote entities from cloud
      val pulledProps = pullPropertiesFromFirestore().getOrDefault(0)
      val pulledTenants = pullTenantsFromFirestore().getOrDefault(0)
      val pulledPayments = pullPaymentsFromFirestore().getOrDefault(0)
      val pulledExpenses = pullExpensesFromFirestore().getOrDefault(0)

      val summary = FirestoreSyncSummary(
        pushedPropertiesCount = pushedProps,
        pulledPropertiesCount = pulledProps,
        pushedTenantsCount = pushedTenants,
        pulledTenantsCount = pulledTenants,
        pushedPaymentsCount = pushedPayments,
        pulledPaymentsCount = pulledPayments,
        pushedExpensesCount = pushedExpenses,
        pulledExpensesCount = pulledExpenses,
        isSuccessful = true,
        message = "Synchronized: $pushedProps props, $pushedTenants tenants, $pushedPayments payments, $pushedExpenses expenses."
      )

      dao.insertAuditEvent(
        AuditEventEntity(
          actorUserId = actorUserId,
          actorName = actorName,
          eventType = "FIRESTORE_SYNC_COMPLETED",
          resourceType = "CLOUD_DATABASE",
          resourceId = "FIRESTORE",
          details = "Synced with Firestore. Payments (pushed: $pushedPayments, pulled: $pulledPayments), Expenses (pushed: $pushedExpenses, pulled: $pulledExpenses)."
        )
      )

      Result.success(summary)
    } catch (e: Exception) {
      Log.e(TAG, "Full Firestore sync failed: ${e.message}", e)
      Result.failure(e)
    }
  }
}

// ==========================================================
// MAPPERS: Room Entities <-> Firestore Document Maps
// ==========================================================

fun PropertyEntity.toFirestoreMap(): Map<String, Any?> = mapOf(
  "id" to id,
  "ownerUserId" to ownerUserId,
  "name" to name,
  "location" to location,
  "totalUnits" to totalUnits,
  "currency" to currency,
  "createdAt" to createdAt,
  "updatedAt" to System.currentTimeMillis()
)

object PropertyEntityMappers {
  fun fromFirestoreMap(id: String, data: Map<String, Any?>): PropertyEntity {
    return PropertyEntity(
      id = id.ifBlank { (data["id"] as? String) ?: UUID.randomUUID().toString() },
      ownerUserId = (data["ownerUserId"] as? String) ?: "USER_LANDLORD_1",
      name = (data["name"] as? String) ?: "",
      location = (data["location"] as? String) ?: "",
      totalUnits = (data["totalUnits"] as? Number)?.toInt() ?: 0,
      currency = (data["currency"] as? String) ?: "UGX",
      syncStatus = "SYNCED",
      lastSyncedAt = System.currentTimeMillis(),
      createdAt = (data["createdAt"] as? Number)?.toLong() ?: System.currentTimeMillis()
    )
  }
}

fun TenantEntity.toFirestoreMap(): Map<String, Any?> = mapOf(
  "id" to id,
  "userId" to userId,
  "propertyId" to propertyId,
  "unitId" to unitId,
  "name" to name,
  "phone" to phone,
  "unitName" to unitName,
  "propertyName" to propertyName,
  "monthlyRent" to monthlyRent,
  "rentDue" to rentDue,
  "arrears" to arrears,
  "advanceCredit" to advanceCredit,
  "paymentStatus" to paymentStatus,
  "leaseStart" to leaseStart,
  "leaseEnd" to leaseEnd,
  "createdAt" to createdAt,
  "updatedAt" to System.currentTimeMillis()
)

object TenantEntityMappers {
  fun fromFirestoreMap(id: String, data: Map<String, Any?>): TenantEntity {
    return TenantEntity(
      id = id.ifBlank { (data["id"] as? String) ?: UUID.randomUUID().toString() },
      userId = (data["userId"] as? String) ?: "",
      propertyId = (data["propertyId"] as? String) ?: "",
      unitId = (data["unitId"] as? String) ?: "",
      name = (data["name"] as? String) ?: "",
      phone = (data["phone"] as? String) ?: "",
      unitName = (data["unitName"] as? String) ?: "",
      propertyName = (data["propertyName"] as? String) ?: "",
      monthlyRent = (data["monthlyRent"] as? Number)?.toLong() ?: 1200000L,
      rentDue = (data["rentDue"] as? Number)?.toLong() ?: 1200000L,
      arrears = (data["arrears"] as? Number)?.toLong() ?: 0L,
      advanceCredit = (data["advanceCredit"] as? Number)?.toLong() ?: 0L,
      paymentStatus = (data["paymentStatus"] as? String) ?: "Paid",
      leaseStart = (data["leaseStart"] as? Number)?.toLong() ?: System.currentTimeMillis(),
      leaseEnd = (data["leaseEnd"] as? Number)?.toLong() ?: (System.currentTimeMillis() + 31536000000L),
      syncStatus = "SYNCED",
      createdAt = (data["createdAt"] as? Number)?.toLong() ?: System.currentTimeMillis()
    )
  }
}

fun PaymentEntity.toFirestoreMap(): Map<String, Any?> = mapOf(
  "id" to id,
  "tenantId" to tenantId,
  "propertyId" to propertyId,
  "unitId" to unitId,
  "tenantName" to tenantName,
  "unitName" to unitName,
  "propertyName" to propertyName,
  "amount" to amount,
  "currency" to currency,
  "paymentMethod" to paymentMethod,
  "paymentStatus" to paymentStatus,
  "externalReference" to externalReference,
  "receiptNumber" to receiptNumber,
  "recordedByUserId" to recordedByUserId,
  "recordedBy" to recordedBy,
  "notes" to notes,
  "date" to date,
  "paymentTimestamp" to paymentTimestamp,
  "createdAt" to createdAt,
  "updatedAt" to System.currentTimeMillis()
)

object PaymentEntityMappers {
  fun fromFirestoreMap(id: String, data: Map<String, Any?>): PaymentEntity {
    return PaymentEntity(
      id = id.ifBlank { (data["id"] as? String) ?: UUID.randomUUID().toString() },
      tenantId = (data["tenantId"] as? String) ?: "",
      propertyId = (data["propertyId"] as? String) ?: "",
      unitId = (data["unitId"] as? String) ?: "",
      tenantName = (data["tenantName"] as? String) ?: "",
      unitName = (data["unitName"] as? String) ?: "",
      propertyName = (data["propertyName"] as? String) ?: "",
      amount = (data["amount"] as? Number)?.toLong() ?: 0L,
      currency = (data["currency"] as? String) ?: "UGX",
      paymentMethod = (data["paymentMethod"] as? String) ?: "MTN_MOMO",
      paymentStatus = (data["paymentStatus"] as? String) ?: "SUCCESSFUL",
      externalReference = (data["externalReference"] as? String) ?: "",
      receiptNumber = (data["receiptNumber"] as? String) ?: "RCP-${System.currentTimeMillis()}",
      recordedByUserId = (data["recordedByUserId"] as? String) ?: "",
      recordedBy = (data["recordedBy"] as? String) ?: "Caretaker",
      notes = (data["notes"] as? String) ?: "",
      date = (data["date"] as? String) ?: "",
      paymentTimestamp = (data["paymentTimestamp"] as? Number)?.toLong() ?: System.currentTimeMillis(),
      syncStatus = "SYNCED",
      createdAt = (data["createdAt"] as? Number)?.toLong() ?: System.currentTimeMillis()
    )
  }
}

fun ExpenseEntity.toFirestoreMap(): Map<String, Any?> = mapOf(
  "id" to id,
  "propertyId" to propertyId,
  "propertyName" to propertyName,
  "description" to description,
  "amount" to amount,
  "currency" to currency,
  "category" to category,
  "receiptPhotoUri" to receiptPhotoUri,
  "recordedBy" to recordedBy,
  "status" to status,
  "date" to date,
  "expenseTimestamp" to expenseTimestamp,
  "createdAt" to createdAt,
  "updatedAt" to System.currentTimeMillis()
)

object ExpenseEntityMappers {
  fun fromFirestoreMap(id: String, data: Map<String, Any?>): ExpenseEntity {
    return ExpenseEntity(
      id = id.ifBlank { (data["id"] as? String) ?: UUID.randomUUID().toString() },
      propertyId = (data["propertyId"] as? String) ?: "",
      propertyName = (data["propertyName"] as? String) ?: "",
      description = (data["description"] as? String) ?: "",
      amount = (data["amount"] as? Number)?.toLong() ?: 0L,
      currency = (data["currency"] as? String) ?: "UGX",
      category = (data["category"] as? String) ?: "Maintenance",
      receiptPhotoUri = data["receiptPhotoUri"] as? String,
      recordedBy = (data["recordedBy"] as? String) ?: "Manager",
      status = (data["status"] as? String) ?: "APPROVED",
      date = (data["date"] as? String) ?: "",
      expenseTimestamp = (data["expenseTimestamp"] as? Number)?.toLong() ?: System.currentTimeMillis(),
      syncStatus = "SYNCED",
      createdAt = (data["createdAt"] as? Number)?.toLong() ?: System.currentTimeMillis()
    )
  }
}

/**
 * Coroutine task await helper for Google Tasks / Firebase Tasks.
 */
private suspend fun <T> Task<T>.awaitTask(): T = suspendCancellableCoroutine { cont ->
  addOnCompleteListener { task ->
    if (task.isSuccessful) {
      val result = task.result
      if (result != null) {
        cont.resume(result)
      } else {
        @Suppress("UNCHECKED_CAST")
        cont.resume(null as T)
      }
    } else {
      cont.resumeWithException(task.exception ?: RuntimeException("Firebase Firestore task failed"))
    }
  }
}
