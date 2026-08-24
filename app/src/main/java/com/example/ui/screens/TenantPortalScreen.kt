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
fun TenantPortalScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onViewReceipt: (String) -> Unit,
  onBack: () -> Unit
) {
  val tenants by viewModel.tenants.collectAsState()
  val payments by viewModel.payments.collectAsState()
  val maintenanceList by viewModel.maintenance.collectAsState()
  val currentUser by viewModel.currentUser.collectAsState()

  var selectedTenantIndex by remember { mutableStateOf(0) }
  val currentTenant = tenants.getOrNull(selectedTenantIndex) ?: tenants.firstOrNull()

  var payAmountInput by remember { mutableStateOf("") }
  var payMethod by remember { mutableStateOf("Mobile Money (MTN)") }
  var isPaying by remember { mutableStateOf(false) }
  var paymentSuccessMessage by remember { mutableStateOf<String?>(null) }

  var maintenanceIssue by remember { mutableStateOf("") }
  var maintenancePriority by remember { mutableStateOf("MEDIUM") }
  var maintenanceSuccess by remember { mutableStateOf(false) }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("👤", fontSize = 14.sp)
            }
            Text("Tenant Portal", fontWeight = FontWeight.Black, fontSize = 18.sp)
          }
        },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
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
    if (currentTenant == null) {
      Box(
        modifier = Modifier.fillMaxSize().padding(innerPadding),
        contentAlignment = Alignment.Center
      ) {
        Text("No tenant profiles found.", color = MarsMuted)
      }
    } else {
      Column(
        modifier =
          Modifier.fillMaxSize()
            .padding(innerPadding)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
      ) {
        // Tenant Account Switcher (For Multi-Unit or Demo Exploration)
        Text(
          "ACTIVE TENANT ACCOUNT",
          fontSize = 10.sp,
          fontWeight = FontWeight.Bold,
          color = MarsMuted,
          letterSpacing = 1.sp
        )
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          tenants.forEachIndexed { idx, t ->
            FilterChip(
              selected = selectedTenantIndex == idx,
              onClick = { selectedTenantIndex = idx },
              label = { Text(t.name.split(" ").first() + " (${t.unitName})", fontSize = 11.sp) },
              shape = RoundedCornerShape(8.dp),
              colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = MarsGreen,
                selectedLabelColor = Color.White
              )
            )
          }
        }

        // Rent Status Hero Card
        Card(
          shape = RoundedCornerShape(24.dp),
          colors = CardDefaults.cardColors(containerColor = MarsDark),
          elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column {
                Text(
                  "${currentTenant.unitName} • ${currentTenant.propertyName}",
                  color = MarsAccent,
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold
                )
                Text(
                  currentTenant.name,
                  fontSize = 18.sp,
                  fontWeight = FontWeight.Bold,
                  color = Color.White
                )
              }
              Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (currentTenant.arrears > 0) MarsRed else MarsGreen
              ) {
                Text(
                  if (currentTenant.arrears > 0) "DUE: UGX ${formatMoney(currentTenant.arrears)}" else "UP TO DATE",
                  color = Color.White,
                  fontSize = 10.sp,
                  fontWeight = FontWeight.Black,
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
              }
            }

            HorizontalDivider(color = Color(0x33FFFFFF))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Column {
                Text("Monthly Rent", color = Color(0xFFB7C5BF), fontSize = 11.sp)
                Text("UGX " + formatMoney(currentTenant.monthlyRent), fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
              }
              Column(horizontalAlignment = Alignment.End) {
                Text("Advance Credit", color = Color(0xFFB7C5BF), fontSize = 11.sp)
                Text("UGX " + formatMoney(currentTenant.advanceCredit), fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MarsAccent)
              }
            }
          }
        }

        // Direct Mobile Money Rent Payment Card
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Text("Pay Rent via Mobile Money", fontWeight = FontWeight.Black, fontSize = 14.sp, color = MarsInk)

            if (paymentSuccessMessage != null) {
              Surface(
                shape = RoundedCornerShape(10.dp),
                color = MarsSurfaceLight,
                border = BorderStroke(1.dp, MarsGreen)
              ) {
                Row(
                  modifier = Modifier.fillMaxWidth().padding(10.dp),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                  Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MarsGreen)
                  Text(paymentSuccessMessage ?: "", color = MarsGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
              }
            }

            OutlinedTextField(
              value = payAmountInput,
              onValueChange = { payAmountInput = it },
              label = { Text("Amount to Pay (UGX)") },
              placeholder = { Text("e.g. ${currentTenant.monthlyRent}") },
              singleLine = true,
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp)
            )

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              listOf("Mobile Money (MTN)", "Mobile Money (Airtel)").forEach { m ->
                FilterChip(
                  selected = payMethod == m,
                  onClick = { payMethod = m },
                  label = { Text(if (m.contains("MTN")) "MTN MoMo" else "Airtel Money", fontSize = 11.sp) },
                  shape = RoundedCornerShape(8.dp),
                  colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MarsGreen,
                    selectedLabelColor = Color.White
                  )
                )
              }
            }

            Button(
              onClick = {
                val amt = payAmountInput.toLongOrNull() ?: currentTenant.monthlyRent
                if (amt > 0) {
                  isPaying = true
                  viewModel.recordPayment(
                    tenantName = currentTenant.name,
                    unitName = currentTenant.unitName,
                    propertyName = currentTenant.propertyName,
                    amount = amt,
                    method = payMethod,
                    payerPhone = currentTenant.phone,
                    caretaker = "Self-Service (Tenant)",
                    notes = "Self-service mobile payment via app"
                  ) { pId ->
                    isPaying = false
                    if (pId.isNotBlank()) {
                      paymentSuccessMessage = "Payment of UGX $amt approved! Receipt issued."
                      payAmountInput = ""
                    }
                  }
                }
              },
              enabled = !isPaying,
              modifier = Modifier.fillMaxWidth().height(48.dp),
              colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
              shape = RoundedCornerShape(12.dp)
            ) {
              if (isPaying) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
              } else {
                Icon(Icons.Default.PhoneAndroid, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Authorize USSD MoMo Prompt", fontWeight = FontWeight.Bold)
              }
            }
          }
        }

        // Verified Payment Receipts
        val tenantPayments = payments.filter { it.tenantName.equals(currentTenant.name, ignoreCase = true) }
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Text("Payment History & Receipts", fontWeight = FontWeight.Black, fontSize = 14.sp, color = MarsInk)

            if (tenantPayments.isEmpty()) {
              Text("No receipts recorded yet.", fontSize = 12.sp, color = MarsMuted)
            } else {
              tenantPayments.forEach { p ->
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
                      Text("Receipt: ${p.receiptNumber}", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MarsInk)
                      Text("${p.date} • ${p.paymentMethod}", fontSize = 10.sp, color = MarsMuted)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                      Text("UGX " + formatMoney(p.amount), fontWeight = FontWeight.Black, fontSize = 12.sp, color = MarsGreen)
                      Text("View Receipt →", fontSize = 10.sp, color = MarsAccent, fontWeight = FontWeight.Bold)
                    }
                  }
                }
              }
            }
          }
        }

        // Report Maintenance Issue
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Text("Report Maintenance Request", fontWeight = FontWeight.Black, fontSize = 14.sp, color = MarsInk)

            if (maintenanceSuccess) {
              Text("Maintenance request submitted to caretaker.", color = MarsGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }

            OutlinedTextField(
              value = maintenanceIssue,
              onValueChange = { maintenanceIssue = it },
              label = { Text("Describe the issue") },
              placeholder = { Text("e.g. Leaking pipe under kitchen sink") },
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(12.dp)
            )

            Button(
              onClick = {
                if (maintenanceIssue.isNotBlank()) {
                  viewModel.addMaintenance(
                    propertyName = currentTenant.propertyName,
                    unitName = currentTenant.unitName,
                    tenantName = currentTenant.name,
                    issue = maintenanceIssue,
                    priority = maintenancePriority
                  )
                  maintenanceIssue = ""
                  maintenanceSuccess = true
                }
              },
              modifier = Modifier.fillMaxWidth(),
              colors = ButtonDefaults.buttonColors(containerColor = MarsDark),
              shape = RoundedCornerShape(12.dp)
            ) {
              Text("Submit Repair Request")
            }
          }
        }
      }
    }
  }
}
