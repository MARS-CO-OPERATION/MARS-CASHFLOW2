package com.example.ui.screens

import android.content.Context
import android.util.Log
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import com.example.R
import com.example.data.UserRole
import com.example.ui.MarsViewModel
import com.example.ui.theme.*
import com.google.android.gms.tasks.Task
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

suspend fun <T> Task<T>.awaitTask(): T = suspendCancellableCoroutine { cont ->
  addOnCompleteListener { task ->
    if (task.isSuccessful) {
      val result = task.result
      if (result != null) {
        cont.resume(result)
      } else {
        cont.resumeWithException(IllegalStateException("Task result is null"))
      }
    } else {
      cont.resumeWithException(task.exception ?: RuntimeException("Firebase operation failed"))
    }
  }
}

/**
 * Production-grade MARS Cashflow Authentication Screen.
 * Provides:
 * 1. Sign In (Email/Password, Phone/PIN, Google Sign-In via Credential Manager)
 * 2. Create Account with explicit Role Selection (Landlord, Manager, Tenant, Service Provider)
 * 3. Role-aware redirection upon successful authorization.
 * 4. Sandbox 1-tap testing credentials for quick review.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onSignInSuccess: ((FirebaseUser?) -> Unit)? = null
) {
  val context = LocalContext.current
  val coroutineScope = rememberCoroutineScope()

  var selectedTab by remember { mutableIntStateOf(0) } // 0 = Sign In, 1 = Create Account
  var authMode by remember { mutableStateOf("EMAIL") } // "EMAIL" or "PHONE"

  // Sign In state
  var emailInput by remember { mutableStateOf("landlord@mars.ug") }
  var passwordInput by remember { mutableStateOf("123456") }
  var phoneInput by remember { mutableStateOf("0770000001") }
  var pinInput by remember { mutableStateOf("1234") }
  var isPasswordVisible by remember { mutableStateOf(false) }

  // Registration state
  var regNameInput by remember { mutableStateOf("") }
  var regEmailInput by remember { mutableStateOf("") }
  var regPhoneInput by remember { mutableStateOf("+256 ") }
  var regPasswordInput by remember { mutableStateOf("") }
  var regOrgInput by remember { mutableStateOf("") }
  var regRole by remember { mutableStateOf(UserRole.LANDLORD) }

  var errorMessage by remember { mutableStateOf<String?>(null) }
  var infoMessage by remember { mutableStateOf<String?>(null) }
  var isAuthenticating by remember { mutableStateOf(false) }
  var isGoogleSigningIn by remember { mutableStateOf(false) }
  var showForgotDialog by remember { mutableStateOf(false) }
  var forgotEmailInput by remember { mutableStateOf("") }

  val isDemoMode by viewModel.isDemoMode.collectAsState()

  fun navigateByRole(role: UserRole?) {
    when (role) {
      UserRole.LANDLORD -> onNavigate("landlord")
      UserRole.MANAGER -> onNavigate("caretaker")
      UserRole.TENANT -> onNavigate("tenant")
      UserRole.SERVICE_PROVIDER -> onNavigate("service_providers")
      UserRole.MULTIROLE -> onNavigate("multi_role_selection")
      else -> onNavigate("home")
    }
  }

  fun performEmailLogin() {
    isAuthenticating = true
    errorMessage = null
    infoMessage = null
    viewModel.loginWithEmailPassword(emailInput, passwordInput) { success, message, role ->
      isAuthenticating = false
      if (success) {
        navigateByRole(role)
      } else {
        errorMessage = message
      }
    }
  }

  fun performPhoneLogin(phone: String, pin: String) {
    isAuthenticating = true
    errorMessage = null
    infoMessage = null
    viewModel.login(phone, pin) { success, message ->
      isAuthenticating = false
      if (success) {
        val user = viewModel.currentUser.value
        navigateByRole(UserRole.fromKey(user?.primaryRole))
      } else {
        errorMessage = message
      }
    }
  }

  fun performRegistration() {
    if (regNameInput.isBlank()) {
      errorMessage = "Please enter your full name or organization."
      return
    }
    if (regEmailInput.isBlank() || !regEmailInput.contains("@")) {
      errorMessage = "Please enter a valid email address."
      return
    }
    if (regPasswordInput.length < 6) {
      errorMessage = "Password must be at least 6 characters long."
      return
    }

    isAuthenticating = true
    errorMessage = null
    infoMessage = null
    viewModel.registerWithEmailPassword(
      email = regEmailInput,
      password = regPasswordInput,
      displayName = regNameInput,
      phoneNumber = regPhoneInput,
      role = regRole,
      organizationName = regOrgInput.ifBlank { null }
    ) { success, message, role ->
      isAuthenticating = false
      if (success) {
        navigateByRole(role)
      } else {
        errorMessage = message
      }
    }
  }

  fun initiateGoogleSignIn() {
    isGoogleSigningIn = true
    errorMessage = null
    infoMessage = null

    coroutineScope.launch {
      try {
        val credentialManager = CredentialManager.create(context)
        val serverClientId = try {
          context.getString(R.string.default_web_client_id)
        } catch (e: Exception) {
          "mars-cashflow-app.apps.googleusercontent.com"
        }

        val googleIdOption = GetGoogleIdOption.Builder()
          .setFilterByAuthorizedAccounts(false)
          .setServerClientId(serverClientId)
          .setAutoSelectEnabled(false)
          .build()

        val request = GetCredentialRequest.Builder()
          .addCredentialOption(googleIdOption)
          .build()

        val result = credentialManager.getCredential(
          request = request,
          context = context
        )

        val credential = result.credential
        if (credential is CustomCredential && credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
          val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
          val idToken = googleIdTokenCredential.idToken

          viewModel.loginWithGoogle(idToken = idToken, defaultRole = UserRole.LANDLORD) { success, msg, role ->
            isGoogleSigningIn = false
            if (success) {
              navigateByRole(role)
            } else {
              errorMessage = msg
            }
          }
        } else {
          isGoogleSigningIn = false
          errorMessage = "Received unexpected credential from identity provider."
        }
      } catch (e: GetCredentialCancellationException) {
        isGoogleSigningIn = false
        Log.d("LoginScreen", "Google Sign-in cancelled by user")
      } catch (e: GetCredentialException) {
        isGoogleSigningIn = false
        errorMessage = "Google Sign-In: ${e.localizedMessage ?: "Credentials unavailable"}"
      } catch (e: Exception) {
        isGoogleSigningIn = false
        errorMessage = "Authentication failed: ${e.localizedMessage ?: "Sign-in error"}"
      }
    }
  }

  if (showForgotDialog) {
    AlertDialog(
      onDismissRequest = { showForgotDialog = false },
      title = { Text("Reset Password / PIN", fontWeight = FontWeight.Bold) },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text(
            "Enter your registered MARS email address to receive a secure password reset link.",
            fontSize = 13.sp,
            color = MarsMuted
          )
          OutlinedTextField(
            value = forgotEmailInput,
            onValueChange = { forgotEmailInput = it },
            label = { Text("Email Address") },
            placeholder = { Text("you@domain.com") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )
        }
      },
      confirmButton = {
        Button(
          onClick = {
            if (forgotEmailInput.isNotBlank()) {
              viewModel.sendPasswordReset(forgotEmailInput) { success, msg ->
                showForgotDialog = false
                if (success) infoMessage = msg else errorMessage = msg
              }
            }
          },
          colors = ButtonDefaults.buttonColors(containerColor = MarsGreen)
        ) {
          Text("Send Reset Link")
        }
      },
      dismissButton = {
        TextButton(onClick = { showForgotDialog = false }) {
          Text("Cancel")
        }
      }
    )
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Box(
              modifier = Modifier.size(36.dp).background(MarsGreen, RoundedCornerShape(12.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("M", color = Color.White, fontWeight = FontWeight.Black, fontSize = 18.sp)
            }
            Column {
              Text(
                "MARS CASHFLOW",
                fontWeight = FontWeight.Black,
                fontSize = 16.sp,
                color = MarsInk,
                lineHeight = 16.sp
              )
              Text(
                "Uganda Property Ledger",
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = MarsGreen,
                letterSpacing = 1.sp
              )
            }
          }
        },
        actions = {
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = if (isDemoMode) MarsAccent.copy(alpha = 0.2f) else MarsSurfaceLight,
            border = BorderStroke(1.dp, if (isDemoMode) MarsAccent else Color(0xFFDFE8E3))
          ) {
            Text(
              text = if (isDemoMode) "🧪 Sandbox" else "🔒 Live Firebase",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = if (isDemoMode) MarsDark else MarsGreen,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
          }
        },
        colors = TopAppBarDefaults.topAppBarColors(containerColor = MarsBg)
      )
    },
    containerColor = MarsBg
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .verticalScroll(rememberScrollState())
        .padding(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      // Main Mode Switcher Tab (Sign In vs Create Account)
      TabRow(
        selectedTabIndex = selectedTab,
        containerColor = MarsSurfaceLight,
        contentColor = MarsGreen,
        modifier = Modifier.fillMaxWidth().background(MarsSurfaceLight, RoundedCornerShape(12.dp))
      ) {
        Tab(
          selected = selectedTab == 0,
          onClick = { selectedTab = 0; errorMessage = null },
          text = { Text("Sign In", fontWeight = FontWeight.Bold, fontSize = 14.sp) }
        )
        Tab(
          selected = selectedTab == 1,
          onClick = { selectedTab = 1; errorMessage = null },
          text = { Text("Create Account", fontWeight = FontWeight.Bold, fontSize = 14.sp) }
        )
      }

      if (errorMessage != null) {
        Surface(
          shape = RoundedCornerShape(12.dp),
          color = MarsRed.copy(alpha = 0.12f),
          border = BorderStroke(1.dp, MarsRed.copy(alpha = 0.4f)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Icon(Icons.Default.Error, contentDescription = null, tint = MarsRed)
            Text(
              text = errorMessage ?: "",
              color = MarsRed,
              fontWeight = FontWeight.Bold,
              fontSize = 12.sp
            )
          }
        }
      }

      if (infoMessage != null) {
        Surface(
          shape = RoundedCornerShape(12.dp),
          color = MarsGreen.copy(alpha = 0.12f),
          border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.4f)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MarsGreen)
            Text(
              text = infoMessage ?: "",
              color = MarsInk,
              fontWeight = FontWeight.Bold,
              fontSize = 12.sp
            )
          }
        }
      }

      // TAB 0: SIGN IN
      if (selectedTab == 0) {
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
          elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
          ) {
            // Google Sign-In Button
            Button(
              onClick = { initiateGoogleSignIn() },
              enabled = !isGoogleSigningIn && !isAuthenticating,
              modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
              colors = ButtonDefaults.buttonColors(containerColor = Color.White),
              border = BorderStroke(1.dp, Color(0xFFDADCE0)),
              shape = RoundedCornerShape(12.dp),
              elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
            ) {
              if (isGoogleSigningIn) {
                CircularProgressIndicator(color = MarsGreen, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                Spacer(Modifier.width(10.dp))
                Text("Connecting with Google...", color = MarsInk, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
              } else {
                Row(
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.Center
                ) {
                  Box(
                    modifier = Modifier
                      .size(22.dp)
                      .background(Color(0xFF4285F4), CircleShape),
                    contentAlignment = Alignment.Center
                  ) {
                    Text("G", color = Color.White, fontWeight = FontWeight.Black, fontSize = 13.sp)
                  }
                  Spacer(Modifier.width(10.dp))
                  Text(
                    "Sign in with Google",
                    color = Color(0xFF3C4043),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                  )
                }
              }
            }

            Row(
              modifier = Modifier.fillMaxWidth(),
              verticalAlignment = Alignment.CenterVertically
            ) {
              HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0))
              Text(
                "  or credentials  ",
                fontSize = 11.sp,
                color = MarsMuted,
                fontWeight = FontWeight.Medium
              )
              HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0))
            }

            // Auth mode toggle (Email vs Phone)
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              FilterChip(
                selected = authMode == "EMAIL",
                onClick = { authMode = "EMAIL" },
                label = { Text("Email & Password", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(14.dp)) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp)
              )
              FilterChip(
                selected = authMode == "PHONE",
                onClick = { authMode = "PHONE" },
                label = { Text("Phone & PIN", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(14.dp)) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp)
              )
            }

            if (authMode == "EMAIL") {
              OutlinedTextField(
                value = emailInput,
                onValueChange = { emailInput = it },
                label = { Text("Email Address") },
                placeholder = { Text("landlord@mars.ug") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
              )

              OutlinedTextField(
                value = passwordInput,
                onValueChange = { passwordInput = it },
                label = { Text("Password") },
                singleLine = true,
                visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                  IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                    Icon(
                      if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                      contentDescription = "Toggle password"
                    )
                  }
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
              )

              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
              ) {
                TextButton(onClick = { showForgotDialog = true; forgotEmailInput = emailInput }) {
                  Text("Forgot Password?", fontSize = 12.sp, color = MarsGreen, fontWeight = FontWeight.Bold)
                }
              }

              Button(
                onClick = { performEmailLogin() },
                enabled = !isAuthenticating && !isGoogleSigningIn,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
                shape = RoundedCornerShape(12.dp)
              ) {
                if (isAuthenticating) {
                  CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                  Icon(Icons.Default.LockOpen, contentDescription = null, modifier = Modifier.size(18.dp))
                  Spacer(Modifier.width(8.dp))
                  Text("Sign In to MARS", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
              }
            } else {
              OutlinedTextField(
                value = phoneInput,
                onValueChange = { phoneInput = it },
                label = { Text("Uganda Phone Number / ID") },
                placeholder = { Text("0770000001") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
              )

              OutlinedTextField(
                value = pinInput,
                onValueChange = { pinInput = it },
                label = { Text("4-Digit PIN") },
                placeholder = { Text("1234") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
              )

              Button(
                onClick = { performPhoneLogin(phoneInput, pinInput) },
                enabled = !isAuthenticating && !isGoogleSigningIn,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
                shape = RoundedCornerShape(12.dp)
              ) {
                if (isAuthenticating) {
                  CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                  Icon(Icons.Default.LockOpen, contentDescription = null, modifier = Modifier.size(18.dp))
                  Spacer(Modifier.width(8.dp))
                  Text("Authorize with PIN", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
              }
            }
          }
        }

        // Quick Role Sandbox Accounts
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = MarsSurfaceLight),
          border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.25f)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Text(
              "Instant Role Switcher (Pre-Configured Accounts)",
              fontWeight = FontWeight.Black,
              fontSize = 12.sp,
              color = MarsInk
            )

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              OutlinedButton(
                onClick = {
                  emailInput = "landlord@mars.ug"
                  passwordInput = "123456"
                  phoneInput = "0770000001"
                  pinInput = "1234"
                  performPhoneLogin("0770000001", "1234")
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
                contentPadding = PaddingValues(4.dp)
              ) {
                Text("👑 Owner", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
              }

              OutlinedButton(
                onClick = {
                  emailInput = "manager@mars.ug"
                  passwordInput = "123456"
                  phoneInput = "0770000002"
                  pinInput = "0000"
                  performPhoneLogin("0770000002", "0000")
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
                contentPadding = PaddingValues(4.dp)
              ) {
                Text("👨🏾💼 Manager", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
              }

              OutlinedButton(
                onClick = {
                  emailInput = "tenant@mars.ug"
                  passwordInput = "123456"
                  phoneInput = "0771111111"
                  pinInput = "1111"
                  performPhoneLogin("0771111111", "1111")
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
                contentPadding = PaddingValues(4.dp)
              ) {
                Text("👤 Tenant", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
              }
            }

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              OutlinedButton(
                onClick = {
                  emailInput = "contractor@mars.ug"
                  passwordInput = "123456"
                  phoneInput = "0772333444"
                  pinInput = "2222"
                  performPhoneLogin("0772333444", "2222")
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
                contentPadding = PaddingValues(4.dp)
              ) {
                Text("🛠️ Contractor", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
              }

              OutlinedButton(
                onClick = {
                  emailInput = "multirole@mars.ug"
                  passwordInput = "123456"
                  phoneInput = "0779999999"
                  pinInput = "9999"
                  performPhoneLogin("0779999999", "9999")
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
                contentPadding = PaddingValues(4.dp)
              ) {
                Text("🔀 Multi-Role", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
              }
            }
          }
        }
      }

      // TAB 1: CREATE ACCOUNT & SELECT ROLE
      if (selectedTab == 1) {
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
          elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
          ) {
            Text(
              "Select Your Primary Role in MARS",
              fontWeight = FontWeight.Black,
              fontSize = 14.sp,
              color = MarsInk
            )

            // Role selection cards
            val roles = listOf(
              UserRole.LANDLORD,
              UserRole.MANAGER,
              UserRole.TENANT,
              UserRole.SERVICE_PROVIDER
            )

            roles.forEach { role ->
              val isSelected = regRole == role
              Surface(
                shape = RoundedCornerShape(14.dp),
                color = if (isSelected) MarsSurfaceLight else Color.White,
                border = BorderStroke(
                  width = if (isSelected) 2.dp else 1.dp,
                  color = if (isSelected) MarsGreen else Color(0xFFE2E8F0)
                ),
                modifier = Modifier
                  .fillMaxWidth()
                  .clickable { regRole = role }
              ) {
                Row(
                  modifier = Modifier.padding(12.dp),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                  Box(
                    modifier = Modifier
                      .size(38.dp)
                      .background(if (isSelected) MarsGreen else MarsBg, RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                  ) {
                    Text(role.icon, fontSize = 18.sp)
                  }
                  Column(modifier = Modifier.weight(1f)) {
                    Text(
                      role.title,
                      fontWeight = FontWeight.Bold,
                      fontSize = 13.sp,
                      color = if (isSelected) MarsGreen else MarsInk
                    )
                    Text(
                      role.subtitle,
                      fontSize = 11.sp,
                      color = MarsMuted,
                      lineHeight = 14.sp
                    )
                  }
                  RadioButton(
                    selected = isSelected,
                    onClick = { regRole = role },
                    colors = RadioButtonDefaults.colors(selectedColor = MarsGreen)
                  )
                }
              }
            }

            HorizontalDivider(color = Color(0xFFE2E8F0))

            OutlinedTextField(
              value = regNameInput,
              onValueChange = { regNameInput = it },
              label = { Text("Full Name or Contact Person") },
              placeholder = { Text("e.g. Dr. Ronald Katende") },
              singleLine = true,
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
              value = regEmailInput,
              onValueChange = { regEmailInput = it },
              label = { Text("Email Address") },
              placeholder = { Text("ronald@katende.ug") },
              singleLine = true,
              keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
              value = regPhoneInput,
              onValueChange = { regPhoneInput = it },
              label = { Text("Mobile Money Phone Number") },
              placeholder = { Text("+256 770 000000") },
              singleLine = true,
              keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
              value = regPasswordInput,
              onValueChange = { regPasswordInput = it },
              label = { Text("Create Password (6+ characters)") },
              singleLine = true,
              visualTransformation = PasswordVisualTransformation(),
              keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
              value = regOrgInput,
              onValueChange = { regOrgInput = it },
              label = { Text("Property / Business Name (Optional)") },
              placeholder = { Text("e.g. Kololo Suites Ltd") },
              singleLine = true,
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp)
            )

            Button(
              onClick = { performRegistration() },
              enabled = !isAuthenticating,
              modifier = Modifier.fillMaxWidth().height(48.dp),
              colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
              shape = RoundedCornerShape(12.dp)
            ) {
              if (isAuthenticating) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
              } else {
                Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Create Account as ${regRole.title.split("/").first().trim()}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
              }
            }
          }
        }
      }

      TextButton(onClick = { onNavigate("home") }) {
        Text("Master Overview Dashboard →", fontSize = 12.sp, color = MarsMuted, fontWeight = FontWeight.Bold)
      }
    }
  }
}

