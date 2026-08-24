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
fun MaintenanceScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val maintenanceList by viewModel.maintenance.collectAsState()

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("🛠️", fontSize = 14.sp)
            }
            Text("Maintenance Tracker", fontWeight = FontWeight.Black, fontSize = 18.sp)
          }
        },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
          }
        },
        actions = {
          Button(
            onClick = { onNavigate("recurring_maintenance") },
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
            shape = RoundedCornerShape(10.dp),
            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
          ) {
            Text("⏰ Recurring", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
          }
          Spacer(Modifier.width(4.dp))
          Button(
            onClick = { onNavigate("service_providers") },
            colors = ButtonDefaults.buttonColors(containerColor = MarsSurfaceLight),
            shape = RoundedCornerShape(10.dp),
            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)
          ) {
            Text("👷🏾 Providers", color = MarsGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold)
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
      Text("Property Maintenance Requests", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MarsInk)
      Text(
        "Track repair issues reported by tenants across all properties.",
        fontSize = 13.sp,
        color = MarsMuted
      )

      if (maintenanceList.isEmpty()) {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3))
        ) {
          Box(
            modifier = Modifier.fillMaxWidth().padding(32.dp),
            contentAlignment = Alignment.Center
          ) {
            Text("No maintenance issues reported.", color = MarsMuted)
          }
        }
      } else {
        maintenanceList.forEach { item ->
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
                  Text(
                    item.tenantName,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = MarsInk
                  )
                  Text(
                    "${item.propertyName} • ${item.unitName}",
                    fontSize = 12.sp,
                    color = MarsMuted
                  )
                }

                val statusColor =
                  when (item.status) {
                    "Resolved" -> MarsGreen
                    "In Progress" -> MarsYellow
                    else -> MarsRed
                  }
                Surface(shape = RoundedCornerShape(6.dp), color = statusColor.copy(alpha = 0.15f)) {
                  Text(
                    item.status,
                    color = statusColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                  )
                }
              }

              Text(item.issue, fontSize = 14.sp, color = MarsInk, fontWeight = FontWeight.Medium)
              Text("Reported: ${item.date}", fontSize = 11.sp, color = MarsMuted)

              HorizontalDivider(color = Color(0xFFDFE8E3))

              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                if (item.status != "Pending") {
                  OutlinedButton(
                    onClick = { viewModel.updateMaintenanceStatus(item.id, "Pending") },
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(4.dp),
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Text("Pending", fontSize = 11.sp)
                  }
                }
                if (item.status != "In Progress") {
                  OutlinedButton(
                    onClick = { viewModel.updateMaintenanceStatus(item.id, "In Progress") },
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(4.dp),
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Text("In Progress", fontSize = 11.sp)
                  }
                }
                if (item.status != "Resolved") {
                  Button(
                    onClick = { viewModel.updateMaintenanceStatus(item.id, "Resolved") },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
                    contentPadding = PaddingValues(4.dp),
                    shape = RoundedCornerShape(8.dp)
                  ) {
                    Text("Resolve", fontSize = 11.sp, fontWeight = FontWeight.Bold)
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
