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
fun TenantPaymentStatusScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val monthlyStatuses by viewModel.monthlyStatuses.collectAsState()
  var selectedFilter by remember { mutableStateOf("All") }
  var successMessage by remember { mutableStateOf<String?>(null) }

  val filteredList = if (selectedFilter == "All") {
    monthlyStatuses
  } else {
    monthlyStatuses.filter { it.status.equals(selectedFilter, ignoreCase = true) }
  }

  val paidCount = monthlyStatuses.count { it.status.equals("Paid", ignoreCase = true) }
  val pendingCount = monthlyStatuses.count { it.status.equals("Pending", ignoreCase = true) }
  val overdueCount = monthlyStatuses.count { it.status.equals("Overdue", ignoreCase = true) }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("📋", fontSize = 14.sp)
            }
            Text("Tenant Monthly Payment Tracker", fontWeight = FontWeight.Black, fontSize = 17.sp)
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
    Column(
      modifier =
        Modifier.fillMaxSize()
          .padding(innerPadding)
          .verticalScroll(rememberScrollState())
          .padding(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      if (successMessage != null) {
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
            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MarsGreen)
            Text(
              successMessage ?: "",
              fontWeight = FontWeight.Bold,
              color = MarsInk,
              modifier = Modifier.weight(1f),
              fontSize = 13.sp
            )
          }
        }
      }

      // Hero Card
      Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MarsDark),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Text("ROOM DATABASE PAYMENT TRACKING", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsAccent, letterSpacing = 1.sp)
          Text("Track monthly rental collection statuses (Paid, Pending, Overdue) for each tenant across all properties in real time.", fontSize = 13.sp, color = Color(0xFFC7D4CE), lineHeight = 18.sp)
        }
      }

      // Summary Stats Row
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        Card(
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.3f))
        ) {
          Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("Paid", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MarsGreen)
            Text("$paidCount", fontSize = 18.sp, fontWeight = FontWeight.Black, color = MarsInk)
          }
        }

        Card(
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, MarsYellow.copy(alpha = 0.3f))
        ) {
          Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("Pending", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MarsYellow)
            Text("$pendingCount", fontSize = 18.sp, fontWeight = FontWeight.Black, color = MarsInk)
          }
        }

        Card(
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, MarsRed.copy(alpha = 0.3f))
        ) {
          Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("Overdue", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MarsRed)
            Text("$overdueCount", fontSize = 18.sp, fontWeight = FontWeight.Black, color = MarsInk)
          }
        }
      }

      // Filter Chips
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        listOf("All", "Paid", "Pending", "Overdue").forEach { filter ->
          FilterChip(
            selected = selectedFilter == filter,
            onClick = { selectedFilter = filter },
            label = { Text(filter, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
            shape = RoundedCornerShape(10.dp)
          )
        }
      }

      // Tenant Status List
      Text("Tenant Monthly Status List", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = MarsInk)

      if (filteredList.isEmpty()) {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3))
        ) {
          Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
            Text("No records found for '$selectedFilter'.", color = MarsMuted)
          }
        }
      } else {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
          filteredList.forEach { item ->
            val statusColor = when (item.status.lowercase()) {
              "paid" -> MarsGreen
              "pending" -> MarsYellow
              else -> MarsRed
            }

            Card(
              shape = RoundedCornerShape(16.dp),
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
                    Text(item.tenantName, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MarsInk)
                    Text("${item.propertyName} • ${item.unitName}", fontSize = 12.sp, color = MarsMuted)
                  }
                  Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = statusColor.copy(alpha = 0.15f)
                  ) {
                    Text(
                      item.status.uppercase(),
                      fontWeight = FontWeight.Bold,
                      fontSize = 11.sp,
                      color = statusColor,
                      modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                  }
                }

                HorizontalDivider(color = Color(0xFFDFE8E3))

                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Column {
                    Text("Month: ${item.month}", fontSize = 11.sp, color = MarsMuted)
                    Text("Due: ${formatUgx(item.amountDue)}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MarsInk)
                  }
                  Column(horizontalAlignment = Alignment.End) {
                    Text("Paid: ${formatUgx(item.amountPaid)}", fontSize = 11.sp, color = MarsMuted)
                    val balance = maxOf(0L, item.amountDue - item.amountPaid)
                    Text("Balance: ${formatUgx(balance)}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (balance > 0) MarsRed else MarsGreen)
                  }
                }

                // Status Change Actions
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                  listOf("Paid", "Pending", "Overdue").forEach { st ->
                    OutlinedButton(
                      onClick = {
                        viewModel.updateMonthlyStatus(item, st)
                        successMessage = "Updated ${item.tenantName} status to $st in Room database!"
                      },
                      modifier = Modifier.weight(1f),
                      shape = RoundedCornerShape(8.dp),
                      colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (item.status.equals(st, ignoreCase = true)) statusColor.copy(alpha = 0.15f) else Color.White
                      ),
                      border = BorderStroke(1.dp, if (item.status.equals(st, ignoreCase = true)) statusColor else Color(0xFFDFE8E3)),
                      contentPadding = PaddingValues(vertical = 4.dp)
                    ) {
                      Text(st, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = if (item.status.equals(st, ignoreCase = true)) statusColor else MarsInk)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
