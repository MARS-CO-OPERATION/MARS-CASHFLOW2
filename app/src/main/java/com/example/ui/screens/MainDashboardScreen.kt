package com.example.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material.icons.automirrored.filled.ReceiptLong
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.SyncEngine
import com.example.data.TenantEntity
import com.example.ui.MarsViewModel
import com.example.ui.theme.*

/**
 * Main Dashboard Screen displaying primary summary cards for Total Rent Collected,
 * Pending Rent Arrears, Portfolio Cashflow, Overdue Tenants Watchlist, and Operations.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainDashboardScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit
) {
  val context = LocalContext.current
  val properties by viewModel.properties.collectAsState()
  val tenants by viewModel.tenants.collectAsState()
  val payments by viewModel.payments.collectAsState()
  val expenses by viewModel.expenses.collectAsState()
  val currentUser by viewModel.currentUser.collectAsState()
  val currentWorkspace by viewModel.currentWorkspace.collectAsState()
  val syncStatus by viewModel.syncStatus.collectAsState()
  val isDemoMode by viewModel.isDemoMode.collectAsState()

  // Timeframe and Property filters
  var selectedTimeframe by remember { mutableStateOf("All Time") }
  var selectedPropertyFilter by remember { mutableStateOf("All Properties") }

  // Quick Action Dialog states
  var showRecordPaymentDialog by remember { mutableStateOf(false) }
  var selectedTenantForPayment by remember { mutableStateOf<TenantEntity?>(null) }
  var showBatchReminderDialog by remember { mutableStateOf(false) }
  var reminderFeedbackMessage by remember { mutableStateOf<String?>(null) }

  // Filtered dataset calculations
  val filteredProperties = remember(properties, selectedPropertyFilter) {
    if (selectedPropertyFilter == "All Properties") properties
    else properties.filter { it.name == selectedPropertyFilter }
  }

  val filteredTenants = remember(tenants, selectedPropertyFilter) {
    if (selectedPropertyFilter == "All Properties") tenants
    else tenants.filter { it.propertyName == selectedPropertyFilter }
  }

  val filteredPayments = remember(payments, selectedPropertyFilter) {
    if (selectedPropertyFilter == "All Properties") payments
    else payments.filter { it.propertyName == selectedPropertyFilter }
  }

  val filteredExpenses = remember(expenses, selectedPropertyFilter) {
    if (selectedPropertyFilter == "All Properties") expenses
    else expenses.filter { it.propertyName == selectedPropertyFilter }
  }

  // Key Financial Metrics
  val totalCollected = remember(filteredPayments) {
    filteredPayments.filter { it.paymentStatus == "SUCCESSFUL" }.sumOf { it.amount }
  }

  val totalExpectedRent = remember(filteredTenants) {
    filteredTenants.sumOf { it.rentDue }
  }

  val totalPendingArrears = remember(filteredTenants) {
    filteredTenants.sumOf { it.arrears }
  }

  val totalOperatingExpenses = remember(filteredExpenses) {
    filteredExpenses.sumOf { it.amount }
  }

  val netOperatingCashflow = totalCollected - totalOperatingExpenses

  val tenantsInArrears = remember(filteredTenants) {
    filteredTenants.filter { it.arrears > 0L }.sortedByDescending { it.arrears }
  }

  val collectionRate = if (totalExpectedRent > 0L) {
    (totalCollected.toFloat() / totalExpectedRent.toFloat()).coerceIn(0f, 1f)
  } else {
    0.88f
  }

  val totalUnits = properties.sumOf { it.totalUnits }
  val occupiedUnits = tenants.size
  val occupancyRate = if (totalUnits > 0) ((occupiedUnits.toFloat() / totalUnits.toFloat()) * 100).toInt() else 100

  Scaffold(
    topBar = {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .background(MarsBg)
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          // Brand Header
          Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box(
              modifier = Modifier
                .size(42.dp)
                .background(
                  brush = Brush.linearGradient(listOf(MarsGreen, Color(0xFF07885E))),
                  shape = RoundedCornerShape(14.dp)
                ),
              contentAlignment = Alignment.Center
            ) {
              Text("M", color = Color.White, fontWeight = FontWeight.Black, fontSize = 22.sp)
            }
            Column {
              Text(
                "MARS CASHFLOW",
                fontWeight = FontWeight.Black,
                fontSize = 16.sp,
                color = MarsInk,
                lineHeight = 18.sp
              )
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                Box(
                  modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(if (isDemoMode) MarsAccent else MarsGreen)
                )
                Text(
                  if (isDemoMode) "SANDBOX ENVIRONMENT" else "UGANDA MASTER LEDGER",
                  fontWeight = FontWeight.Bold,
                  fontSize = 9.sp,
                  color = if (isDemoMode) MarsDark else MarsGreen,
                  letterSpacing = 1.1.sp
                )
              }
            }
          }

          // Top Actions: Workspace Selector & Cloud Sync
          Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              onClick = { onNavigate("multi_role_selection") },
              shape = RoundedCornerShape(10.dp),
              color = MarsSurfaceLight,
              border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.35f)),
              modifier = Modifier.testTag("workspace_selector_btn")
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                Text("🔀", fontSize = 11.sp)
                Text(
                  currentWorkspace?.role ?: "Workspace",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = MarsInk
                )
              }
            }

            IconButton(
              onClick = {
                viewModel.triggerSync { _, msg ->
                  Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                }
              },
              modifier = Modifier
                .size(38.dp)
                .background(Color.White, CircleShape)
                .testTag("sync_action_btn")
            ) {
              Icon(
                imageVector = if (syncStatus == SyncEngine.SyncStatus.SYNCING) Icons.Default.Sync else Icons.Default.CloudDone,
                contentDescription = "Sync Cloud & Offline DB",
                tint = if (syncStatus == SyncEngine.SyncStatus.SYNCING) MarsAccent else MarsGreen,
                modifier = Modifier.size(20.dp)
              )
            }
          }
        }

        // Active Logged In Session Pill
        if (currentUser != null) {
          Surface(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 20.dp, vertical = 2.dp),
            shape = RoundedCornerShape(10.dp),
            color = Color(0xFFE6EFEA)
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Text("👤", fontSize = 12.sp)
                Text(
                  text = "${currentUser?.displayName ?: "User"} (${currentUser?.primaryRole ?: "MANAGER"})",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = MarsInk
                )
              }
              TextButton(
                onClick = { viewModel.logout { onNavigate("login") } },
                contentPadding = PaddingValues(0.dp)
              ) {
                Text("Sign Out", fontSize = 11.sp, color = MarsRed, fontWeight = FontWeight.Bold)
              }
            }
          }
        }
      }
    },
    bottomBar = {
      Surface(
        modifier = Modifier
          .fillMaxWidth()
          .navigationBarsPadding(),
        color = Color.White,
        tonalElevation = 8.dp,
        shadowElevation = 8.dp
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .height(68.dp)
            .padding(horizontal = 12.dp),
          horizontalArrangement = Arrangement.SpaceAround,
          verticalAlignment = Alignment.CenterVertically
        ) {
          BottomNavItem(icon = "📊", label = "Dashboard", selected = true, onClick = { })
          BottomNavItem(icon = "👑", label = "Landlord", selected = false, onClick = { onNavigate("landlord") })
          BottomNavItem(icon = "👨🏾💼", label = "Caretaker", selected = false, onClick = { onNavigate("caretaker") })
          BottomNavItem(icon = "👤", label = "Tenant", selected = false, onClick = { onNavigate("tenant") })
          BottomNavItem(icon = "📜", label = "Audit", selected = false, onClick = { onNavigate("timeline") })
        }
      }
    },
    containerColor = MarsBg
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 16.dp, vertical = 12.dp),
      verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {

      // Notification / Feedback Banner
      AnimatedVisibility(
        visible = reminderFeedbackMessage != null,
        enter = fadeIn(),
        exit = fadeOut()
      ) {
        Surface(
          shape = RoundedCornerShape(12.dp),
          color = MarsGreen.copy(alpha = 0.12f),
          border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.4f)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(8.dp),
              modifier = Modifier.weight(1f)
            ) {
              Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MarsGreen, modifier = Modifier.size(18.dp))
              Text(
                reminderFeedbackMessage ?: "",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = MarsInk
              )
            }
            IconButton(
              onClick = { reminderFeedbackMessage = null },
              modifier = Modifier.size(24.dp)
            ) {
              Icon(Icons.Default.Close, contentDescription = "Dismiss", tint = MarsMuted, modifier = Modifier.size(16.dp))
            }
          }
        }
      }

      // Smart Onboarding Guide for Clean Production Databases
      if (properties.isEmpty()) {
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = MarsSurfaceLight),
          border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.35f)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              Box(
                modifier = Modifier.size(36.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
              ) {
                Text("🚀", fontSize = 16.sp)
              }
              Column {
                Text("Welcome to MARS Cashflow", fontWeight = FontWeight.Black, fontSize = 14.sp, color = MarsInk)
                Text("Set up your property portfolio and rental ledgers", fontSize = 11.sp, color = MarsMuted)
              }
            }
            Text(
              "Your ledger is clean and ready. Follow these 3 easy steps to start tracking rental cashflow:",
              fontSize = 12.sp,
              color = MarsInk
            )
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
              Text("1. 🏢 Register your properties and total units in portfolio", fontSize = 11.sp, color = MarsInk, fontWeight = FontWeight.Medium)
              Text("2. 👤 Add tenants, phone contacts, and monthly expected rent", fontSize = 11.sp, color = MarsInk, fontWeight = FontWeight.Medium)
              Text("3. 💵 Record cash or Mobile Money payments to issue instant receipts", fontSize = 11.sp, color = MarsInk, fontWeight = FontWeight.Medium)
            }
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              Button(
                onClick = { onNavigate("landlord") },
                colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f)
              ) {
                Text("🏢 Add Property", fontSize = 11.sp, fontWeight = FontWeight.Bold)
              }
              OutlinedButton(
                onClick = {
                  viewModel.loadSandboxDemoData {
                    reminderFeedbackMessage = "Sample sandbox portfolio loaded for testing."
                  }
                },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White),
                modifier = Modifier.weight(1f)
              ) {
                Text("🧪 Load Demo", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
              }
            }
          }
        }
      }

      // Filter Chips (Property & Timeframe)
      Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        LazyRow(
          horizontalArrangement = Arrangement.spacedBy(8.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          val propFilters = listOf("All Properties") + properties.map { it.name }
          items(propFilters) { propName ->
            val isSelected = selectedPropertyFilter == propName
            FilterChip(
              selected = isSelected,
              onClick = { selectedPropertyFilter = propName },
              label = {
                Text(
                  propName,
                  fontSize = 11.sp,
                  fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                )
              },
              colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = MarsDark,
                selectedLabelColor = Color.White,
                containerColor = Color.White,
                labelColor = MarsInk
              ),
              border = BorderStroke(1.dp, if (isSelected) MarsDark else Color(0xFFDFE8E3)),
              shape = RoundedCornerShape(10.dp)
            )
          }
        }
      }

      // ==========================================
      // 1. TOTAL RENT COLLECTED SUMMARY CARD
      // ==========================================
      Card(
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = MarsDark),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("total_rent_collected_card")
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          // Card Header
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              Box(
                modifier = Modifier
                  .size(34.dp)
                  .background(MarsGreen.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  Icons.Default.AccountBalanceWallet,
                  contentDescription = null,
                  tint = MarsAccent,
                  modifier = Modifier.size(20.dp)
                )
              }
              Column {
                Text(
                  "TOTAL RENT COLLECTED",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = MarsAccent,
                  letterSpacing = 1.2.sp
                )
                Text(
                  "Verified Ledger Inflow",
                  fontSize = 10.sp,
                  color = Color(0xFF9FB2A9)
                )
              }
            }

            Surface(
              shape = RoundedCornerShape(8.dp),
              color = MarsGreen
            ) {
              Text(
                "${filteredPayments.count { it.paymentStatus == "SUCCESSFUL" }} Receipts",
                fontSize = 10.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }

          // Primary Big Figure Display
          Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
              text = "UGX ${formatMoney(totalCollected)}",
              fontSize = 28.sp,
              fontWeight = FontWeight.Black,
              color = Color.White,
              lineHeight = 32.sp
            )
            Text(
              text = "Target Monthly Inflow: UGX ${formatMoney(totalExpectedRent)}",
              fontSize = 11.sp,
              color = Color(0xFFC5D7CE),
              fontWeight = FontWeight.Medium
            )
          }

          // Progress Bar & Percentage
          Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            LinearProgressIndicator(
              progress = { collectionRate },
              modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(CircleShape),
              color = MarsGreen,
              trackColor = Color(0xFF20322A),
            )
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Text(
                "${(collectionRate * 100).toInt()}% collected of expected rent",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MarsAccent
              )
              Text(
                "Occupancy: $occupancyRate%",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF9FB2A9)
              )
            }
          }

          HorizontalDivider(color = Color(0xFF263D33))

          // Card Action Buttons
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Button(
              onClick = { showRecordPaymentDialog = true },
              colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
              shape = RoundedCornerShape(10.dp),
              modifier = Modifier
                .weight(1f)
                .testTag("record_rent_btn"),
              contentPadding = PaddingValues(vertical = 8.dp)
            ) {
              Icon(Icons.Default.AddCircleOutline, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Record Payment", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }

            OutlinedButton(
              onClick = { onNavigate("income_expense_chart") },
              colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
              border = BorderStroke(1.dp, Color(0xFF38574A)),
              shape = RoundedCornerShape(10.dp),
              modifier = Modifier.weight(1f),
              contentPadding = PaddingValues(vertical = 8.dp)
            ) {
              Icon(Icons.Default.BarChart, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Trends Chart", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
          }
        }
      }

      // ==========================================
      // 2. PENDING ARREARS SUMMARY CARD
      // ==========================================
      Card(
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.5.dp, if (totalPendingArrears > 0L) MarsRed.copy(alpha = 0.35f) else Color(0xFFDFE8E3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("pending_arrears_summary_card")
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          // Card Header
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              Box(
                modifier = Modifier
                  .size(34.dp)
                  .background(MarsRed.copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  Icons.Default.WarningAmber,
                  contentDescription = null,
                  tint = MarsRed,
                  modifier = Modifier.size(20.dp)
                )
              }
              Column {
                Text(
                  "PENDING ARREARS",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Black,
                  color = MarsRed,
                  letterSpacing = 1.1.sp
                )
                Text(
                  "Overdue Rent Balances",
                  fontSize = 10.sp,
                  color = MarsMuted
                )
              }
            }

            Surface(
              shape = RoundedCornerShape(8.dp),
              color = if (totalPendingArrears > 0L) MarsRed.copy(alpha = 0.15f) else MarsSurfaceLight,
              border = BorderStroke(1.dp, if (totalPendingArrears > 0L) MarsRed.copy(alpha = 0.4f) else MarsGreen.copy(alpha = 0.4f))
            ) {
              Text(
                text = if (totalPendingArrears > 0L) "⚠️ ${tenantsInArrears.size} Units Overdue" else "✅ All Clear",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = if (totalPendingArrears > 0L) MarsRed else MarsGreen,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }

          // Primary Big Figure Display
          Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
              text = "UGX ${formatMoney(totalPendingArrears)}",
              fontSize = 28.sp,
              fontWeight = FontWeight.Black,
              color = if (totalPendingArrears > 0L) MarsRed else MarsInk,
              lineHeight = 32.sp
            )
            Text(
              text = if (tenantsInArrears.isNotEmpty()) {
                "${tenantsInArrears.size} tenant(s) currently carry outstanding rent balances"
              } else {
                "No pending rent arrears. Full collection achieved."
              },
              fontSize = 11.sp,
              color = MarsMuted,
              fontWeight = FontWeight.Medium
            )
          }

          // Micro Breakdown Row
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .background(MarsBg, RoundedCornerShape(12.dp))
              .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column {
              Text("Average Arrears / Unit", fontSize = 10.sp, color = MarsMuted)
              val avgArrears = if (tenantsInArrears.isNotEmpty()) totalPendingArrears / tenantsInArrears.size else 0L
              Text(
                "UGX ${formatMoney(avgArrears)}",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = MarsInk
              )
            }
            Column(horizontalAlignment = Alignment.End) {
              Text("Arrears Ratio", fontSize = 10.sp, color = MarsMuted)
              val arrearsRatio = if (totalExpectedRent > 0L) ((totalPendingArrears.toFloat() / totalExpectedRent.toFloat()) * 100).toInt() else 0
              Text(
                "$arrearsRatio% of Expected",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = MarsRed
              )
            }
          }

          // Action Buttons: Send Reminders & Tenant Arrears List
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Button(
              onClick = {
                if (tenantsInArrears.isNotEmpty()) {
                  showBatchReminderDialog = true
                } else {
                  Toast.makeText(context, "No tenants currently owe rent arrears.", Toast.LENGTH_SHORT).show()
                }
              },
              enabled = tenantsInArrears.isNotEmpty(),
              colors = ButtonDefaults.buttonColors(
                containerColor = MarsRed,
                disabledContainerColor = Color(0xFFE2E8F0)
              ),
              shape = RoundedCornerShape(10.dp),
              modifier = Modifier
                .weight(1f)
                .testTag("send_reminders_btn"),
              contentPadding = PaddingValues(vertical = 8.dp)
            ) {
              Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null, modifier = Modifier.size(15.dp))
              Spacer(Modifier.width(6.dp))
              Text("Send SMS Reminders", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }

            OutlinedButton(
              onClick = { onNavigate("tenant_payment_status") },
              shape = RoundedCornerShape(10.dp),
              border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
              modifier = Modifier.weight(1f),
              contentPadding = PaddingValues(vertical = 8.dp)
            ) {
              Icon(Icons.AutoMirrored.Filled.ListAlt, contentDescription = null, modifier = Modifier.size(15.dp), tint = MarsInk)
              Spacer(Modifier.width(6.dp))
              Text("Status Matrix", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MarsInk)
            }
          }
        }
      }

      // ==========================================
      // 3. NET CASHFLOW & EXPENSE METRIC STRIP
      // ==========================================
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        // Operating Expenses Metric
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
          modifier = Modifier
            .weight(1f)
            .clickable { onNavigate("expenses") }
        ) {
          Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Text("📉", fontSize = 12.sp)
              Text("Expenses", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsMuted)
            }
            Text(
              "UGX ${formatUgxShort(totalOperatingExpenses)}",
              fontSize = 15.sp,
              fontWeight = FontWeight.Black,
              color = MarsInk
            )
            Text(
              "${filteredExpenses.size} Approved",
              fontSize = 9.sp,
              color = MarsMuted
            )
          }
        }

        // Net Operating Cashflow Metric
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(
            containerColor = if (netOperatingCashflow >= 0) MarsSurfaceLight else MarsRed.copy(alpha = 0.1f)
          ),
          border = BorderStroke(
            1.dp,
            if (netOperatingCashflow >= 0) MarsGreen.copy(alpha = 0.4f) else MarsRed.copy(alpha = 0.4f)
          ),
          modifier = Modifier.weight(1f)
        ) {
          Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Text(if (netOperatingCashflow >= 0) "💰" else "⚠️", fontSize = 12.sp)
              Text(
                "Net Cashflow",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (netOperatingCashflow >= 0) MarsDark else MarsRed
              )
            }
            Text(
              "UGX ${formatUgxShort(netOperatingCashflow)}",
              fontSize = 15.sp,
              fontWeight = FontWeight.Black,
              color = if (netOperatingCashflow >= 0) MarsGreen else MarsRed
            )
            Text(
              "Inflow - Outflow",
              fontSize = 9.sp,
              color = MarsMuted
            )
          }
        }
      }

      // ==========================================
      // 4. OVERDUE TENANTS WATCHLIST
      // ==========================================
      if (tenantsInArrears.isNotEmpty()) {
        Surface(
          shape = RoundedCornerShape(18.dp),
          color = Color.White,
          border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Text("🔴", fontSize = 12.sp)
                Text(
                  "Arrears Action Queue (${tenantsInArrears.size})",
                  fontWeight = FontWeight.Black,
                  fontSize = 13.sp,
                  color = MarsInk
                )
              }
              TextButton(
                onClick = { onNavigate("landlord") },
                contentPadding = PaddingValues(0.dp)
              ) {
                Text("Full List →", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsGreen)
              }
            }

            tenantsInArrears.take(4).forEach { tenant ->
              Surface(
                shape = RoundedCornerShape(12.dp),
                color = MarsBg,
                border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
                modifier = Modifier.fillMaxWidth()
              ) {
                Row(
                  modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Column(modifier = Modifier.weight(1f)) {
                    Text(
                      tenant.name,
                      fontSize = 13.sp,
                      fontWeight = FontWeight.Bold,
                      color = MarsInk
                    )
                    Text(
                      "${tenant.propertyName} • ${tenant.unitName} (${tenant.phone})",
                      fontSize = 10.sp,
                      color = MarsMuted
                    )
                    Spacer(Modifier.height(2.dp))
                    Text(
                      "Owed: UGX ${formatMoney(tenant.arrears)}",
                      fontSize = 12.sp,
                      fontWeight = FontWeight.Black,
                      color = MarsRed
                    )
                  }

                  Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(
                      onClick = {
                        viewModel.sendTenantReminder(
                          tenantName = tenant.name,
                          tenantPhone = tenant.phone,
                          amountDue = tenant.arrears,
                          propertyName = tenant.propertyName,
                          unitName = tenant.unitName
                        ) {
                          reminderFeedbackMessage = "SMS Reminder dispatched to ${tenant.name} (${tenant.phone})."
                        }
                      },
                      modifier = Modifier
                        .size(34.dp)
                        .background(MarsRed.copy(alpha = 0.12f), RoundedCornerShape(8.dp))
                    ) {
                      Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Remind", tint = MarsRed, modifier = Modifier.size(16.dp))
                    }

                    IconButton(
                      onClick = {
                        selectedTenantForPayment = tenant
                        showRecordPaymentDialog = true
                      },
                      modifier = Modifier
                        .size(34.dp)
                        .background(MarsGreen.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                    ) {
                      Icon(Icons.AutoMirrored.Filled.ReceiptLong, contentDescription = "Record Payment", tint = MarsGreen, modifier = Modifier.size(16.dp))
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        Surface(
          shape = RoundedCornerShape(18.dp),
          color = Color.White,
          border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Box(
              modifier = Modifier
                .size(38.dp)
                .background(MarsGreen.copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("✅", fontSize = 18.sp)
            }
            Column {
              Text(
                if (tenants.isEmpty()) "No Tenant Arrears" else "All Accounts In Good Standing",
                fontSize = 13.sp,
                fontWeight = FontWeight.Black,
                color = MarsInk
              )
              Text(
                if (tenants.isEmpty()) "Register tenants in your properties to track rent balances and collection rates." else "Zero overdue balances. All tenants are up to date on their rent.",
                fontSize = 11.sp,
                color = MarsMuted
              )
            }
          }
        }
      }

      // ==========================================
      // 5. OPERATIONAL SHORTCUTS HUB
      // ==========================================
      Text("Operations & Management Hub", fontWeight = FontWeight.Black, fontSize = 13.sp, color = MarsInk)

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        QuickActionButton(icon = "👑", label = "Landlord", modifier = Modifier.weight(1f), onClick = { onNavigate("landlord") })
        QuickActionButton(icon = "👨🏾💼", label = "Caretaker", modifier = Modifier.weight(1f), onClick = { onNavigate("caretaker") })
        QuickActionButton(icon = "👤", label = "Tenant", modifier = Modifier.weight(1f), onClick = { onNavigate("tenant") })
        QuickActionButton(icon = "🔧", label = "Vendors", modifier = Modifier.weight(1f), onClick = { onNavigate("service_providers") })
      }

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        QuickActionButton(icon = "📉", label = "Expenses", modifier = Modifier.weight(1f), onClick = { onNavigate("expenses") })
        QuickActionButton(icon = "🛠️", label = "Repairs", modifier = Modifier.weight(1f), onClick = { onNavigate("maintenance") })
        QuickActionButton(icon = "📷", label = "OCR Scan", modifier = Modifier.weight(1f), onClick = { onNavigate("document_scanner") })
        QuickActionButton(icon = "📄", label = "PDF Export", modifier = Modifier.weight(1f), onClick = { onNavigate("pdf_export") })
      }

      // ==========================================
      // 6. RECENT VERIFIED PAYMENTS STREAM
      // ==========================================
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = Color.White,
        border = BorderStroke(1.dp, Color(0xFFDFE8E3))
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              "Recent Ledger Payments",
              fontSize = 13.sp,
              fontWeight = FontWeight.Black,
              color = MarsInk
            )
            TextButton(onClick = { onNavigate("timeline") }) {
              Text("Audit Trail →", color = MarsGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
          }

          if (filteredPayments.isEmpty()) {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
              contentAlignment = Alignment.Center
            ) {
              Text("No payment transactions recorded yet.", color = MarsMuted, fontSize = 12.sp)
            }
          } else {
            filteredPayments.take(4).forEach { payment ->
              Surface(
                shape = RoundedCornerShape(12.dp),
                color = MarsBg,
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                modifier = Modifier
                  .fillMaxWidth()
                  .clickable { onNavigate("receipt/${payment.id}") }
              ) {
                Row(
                  modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Box(
                      modifier = Modifier
                        .size(36.dp)
                        .background(MarsGreen.copy(alpha = 0.15f), RoundedCornerShape(10.dp)),
                      contentAlignment = Alignment.Center
                    ) {
                      Text(
                        when {
                          payment.paymentMethod.contains("MTN", ignoreCase = true) -> "🟡"
                          payment.paymentMethod.contains("Airtel", ignoreCase = true) -> "🔴"
                          else -> "🏦"
                        },
                        fontSize = 14.sp
                      )
                    }
                    Column {
                      Text(
                        payment.tenantName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = MarsInk
                      )
                      Text(
                        "${payment.propertyName} • ${payment.unitName} (${payment.paymentMethod})",
                        fontSize = 10.sp,
                        color = MarsMuted
                      )
                    }
                  }

                  Column(horizontalAlignment = Alignment.End) {
                    Text(
                      "+UGX ${formatMoney(payment.amount)}",
                      fontWeight = FontWeight.Black,
                      fontSize = 13.sp,
                      color = MarsGreen
                    )
                    Text(
                      payment.date,
                      fontSize = 9.sp,
                      color = MarsMuted
                    )
                  }
                }
              }
            }
          }
        }
      }

      Spacer(Modifier.height(16.dp))
    }
  }

  // ==========================================
  // RECORD RENT PAYMENT MODAL DIALOG
  // ==========================================
  if (showRecordPaymentDialog) {
    var selectedTenantName by remember {
      mutableStateOf(selectedTenantForPayment?.name ?: tenants.firstOrNull()?.name ?: "")
    }
    var amountInput by remember {
      mutableStateOf(
        selectedTenantForPayment?.let { if (it.arrears > 0) it.arrears.toString() else it.monthlyRent.toString() }
          ?: "1200000"
      )
    }
    var selectedMethod by remember { mutableStateOf("MTN Mobile Money") }
    var notesInput by remember { mutableStateOf("Rent Collection via Main Dashboard") }
    var isSubmitting by remember { mutableStateOf(false) }

    val matchedTenant = remember(selectedTenantName, tenants) {
      tenants.find { it.name.equals(selectedTenantName, ignoreCase = true) }
    }

    AlertDialog(
      onDismissRequest = {
        if (!isSubmitting) {
          showRecordPaymentDialog = false
          selectedTenantForPayment = null
        }
      },
      title = {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Box(
            modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
          ) {
            Icon(Icons.Default.Receipt, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
          }
          Text("Record Rent Payment", fontWeight = FontWeight.Black, fontSize = 16.sp)
        }
      },
      text = {
        Column(
          modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState()),
          verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Text("Select Tenant & Unit:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)

          LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(tenants) { t ->
              val isChosen = selectedTenantName == t.name
              Surface(
                onClick = {
                  selectedTenantName = t.name
                  amountInput = if (t.arrears > 0) t.arrears.toString() else t.monthlyRent.toString()
                },
                shape = RoundedCornerShape(8.dp),
                color = if (isChosen) MarsDark else MarsSurfaceLight,
                border = BorderStroke(1.dp, if (isChosen) MarsDark else MarsGreen.copy(alpha = 0.4f))
              ) {
                Text(
                  "${t.name} (${t.unitName})",
                  color = if (isChosen) Color.White else MarsInk,
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                )
              }
            }
          }

          if (matchedTenant != null) {
            Surface(
              shape = RoundedCornerShape(8.dp),
              color = MarsBg,
              modifier = Modifier.fillMaxWidth()
            ) {
              Column(modifier = Modifier.padding(8.dp)) {
                Text("Property: ${matchedTenant.propertyName} (${matchedTenant.unitName})", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text(
                  "Arrears Owed: UGX ${formatMoney(matchedTenant.arrears)} | Monthly: UGX ${formatMoney(matchedTenant.monthlyRent)}",
                  fontSize = 10.sp,
                  color = if (matchedTenant.arrears > 0) MarsRed else MarsGreen,
                  fontWeight = FontWeight.SemiBold
                )
              }
            }
          }

          OutlinedTextField(
            value = amountInput,
            onValueChange = { amountInput = it },
            label = { Text("Payment Amount (UGX)") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
          )

          Text("Payment Channel:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsInk)
          val methods = listOf("MTN Mobile Money", "Airtel Money", "Bank Transfer", "Cash")
          LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(methods) { m ->
              val isSel = selectedMethod == m
              FilterChip(
                selected = isSel,
                onClick = { selectedMethod = m },
                label = { Text(m, fontSize = 10.sp) },
                shape = RoundedCornerShape(8.dp)
              )
            }
          }

          OutlinedTextField(
            value = notesInput,
            onValueChange = { notesInput = it },
            label = { Text("Notes / Voucher Reference") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
          )
        }
      },
      confirmButton = {
        Button(
          onClick = {
            val amountNum = amountInput.toLongOrNull() ?: 0L
            if (amountNum <= 0L) {
              Toast.makeText(context, "Please enter a valid amount.", Toast.LENGTH_SHORT).show()
              return@Button
            }
            if (matchedTenant == null) {
              Toast.makeText(context, "Please select a valid tenant.", Toast.LENGTH_SHORT).show()
              return@Button
            }

            isSubmitting = true
            viewModel.recordPayment(
              tenantName = matchedTenant.name,
              unitName = matchedTenant.unitName,
              propertyName = matchedTenant.propertyName,
              amount = amountNum,
              method = selectedMethod,
              payerPhone = matchedTenant.phone,
              caretaker = currentUser?.displayName ?: "Manager",
              notes = notesInput
            ) { paymentId ->
              isSubmitting = false
              showRecordPaymentDialog = false
              selectedTenantForPayment = null
              Toast.makeText(context, "Payment recorded! Receipt: $paymentId", Toast.LENGTH_SHORT).show()
              reminderFeedbackMessage = "Successfully recorded UGX ${formatMoney(amountNum)} for ${matchedTenant.name}."
            }
          },
          enabled = !isSubmitting,
          colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
          shape = RoundedCornerShape(10.dp)
        ) {
          if (isSubmitting) {
            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
          } else {
            Text("Confirm & Record", fontWeight = FontWeight.Bold)
          }
        }
      },
      dismissButton = {
        TextButton(
          onClick = {
            showRecordPaymentDialog = false
            selectedTenantForPayment = null
          },
          enabled = !isSubmitting
        ) {
          Text("Cancel", color = MarsMuted)
        }
      }
    )
  }

  // ==========================================
  // BATCH REMINDER CONFIRMATION DIALOG
  // ==========================================
  if (showBatchReminderDialog) {
    AlertDialog(
      onDismissRequest = { showBatchReminderDialog = false },
      title = {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("📢", fontSize = 16.sp)
          Text("Send Overdue Rent Alerts", fontWeight = FontWeight.Black, fontSize = 16.sp)
        }
      },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text(
            "Send SMS rent payment reminders to all ${tenantsInArrears.size} tenants who have outstanding balances?",
            fontSize = 13.sp,
            color = MarsInk
          )
          Text(
            "Total Arrears Target: UGX ${formatMoney(totalPendingArrears)}",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = MarsRed
          )
        }
      },
      confirmButton = {
        Button(
          onClick = {
            showBatchReminderDialog = false
            tenantsInArrears.forEach { t ->
              viewModel.sendTenantReminder(
                tenantName = t.name,
                tenantPhone = t.phone,
                amountDue = t.arrears,
                propertyName = t.propertyName,
                unitName = t.unitName
              )
            }
            reminderFeedbackMessage = "Dispatched SMS reminders to all ${tenantsInArrears.size} overdue tenants."
          },
          colors = ButtonDefaults.buttonColors(containerColor = MarsRed),
          shape = RoundedCornerShape(10.dp)
        ) {
          Text("Send All Reminders", fontWeight = FontWeight.Bold)
        }
      },
      dismissButton = {
        TextButton(onClick = { showBatchReminderDialog = false }) {
          Text("Cancel", color = MarsMuted)
        }
      }
    )
  }
}

@Composable
fun BottomNavItem(icon: String, label: String, selected: Boolean, onClick: () -> Unit) {
  Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center,
    modifier = Modifier
      .clip(RoundedCornerShape(12.dp))
      .clickable(onClick = onClick)
      .padding(horizontal = 10.dp, vertical = 6.dp)
  ) {
    Text(icon, fontSize = 20.sp)
    Spacer(Modifier.height(2.dp))
    Text(
      label,
      fontSize = 10.sp,
      fontWeight = if (selected) FontWeight.Black else FontWeight.Medium,
      color = if (selected) MarsGreen else MarsMuted
    )
  }
}

@Composable
fun QuickActionButton(icon: String, label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
  Surface(
    onClick = onClick,
    shape = RoundedCornerShape(14.dp),
    color = Color.White,
    border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
    modifier = modifier.height(68.dp)
  ) {
    Column(
      modifier = Modifier.fillMaxSize().padding(6.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center
    ) {
      Text(icon, fontSize = 18.sp)
      Spacer(Modifier.height(3.dp))
      Text(
        label,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        color = MarsInk,
        maxLines = 1
      )
    }
  }
}

