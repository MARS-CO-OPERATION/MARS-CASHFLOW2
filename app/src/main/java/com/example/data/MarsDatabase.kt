package com.example.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
  entities = [
    UserEntity::class,
    RoleAssignmentEntity::class,
    PropertyEntity::class,
    UnitEntity::class,
    TenantEntity::class,
    PaymentEntity::class,
    ExpenseEntity::class,
    MaintenanceEntity::class,
    ServiceProviderEntity::class,
    MonthlyPaymentStatusEntity::class,
    AuditEventEntity::class,
    NotificationEntity::class
  ],
  version = 3,
  exportSchema = false
)
abstract class MarsDatabase : RoomDatabase() {
  abstract fun marsDao(): MarsDao

  companion object {
    @Volatile private var INSTANCE: MarsDatabase? = null

    fun getDatabase(context: Context): MarsDatabase {
      return INSTANCE
        ?: synchronized(this) {
          val instance =
            Room.databaseBuilder(
                context.applicationContext,
                MarsDatabase::class.java,
                "mars_cashflow_database"
              )
              .fallbackToDestructiveMigration()
              .build()
          INSTANCE = instance
          instance
        }
    }
  }
}
