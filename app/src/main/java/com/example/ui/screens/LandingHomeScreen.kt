package com.example.ui.screens

import android.widget.Toast
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.SyncEngine
import com.example.ui.MarsViewModel
import com.example.ui.theme.*

@Composable
fun LandingHomeScreen(viewModel: MarsViewModel, onNavigate: (String) -> Unit) {
  val context = LocalContext.current
  val properties by viewModel.properties.collectAsState()
  val tenants by viewModel.tenants.collectAsState()
  val payments by viewModel.payments.collectAsState()
  val expenses by viewModel.expenses.collectAsState()
  val currentUser by viewModel.currentUser.collectAsState()
  val currentWorkspace by viewModel.currentWorkspace.collectAsState()
  val syncStatus by viewModel.syncStatus.collectAsState()
  val isDemoMode by viewModel.isDemoMode.collectAsState()

  val totalCollected = payments.filter { it.paymentStatus == "SUCCESSFUL" }.sumOf { it.amount }
  val totalExpenses = expenses.sumOf { it.amount }
  val totalOutstanding = tenants.sumOf { it.arrears }
  val netCashflow = totalCollected - totalExpenses

  val totalExpectedRent = tenants.sumOf { it.rentDue }
  val progressPercent = if (totalExpectedRent > 0) {
    (totalCollected.toFloat() / totalExpectedRent.toFloat()).coerceIn(0f, 1f)
  } else {
    0.85f
  }

  Scaffold(
    topBar = {
      Column(modifier = Modifier.fillMaxWidth().background(MarsBg)) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 14.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box(
              modifier = Modifier
                .size(40.dp)
                .background(MarsGreen, RoundedCornerShape(12.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("M", color = Color.White, fontWeight = FontWeight.Black, fontSize = 20.sp)
            }
            Column {
              Text("MARS CASHFLOW", fontWeight = FontWeight.Black, fontSize = 16.sp, color = MarsInk, lineHeight = 16.sp)
              Text(
                if (isDemoMode) "DEMO SANDBOX" else "PRODUCTION LEDGER",
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                color = if (isDemoMode) MarsAccent else MarsGreen,
                letterSpacing = 1.2.sp
              )
            }
          }

          Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            // Workspace Button
            Surface(
              onClick = { onNavigate("multi_role_selection") },
              shape = RoundedCornerShape(10.dp),
              color = MarsSurfaceLight,
              border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.3f))
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                Text("🔀", fontSize = 12.sp)
                Text(
                  currentWorkspace?.role ?: "Workspace",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  color = MarsInk
                )
              }
            }

            // Sync Button
            IconButton(
              onClick = {
                viewModel.triggerSync { success, msg ->
                  Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                }
              },
              modifier = Modifier.size(36.dp)
            ) {
              Icon(
                if (syncStatus == SyncEngine.SyncStatus.SYNCING) Icons.Default.Sync else Icons.Default.CloudDone,
                contentDescription = "Sync",
                tint = if (syncStatus == SyncEngine.SyncStatus.SYNCING) MarsAccent else MarsGreen
              )
            }
          }
        }

        // Active Session Badge
        if (currentUser != null) {
          Surface(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 2.dp),
            shape = RoundedCornerShape(8.dp),
            color = Color(0xFFE8F1EC)
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                "Logged in as: ${currentUser?.displayName ?: "User"}",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MarsInk
              )
              TextButton(
                onClick = {
                  viewModel.logout { onNavigate("login") }
                },
                contentPadding = PaddingValues(0.dp)
              ) {
                Text("Logout", fontSize = 11.sp, color = MarsRed, fontWeight = FontWeight.Bold)
              }
            }
          }
        }
      }
    },
    bottomBar = {
      Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color.White,
        tonalElevation = 8.dp,
        shadowElevation = 8.dp
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .height(72.dp)
            .padding(horizontal = 16.dp, vertical = 4.dp),
          horizontalArrangement = Arrangement.SpaceAround,
          verticalAlignment = Alignment.CenterVertically
        ) {
          BottomNavItem(icon = "🏠", label = "Overview", selected = true, onClick = { })
          BottomNavItem(icon = "👑", label = "Landlord", selected = false, onClick = { onNavigate("landlord") })
          BottomNavItem(icon = "👨🏾💼", label = "Caretaker", selected = false, onClick = { onNavigate("caretaker") })
          BottomNavItem(icon = "👤", label = "Tenant", selected = false, onClick = { onNavigate("tenant") })
          BottomNavItem(icon = "📜", label = "Audit Log", selected = false, onClick = { onNavigate("timeline") })
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
        .padding(horizontal = 16.dp, vertical = 8.dp),
      verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
      // Hero Cashflow Summary Card (Dark)
      Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MarsDark),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        modifier = Modifier.fillMaxWidth()
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
                "CONSOLIDATED PORTFOLIO",
                color = MarsAccent,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
              )
              Text(
                if (properties.isNotEmpty()) "${properties.size} Properties (${properties.sumOf { it.totalUnits }} Units)" else "Portfolio Active",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
              )
            }
            Surface(
              shape = CircleShape,
              color = MarsGreen
            ) {
              Text(
                "REAL LEDGER",
                color = Color.White,
                fontSize = 9.sp,
                fontWeight = FontWeight.Black,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Column {
              Text("Net Collected", color = Color(0xFFB7C5BF), fontSize = 11.sp, fontWeight = FontWeight.Medium)
              Text(
                "UGX " + formatMoney(totalCollected),
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
              )
            }
            Column(horizontalAlignment = Alignment.End) {
              Text("Total Arrears", color = Color(0xFFB7C5BF), fontSize = 11.sp, fontWeight = FontWeight.Medium)
              Text(
                "UGX " + formatMoney(totalOutstanding),
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = MarsRed
              )
            }
          }

          Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            LinearProgressIndicator(
              progress = { progressPercent },
              modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(CircleShape),
              color = MarsGreen,
              trackColor = Color(0xFFFFFFFF14),
            )
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Text("Collection Rate", fontSize = 10.sp, color = Color(0xFFB7C5BF))
              Text("${(progressPercent * 100).toInt()}% of expected rent", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MarsAccent)
            }
          }
        }
      }

      // Feature Status Legend
      Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        border = BorderStroke(1.dp, Color(0xFFDFE8E3))
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(10.dp),
          horizontalArrangement = Arrangement.SpaceAround,
          verticalAlignment = Alignment.CenterVertically
        ) {
          StatusPill("REAL", "Active", MarsGreen)
          StatusPill("OFFLINE-REAL", "Queued Room DB", Color(0xFF2B6CB0))
          StatusPill("AUDITED", "Append-Only", Color(0xFF805AD5))
        }
      }

      // Quick Workspaces
      Text("Operational Workspaces", fontWeight = FontWeight.Black, fontSize = 14.sp, color = MarsInk)

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

      // Recent Activity Container
      Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
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
              Text("Audit Log →", color = MarsGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
          }

          payments.take(3).forEach { payment ->
            Card(
              shape = RoundedCornerShape(12.dp),
              colors = CardDefaults.cardColors(containerColor = MarsBg),
              border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
              elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Box(
                  modifier = Modifier
                    .size(36.dp)
                    .background(Color.White, RoundedCornerShape(10.dp)),
                  contentAlignment = Alignment.Center
                ) {
                  Text("💰", fontSize = 16.sp)
                }
                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    "${payment.unitName} — ${payment.tenantName}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MarsInk
                  )
                  Text("${payment.date} • ${payment.paymentMethod}", fontSize = 10.sp, color = MarsMuted)
                }
                Column(horizontalAlignment = Alignment.End) {
                  Text(
                    "+UGX ${formatMoney(payment.amount)}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = MarsGreen
                  )
                  Text(payment.receiptNumber, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MarsMuted)
                }
              }
            }
          }
        }
      }
    }
  }
}

@Composable
private fun StatusPill(badge: String, title: String, color: Color) {
  Row(
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(4.dp)
  ) {
    Box(modifier = Modifier.size(8.dp).background(color, CircleShape))
    Column {
      Text(badge, fontSize = 9.sp, fontWeight = FontWeight.Black, color = color)
      Text(title, fontSize = 8.sp, color = MarsMuted)
    }
  }
}

@Composable
fun QuickActionButton(icon: String, label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
  Button(
    onClick = onClick,
    modifier = modifier,
    shape = RoundedCornerShape(16.dp),
    colors = ButtonDefaults.buttonColors(containerColor = Color.White),
    border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
    contentPadding = PaddingValues(vertical = 12.dp, horizontal = 4.dp),
    elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
  ) {
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
      Text(icon, fontSize = 22.sp)
      Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MarsMuted)
    }
  }
}

@Composable
fun BottomNavItem(icon: String, label: String, selected: Boolean, onClick: () -> Unit) {
  val color = if (selected) MarsGreen else MarsMuted

  TextButton(
    onClick = onClick,
    contentPadding = PaddingValues(0.dp)
  ) {
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.spacedBy(2.dp),
      modifier = Modifier.padding(horizontal = 8.dp)
    ) {
      Text(icon, fontSize = 20.sp)
      Text(
        label,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = color
      )
    }
  }
}
