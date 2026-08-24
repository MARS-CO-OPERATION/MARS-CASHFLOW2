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
fun ServiceProviderScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val serviceProviders by viewModel.serviceProviders.collectAsState()
  val properties by viewModel.properties.collectAsState()

  var selectedCategory by remember { mutableStateOf("All") }
  var showAddDialog by remember { mutableStateOf(false) }

  var nameInput by remember { mutableStateOf("") }
  var typeInput by remember { mutableStateOf("Plumbing") }
  var phoneInput by remember { mutableStateOf("+256 ") }
  var rateInput by remember { mutableStateOf("UGX 50,000 / call") }
  var propertyInput by remember { mutableStateOf(properties.firstOrNull()?.name ?: "Kampala Apartments") }

  var successMessage by remember { mutableStateOf<String?>(null) }

  val categories = listOf("All", "Plumbing", "Electrical", "Security", "Fumigation")
  val filteredProviders = if (selectedCategory == "All") {
    serviceProviders
  } else {
    serviceProviders.filter { it.serviceType.equals(selectedCategory, ignoreCase = true) }
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
              Text("👷🏾", fontSize = 14.sp)
            }
            Text("Service Providers", fontWeight = FontWeight.Black, fontSize = 18.sp)
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
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
          ) {
            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(4.dp))
            Text("Provider", fontSize = 12.sp, fontWeight = FontWeight.Bold)
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

      // Summary Header Card
      Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MarsDark),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
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
            Text("Maintenance Network", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MarsAccent)
            Surface(shape = RoundedCornerShape(8.dp), color = MarsGreen) {
              Text(
                "${serviceProviders.size} Active",
                color = Color.White,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }
          Text(
            "Manage electricians, plumbers, security teams and repair technicians across your properties.",
            fontSize = 13.sp,
            color = Color(0xFFC7D4CE),
            lineHeight = 18.sp
          )
        }
      }

      // Category Filter Chips
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        categories.forEach { cat ->
          FilterChip(
            selected = selectedCategory == cat,
            onClick = { selectedCategory = cat },
            label = { Text(cat, fontSize = 11.sp) },
            shape = RoundedCornerShape(10.dp)
          )
        }
      }

      // Providers List
      if (filteredProviders.isEmpty()) {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3))
        ) {
          Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
            Text("No service providers found in this category.", color = MarsMuted, fontSize = 13.sp)
          }
        }
      } else {
        filteredProviders.forEach { provider ->
          Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MarsCard),
            border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
          ) {
            Column(
              modifier = Modifier.padding(16.dp),
              verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    provider.name,
                    fontWeight = FontWeight.Black,
                    fontSize = 16.sp,
                    color = MarsInk
                  )
                  Spacer(Modifier.height(2.dp))
                  Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Surface(shape = RoundedCornerShape(6.dp), color = MarsSurfaceLight) {
                      Text(
                        provider.serviceType,
                        color = MarsGreen,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                      )
                    }
                    Text("⭐ ${provider.rating}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MarsInk)
                  }
                }

                val statusColor = if (provider.status == "Available") MarsGreen else MarsYellow
                Surface(shape = RoundedCornerShape(6.dp), color = statusColor.copy(alpha = 0.15f)) {
                  Text(
                    provider.status,
                    color = statusColor,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                  )
                }
              }

              HorizontalDivider(color = Color(0xFFDFE8E3))

              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                  Text("Rate: ${provider.rate}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MarsInk)
                  Text("Property: ${provider.assignedProperty}", fontSize = 12.sp, color = MarsMuted)
                  Text("Phone: ${provider.phone}", fontSize = 12.sp, color = MarsMuted)
                }
              }

              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                OutlinedButton(
                  onClick = {
                    val newStatus = if (provider.status == "Available") "On Job" else "Available"
                    viewModel.updateServiceProviderStatus(provider, newStatus)
                    successMessage = "Updated status for ${provider.name} to $newStatus"
                  },
                  modifier = Modifier.weight(1f),
                  shape = RoundedCornerShape(10.dp)
                ) {
                  Text(if (provider.status == "Available") "Set On Job" else "Set Available", fontSize = 11.sp)
                }

                Button(
                  onClick = {
                    successMessage = "Calling ${provider.name} at ${provider.phone}..."
                  },
                  modifier = Modifier.weight(1f),
                  colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
                  shape = RoundedCornerShape(10.dp)
                ) {
                  Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(14.sp.value.dp))
                  Spacer(Modifier.width(4.dp))
                  Text("Call Tech", fontSize = 11.sp, fontWeight = FontWeight.Bold)
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
      confirmButton = {
        Button(
          onClick = {
            if (nameInput.isNotBlank()) {
              viewModel.addServiceProvider(
                name = nameInput,
                serviceType = typeInput,
                phone = phoneInput,
                rate = rateInput,
                rating = 5.0f,
                assignedProperty = propertyInput
              )
              showAddDialog = false
              nameInput = ""
              successMessage = "Service provider added successfully!"
            }
          },
          colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
          shape = RoundedCornerShape(12.dp)
        ) {
          Text("Save Provider", fontWeight = FontWeight.Bold)
        }
      },
      dismissButton = {
        TextButton(onClick = { showAddDialog = false }) { Text("Cancel", color = MarsMuted) }
      },
      shape = RoundedCornerShape(24.dp),
      title = { Text("Add Service Provider", fontWeight = FontWeight.Black) },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          OutlinedTextField(
            value = nameInput,
            onValueChange = { nameInput = it },
            label = { Text("Provider / Company Name") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
          )

          var typeExpanded by remember { mutableStateOf(false) }
          OutlinedTextField(
            value = typeInput,
            onValueChange = {},
            readOnly = true,
            label = { Text("Service Type") },
            trailingIcon = { IconButton(onClick = { typeExpanded = !typeExpanded }) { Icon(Icons.Default.ArrowDropDown, null) } },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
          )
          DropdownMenu(expanded = typeExpanded, onDismissRequest = { typeExpanded = false }) {
            listOf("Plumbing", "Electrical", "Security", "Fumigation", "General Maintenance").forEach { t ->
              DropdownMenuItem(
                text = { Text(t) },
                onClick = { typeInput = t; typeExpanded = false }
              )
            }
          }

          OutlinedTextField(
            value = phoneInput,
            onValueChange = { phoneInput = it },
            label = { Text("Phone Number") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
          )

          OutlinedTextField(
            value = rateInput,
            onValueChange = { rateInput = it },
            label = { Text("Service Rate (e.g. UGX 50,000 / call)") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
          )

          var propExpanded by remember { mutableStateOf(false) }
          OutlinedTextField(
            value = propertyInput,
            onValueChange = {},
            readOnly = true,
            label = { Text("Assigned Property") },
            trailingIcon = { IconButton(onClick = { propExpanded = !propExpanded }) { Icon(Icons.Default.ArrowDropDown, null) } },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
          )
          DropdownMenu(expanded = propExpanded, onDismissRequest = { propExpanded = false }) {
            properties.forEach { p ->
              DropdownMenuItem(
                text = { Text(p.name) },
                onClick = { propertyInput = p.name; propExpanded = false }
              )
            }
          }
        }
      }
    )
  }
}
