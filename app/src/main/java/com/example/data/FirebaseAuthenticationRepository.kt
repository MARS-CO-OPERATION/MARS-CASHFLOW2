package com.example.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.google.android.gms.tasks.Task
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.security.MessageDigest
import java.util.UUID
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * Represents the current authentication and session status of the application.
 */
sealed interface AuthSessionState {
  data object Idle : AuthSessionState
  data object Loading : AuthSessionState
  data class Authenticated(
    val user: UserEntity,
    val activeRole: UserRole,
    val workspace: RoleAssignmentEntity?
  ) : AuthSessionState
  data object Unauthenticated : AuthSessionState
  data class Error(val message: String) : AuthSessionState
}

private suspend fun <T> Task<T>.awaitTaskResult(): T = suspendCancellableCoroutine { cont ->
  addOnCompleteListener { task ->
    if (task.isSuccessful) {
      val result = task.result
      if (result != null) {
        cont.resume(result)
      } else {
        cont.resumeWithException(IllegalStateException("Task returned null result"))
      }
    } else {
      cont.resumeWithException(task.exception ?: RuntimeException("Firebase task failed"))
    }
  }
}

/**
 * Interface defining user authentication, registration, session persistence,
 * and workspace role management backed by Firebase Auth and Firestore.
 */
interface FirebaseAuthenticationRepository {
  val sessionState: StateFlow<AuthSessionState>
  val currentUser: StateFlow<UserEntity?>
  val currentWorkspace: StateFlow<RoleAssignmentEntity?>
  val userWorkspaces: StateFlow<List<RoleAssignmentEntity>>
  val isDemoMode: StateFlow<Boolean>
  val activeRole: UserRole
  val firebaseUser: FirebaseUser?

  suspend fun restoreSession(): Result<UserEntity?>

  suspend fun signUpWithEmailPassword(
    email: String,
    password: String,
    displayName: String,
    phoneNumber: String,
    role: UserRole,
    organizationName: String? = null
  ): Result<UserEntity>

  suspend fun signInWithEmailPassword(
    email: String,
    password: String
  ): Result<UserEntity>

  suspend fun signInWithGoogle(
    idToken: String,
    firebaseUser: FirebaseUser? = null,
    defaultRole: UserRole = UserRole.LANDLORD,
    defaultName: String = "MARS User"
  ): Result<UserEntity>

  suspend fun signInWithPhonePin(
    identifier: String,
    pin: String
  ): Result<UserEntity>

  suspend fun signInDemo(role: UserRole): Result<UserEntity>

  suspend fun sendPasswordResetEmail(email: String): Result<Unit>

  suspend fun updateUserProfile(
    displayName: String,
    phoneNumber: String
  ): Result<UserEntity>

  suspend fun switchWorkspace(assignment: RoleAssignmentEntity): Result<RoleAssignmentEntity>

  fun setDemoMode(enabled: Boolean)

  suspend fun signOut(): Result<Unit>
}

/**
 * Production implementation of [FirebaseAuthenticationRepository] combining Firebase Auth,
 * Firestore user profiles, local Room caching for offline resilience, and session preferences.
 */
class FirebaseAuthenticationRepositoryImpl(
  private val context: Context,
  private val dao: MarsDao,
  private val firebaseAuth: FirebaseAuth? = runCatching {
    if (FirebaseApp.getApps(context).isEmpty()) {
      FirebaseApp.initializeApp(context)
    }
    FirebaseAuth.getInstance()
  }.getOrNull(),
  private val firestore: FirebaseFirestore? = runCatching {
    if (FirebaseApp.getApps(context).isEmpty()) {
      FirebaseApp.initializeApp(context)
    }
    FirebaseFirestore.getInstance()
  }.getOrNull()
) : FirebaseAuthenticationRepository {

  companion object {
    private const val PREFS_NAME = "mars_auth_prefs"
    private const val KEY_SESSION_USER_ID = "session_user_id"
    private const val KEY_ACTIVE_WORKSPACE_ID = "active_workspace_id"
    private const val KEY_IS_DEMO_MODE = "is_demo_mode"

    fun hashPin(pin: String): String {
      return try {
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(pin.toByteArray(Charsets.UTF_8))
        hashBytes.joinToString("") { "%02x".format(it) }
      } catch (e: Exception) {
        pin
      }
    }
  }

  private val prefs: SharedPreferences =
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  private val repositoryScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

  private val _sessionState = MutableStateFlow<AuthSessionState>(AuthSessionState.Idle)
  override val sessionState: StateFlow<AuthSessionState> = _sessionState.asStateFlow()

  private val _currentUser = MutableStateFlow<UserEntity?>(null)
  override val currentUser: StateFlow<UserEntity?> = _currentUser.asStateFlow()

  private val _currentWorkspace = MutableStateFlow<RoleAssignmentEntity?>(null)
  override val currentWorkspace: StateFlow<RoleAssignmentEntity?> = _currentWorkspace.asStateFlow()

  private val _userWorkspaces = MutableStateFlow<List<RoleAssignmentEntity>>(emptyList())
  override val userWorkspaces: StateFlow<List<RoleAssignmentEntity>> = _userWorkspaces.asStateFlow()

  private val _isDemoMode = MutableStateFlow(prefs.getBoolean(KEY_IS_DEMO_MODE, false))
  override val isDemoMode: StateFlow<Boolean> = _isDemoMode.asStateFlow()

  override val firebaseUser: FirebaseUser?
    get() = firebaseAuth?.currentUser

  override val activeRole: UserRole
    get() {
      val wsRole = _currentWorkspace.value?.role
      if (!wsRole.isNullOrBlank()) {
        return UserRole.fromKey(wsRole)
      }
      return UserRole.fromKey(_currentUser.value?.primaryRole)
    }

  init {
    // Attach Firebase Auth state listener to observe token changes and automatic renewals
    firebaseAuth?.addAuthStateListener { auth ->
      val fbUser = auth.currentUser
      if (fbUser == null && _currentUser.value != null && !_isDemoMode.value) {
        // If logged out from Firebase externally and not in demo mode
        repositoryScope.launch {
          val savedUserId = prefs.getString(KEY_SESSION_USER_ID, null)
          if (savedUserId == null) {
            _currentUser.value = null
            _currentWorkspace.value = null
            _userWorkspaces.value = emptyList()
            _sessionState.value = AuthSessionState.Unauthenticated
          }
        }
      }
    }
  }

  override suspend fun restoreSession(): Result<UserEntity?> = withContext(Dispatchers.IO) {
    try {
      _sessionState.value = AuthSessionState.Loading
      val savedUserId = prefs.getString(KEY_SESSION_USER_ID, null)
      if (savedUserId != null) {
        var user = dao.getUserById(savedUserId) ?: dao.getUserByIdentifier(savedUserId)

        // Try syncing with Firestore if available
        if (user == null && firestore != null) {
          try {
            val doc = firestore.collection("users").document(savedUserId).get().awaitTaskResult()
            if (doc.exists()) {
              val data = doc.data
              if (data != null) {
                user = UserEntity(
                  id = savedUserId,
                  email = data["email"] as? String ?: "",
                  phoneNumber = data["phoneNumber"] as? String ?: "",
                  displayName = data["displayName"] as? String ?: "MARS User",
                  primaryRole = data["primaryRole"] as? String ?: "LANDLORD",
                  accountStatus = data["accountStatus"] as? String ?: "ACTIVE",
                  organizationId = data["organizationId"] as? String ?: "ORG_MARS",
                  isDemo = data["isDemo"] as? Boolean ?: false,
                  createdAt = (data["createdAt"] as? Long) ?: System.currentTimeMillis(),
                  updatedAt = (data["updatedAt"] as? Long) ?: System.currentTimeMillis()
                )
                dao.insertUser(user)
              }
            }
          } catch (e: Exception) {
            Log.w("AuthRepo", "Could not fetch user from Firestore: ${e.message}")
          }
        }

        if (user != null) {
          _currentUser.value = user
          loadWorkspacesForUser(user.id)
          _sessionState.value = AuthSessionState.Authenticated(user, activeRole, _currentWorkspace.value)
          return@withContext Result.success(user)
        }
      }

      // Check current Firebase Auth user
      val fbUser = firebaseAuth?.currentUser
      if (fbUser != null) {
        val user = syncFirebaseUserToLocal(fbUser, UserRole.LANDLORD, fbUser.displayName ?: "MARS User")
        _currentUser.value = user
        loadWorkspacesForUser(user.id)
        _sessionState.value = AuthSessionState.Authenticated(user, activeRole, _currentWorkspace.value)
        return@withContext Result.success(user)
      }

      _sessionState.value = AuthSessionState.Unauthenticated
      Result.success(null)
    } catch (e: Exception) {
      Log.e("AuthRepo", "Session restore failed: ${e.message}", e)
      _sessionState.value = AuthSessionState.Unauthenticated
      Result.failure(e)
    }
  }

  override suspend fun signUpWithEmailPassword(
    email: String,
    password: String,
    displayName: String,
    phoneNumber: String,
    role: UserRole,
    organizationName: String?
  ): Result<UserEntity> = withContext(Dispatchers.IO) {
    try {
      _sessionState.value = AuthSessionState.Loading
      val cleanEmail = email.trim()
      val cleanName = displayName.trim()
      val cleanPhone = phoneNumber.trim()

      if (cleanEmail.isEmpty() || !cleanEmail.contains("@")) {
        val error = IllegalArgumentException("Please enter a valid email address.")
        _sessionState.value = AuthSessionState.Error(error.message ?: "Invalid email")
        return@withContext Result.failure(error)
      }
      if (password.length < 6) {
        val error = IllegalArgumentException("Password must be at least 6 characters.")
        _sessionState.value = AuthSessionState.Error(error.message ?: "Weak password")
        return@withContext Result.failure(error)
      }
      if (cleanName.isEmpty()) {
        val error = IllegalArgumentException("Full Name is required.")
        _sessionState.value = AuthSessionState.Error(error.message ?: "Name required")
        return@withContext Result.failure(error)
      }

      var uid = UUID.randomUUID().toString()
      if (firebaseAuth != null) {
        try {
          val authResult = firebaseAuth.createUserWithEmailAndPassword(cleanEmail, password).awaitTaskResult()
          val fbUser = authResult.user
          if (fbUser != null) {
            uid = fbUser.uid
            val profileUpdates = UserProfileChangeRequest.Builder()
              .setDisplayName(cleanName)
              .build()
            fbUser.updateProfile(profileUpdates).awaitTaskResult()
          }
        } catch (authEx: Exception) {
          Log.w("AuthRepo", "Firebase Auth registration step handled/fallback: ${authEx.message}")
        }
      }

      val orgId = organizationName?.trim()?.ifEmpty { "MARS Workspace" } ?: "MARS Workspace"

      val user = UserEntity(
        id = uid,
        email = cleanEmail,
        phoneNumber = cleanPhone,
        displayName = cleanName,
        pinHash = hashPin(password.take(4)),
        primaryRole = role.key,
        accountStatus = "ACTIVE",
        organizationId = orgId,
        isDemo = false,
        createdAt = System.currentTimeMillis(),
        updatedAt = System.currentTimeMillis()
      )

      dao.insertUser(user)

      val assignment = RoleAssignmentEntity(
        id = UUID.randomUUID().toString(),
        userId = user.id,
        role = role.key,
        propertyId = null,
        unitId = null,
        workspaceTitle = orgId,
        createdAt = System.currentTimeMillis()
      )
      dao.insertRoleAssignment(assignment)

      // Sync user doc to Firestore
      if (firestore != null) {
        try {
          val firestoreUserMap = hashMapOf(
            "id" to user.id,
            "email" to user.email,
            "phoneNumber" to user.phoneNumber,
            "displayName" to user.displayName,
            "primaryRole" to user.primaryRole,
            "accountStatus" to user.accountStatus,
            "organizationId" to user.organizationId,
            "isDemo" to user.isDemo,
            "createdAt" to user.createdAt,
            "updatedAt" to user.updatedAt
          )
          firestore.collection("users").document(user.id).set(firestoreUserMap, SetOptions.merge()).awaitTaskResult()

          val firestoreRoleMap = hashMapOf(
            "id" to assignment.id,
            "userId" to assignment.userId,
            "role" to assignment.role,
            "workspaceTitle" to assignment.workspaceTitle,
            "createdAt" to assignment.createdAt
          )
          firestore.collection("role_assignments").document(assignment.id).set(firestoreRoleMap, SetOptions.merge()).awaitTaskResult()
        } catch (cloudEx: Exception) {
          Log.w("AuthRepo", "Firestore cloud user sync postponed (offline): ${cloudEx.message}")
        }
      }

      prefs.edit()
        .putString(KEY_SESSION_USER_ID, user.id)
        .putString(KEY_ACTIVE_WORKSPACE_ID, assignment.id)
        .putBoolean(KEY_IS_DEMO_MODE, false)
        .apply()

      _currentUser.value = user
      _currentWorkspace.value = assignment
      _userWorkspaces.value = listOf(assignment)
      _isDemoMode.value = false
      _sessionState.value = AuthSessionState.Authenticated(user, role, assignment)

      Result.success(user)
    } catch (e: Exception) {
      Log.e("AuthRepo", "Registration failed: ${e.message}", e)
      _sessionState.value = AuthSessionState.Error(e.message ?: "Sign up failed")
      Result.failure(e)
    }
  }

  override suspend fun signInWithEmailPassword(
    email: String,
    password: String
  ): Result<UserEntity> = withContext(Dispatchers.IO) {
    try {
      _sessionState.value = AuthSessionState.Loading
      val cleanEmail = email.trim()
      if (cleanEmail.isEmpty() || password.isEmpty()) {
        val error = IllegalArgumentException("Email and password cannot be empty.")
        _sessionState.value = AuthSessionState.Error(error.message ?: "Empty credentials")
        return@withContext Result.failure(error)
      }

      var user: UserEntity? = null

      // 1. Try Firebase Auth
      if (firebaseAuth != null) {
        try {
          val authResult = firebaseAuth.signInWithEmailAndPassword(cleanEmail, password).awaitTaskResult()
          val fbUser = authResult.user
          if (fbUser != null && firestore != null) {
            val doc = firestore.collection("users").document(fbUser.uid).get().awaitTaskResult()
            if (doc.exists()) {
              val data = doc.data
              if (data != null) {
                user = UserEntity(
                  id = fbUser.uid,
                  email = data["email"] as? String ?: cleanEmail,
                  phoneNumber = data["phoneNumber"] as? String ?: "",
                  displayName = data["displayName"] as? String ?: (fbUser.displayName ?: "MARS User"),
                  primaryRole = data["primaryRole"] as? String ?: "LANDLORD",
                  accountStatus = data["accountStatus"] as? String ?: "ACTIVE",
                  organizationId = data["organizationId"] as? String ?: "ORG_MARS",
                  isDemo = data["isDemo"] as? Boolean ?: false,
                  createdAt = (data["createdAt"] as? Long) ?: System.currentTimeMillis(),
                  updatedAt = (data["updatedAt"] as? Long) ?: System.currentTimeMillis()
                )
                dao.insertUser(user)
              }
            }
          }
        } catch (fbEx: Exception) {
          Log.w("AuthRepo", "Firebase Auth sign-in failed, trying local fallback: ${fbEx.message}")
        }
      }

      // 2. Local Fallback via Room
      if (user == null) {
        user = dao.getUserByEmail(cleanEmail)
        if (user == null) {
          user = dao.getUserByIdentifier(cleanEmail)
        }
      }

      if (user == null) {
        val error = IllegalStateException("Account not found. Please check your credentials or create a new account.")
        _sessionState.value = AuthSessionState.Error(error.message ?: "Account not found")
        return@withContext Result.failure(error)
      }

      prefs.edit()
        .putString(KEY_SESSION_USER_ID, user.id)
        .putBoolean(KEY_IS_DEMO_MODE, false)
        .apply()

      _currentUser.value = user
      _isDemoMode.value = false
      loadWorkspacesForUser(user.id)
      val role = UserRole.fromKey(user.primaryRole)
      _sessionState.value = AuthSessionState.Authenticated(user, role, _currentWorkspace.value)

      Result.success(user)
    } catch (e: Exception) {
      Log.e("AuthRepo", "Sign in failed: ${e.message}", e)
      _sessionState.value = AuthSessionState.Error(e.message ?: "Sign in failed")
      Result.failure(e)
    }
  }

  override suspend fun signInWithGoogle(
    idToken: String,
    firebaseUser: FirebaseUser?,
    defaultRole: UserRole,
    defaultName: String
  ): Result<UserEntity> = withContext(Dispatchers.IO) {
    try {
      _sessionState.value = AuthSessionState.Loading
      var fbUser = firebaseUser
      if (fbUser == null && idToken.isNotBlank() && firebaseAuth != null) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        val authResult = firebaseAuth.signInWithCredential(credential).awaitTaskResult()
        fbUser = authResult.user
      }

      val uid = fbUser?.uid ?: UUID.randomUUID().toString()
      val email = fbUser?.email ?: "google.user@mars.ug"
      val displayName = fbUser?.displayName ?: defaultName

      val user = syncFirebaseUserToLocal(fbUser, defaultRole, displayName)

      prefs.edit()
        .putString(KEY_SESSION_USER_ID, uid)
        .putBoolean(KEY_IS_DEMO_MODE, false)
        .apply()

      _currentUser.value = user
      _isDemoMode.value = false
      loadWorkspacesForUser(user.id)
      val role = UserRole.fromKey(user.primaryRole)
      _sessionState.value = AuthSessionState.Authenticated(user, role, _currentWorkspace.value)

      Result.success(user)
    } catch (e: Exception) {
      Log.e("AuthRepo", "Google Sign-In failed: ${e.message}", e)
      _sessionState.value = AuthSessionState.Error(e.message ?: "Google Sign-In failed")
      Result.failure(e)
    }
  }

  override suspend fun signInWithPhonePin(
    identifier: String,
    pin: String
  ): Result<UserEntity> = withContext(Dispatchers.IO) {
    try {
      _sessionState.value = AuthSessionState.Loading
      val cleanIdentifier = identifier.trim()
      val cleanPin = pin.trim()

      if (cleanIdentifier.isEmpty() || cleanPin.isEmpty()) {
        val error = IllegalArgumentException("Phone/Email and PIN cannot be empty.")
        _sessionState.value = AuthSessionState.Error(error.message ?: "Empty credentials")
        return@withContext Result.failure(error)
      }

      val user = dao.getUserByIdentifier(cleanIdentifier)
        ?: dao.getUserByPhone(cleanIdentifier)
        ?: dao.getUserByEmail(cleanIdentifier)

      if (user == null) {
        val error = IllegalStateException("No account found for '$cleanIdentifier'. Please register first.")
        _sessionState.value = AuthSessionState.Error(error.message ?: "User not found")
        return@withContext Result.failure(error)
      }

      val hashedInput = hashPin(cleanPin)
      val pinMatches = user.pinHash == hashedInput ||
        user.pinHash == cleanPin ||
        (user.isDemo && (cleanPin == "1234" || cleanPin == "0000" || cleanPin == "1111"))

      if (!pinMatches) {
        val error = IllegalArgumentException("Incorrect Security PIN. Please try again.")
        _sessionState.value = AuthSessionState.Error(error.message ?: "Incorrect PIN")
        return@withContext Result.failure(error)
      }

      prefs.edit()
        .putString(KEY_SESSION_USER_ID, user.id)
        .putBoolean(KEY_IS_DEMO_MODE, user.isDemo)
        .apply()

      _currentUser.value = user
      _isDemoMode.value = user.isDemo
      loadWorkspacesForUser(user.id)
      val role = UserRole.fromKey(user.primaryRole)
      _sessionState.value = AuthSessionState.Authenticated(user, role, _currentWorkspace.value)

      Result.success(user)
    } catch (e: Exception) {
      Log.e("AuthRepo", "Phone PIN login failed: ${e.message}", e)
      _sessionState.value = AuthSessionState.Error(e.message ?: "Authentication failed")
      Result.failure(e)
    }
  }

  override suspend fun signInDemo(role: UserRole): Result<UserEntity> = withContext(Dispatchers.IO) {
    try {
      _sessionState.value = AuthSessionState.Loading
      val demoUserId = when (role) {
        UserRole.LANDLORD -> "USER_LANDLORD_1"
        UserRole.MANAGER -> "USER_MGR_1"
        UserRole.TENANT -> "USER_TENANT_1"
        UserRole.MULTIROLE -> "USER_MULTIROLE_1"
      }

      var user = dao.getUserById(demoUserId)
      if (user == null) {
        val demoName = when (role) {
          UserRole.LANDLORD -> "Dr. Ronald Katende (Demo Landlord)"
          UserRole.MANAGER -> "Peter Sserwadda (Demo Caretaker)"
          UserRole.TENANT -> "Sarah Namubiru (Demo Tenant)"
          UserRole.MULTIROLE -> "Grace Nakate (Portfolio Owner & Manager)"
        }
        val demoEmail = "${role.key.lowercase()}@marsdemo.ug"
        val demoPhone = "077000000${role.ordinal + 1}"

        user = UserEntity(
          id = demoUserId,
          phoneNumber = demoPhone,
          email = demoEmail,
          displayName = demoName,
          pinHash = hashPin("1234"),
          primaryRole = role.key,
          accountStatus = "ACTIVE",
          organizationId = "Katende Real Estate Holdings",
          isDemo = true
        )
        dao.insertUser(user)

        val assignment = RoleAssignmentEntity(
          id = "DEMO_ROLE_${role.key}",
          userId = user.id,
          role = role.key,
          workspaceTitle = "Katende Real Estate Holdings",
          createdAt = System.currentTimeMillis()
        )
        dao.insertRoleAssignment(assignment)
      }

      prefs.edit()
        .putString(KEY_SESSION_USER_ID, user.id)
        .putBoolean(KEY_IS_DEMO_MODE, true)
        .apply()

      _currentUser.value = user
      _isDemoMode.value = true
      loadWorkspacesForUser(user.id)
      _sessionState.value = AuthSessionState.Authenticated(user, role, _currentWorkspace.value)

      Result.success(user)
    } catch (e: Exception) {
      Log.e("AuthRepo", "Demo login failed: ${e.message}", e)
      _sessionState.value = AuthSessionState.Error(e.message ?: "Demo login failed")
      Result.failure(e)
    }
  }

  override suspend fun sendPasswordResetEmail(email: String): Result<Unit> = withContext(Dispatchers.IO) {
    try {
      val cleanEmail = email.trim()
      if (cleanEmail.isEmpty()) {
        return@withContext Result.failure(IllegalArgumentException("Please provide a valid email address."))
      }
      firebaseAuth?.sendPasswordResetEmail(cleanEmail)?.awaitTaskResult()
      Result.success(Unit)
    } catch (e: Exception) {
      Log.w("AuthRepo", "Password reset failed: ${e.message}")
      Result.failure(e)
    }
  }

  override suspend fun updateUserProfile(
    displayName: String,
    phoneNumber: String
  ): Result<UserEntity> = withContext(Dispatchers.IO) {
    try {
      val current = _currentUser.value
        ?: return@withContext Result.failure(IllegalStateException("No active user session."))

      val updated = current.copy(
        displayName = displayName.trim().ifEmpty { current.displayName },
        phoneNumber = phoneNumber.trim().ifEmpty { current.phoneNumber },
        updatedAt = System.currentTimeMillis()
      )

      dao.updateUser(updated)
      _currentUser.value = updated

      // Update Firebase Auth profile displayName
      firebaseAuth?.currentUser?.let { fbUser ->
        try {
          val profileUpdates = UserProfileChangeRequest.Builder()
            .setDisplayName(updated.displayName)
            .build()
          fbUser.updateProfile(profileUpdates).awaitTaskResult()
        } catch (e: Exception) {
          Log.w("AuthRepo", "Could not update Firebase profile: ${e.message}")
        }
      }

      // Sync to Firestore
      firestore?.let { db ->
        try {
          db.collection("users").document(updated.id).set(
            mapOf(
              "displayName" to updated.displayName,
              "phoneNumber" to updated.phoneNumber,
              "updatedAt" to updated.updatedAt
            ),
            SetOptions.merge()
          ).awaitTaskResult()
        } catch (e: Exception) {
          Log.w("AuthRepo", "Could not update Firestore user document: ${e.message}")
        }
      }

      _sessionState.value = AuthSessionState.Authenticated(updated, activeRole, _currentWorkspace.value)
      Result.success(updated)
    } catch (e: Exception) {
      Log.e("AuthRepo", "Update profile failed: ${e.message}", e)
      Result.failure(e)
    }
  }

  override suspend fun switchWorkspace(assignment: RoleAssignmentEntity): Result<RoleAssignmentEntity> = withContext(Dispatchers.IO) {
    try {
      _currentWorkspace.value = assignment
      prefs.edit().putString(KEY_ACTIVE_WORKSPACE_ID, assignment.id).apply()
      _currentUser.value?.let { user ->
        _sessionState.value = AuthSessionState.Authenticated(user, activeRole, assignment)
      }
      Result.success(assignment)
    } catch (e: Exception) {
      Log.e("AuthRepo", "Switch workspace failed: ${e.message}", e)
      Result.failure(e)
    }
  }

  override fun setDemoMode(enabled: Boolean) {
    _isDemoMode.value = enabled
    prefs.edit().putBoolean(KEY_IS_DEMO_MODE, enabled).apply()
  }

  override suspend fun signOut(): Result<Unit> = withContext(Dispatchers.IO) {
    try {
      firebaseAuth?.signOut()
      prefs.edit()
        .remove(KEY_SESSION_USER_ID)
        .remove(KEY_ACTIVE_WORKSPACE_ID)
        .putBoolean(KEY_IS_DEMO_MODE, false)
        .apply()

      _currentUser.value = null
      _currentWorkspace.value = null
      _userWorkspaces.value = emptyList()
      _isDemoMode.value = false
      _sessionState.value = AuthSessionState.Unauthenticated

      Result.success(Unit)
    } catch (e: Exception) {
      Log.e("AuthRepo", "Sign out error: ${e.message}", e)
      Result.failure(e)
    }
  }

  private suspend fun loadWorkspacesForUser(userId: String) {
    try {
      val workspaces = dao.getRoleAssignmentsList(userId)
      _userWorkspaces.value = workspaces

      val activeId = prefs.getString(KEY_ACTIVE_WORKSPACE_ID, null)
      val active = workspaces.find { it.id == activeId } ?: workspaces.firstOrNull()
      _currentWorkspace.value = active
    } catch (e: Exception) {
      Log.w("AuthRepo", "Error loading workspaces: ${e.message}")
    }
  }

  private suspend fun syncFirebaseUserToLocal(
    fbUser: FirebaseUser?,
    defaultRole: UserRole,
    displayName: String
  ): UserEntity {
    val uid = fbUser?.uid ?: UUID.randomUUID().toString()
    val email = fbUser?.email ?: "google.user@mars.ug"

    var user: UserEntity? = null
    if (firestore != null) {
      try {
        val doc = firestore.collection("users").document(uid).get().awaitTaskResult()
        if (doc.exists()) {
          val data = doc.data
          if (data != null) {
            user = UserEntity(
              id = uid,
              email = email,
              phoneNumber = data["phoneNumber"] as? String ?: (fbUser?.phoneNumber ?: ""),
              displayName = data["displayName"] as? String ?: displayName,
              primaryRole = data["primaryRole"] as? String ?: defaultRole.key,
              accountStatus = data["accountStatus"] as? String ?: "ACTIVE",
              organizationId = data["organizationId"] as? String ?: "ORG_MARS",
              isDemo = false,
              createdAt = (data["createdAt"] as? Long) ?: System.currentTimeMillis(),
              updatedAt = System.currentTimeMillis()
            )
          }
        }
      } catch (e: Exception) {
        Log.w("AuthRepo", "Firestore user read skipped: ${e.message}")
      }
    }

    if (user == null) {
      user = dao.getUserById(uid) ?: UserEntity(
        id = uid,
        email = email,
        phoneNumber = fbUser?.phoneNumber ?: "",
        displayName = displayName,
        pinHash = hashPin("1234"),
        primaryRole = defaultRole.key,
        accountStatus = "ACTIVE",
        organizationId = "ORG_MARS",
        isDemo = false,
        createdAt = System.currentTimeMillis(),
        updatedAt = System.currentTimeMillis()
      )
    }

    dao.insertUser(user)

    val existingAssignments = dao.getRoleAssignmentsList(uid)
    if (existingAssignments.isEmpty()) {
      val defaultAssignment = RoleAssignmentEntity(
        id = UUID.randomUUID().toString(),
        userId = uid,
        role = user.primaryRole,
        workspaceTitle = "Default Workspace",
        createdAt = System.currentTimeMillis()
      )
      dao.insertRoleAssignment(defaultAssignment)
    }

    return user
  }
}
