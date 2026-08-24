package com.example

import com.example.data.PropertyEntity
import com.example.data.PropertyEntityMappers
import com.example.data.TenantEntity
import com.example.data.TenantEntityMappers
import com.example.data.toFirestoreMap
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class FirestoreSyncTest {

  @Test
  fun testPropertyEntityToFirestoreMapAndBack() {
    val property = PropertyEntity(
      id = "PROP_TEST_01",
      ownerUserId = "USER_LANDLORD_1",
      name = "Sunset Apartments Kololo",
      location = "Kololo, Kampala",
      totalUnits = 12,
      currency = "UGX",
      syncStatus = "SYNCED",
      lastSyncedAt = 1700000000000L,
      createdAt = 1690000000000L
    )

    val map = property.toFirestoreMap()
    assertEquals("PROP_TEST_01", map["id"])
    assertEquals("Sunset Apartments Kololo", map["name"])
    assertEquals("Kololo, Kampala", map["location"])
    assertEquals(12, map["totalUnits"])
    assertEquals("UGX", map["currency"])

    val restored = PropertyEntityMappers.fromFirestoreMap("PROP_TEST_01", map)
    assertEquals(property.id, restored.id)
    assertEquals(property.ownerUserId, restored.ownerUserId)
    assertEquals(property.name, restored.name)
    assertEquals(property.location, restored.location)
    assertEquals(property.totalUnits, restored.totalUnits)
    assertEquals(property.currency, restored.currency)
    assertEquals("SYNCED", restored.syncStatus)
  }

  @Test
  fun testTenantEntityToFirestoreMapAndBack() {
    val tenant = TenantEntity(
      id = "TENANT_TEST_01",
      userId = "USER_TENANT_1",
      propertyId = "PROP_TEST_01",
      unitId = "UNIT_101",
      name = "Aisha Namaganda",
      phone = "0771234567",
      unitName = "Unit 101",
      propertyName = "Sunset Apartments",
      monthlyRent = 1500000L,
      rentDue = 1500000L,
      arrears = 0L,
      advanceCredit = 300000L,
      paymentStatus = "Paid",
      leaseStart = 1700000000000L,
      leaseEnd = 1731536000000L,
      syncStatus = "SYNCED",
      createdAt = 1700000000000L
    )

    val map = tenant.toFirestoreMap()
    assertEquals("TENANT_TEST_01", map["id"])
    assertEquals("Aisha Namaganda", map["name"])
    assertEquals("0771234567", map["phone"])
    assertEquals(1500000L, map["monthlyRent"])
    assertEquals(300000L, map["advanceCredit"])

    val restored = TenantEntityMappers.fromFirestoreMap("TENANT_TEST_01", map)
    assertEquals(tenant.id, restored.id)
    assertEquals(tenant.name, restored.name)
    assertEquals(tenant.phone, restored.phone)
    assertEquals(tenant.unitName, restored.unitName)
    assertEquals(tenant.propertyName, restored.propertyName)
    assertEquals(tenant.monthlyRent, restored.monthlyRent)
    assertEquals(tenant.arrears, restored.arrears)
    assertEquals(tenant.advanceCredit, restored.advanceCredit)
    assertEquals(tenant.paymentStatus, restored.paymentStatus)
    assertEquals("SYNCED", restored.syncStatus)
  }
}
