package com.example

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class MainDashboardTest {

  private lateinit var db: MarsDatabase
  private lateinit var dao: MarsDao

  @Before
  fun setup() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    db = Room.inMemoryDatabaseBuilder(context, MarsDatabase::class.java)
      .allowMainThreadQueries()
      .build()
    dao = db.marsDao()
  }

  @After
  fun tearDown() {
    db.close()
  }

  @Test
  fun testDashboardRentCollectionAndArrearsSummary() = runBlocking {
    // 1. Seed properties
    val propId = dao.insertProperty(
      PropertyEntity(
        id = "PROP_1",
        name = "Sunset Apartments",
        location = "Kololo, Kampala",
        totalUnits = 10
      )
    )

    // 2. Seed tenants (1 paid, 2 with pending arrears)
    dao.insertTenant(
      TenantEntity(
        id = "T1",
        propertyId = "PROP_1",
        name = "Aisha Namaganda",
        phone = "0771234567",
        unitName = "Unit 101",
        propertyName = "Sunset Apartments",
        monthlyRent = 1200000L,
        rentDue = 1200000L,
        arrears = 0L,
        paymentStatus = "Paid"
      )
    )
    dao.insertTenant(
      TenantEntity(
        id = "T2",
        propertyId = "PROP_1",
        name = "Brian Mukasa",
        phone = "0782345678",
        unitName = "Unit 102",
        propertyName = "Sunset Apartments",
        monthlyRent = 1500000L,
        rentDue = 1500000L,
        arrears = 1500000L,
        paymentStatus = "Pending"
      )
    )
    dao.insertTenant(
      TenantEntity(
        id = "T3",
        propertyId = "PROP_1",
        name = "Grace Akello",
        phone = "0703456789",
        unitName = "Unit 103",
        propertyName = "Sunset Apartments",
        monthlyRent = 900000L,
        rentDue = 900000L,
        arrears = 900000L,
        paymentStatus = "Pending"
      )
    )

    // 3. Seed payments
    dao.insertPayment(
      PaymentEntity(
        id = "PAY_1",
        receiptNumber = "RCP-2026-001",
        tenantId = "T1",
        tenantName = "Aisha Namaganda",
        propertyName = "Sunset Apartments",
        unitName = "Unit 101",
        amount = 1200000L,
        paymentMethod = "MTN Mobile Money",
        paymentStatus = "SUCCESSFUL",
        date = "2026-08-24"
      )
    )

    // 4. Seed operating expense
    dao.insertExpense(
      ExpenseEntity(
        id = "EXP_1",
        propertyId = "PROP_1",
        propertyName = "Sunset Apartments",
        description = "Water pump service",
        amount = 250000L,
        category = "Plumbing",
        status = "APPROVED",
        date = "2026-08-24"
      )
    )

    // Query back and test summary computations
    val allTenants = dao.getAllTenants().first()
    val allPayments = dao.getAllPayments().first()
    val allExpenses = dao.getAllExpenses().first()

    val totalCollected = allPayments.filter { it.paymentStatus == "SUCCESSFUL" }.sumOf { it.amount }
    val totalPendingArrears = allTenants.sumOf { it.arrears }
    val totalOperatingExpenses = allExpenses.sumOf { it.amount }
    val netCashflow = totalCollected - totalOperatingExpenses

    assertEquals(1200000L, totalCollected)
    assertEquals(2400000L, totalPendingArrears)
    assertEquals(250000L, totalOperatingExpenses)
    assertEquals(950000L, netCashflow)

    val overdueTenants = allTenants.filter { it.arrears > 0L }
    assertEquals(2, overdueTenants.size)
    assertTrue(overdueTenants.any { it.name == "Brian Mukasa" })
    assertTrue(overdueTenants.any { it.name == "Grace Akello" })
  }
}
