package com.example.ui.screens

import android.content.Context
import android.util.Log
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import com.example.R
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
 * Minimal, production-grade LoginScreen composable featuring Google Sign-In
 * via Credential Manager and the GoogleId provider for Firebase Authentication.
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

  var usernameInput by remember { mutableStateOf("0770000001") }
  var pinInput by remember { mutableStateOf("1234") }
  var errorMessage by remember { mutableStateOf<String?>(null) }
  var isAuthenticating by remember { mutableStateOf(false) }
  var isGoogleSigningIn by remember { mutableStateOf(false) }

  val isDemoMode by viewModel.isDemoMode.collectAsState()

  fun handleSuccessfulLogin(role: String?) {
    when (role) {
      "LANDLORD" -> onNavigate("landlord")
      "MANAGER" -> onNavigate("caretaker")
      "TENANT" -> onNavigate("tenant")
      "MULTIROLE" -> onNavigate("multi_role_selection")
      else -> onNavigate("home")
    }
  }

  fun performPinLogin(identifier: String, pin: String) {
    isAuthenticating = true
    errorMessage = null
    viewModel.login(identifier, pin) { success, message ->
      isAuthenticating = false
      if (success) {
        val user = viewModel.currentUser.value
        handleSuccessfulLogin(user?.primaryRole)
      } else {
        errorMessage = message
      }
    }
  }

  fun initiateGoogleSignIn() {
    isGoogleSigningIn = true
    errorMessage = null

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

          val auth = FirebaseAuth.getInstance()
          val authCredential = GoogleAuthProvider.getCredential(idToken, null)
          val authResult = auth.signInWithCredential(authCredential).awaitTask()
          val firebaseUser = authResult.user

          isGoogleSigningIn = false
          onSignInSuccess?.invoke(firebaseUser)

          // Bridge authenticated Google user into MARS workspace session
          val userEmail = firebaseUser?.email ?: googleIdTokenCredential.id
          val displayName = firebaseUser?.displayName ?: "Google User"

          viewModel.login(userEmail, "1234") { success, _ ->
            if (success) {
              val user = viewModel.currentUser.value
              handleSuccessfulLogin(user?.primaryRole)
            } else {
              // Default to landlord master overview on fresh Google auth
              onNavigate("home")
            }
          }
        } else {
          isGoogleSigningIn = false
          errorMessage = "Received unexpected credential type from provider."
        }
      } catch (e: GetCredentialCancellationException) {
        isGoogleSigningIn = false
        Log.d("LoginScreen", "Google Sign-in cancelled by user")
      } catch (e: GetCredentialException) {
        isGoogleSigningIn = false
        errorMessage = "Google Sign-In failed: ${e.localizedMessage ?: "Credentials unavailable"}"
      } catch (e: Exception) {
        isGoogleSigningIn = false
        errorMessage = "Authentication failed: ${e.localizedMessage ?: "Sign-in error"}"
      }
    }
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
              text = if (isDemoMode) "🧪 Sandbox" else "🔒 Live",
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
        .padding(20.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      // Branding Header Card
      Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MarsDark),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Text(
            "SECURE ACCESS",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = MarsAccent,
            letterSpacing = 1.2.sp
          )
          Text(
            "Sign in with your Google account or authorized phone credentials to manage your properties and ledgers.",
            fontSize = 13.sp,
            color = Color(0xFFC7D4CE),
            lineHeight = 18.sp
          )
        }
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

      // Primary Google Sign-In Card
      Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Text(
            "Sign In with Identity Provider",
            fontWeight = FontWeight.Black,
            fontSize = 14.sp,
            color = MarsInk
          )

          // Google Sign-In Button using GoogleId Credential Provider
          Button(
            onClick = { initiateGoogleSignIn() },
            enabled = !isGoogleSigningIn && !isAuthenticating,
            modifier = Modifier
              .fillMaxWidth()
              .height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.White),
            border = BorderStroke(1.dp, Color(0xFFDADCE0)),
            shape = RoundedCornerShape(12.dp),
            elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp, pressedElevation = 2.dp)
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
                // Google "G" Badge Icon
                Box(
                  modifier = Modifier
                    .size(24.dp)
                    .background(Color(0xFF4285F4), CircleShape),
                  contentAlignment = Alignment.Center
                ) {
                  Text("G", color = Color.White, fontWeight = FontWeight.Black, fontSize = 14.sp)
                }
                Spacer(Modifier.width(12.dp))
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
              "  or continue with Phone / PIN  ",
              fontSize = 11.sp,
              color = MarsMuted,
              fontWeight = FontWeight.Medium
            )
            HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFE2E8F0))
          }

          OutlinedTextField(
            value = usernameInput,
            onValueChange = { usernameInput = it },
            label = { Text("Phone Number / User ID") },
            placeholder = { Text("e.g. 0770000001") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
          )

          OutlinedTextField(
            value = pinInput,
            onValueChange = { pinInput = it },
            label = { Text("4-Digit Security PIN") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
          )

          Button(
            onClick = { performPinLogin(usernameInput, pinInput) },
            enabled = !isAuthenticating && !isGoogleSigningIn,
            modifier = Modifier
              .fillMaxWidth()
              .height(48.dp),
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
            shape = RoundedCornerShape(12.dp)
          ) {
            if (isAuthenticating) {
              CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            } else {
              Icon(Icons.Default.LockOpen, contentDescription = null, modifier = Modifier.size(18.dp))
              Spacer(Modifier.width(8.dp))
              Text("Authorize & Access Workspace", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
          }
        }
      }

      // Quick Role Accounts for Sandbox Testing
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
            "Quick Role Logins (Demo Sandbox)",
            fontWeight = FontWeight.Black,
            fontSize = 12.sp,
            color = MarsInk
          )

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            OutlinedButton(
              onClick = {
                usernameInput = "0770000001"
                pinInput = "1234"
                performPinLogin("0770000001", "1234")
              },
              modifier = Modifier.weight(1f),
              shape = RoundedCornerShape(10.dp),
              colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
              contentPadding = PaddingValues(6.dp)
            ) {
              Text("👑 Landlord", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
            }

            OutlinedButton(
              onClick = {
                usernameInput = "0770000002"
                pinInput = "0000"
                performPinLogin("0770000002", "0000")
              },
              modifier = Modifier.weight(1f),
              shape = RoundedCornerShape(10.dp),
              colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
              contentPadding = PaddingValues(6.dp)
            ) {
              Text("👨🏾💼 Manager", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
            }
          }

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            OutlinedButton(
              onClick = {
                usernameInput = "0771111111"
                pinInput = "1111"
                performPinLogin("0771111111", "1111")
              },
              modifier = Modifier.weight(1f),
              shape = RoundedCornerShape(10.dp),
              colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
              contentPadding = PaddingValues(6.dp)
            ) {
              Text("👤 Tenant", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
            }

            OutlinedButton(
              onClick = {
                usernameInput = "0779999999"
                pinInput = "9999"
                performPinLogin("0779999999", "9999")
              },
              modifier = Modifier.weight(1f),
              shape = RoundedCornerShape(10.dp),
              colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
              contentPadding = PaddingValues(6.dp)
            ) {
              Text("🔀 Multi-Role", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
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
