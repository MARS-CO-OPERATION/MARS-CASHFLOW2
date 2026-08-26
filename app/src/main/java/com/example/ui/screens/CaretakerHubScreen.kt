package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MarsViewModel
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CaretakerHubScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onViewReceipt: (String) -> Unit,
  onBack: () -> Unit
) {
  val tenants by viewModel.tenants.collectAsState()
  val payments by viewModel.payments.collectAsState()
  val currentUser by viewModel.currentUser.collectAsState()

  var selectedTenantName by remember { mutableStateOf("") }
  var amountInput by remember { mutableStateOf("") }
  var payerPhoneInput by remember { mutableStateOf("") }
  var paymentMethod by remember { mutableStateOf("Mobile Money (MTN)") }
  var notesInput by remember { mutableStateOf("") }
  var isProcessing by remember { mutableStateOf(false) }

  var showAddTenantDialog by remember { mutableStateOf(false) }
  var newTenantName by remember { mutableStateOf("") }
  var newTenantPhone by remember { mutableStateOf("") }
  var newTenantUnit by remember { mutableStateOf("Unit 103") }
  var newTenantProp by remember { mutableStateOf("Kampala Apartments") }
  var newTenantRent by remember { mutableStateOf("1200000") }
  var newTenantArrears by remember { mutableStateOf("0") }

  var successMessage by remember { mutableStateOf<String?>(null) }
  var errorMessage by remember { mutableStateOf<String?>(null) }

  val caretakerDisplayName = currentUser?.displayName ?: "Peter (Caretaker)"
  val syncStatus by viewModel.syncStatus.collectAsState()
  val syncMessage by viewModel.syncMessage.collectAsState()
  var isSyncingNow by remember { mutableStateOf(false) }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("👨🏾💼", fontSize = 14.sp)
            }
            Text("Caretaker Hub", fontWeight = FontWeight.Black, fontSize = 18.sp)
          }
        },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
          }
        },
        actions = {
          Button(
            onClick = { showAddTenantDialog = true },
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
            shape = RoundedCornerShape(10.dp),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
          ) {
            Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(4.dp))
            Text("Add Tenant", fontSize = 12.sp, fontWeight = FontWeight.Bold)
          }
        },
        colors =
          TopAppBarDefaults.topAppBarColors(
            containerColor = MarsBg,
            titleContentColor = MarsInk,
            navigationIconContentColor = MarsInk
          )
      )
    },
    containerColor = MarsBg
  ) { innerPadding ->
    Column(
      modifier =
        Modifier.fillMaxSize()
          .padding(innerPadding)
          .verticalScroll(rememberScrollState())
          .padding(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // Cloud Synchronization Banner
      Card(
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier.padding(14.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Box(
              modifier = Modifier
                .size(36.dp)
                .background(
                  if (syncStatus == com.example.data.SyncEngine.SyncStatus.SYNCED) MarsSurfaceLight else MarsBg,
                  RoundedCornerShape(8.dp)
                ),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                if (syncStatus == com.example.data.SyncEngine.SyncStatus.SYNCED) Icons.Default.CloudDone else Icons.Default.CloudQueue,
                contentDescription = null,
                tint = if (syncStatus == com.example.data.SyncEngine.SyncStatus.SYNCED) MarsGreen else MarsMuted,
                modifier = Modifier.size(20.dp)
              )
            }
            Column {
              Text(
                when (syncStatus) {
                  com.example.data.SyncEngine.SyncStatus.SYNCED -> "Cloud Ledger Synchronized"
                  com.example.data.SyncEngine.SyncStatus.SYNCING -> "Synchronizing with Cloud..."
                  com.example.data.SyncEngine.SyncStatus.FAILED -> "Sync Pending (Saved locally)"
                  else -> "Local Ledger Ready"
                },
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = MarsInk
              )
              Text(
                syncMessage.ifBlank { "All local entries cryptographically verified." },
                fontSize = 11.sp,
                color = MarsMuted
              )
            }
          }

          IconButton(
            onClick = {
              isSyncingNow = true
              viewModel.triggerSync { _, _ ->
                isSyncingNow = false
              }
            },
            enabled = !isSyncingNow
          ) {
            if (isSyncingNow) {
              CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp, color = MarsGreen)
            } else {
              Icon(Icons.Default.Sync, contentDescription = "Sync now", tint = MarsGreen)
            }
          }
        }
      }
      if (successMessage != null) {
        Card(
          colors = CardDefaults.cardColors(containerColor = MarsSurfaceLight),
          border = BorderStroke(1.dp, MarsGreen),
          shape = RoundedCornerShape(14.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MarsGreen)
            Column {
              Text("Transaction Success", fontWeight = FontWeight.Bold, color = MarsGreen, fontSize = 13.sp)
              Text(successMessage ?: "", color = MarsInk, fontSize = 12.sp)
            }
          }
        }
      }

      if (errorMessage != null) {
        Card(
          colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF5F5)),
          border = BorderStroke(1.dp, MarsRed),
          shape = RoundedCornerShape(14.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Icon(Icons.Default.Error, contentDescription = null, tint = MarsRed)
            Column {
              Text("Validation Error", fontWeight = FontWeight.Bold, color = MarsRed, fontSize = 13.sp)
              Text(errorMessage ?: "", color = MarsInk, fontSize = 12.sp)
            }
          }
        }
      }

      // Record Payment Card
      Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("Record Rent Inflow", fontWeight = FontWeight.Black, fontSize = 16.sp, color = MarsInk)
            Surface(shape = RoundedCornerShape(6.dp), color = MarsSurfaceLight) {
              Text("OFFLINE-REAL", color = MarsGreen, fontSize = 9.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
            }
          }

          Text("Select Tenant", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MarsMuted)

          // Tenant Selector Chips
          Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            tenants.forEach { t ->
              val isSelected = selectedTenantName == t.name
              OutlinedButton(
                onClick = {
                  selectedTenantName = t.name
                  payerPhoneInput = t.phone
                  if (t.arrears > 0) amountInput = t.arrears.toString() else amountInput = t.rentDue.toString()
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                  containerColor = if (isSelected) MarsGreen.copy(alpha = 0.1f) else Color.White
                ),
                border = BorderStroke(1.dp, if (isSelected) MarsGreen else Color(0xFFDFE8E3))
              ) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Column(horizontalAlignment = Alignment.Start) {
                    Text("${t.unitName} • ${t.name}", fontWeight = FontWeight.Bold, color = MarsInk, fontSize = 13.sp)
                    Text(t.propertyName, fontSize = 11.sp, color = MarsMuted)
                  }
                  Column(horizontalAlignment = Alignment.End) {
                    Text(
                      if (t.arrears > 0) "Arrears: UGX ${formatMoney(t.arrears)}" else "Fully Paid",
                      fontSize = 11.sp,
                      fontWeight = FontWeight.Bold,
                      color = if (t.arrears > 0) MarsRed else MarsGreen
                    )
                  }
                }
              }
            }
          }

          OutlinedTextField(
            value = amountInput,
            onValueChange = { amountInput = it },
            label = { Text("Payment Amount (UGX)") },
            placeholder = { Text("e.g. 1200000") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
          )

          OutlinedTextField(
            value = payerPhoneInput,
            onValueChange = { payerPhoneInput = it },
            label = { Text("Payer Mobile Money Phone") },
            placeholder = { Text("e.g. +256 772 123456") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
          )

          // Payment Methods
          Text("Payment Channel", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MarsMuted)
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            listOf("Mobile Money (MTN)", "Mobile Money (Airtel)", "Cash", "Bank Transfer").forEach { m ->
              val isSel = paymentMethod == m
              FilterChip(
                selected = isSel,
                onClick = { paymentMethod = m },
                label = { Text(if (m.startsWith("Mobile")) m.replace("Mobile Money ", "") else m, fontSize = 11.sp) },
                shape = RoundedCornerShape(8.dp),
                colors = FilterChipDefaults.filterChipColors(
                  selectedContainerColor = MarsGreen,
                  selectedLabelColor = Color.White
                )
              )
            }
          }

          OutlinedTextField(
            value = notesInput,
            onValueChange = { notesInput = it },
            label = { Text("Receipt Notes (Optional)") },
            placeholder = { Text("e.g. Balance for August 2026") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
          )

          Button(
            onClick = {
              val amt = amountInput.toLongOrNull() ?: 0L
              if (selectedTenantName.isBlank()) {
                errorMessage = "Please select a tenant."
                return@Button
              }
              if (amt <= 0) {
                errorMessage = "Please enter a valid amount greater than zero."
                return@Button
              }

              errorMessage = null
              isProcessing = true

              val targetTenant = tenants.find { it.name == selectedTenantName }
              val propName = targetTenant?.propertyName ?: "Kampala Apartments"
              val uName = targetTenant?.unitName ?: "Unit 101"

              viewModel.recordPayment(
                tenantName = selectedTenantName,
                unitName = uName,
                propertyName = propName,
                amount = amt,
                method = paymentMethod,
                payerPhone = payerPhoneInput,
                caretaker = caretakerDisplayName,
                notes = notesInput
              ) { paymentId ->
                isProcessing = false
                if (paymentId.isNotBlank()) {
                  successMessage = "Payment recorded successfully! Digital receipt generated."
                  amountInput = ""
                  notesInput = ""
                } else {
                  errorMessage = "Transaction failed or network timed out."
                }
              }
            },
            enabled = !isProcessing,
            modifier = Modifier.fillMaxWidth().height(48.dp),
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
            shape = RoundedCornerShape(12.dp)
          ) {
            if (isProcessing) {
              CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
            } else {
              Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
              Spacer(Modifier.width(8.dp))
              Text("Commit Payment to Ledger", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
          }
        }
      }

      // Recent Payments List
      Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3))
      ) {
        Column(
          modifier = Modifier.padding(18.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Text("Recorded Vouchers & Receipts", fontWeight = FontWeight.Black, fontSize = 14.sp, color = MarsInk)

          payments.forEach { p ->
            Card(
              onClick = { onViewReceipt(p.id) },
              shape = RoundedCornerShape(12.dp),
              colors = CardDefaults.cardColors(containerColor = MarsBg),
              border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
              modifier = Modifier.fillMaxWidth()
            ) {
              Row(
                modifier = Modifier.padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Column {
                  Text(p.tenantName, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MarsInk)
                  Text("${p.unitName} • ${p.propertyName}", fontSize = 11.sp, color = MarsMuted)
                  Text("Ref: ${p.receiptNumber}", fontSize = 10.sp, color = MarsGreen, fontWeight = FontWeight.Bold)
                }
                Column(horizontalAlignment = Alignment.End) {
                  Text("UGX " + formatMoney(p.amount), fontWeight = FontWeight.Black, fontSize = 13.sp, color = MarsGreen)
                  Text(p.date, fontSize = 10.sp, color = MarsMuted)
                  Text("View Receipt →", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MarsAccent)
                }
              }
            }
          }
        }
      }
    }
  }

  // Add Tenant Dialog
  if (showAddTenantDialog) {
    AlertDialog(
      onDismissRequest = { showAddTenantDialog = false },
      title = { Text("Register New Tenant", fontWeight = FontWeight.Bold) },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          OutlinedTextField(
            value = newTenantName,
            onValueChange = { newTenantName = it },
            label = { Text("Full Name") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )
          OutlinedTextField(
            value = newTenantPhone,
            onValueChange = { newTenantPhone = it },
            label = { Text("Phone Number") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )
          OutlinedTextField(
            value = newTenantUnit,
            onValueChange = { newTenantUnit = it },
            label = { Text("Unit (e.g. Unit 104)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )
          OutlinedTextField(
            value = newTenantProp,
            onValueChange = { newTenantProp = it },
            label = { Text("Property Name") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )
          OutlinedTextField(
            value = newTenantRent,
            onValueChange = { newTenantRent = it },
            label = { Text("Monthly Rent (UGX)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
          )
        }
      },
      confirmButton = {
        Button(
          onClick = {
            val rent = newTenantRent.toLongOrNull() ?: 1200000L
            val arr = newTenantArrears.toLongOrNull() ?: 0L
            if (newTenantName.isNotBlank()) {
              viewModel.addTenant(
                name = newTenantName,
                phone = newTenantPhone.ifBlank { "+256 770 000000" },
                unitName = newTenantUnit,
                propertyName = newTenantProp,
                rentDue = rent,
                arrears = arr
              )
              showAddTenantDialog = false
              successMessage = "Tenant $newTenantName registered successfully."
            }
          },
          colors = ButtonDefaults.buttonColors(containerColor = MarsGreen)
        ) {
          Text("Register Tenant")
        }
      },
      dismissButton = {
        TextButton(onClick = { showAddTenantDialog = false }) {
          Text("Cancel")
        }
      }
    )
  }
}
