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
fun LandlordDashboardScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val properties by viewModel.properties.collectAsState()
  val tenants by viewModel.tenants.collectAsState()
  val payments by viewModel.payments.collectAsState()
  val expenses by viewModel.expenses.collectAsState()

  val totalCollected = payments.sumOf { it.amount }
  val totalExpenses = expenses.sumOf { it.amount }
  val totalArrears = tenants.sumOf { it.arrears }
  val netCash = totalCollected - totalExpenses

  var showAddPropertyDialog by remember { mutableStateOf(false) }
  var newPropName by remember { mutableStateOf("") }
  var newPropLoc by remember { mutableStateOf("") }
  var newPropUnits by remember { mutableStateOf("10") }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("🏢", fontSize = 14.sp)
            }
            Text("Landlord Dashboard", fontWeight = FontWeight.Black, fontSize = 18.sp)
          }
        },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
          }
        },
        actions = {
          Button(
            onClick = { onNavigate("tenant") },
            colors = ButtonDefaults.buttonColors(containerColor = MarsSurfaceLight),
            shape = RoundedCornerShape(10.dp),
            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
          ) {
            Text("👤", fontSize = 12.sp)
            Spacer(Modifier.width(4.dp))
            Text("Tenant View", color = MarsInk, fontSize = 11.sp, fontWeight = FontWeight.Bold)
          }
          Spacer(Modifier.width(8.dp))
          Button(
            onClick = { showAddPropertyDialog = true },
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
            shape = RoundedCornerShape(10.dp),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
          ) {
            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(4.dp))
            Text("Property", fontSize = 12.sp, fontWeight = FontWeight.Bold)
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
      var notificationMessage by remember { mutableStateOf<String?>(null) }
      var arrearsFilter by remember { mutableStateOf("All") }

      if (notificationMessage != null) {
        Card(
          colors = CardDefaults.cardColors(containerColor = MarsSurfaceLight),
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.3f))
        ) {
          Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Icon(Icons.Default.NotificationsActive, contentDescription = null, tint = MarsGreen)
            Text(
              notificationMessage ?: "",
              fontWeight = FontWeight.Bold,
              color = MarsInk,
              modifier = Modifier.weight(1f),
              fontSize = 13.sp
            )
          }
        }
      }

      // Summary Financial Card (Dark polished hero)
      Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MarsDark),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
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
            Column {
              Text(
                "PORTFOLIO PERFORMANCE",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = MarsAccent,
                letterSpacing = 1.sp
              )
              Spacer(Modifier.height(2.dp))
              Text(
                "Overall Financial Summary",
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                color = Color.White
              )
            }
            Surface(shape = RoundedCornerShape(8.dp), color = MarsGreen) {
              Text(
                "${properties.size} Properties",
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }

          HorizontalDivider(color = Color(0xFFFFFFFF14))

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            DarkMetricBox("Total Collected", formatUgx(totalCollected), Modifier.weight(1f), MarsAccent)
            DarkMetricBox("Arrears Owed", formatUgx(totalArrears), Modifier.weight(1f), MarsRed)
          }
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            DarkMetricBox("Expenses", formatUgx(totalExpenses), Modifier.weight(1f), Color.White)
            DarkMetricBox(
              "Net Cashflow",
              formatUgx(netCash),
              Modifier.weight(1f),
              MarsGreen
            )
          }
        }
      }

      // Timeline Quick Button Card
      Card(
        onClick = { onNavigate("timeline") },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MarsSurfaceLight),
        border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.3f))
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier.size(36.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("⏳", fontSize = 16.sp)
            }
            Column {
              Text("Property Activity Timeline", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsInk)
              Text("View historical move-ins, repair tickets & payments", fontSize = 11.sp, color = MarsMuted)
            }
          }
          Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MarsGreen)
        }
      }

      // Income & Expense Trend Chart Card
      Card(
        onClick = { onNavigate("income_expense_chart") },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MarsSurfaceLight),
        border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.3f))
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier.size(36.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("📈", fontSize = 16.sp)
            }
            Column {
              Text("Income & Expense Trend Charts", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsInk)
              Text("Analyze monthly financial performance & cashflows", fontSize = 11.sp, color = MarsMuted)
            }
          }
          Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MarsGreen)
        }
      }

      // PDF Export Report Card
      Card(
        onClick = { onNavigate("pdf_export") },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MarsSurfaceLight),
        border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.3f))
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier.size(36.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("📄", fontSize = 16.sp)
            }
            Column {
              Text("Export Financial PDF Reports", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsInk)
              Text("Generate tax-ready statements & itemized ledgers", fontSize = 11.sp, color = MarsMuted)
            }
          }
          Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MarsGreen)
        }
      }

      // Monthly Budget Planner Card
      Card(
        onClick = { onNavigate("monthly_budget") },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MarsSurfaceLight),
        border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.3f))
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier.size(36.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("🧮", fontSize = 16.sp)
            }
            Column {
              Text("Monthly Budget & Cashflow Planner", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsInk)
              Text("Forecast rental income and plan expected expenses", fontSize = 11.sp, color = MarsMuted)
            }
          }
          Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MarsGreen)
        }
      }

      // Tenant Payment Status Tracker Card
      Card(
        onClick = { onNavigate("tenant_payment_status") },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MarsSurfaceLight),
        border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.3f))
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier.size(36.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("📋", fontSize = 16.sp)
            }
            Column {
              Text("Tenant Monthly Payment Tracker (Room DB)", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsInk)
              Text("Track Paid, Pending, & Overdue rent statuses", fontSize = 11.sp, color = MarsMuted)
            }
          }
          Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MarsGreen)
        }
      }

      // Properties List
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text("Your Properties", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MarsInk)
        TextButton(onClick = { showAddPropertyDialog = true }) {
          Text("+ Add Property", color = MarsGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
        }
      }

      if (properties.isEmpty()) {
        Card(
          shape = RoundedCornerShape(18.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            Box(
              modifier = Modifier.size(48.dp).background(MarsSurfaceLight, RoundedCornerShape(12.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("🏢", fontSize = 22.sp)
            }
            Text(
              "No Properties in Portfolio Yet",
              fontWeight = FontWeight.Black,
              fontSize = 15.sp,
              color = MarsInk
            )
            Text(
              "Register your first building or apartment block to start tracking occupancy, tenant rent roll, and arrears.",
              fontSize = 12.sp,
              color = MarsMuted,
              textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
            Button(
              onClick = { showAddPropertyDialog = true },
              colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
              shape = RoundedCornerShape(10.dp)
            ) {
              Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Register First Property", fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
          }
        }
      } else {
        properties.forEach { prop ->
          val propTenants = tenants.filter { it.propertyName == prop.name }
          val propCollected = payments.filter { it.propertyName == prop.name }.sumOf { it.amount }
          val propArrears = propTenants.sumOf { it.arrears }

          Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MarsCard),
            border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
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
                Column {
                  Text(prop.name, fontSize = 16.sp, fontWeight = FontWeight.Black, color = MarsInk)
                  Text(prop.location, fontSize = 12.sp, color = MarsMuted)
                }
                Surface(shape = RoundedCornerShape(8.dp), color = MarsSurfaceLight) {
                  Text(
                    "${propTenants.size} / ${prop.totalUnits} Units",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MarsGreen,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                  )
                }
              }
              HorizontalDivider(color = Color(0xFFEDF2F0))
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
              ) {
                Column {
                  Text("Collected", fontSize = 10.sp, color = MarsMuted, fontWeight = FontWeight.Bold)
                  Text(formatUgxShort(propCollected), fontSize = 14.sp, fontWeight = FontWeight.Black, color = MarsGreen)
                }
                Column(horizontalAlignment = Alignment.End) {
                  Text("Arrears", fontSize = 10.sp, color = MarsMuted, fontWeight = FontWeight.Bold)
                  Text(
                    formatUgxShort(propArrears),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Black,
                    color = if (propArrears > 0) MarsRed else MarsMuted
                  )
                }
              }
            }
          }
        }
      }

      // Tenants & Arrears Tracker
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text("Tenant Arrears & Status", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MarsInk)
        if (tenants.any { it.arrears > 0 }) {
          TextButton(
            onClick = {
              val arrearsTenants = tenants.filter { it.arrears > 0 }
              arrearsTenants.forEach { t ->
                viewModel.sendTenantReminder(
                  tenantName = t.name,
                  tenantPhone = t.phone,
                  amountDue = t.arrears,
                  propertyName = t.propertyName,
                  unitName = t.unitName
                )
              }
              notificationMessage = "Dispatched ${arrearsTenants.size} in-app payment reminders to tenant ledgers."
            }
          ) {
            Text("📢 Notify All Arrears", color = MarsRed, fontWeight = FontWeight.Bold, fontSize = 11.sp)
          }
        }
      }

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        listOf("All", "Paid", "In Arrears").forEach { filter ->
          FilterChip(
            selected = arrearsFilter == filter,
            onClick = { arrearsFilter = filter },
            label = { Text(filter, fontSize = 11.sp) },
            shape = RoundedCornerShape(10.dp)
          )
        }
      }

      val filteredTenants = when (arrearsFilter) {
        "Paid" -> tenants.filter { it.paymentStatus == "Paid" }
        "In Arrears" -> tenants.filter { it.arrears > 0 || it.paymentStatus == "Overdue" }
        else -> tenants
      }

      if (filteredTenants.isEmpty()) {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3))
        ) {
          Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
            Text("No tenants match this filter.", color = MarsMuted)
          }
        }
      } else {
        filteredTenants.forEach { tenant ->
          Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MarsCard),
            border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
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
                Column(modifier = Modifier.weight(1f)) {
                  Text(tenant.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsInk)
                  Text("${tenant.propertyName} • ${tenant.unitName}", fontSize = 12.sp, color = MarsMuted)
                  Text("Phone: ${tenant.phone}", fontSize = 11.sp, color = MarsMuted)
                }
                Column(horizontalAlignment = Alignment.End) {
                  val statusColor =
                    when (tenant.paymentStatus) {
                      "Paid" -> MarsGreen
                      "Pending" -> MarsYellow
                      else -> MarsRed
                    }
                  Surface(shape = RoundedCornerShape(6.dp), color = statusColor.copy(alpha = 0.15f)) {
                    Text(
                      tenant.paymentStatus,
                      color = statusColor,
                      fontWeight = FontWeight.Bold,
                      fontSize = 11.sp,
                      modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                  }
                  if (tenant.arrears > 0) {
                    Spacer(Modifier.height(4.dp))
                    Text(
                      formatUgx(tenant.arrears),
                      fontSize = 12.sp,
                      color = MarsRed,
                      fontWeight = FontWeight.Black
                    )
                  }
                }
              }

              if (tenant.arrears > 0) {
                HorizontalDivider(color = Color(0xFFDFE8E3))
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                  OutlinedButton(
                    onClick = {
                      viewModel.sendTenantReminder(
                        tenantName = tenant.name,
                        tenantPhone = tenant.phone,
                        amountDue = tenant.arrears,
                        propertyName = tenant.propertyName,
                        unitName = tenant.unitName
                      )
                      notificationMessage = "Dispatched payment notice to ${tenant.name} (${tenant.phone}) for UGX ${formatMoney(tenant.arrears)}."
                    },
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(4.dp),
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Text("🔔 Send In-App Notice", fontSize = 11.sp)
                  }
                  Button(
                    onClick = {
                      viewModel.sendTenantReminder(
                        tenantName = tenant.name,
                        tenantPhone = tenant.phone,
                        amountDue = tenant.arrears,
                        propertyName = tenant.propertyName,
                        unitName = tenant.unitName
                      )
                      notificationMessage = "Urgent formal notice logged in audit ledger for ${tenant.name}."
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = MarsRed),
                    contentPadding = PaddingValues(4.dp),
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Text("🚨 Log Formal Notice", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if (showAddPropertyDialog) {
    AlertDialog(
      onDismissRequest = { showAddPropertyDialog = false },
      confirmButton = {
        Button(
          onClick = {
            if (newPropName.isNotBlank()) {
              viewModel.addProperty(newPropName, newPropLoc, newPropUnits.toIntOrNull() ?: 10)
              showAddPropertyDialog = false
              newPropName = ""
              newPropLoc = ""
            }
          },
          colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
          shape = RoundedCornerShape(12.dp)
        ) {
          Text("Add Property", fontWeight = FontWeight.Bold)
        }
      },
      dismissButton = {
        TextButton(onClick = { showAddPropertyDialog = false }) { Text("Cancel", color = MarsMuted) }
      },
      shape = RoundedCornerShape(24.dp),
      title = { Text("Add New Property", fontWeight = FontWeight.Black) },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          OutlinedTextField(
            value = newPropName,
            onValueChange = { newPropName = it },
            label = { Text("Property Name") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
          )
          OutlinedTextField(
            value = newPropLoc,
            onValueChange = { newPropLoc = it },
            label = { Text("Location (e.g. Ntinda, Kampala)") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
          )
          OutlinedTextField(
            value = newPropUnits,
            onValueChange = { newPropUnits = it },
            label = { Text("Total Units") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
          )
        }
      }
    )
  }
}

@Composable
fun DarkMetricBox(label: String, value: String, modifier: Modifier = Modifier, valueColor: Color = Color.White) {
  Box(
    modifier = modifier
      .background(Color(0xFF1B2923), RoundedCornerShape(16.dp))
      .padding(14.dp)
  ) {
    Column {
      Text(label, fontSize = 11.sp, color = Color(0xFFB7C5BF), fontWeight = FontWeight.Medium)
      Spacer(Modifier.height(4.dp))
      Text(
        value,
        fontSize = 15.sp,
        fontWeight = FontWeight.Black,
        color = valueColor,
        maxLines = 1
      )
    }
  }
}
