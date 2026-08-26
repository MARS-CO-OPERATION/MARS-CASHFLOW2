package com.example

import com.example.data.*
import org.junit.Assert.*
import org.junit.Test

class FirebaseAuthenticationRepositoryTest {

  @Test
  fun testPinHashingIsDeterministic() {
    val pin = "1234"
    val hash1 = FirebaseAuthenticationRepositoryImpl.hashPin(pin)
    val hash2 = FirebaseAuthenticationRepositoryImpl.hashPin(pin)
    assertEquals(hash1, hash2)
    assertNotEquals(pin, hash1)
    assertTrue(hash1.length >= 32)
  }

  @Test
  fun testUserRoleMappingFromKey() {
    assertEquals(UserRole.LANDLORD, UserRole.fromKey("LANDLORD"))
    assertEquals(UserRole.MANAGER, UserRole.fromKey("MANAGER"))
    assertEquals(UserRole.TENANT, UserRole.fromKey("TENANT"))
    assertEquals(UserRole.SERVICE_PROVIDER, UserRole.fromKey("SERVICE_PROVIDER"))
    assertEquals(UserRole.MULTIROLE, UserRole.fromKey("MULTIROLE"))
    assertEquals(UserRole.LANDLORD, UserRole.fromKey("UNKNOWN_ROLE"))
  }

  @Test
  fun testAuthSessionStateHierarchy() {
    val idleState: AuthSessionState = AuthSessionState.Idle
    val loadingState: AuthSessionState = AuthSessionState.Loading
    val unauthenticatedState: AuthSessionState = AuthSessionState.Unauthenticated
    val errorState: AuthSessionState = AuthSessionState.Error("Invalid credentials")

    val user = UserEntity(
      id = "TEST_USER_1",
      email = "test@mars.ug",
      phoneNumber = "0770000001",
      displayName = "Test Landlord",
      primaryRole = "LANDLORD"
    )
    val workspace = RoleAssignmentEntity(
      id = "WS_01",
      userId = user.id,
      role = "LANDLORD",
      workspaceTitle = "Prime Real Estate"
    )
    val authenticatedState: AuthSessionState = AuthSessionState.Authenticated(
      user = user,
      activeRole = UserRole.LANDLORD,
      workspace = workspace
    )

    assertTrue(idleState is AuthSessionState.Idle)
    assertTrue(loadingState is AuthSessionState.Loading)
    assertTrue(unauthenticatedState is AuthSessionState.Unauthenticated)
    assertTrue(errorState is AuthSessionState.Error)
    assertEquals("Invalid credentials", (errorState as AuthSessionState.Error).message)

    assertTrue(authenticatedState is AuthSessionState.Authenticated)
    val auth = authenticatedState as AuthSessionState.Authenticated
    assertEquals("TEST_USER_1", auth.user.id)
    assertEquals(UserRole.LANDLORD, auth.activeRole)
    assertEquals("Prime Real Estate", auth.workspace?.workspaceTitle)
  }
}
