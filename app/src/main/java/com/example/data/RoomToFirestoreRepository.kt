package com.example.data

import android.util.Log
import com.google.android.gms.tasks.Task
import com.google.firebase.firestore.DocumentSnapshot
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
  val isSuccessful: Boolean = true,
  val timestamp: Long = System.currentTimeMillis(),
  val message: String = ""
)

/**
 * Repository interface for synchronizing Room local database entities
 * (PropertyEntity, TenantEntity) with cloud Firebase Firestore collections.
 */
interface RoomToFirestoreRepository {

  /**
   * Pushes all local properties (or pending sync properties) from Room to Firestore.
   */
  suspend fun pushPropertiesToFirestore(): Result<Int>

  /**
   * Pulls all property documents from Firestore collection "properties" and upserts to Room.
   */
  suspend fun pullPropertiesFromFirestore(): Result<Int>

  /**
   * Pushes all local tenants (or pending sync tenants) from Room to Firestore.
   */
  suspend fun pushTenantsToFirestore(): Result<Int>

  /**
   * Pulls all tenant documents from Firestore collection "tenants" and upserts to Room.
   */
  suspend fun pullTenantsFromFirestore(): Result<Int>

  /**
   * Pushes a specific PropertyEntity directly to Firestore.
   */
  suspend fun syncPropertyToFirestore(property: PropertyEntity): Result<Unit>

  /**
   * Pushes a specific TenantEntity directly to Firestore.
   */
  suspend fun syncTenantToFirestore(tenant: TenantEntity): Result<Unit>

  /**
   * Deletes a property document from Firestore.
   */
  suspend fun deletePropertyFromFirestore(propertyId: String): Result<Unit>

  /**
   * Deletes a tenant document from Firestore.
   */
  suspend fun deleteTenantFromFirestore(tenantId: String): Result<Unit>

  /**
   * Executes a two-way synchronization between Room and Firestore for both properties and tenants.
   */
  suspend fun syncAll(actorUserId: String = "SYSTEM", actorName: String = "SyncEngine"): Result<FirestoreSyncSummary>

  /**
   * Real-time stream of PropertyEntity records from Firestore.
   */
  fun observeRemoteProperties(): Flow<List<PropertyEntity>>

  /**
   * Real-time stream of TenantEntity records from Firestore.
   */
  fun observeRemoteTenants(): Flow<List<TenantEntity>>
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
  }

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

  override suspend fun syncAll(
    actorUserId: String,
    actorName: String
  ): Result<FirestoreSyncSummary> = withContext(Dispatchers.IO) {
    try {
      // 1. Push local changes to cloud
      val pushedPropRes = pushPropertiesToFirestore()
      val pushedTenantRes = pushTenantsToFirestore()

      val pushedProps = pushedPropRes.getOrDefault(0)
      val pushedTenants = pushedTenantRes.getOrDefault(0)

      // 2. Pull remote changes from cloud
      val pulledPropRes = pullPropertiesFromFirestore()
      val pulledTenantRes = pullTenantsFromFirestore()

      val pulledProps = pulledPropRes.getOrDefault(0)
      val pulledTenants = pulledTenantRes.getOrDefault(0)

      val summary = FirestoreSyncSummary(
        pushedPropertiesCount = pushedProps,
        pulledPropertiesCount = pulledProps,
        pushedTenantsCount = pushedTenants,
        pulledTenantsCount = pulledTenants,
        isSuccessful = true,
        message = "Successfully synchronized $pushedProps properties and $pushedTenants tenants with Firestore."
      )

      dao.insertAuditEvent(
        AuditEventEntity(
          actorUserId = actorUserId,
          actorName = actorName,
          eventType = "FIRESTORE_SYNC_COMPLETED",
          resourceType = "CLOUD_DATABASE",
          resourceId = "FIRESTORE",
          details = "Synced properties (pushed: $pushedProps, pulled: $pulledProps) and tenants (pushed: $pushedTenants, pulled: $pulledTenants)."
        )
      )

      Result.success(summary)
    } catch (e: Exception) {
      Log.e(TAG, "Full Firestore sync failed: ${e.message}", e)
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
}

/**
 * Extension functions for mapping between Room entities and Firestore document maps.
 */
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
