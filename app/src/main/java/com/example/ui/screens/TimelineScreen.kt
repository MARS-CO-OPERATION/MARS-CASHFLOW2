package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import java.text.SimpleDateFormat
import java.util.*

data class TimelineItem(
  val id: String,
  val title: String,
  val subtitle: String,
  val description: String,
  val date: String,
  val type: String, // "Payment", "Maintenance", "Audit", "Expense"
  val amount: String? = null,
  val statusColor: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TimelineScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val tenants by viewModel.tenants.collectAsState()
  val payments by viewModel.payments.collectAsState()
  val maintenance by viewModel.maintenance.collectAsState()
  val expenses by viewModel.expenses.collectAsState()
  val auditEvents by viewModel.auditEvents.collectAsState()

  var selectedFilter by remember { mutableStateOf("All") }

  val dateFmt = remember { SimpleDateFormat("dd MMM, HH:mm", Locale.getDefault()) }

  // Build unified timeline events
  val events = remember(tenants, payments, maintenance, expenses, auditEvents) {
    val list = mutableListOf<TimelineItem>()

    auditEvents.forEach { a ->
      val timeStr = dateFmt.format(Date(a.timestamp))
      list.add(
        TimelineItem(
          id = "audit_${a.id}",
          title = "Audit: ${a.eventType}",
          subtitle = "Actor: ${a.actorName} • Resource: ${a.resourceType}",
          description = a.details,
          date = timeStr,
          type = "Audit",
          amount = null,
          statusColor = Color(0xFF805AD5)
        )
      )
    }

    payments.forEach { p ->
      list.add(
        TimelineItem(
          id = "pay_${p.id}",
          title = "Rent Payment: ${p.receiptNumber}",
          subtitle = "${p.tenantName} • ${p.propertyName} (${p.unitName})",
          description = "Paid via ${p.paymentMethod}. External Ref: ${p.externalReference}",
          date = p.date,
          type = "Payment",
          amount = "+UGX " + formatMoney(p.amount),
          statusColor = MarsGreen
        )
      )
    }

    expenses.forEach { e ->
      list.add(
        TimelineItem(
          id = "exp_${e.id}",
          title = "Operating Expense: ${e.category}",
          subtitle = "${e.propertyName} • ${e.description}",
          description = "Recorded by ${e.recordedBy} • Status: ${e.status}",
          date = e.date,
          type = "Expense",
          amount = "-UGX " + formatMoney(e.amount),
          statusColor = MarsRed
        )
      )
    }

    maintenance.forEach { m ->
      val col = when (m.status) {
        "Resolved" -> MarsGreen
        "In Progress" -> MarsYellow
        else -> MarsRed
      }
      list.add(
        TimelineItem(
          id = "maint_${m.id}",
          title = "Maintenance (${m.status})",
          subtitle = "${m.propertyName} • ${m.unitName}",
          description = m.issue,
          date = m.date,
          type = "Maintenance",
          amount = if (m.actualCost > 0) "UGX ${formatMoney(m.actualCost)}" else null,
          statusColor = col
        )
      )
    }

    list
  }

  val filteredEvents = when (selectedFilter) {
    "Payments" -> events.filter { it.type == "Payment" }
    "Maintenance" -> events.filter { it.type == "Maintenance" }
    "Expenses" -> events.filter { it.type == "Expense" }
    "Audit Ledger" -> events.filter { it.type == "Audit" }
    else -> events
  }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("📜", fontSize = 14.sp)
            }
            Text("Ledger & Audit Timeline", fontWeight = FontWeight.Black, fontSize = 18.sp)
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
      // Filter Chips
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        listOf("All", "Audit Ledger", "Payments", "Expenses", "Maintenance").forEach { f ->
          FilterChip(
            selected = selectedFilter == f,
            onClick = { selectedFilter = f },
            label = { Text(f, fontSize = 11.sp) },
            shape = RoundedCornerShape(8.dp),
            colors = FilterChipDefaults.filterChipColors(
              selectedContainerColor = MarsGreen,
              selectedLabelColor = Color.White
            )
          )
        }
      }

      if (filteredEvents.isEmpty()) {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3))
        ) {
          Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
            Text("No activity items matching this filter.", color = MarsMuted)
          }
        }
      } else {
        filteredEvents.forEach { item ->
          Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            Row(
              modifier = Modifier.padding(14.dp),
              horizontalArrangement = Arrangement.spacedBy(12.dp),
              verticalAlignment = Alignment.Top
            ) {
              Box(
                modifier = Modifier.size(10.dp).background(item.statusColor, CircleShape).padding(top = 4.dp)
              )

              Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(item.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MarsInk)
                  Text(item.date, fontSize = 10.sp, color = MarsMuted)
                }
                Text(item.subtitle, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = MarsMuted)
                Text(item.description, fontSize = 12.sp, color = Color(0xFF4A5568))

                if (item.amount != null) {
                  Spacer(Modifier.height(4.dp))
                  Text(
                    item.amount,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black,
                    color = item.statusColor
                  )
                }
              }
            }
          }
        }
      }
    }
  }
}
