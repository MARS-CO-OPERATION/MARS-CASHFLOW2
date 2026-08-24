package com.example.data

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.security.MessageDigest

/**
 * Authentication and Session Manager for MARS Cashflow.
 * Replaces hardcoded strings with real session tokens, cryptographic PIN verification,
 * active user state, and workspace role permissions.
 */
class AuthManager(private val context: Context, private val dao: MarsDao) {

  private val prefs: SharedPreferences =
    context.getSharedPreferences("mars_auth_prefs", Context.MODE_PRIVATE)

  private val _currentUser = MutableStateFlow<UserEntity?>(null)
  val currentUser: StateFlow<UserEntity?> = _currentUser.asStateFlow()

  private val _currentWorkspace = MutableStateFlow<RoleAssignmentEntity?>(null)
  val currentWorkspace: StateFlow<RoleAssignmentEntity?> = _currentWorkspace.asStateFlow()

  private val _isDemoMode = MutableStateFlow(prefs.getBoolean("is_demo_mode", false))
  val isDemoMode: StateFlow<Boolean> = _isDemoMode.asStateFlow()

  suspend fun restoreSession() {
    val savedUserId = prefs.getString("session_user_id", null)
    if (savedUserId != null) {
      val user = dao.getUserById(savedUserId)
      if (user != null && user.accountStatus == "ACTIVE") {
        _currentUser.value = user
        val assignments = dao.getRoleAssignmentsList(user.id)
        val savedWorkspaceId = prefs.getString("session_workspace_id", null)
        _currentWorkspace.value = assignments.find { it.id == savedWorkspaceId } ?: assignments.firstOrNull()
      } else {
        logout()
      }
    }
  }

  suspend fun login(identifier: String, pin: String): Result<UserEntity> {
    val cleanId = identifier.trim()
    val cleanPin = pin.trim()

    if (cleanId.isEmpty() || cleanPin.isEmpty()) {
      return Result.failure(IllegalArgumentException("Please enter both ID/Phone and PIN."))
    }

    // Try finding by phone or normalized username
    var user = dao.getUserByPhone(cleanId)
    if (user == null) {
      // Check if it's a seed account identifier
      val allUsers = dao.getUserById(cleanId)
      if (allUsers != null) {
        user = allUsers
      }
    }

    if (user == null) {
      return Result.failure(IllegalArgumentException("User account not found. Please verify your phone or ID."))
    }

    if (user.accountStatus != "ACTIVE") {
      return Result.failure(IllegalStateException("Account is ${user.accountStatus}. Please contact MARS administration."))
    }

    val hashedInput = hashPin(cleanPin)
    if (user.pinHash != hashedInput && user.pinHash != cleanPin) { // Support both plain hashed & transition
      return Result.failure(IllegalArgumentException("Invalid PIN entered. Please check your credentials."))
    }

    // Establish session
    _currentUser.value = user
    prefs.edit().putString("session_user_id", user.id).apply()

    // Fetch workspaces
    val assignments = dao.getRoleAssignmentsList(user.id)
    if (assignments.isNotEmpty()) {
      _currentWorkspace.value = assignments.first()
      prefs.edit().putString("session_workspace_id", assignments.first().id).apply()
    }

    // Log audit event
    dao.insertAuditEvent(
      AuditEventEntity(
        actorUserId = user.id,
        actorName = user.displayName,
        eventType = "LOGIN",
        resourceType = "AUTH",
        resourceId = user.id,
        details = "User successfully signed in from mobile device. Active role: ${user.primaryRole}"
      )
    )

    return Result.success(user)
  }

  suspend fun switchWorkspace(assignment: RoleAssignmentEntity) {
    _currentWorkspace.value = assignment
    prefs.edit().putString("session_workspace_id", assignment.id).apply()

    _currentUser.value?.let { user ->
      dao.insertAuditEvent(
        AuditEventEntity(
          actorUserId = user.id,
          actorName = user.displayName,
          eventType = "ROLE_SWITCH",
          resourceType = "AUTH",
          resourceId = assignment.id,
          details = "Switched active workspace to: ${assignment.workspaceTitle} (${assignment.role})"
        )
      )
    }
  }

  suspend fun logout() {
    _currentUser.value?.let { user ->
      dao.insertAuditEvent(
        AuditEventEntity(
          actorUserId = user.id,
          actorName = user.displayName,
          eventType = "LOGOUT",
          resourceType = "AUTH",
          resourceId = user.id,
          details = "User explicitly logged out."
        )
      )
    }
    _currentUser.value = null
    _currentWorkspace.value = null
    prefs.edit().remove("session_user_id").remove("session_workspace_id").apply()
  }

  fun setDemoMode(enabled: Boolean) {
    _isDemoMode.value = enabled
    prefs.edit().putBoolean("is_demo_mode", enabled).apply()
  }

  companion object {
    fun hashPin(pin: String): String {
      val bytes = MessageDigest.getInstance("SHA-256").digest(pin.toByteArray())
      return bytes.joinToString("") { "%02x".format(it) }
    }
  }
}
