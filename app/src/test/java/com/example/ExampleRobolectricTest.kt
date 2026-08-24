package com.example

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

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
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("MARS Cashflow", appName)
  }

  @Test
  fun `insert and retrieve property, tenant, and payment entities`() = runBlocking {
    // 1. Insert Property
    val propertyId = dao.insertProperty(
      PropertyEntity(
        name = "Victoria Heights",
        location = "Kololo, Kampala",
        totalUnits = 16
      )
    )
    val properties = dao.getAllProperties().first()
    assertEquals(1, properties.size)
    assertEquals("Victoria Heights", properties[0].name)

    // 2. Insert Tenant
    val tenantId = dao.insertTenant(
      TenantEntity(
        name = "Kato Joseph",
        phone = "+256 772 000111",
        unitName = "A-101",
        propertyName = "Victoria Heights",
        rentDue = 1500000L,
        arrears = 500000L,
        paymentStatus = "Pending"
      )
    )
    val tenants = dao.getAllTenants().first()
    assertEquals(1, tenants.size)
    assertEquals("Kato Joseph", tenants[0].name)

    // 3. Insert Payment
    val paymentId = dao.insertPayment(
      PaymentEntity(
        tenantName = "Kato Joseph",
        unitName = "A-101",
        propertyName = "Victoria Heights",
        amount = 500000L,
        date = "24 Aug 2026",
        paymentMethod = "Mobile Money (MTN)",
        receiptNumber = "MARS-RCT-1001",
        recordedBy = "Caretaker Sam"
      )
    )
    val payments = dao.getAllPayments().first()
    assertEquals(1, payments.size)
    assertEquals(500000L, payments[0].amount)

    // 4. Verify Total Collected Aggregation
    val totalCollected = dao.getTotalCollected().first()
    assertEquals(500000L, totalCollected)

    // 5. Update Tenant Arrears after payment
    dao.updateTenant(tenants[0].copy(arrears = 0L, paymentStatus = "Paid"))
    val updatedTenant = dao.getTenantById(tenants[0].id).first()
    assertNotNull(updatedTenant)
    assertEquals(0L, updatedTenant?.arrears)
    assertEquals("Paid", updatedTenant?.paymentStatus)
  }
}

