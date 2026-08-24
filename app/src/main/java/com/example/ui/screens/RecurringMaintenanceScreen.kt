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

data class RecurringTask(
  val id: String,
  val title: String,
  val propertyName: String,
  val frequency: String, // "Monthly", "Quarterly", "Bi-Annually", "Annually"
  val nextDueDate: String,
  val status: String, // "Due Soon", "Scheduled", "Overdue"
  val statusColor: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecurringMaintenanceScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val properties by viewModel.properties.collectAsState()

  var taskList by remember {
    mutableStateOf(
      mutableListOf(
        RecurringTask("1", "Quarterly HVAC Servicing & Filter Check", "Kampala Heights", "Quarterly", "28 Aug 2026", "Due Soon", MarsYellow),
        RecurringTask("2", "Roof & Gutter Inspection", "Ntinda Apartments", "Bi-Annually", "15 Sep 2026", "Scheduled", MarsGreen),
        RecurringTask("3", "Fire Extinguisher & Safety Audit", "Muyenga Luxury Suites", "Annually", "01 Sep 2026", "Due Soon", MarsYellow),
        RecurringTask("4", "Pest Control & Fumigation", "Bukoto Villas", "Monthly", "25 Aug 2026", "Overdue", MarsRed),
        RecurringTask("5", "Water Tank & Pump Servicing", "Kampala Heights", "Quarterly", "10 Oct 2026", "Scheduled", MarsGreen)
      )
    )
  }

  var showAddDialog by remember { mutableStateOf(false) }
  var newTitle by remember { mutableStateOf("") }
  var newProperty by remember { mutableStateOf(properties.firstOrNull()?.name ?: "Kampala Heights") }
  var newFrequency by remember { mutableStateOf("Monthly") }
  var newDueDate by remember { mutableStateOf("05 Sep 2026") }
  var successMessage by remember { mutableStateOf<String?>(null) }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("⏰", fontSize = 14.sp)
            }
            Text("Recurring Task Scheduler", fontWeight = FontWeight.Black, fontSize = 18.sp)
          }
        },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
          }
        },
        actions = {
          Button(
            onClick = { showAddDialog = true },
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
            shape = RoundedCornerShape(10.dp),
            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
          ) {
            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(4.dp))
            Text("New Task", fontSize = 11.sp, fontWeight = FontWeight.Bold)
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
          Text("AUTOMATED PROPERTY INSPECTIONS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsAccent, letterSpacing = 1.sp)
          Text("Schedule routine property maintenance, HVAC servicing, and safety inspections with automated landlord reminder notifications.", fontSize = 13.sp, color = Color(0xFFC7D4CE), lineHeight = 18.sp)
        }
      }

      // Summary Stats Row
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        Card(
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3))
        ) {
          Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("Active Schedules", fontSize = 11.sp, color = MarsMuted)
            Text("${taskList.size}", fontSize = 20.sp, fontWeight = FontWeight.Black, color = MarsInk)
          }
        }

        Card(
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3))
        ) {
          Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("Due / Overdue", fontSize = 11.sp, color = MarsMuted)
            Text("${taskList.count { it.status != "Scheduled" }}", fontSize = 20.sp, fontWeight = FontWeight.Black, color = MarsRed)
          }
        }
      }

      // Task List Header
      Text("Recurring Maintenance Schedule", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = MarsInk)

      if (taskList.isEmpty()) {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3))
        ) {
          Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
            Text("No recurring maintenance schedules configured.", color = MarsMuted)
          }
        }
      } else {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
          taskList.forEach { task ->
            Card(
              shape = RoundedCornerShape(16.dp),
              colors = CardDefaults.cardColors(containerColor = MarsCard),
              border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
              elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
              Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(task.title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsInk)
                  Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = task.statusColor.copy(alpha = 0.15f)
                  ) {
                    Text(
                      task.status,
                      fontWeight = FontWeight.Bold,
                      fontSize = 11.sp,
                      color = task.statusColor,
                      modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                  }
                }

                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Text("Property: ${task.propertyName}", fontSize = 12.sp, color = MarsMuted)
                  Text("Frequency: ${task.frequency}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MarsGreen)
                }

                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text("Next Due: ${task.nextDueDate}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MarsInk)

                  Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                      onClick = {
                        successMessage = "Notification sent to assigned vendor & landlord for '${task.title}'!"
                      },
                      shape = RoundedCornerShape(8.dp),
                      contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                      Icon(Icons.Default.NotificationsActive, contentDescription = null, modifier = Modifier.size(14.dp), tint = MarsGreen)
                      Spacer(Modifier.width(4.dp))
                      Text("Notify", fontSize = 11.sp)
                    }

                    Button(
                      onClick = {
                        taskList = taskList.map {
                          if (it.id == task.id) it.copy(status = "Scheduled", statusColor = MarsGreen) else it
                        }.toMutableList()
                        successMessage = "Marked '${task.title}' as completed & rescheduled!"
                      },
                      shape = RoundedCornerShape(8.dp),
                      colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
                      contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                      Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
                      Spacer(Modifier.width(4.dp))
                      Text("Complete", fontSize = 11.sp)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (showAddDialog) {
      AlertDialog(
        onDismissRequest = { showAddDialog = false },
        title = { Text("Add Recurring Task", fontWeight = FontWeight.Bold) },
        text = {
          Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(
              value = newTitle,
              onValueChange = { newTitle = it },
              label = { Text("Task Title (e.g. Roof Inspection)") },
              singleLine = true,
              shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
              value = newProperty,
              onValueChange = { newProperty = it },
              label = { Text("Property Name") },
              singleLine = true,
              shape = RoundedCornerShape(12.dp)
            )

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              listOf("Monthly", "Quarterly", "Annually").forEach { freq ->
                FilterChip(
                  selected = newFrequency == freq,
                  onClick = { newFrequency = freq },
                  label = { Text(freq, fontSize = 10.sp) },
                  shape = RoundedCornerShape(8.dp)
                )
              }
            }

            OutlinedTextField(
              value = newDueDate,
              onValueChange = { newDueDate = it },
              label = { Text("Next Due Date") },
              singleLine = true,
              shape = RoundedCornerShape(12.dp)
            )
          }
        },
        confirmButton = {
          Button(
            onClick = {
              if (newTitle.isNotBlank()) {
                taskList.add(
                  RecurringTask(
                    id = (taskList.size + 1).toString(),
                    title = newTitle,
                    propertyName = newProperty,
                    frequency = newFrequency,
                    nextDueDate = newDueDate,
                    status = "Due Soon",
                    statusColor = MarsYellow
                  )
                )
                successMessage = "Successfully created recurring maintenance schedule!"
                showAddDialog = false
                newTitle = ""
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen)
          ) {
            Text("Save Schedule")
          }
        },
        dismissButton = {
          TextButton(onClick = { showAddDialog = false }) {
            Text("Cancel")
          }
        }
      )
    }
  }
}
