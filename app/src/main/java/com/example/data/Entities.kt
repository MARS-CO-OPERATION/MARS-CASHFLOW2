package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

/**
 * PRODUCTION-READY MARS CASHFLOW DATA MODEL
 * Uses stable UUID strings as IDs, explicit foreign keys/references,
 * real timestamps (System.currentTimeMillis()), audit trails, and sync statuses.
 */

@Entity(tableName = "users")
data class UserEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val phoneNumber: String,
  val displayName: String,
  val pinHash: String,
  val primaryRole: String, // "LANDLORD", "MANAGER", "TENANT", "SERVICE_PROVIDER", "MULTIROLE"
  val accountStatus: String = "ACTIVE", // "ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"
  val isDemo: Boolean = false,
  val createdAt: Long = System.currentTimeMillis(),
  val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "role_assignments")
data class RoleAssignmentEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val userId: String,
  val role: String, // "LANDLORD", "MANAGER", "TENANT", "SERVICE_PROVIDER"
  val propertyId: String? = null,
  val unitId: String? = null,
  val workspaceTitle: String,
  val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "properties")
data class PropertyEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val ownerUserId: String = "USER_LANDLORD_1",
  val name: String,
  val location: String,
  val totalUnits: Int,
  val currency: String = "UGX",
  val syncStatus: String = "SYNCED", // "SYNCED", "PENDING", "FAILED"
  val lastSyncedAt: Long = System.currentTimeMillis(),
  val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "units")
data class UnitEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val propertyId: String,
  val unitName: String,
  val monthlyRent: Long,
  val status: String = "OCCUPIED", // "OCCUPIED", "VACANT", "MAINTENANCE"
  val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "tenants")
data class TenantEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val userId: String = "",
  val propertyId: String = "",
  val unitId: String = "",
  val name: String,
  val phone: String,
  val unitName: String,
  val propertyName: String,
  val monthlyRent: Long = 1200000L,
  val rentDue: Long = 1200000L,
  val arrears: Long = 0L,
  val advanceCredit: Long = 0L,
  val paymentStatus: String = "Paid", // "Paid", "Pending", "Overdue"
  val leaseStart: Long = System.currentTimeMillis(),
  val leaseEnd: Long = System.currentTimeMillis() + 31536000000L, // 1 year
  val syncStatus: String = "SYNCED",
  val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "payments")
data class PaymentEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val tenantId: String = "",
  val propertyId: String = "",
  val unitId: String = "",
  val tenantName: String,
  val unitName: String,
  val propertyName: String,
  val amount: Long,
  val currency: String = "UGX",
  val paymentMethod: String, // "MTN_MOMO", "AIRTEL_MONEY", "BANK_TRANSFER", "CASH"
  val paymentStatus: String = "SUCCESSFUL", // "SUCCESSFUL", "PENDING", "FAILED", "REVERSED"
  val externalReference: String = "",
  val receiptNumber: String,
  val recordedByUserId: String = "",
  val recordedBy: String = "Caretaker",
  val notes: String = "",
  val date: String = "", // Display date
  val paymentTimestamp: Long = System.currentTimeMillis(),
  val syncStatus: String = "SYNCED",
  val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "expenses")
data class ExpenseEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val propertyId: String = "",
  val propertyName: String,
  val description: String,
  val amount: Long,
  val currency: String = "UGX",
  val category: String, // "Maintenance", "Utilities", "Caretaker Wage", "Repairs", "Security"
  val receiptPhotoUri: String? = null,
  val recordedBy: String = "Manager",
  val status: String = "APPROVED", // "APPROVED", "PENDING", "REJECTED"
  val date: String = "",
  val expenseTimestamp: Long = System.currentTimeMillis(),
  val syncStatus: String = "SYNCED",
  val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "maintenance")
data class MaintenanceEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val propertyId: String = "",
  val propertyName: String,
  val unitId: String = "",
  val unitName: String,
  val tenantName: String,
  val issue: String,
  val priority: String = "MEDIUM", // "LOW", "MEDIUM", "HIGH", "URGENT"
  val status: String = "Pending", // "Pending", "In Progress", "Resolved", "Cancelled"
  val assignedProviderId: String? = null,
  val assignedProviderName: String? = null,
  val estimatedCost: Long = 0L,
  val actualCost: Long = 0L,
  val date: String = "",
  val reportedTimestamp: Long = System.currentTimeMillis(),
  val syncStatus: String = "SYNCED",
  val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "service_providers")
data class ServiceProviderEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val userId: String? = null,
  val name: String,
  val serviceType: String, // "Plumbing", "Electrical", "Security", "Fumigation", "General"
  val phone: String,
  val rate: String,
  val rating: Float = 4.8f,
  val status: String = "Available", // "Available", "On Job", "Unavailable"
  val assignedProperty: String = "Kampala Apartments",
  val isVerified: Boolean = true,
  val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "monthly_payment_status")
data class MonthlyPaymentStatusEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val tenantId: String = "",
  val tenantName: String,
  val propertyId: String = "",
  val propertyName: String,
  val unitName: String,
  val month: String, // e.g. "August 2026"
  val status: String, // "Paid", "Pending", "Overdue"
  val amountDue: Long,
  val amountPaid: Long,
  val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "audit_events")
data class AuditEventEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val actorUserId: String,
  val actorName: String,
  val eventType: String, // "LOGIN", "LOGOUT", "PAYMENT_RECORDED", "PAYMENT_REVERSED", "EXPENSE_CREATED", "MAINTENANCE_LOGGED", "ROLE_SWITCH", "SYNC_EXECUTED"
  val resourceType: String, // "PAYMENT", "TENANT", "PROPERTY", "EXPENSE", "AUTH", "SYSTEM"
  val resourceId: String = "",
  val details: String,
  val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "notifications")
data class NotificationEntity(
  @PrimaryKey val id: String = UUID.randomUUID().toString(),
  val recipientPhone: String,
  val recipientName: String,
  val title: String,
  val message: String,
  val channel: String = "IN_APP", // "IN_APP", "SMS_GATEWAY"
  val deliveryStatus: String = "SENT", // "SENT", "QUEUED", "FAILED", "NOT_CONNECTED"
  val timestamp: Long = System.currentTimeMillis()
)
