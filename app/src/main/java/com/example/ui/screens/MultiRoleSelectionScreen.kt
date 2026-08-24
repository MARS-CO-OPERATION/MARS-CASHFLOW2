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
fun MultiRoleSelectionScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Box(
              modifier = Modifier.size(36.dp).background(MarsGreen, RoundedCornerShape(12.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("M", color = Color.White, fontWeight = FontWeight.Black, fontSize = 18.sp)
            }
            Column {
              Text("MARS MULTI-ROLE SYSTEM", fontWeight = FontWeight.Black, fontSize = 16.sp, color = MarsInk, lineHeight = 16.sp)
              Text("One Account — Multiple Authorized Workspaces", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = MarsGreen, letterSpacing = 1.sp)
            }
          }
        },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
          }
        },
        colors = TopAppBarDefaults.topAppBarColors(containerColor = MarsBg)
      )
    },
    containerColor = MarsBg
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .verticalScroll(rememberScrollState())
        .padding(20.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // Welcome Card
      Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MarsDark),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(
          modifier = Modifier.padding(24.dp),
          verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Text("WELCOME TO MARS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsAccent, letterSpacing = 1.2.sp)
          Text("Choose your workspace below. Your single phone number grants you access across your authorized property relationships with strict role permissions.", fontSize = 13.sp, color = Color(0xFFC7D4CE), lineHeight = 18.sp)
        }
      }

      Text("Choose your workspace:", fontWeight = FontWeight.Black, fontSize = 16.sp, color = MarsInk)

      // Workspace 1: My Rental (Tenant)
      Card(
        onClick = { onNavigate("tenant") },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(18.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier.size(44.dp).background(MarsSurfaceLight, RoundedCornerShape(12.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("🏠", fontSize = 20.sp)
            }
            Column {
              Text("My Rental", fontWeight = FontWeight.Black, fontSize = 15.sp, color = MarsInk)
              Text("View own rent balance, payment history & receipts", fontSize = 11.sp, color = MarsMuted)
            }
          }
          Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MarsGreen)
        }
      }

      // Workspace 2: My Management (Caretaker)
      Card(
        onClick = { onNavigate("caretaker") },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(18.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier.size(44.dp).background(MarsSurfaceLight, RoundedCornerShape(12.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("👨🏾💼", fontSize = 20.sp)
            }
            Column {
              Text("My Management", fontWeight = FontWeight.Black, fontSize = 15.sp, color = MarsInk)
              Text("Record ground payments & manage assigned properties", fontSize = 11.sp, color = MarsMuted)
            }
          }
          Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MarsGreen)
        }
      }

      // Workspace 3: My Services (Service Provider)
      Card(
        onClick = { onNavigate("service_providers") },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(18.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier.size(44.dp).background(MarsSurfaceLight, RoundedCornerShape(12.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("🛠️", fontSize = 20.sp)
            }
            Column {
              Text("My Services", fontWeight = FontWeight.Black, fontSize = 15.sp, color = MarsInk)
              Text("View assigned maintenance jobs & dispatch requests", fontSize = 11.sp, color = MarsMuted)
            }
          }
          Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MarsGreen)
        }
      }

      // Workspace 4: My Properties (Landlord)
      Card(
        onClick = { onNavigate("landlord") },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(18.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier.size(44.dp).background(MarsSurfaceLight, RoundedCornerShape(12.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("🏢", fontSize = 20.sp)
            }
            Column {
              Text("My Properties", fontWeight = FontWeight.Black, fontSize = 15.sp, color = MarsInk)
              Text("Full portfolio overview, financial reports & cashflow", fontSize = 11.sp, color = MarsMuted)
            }
          }
          Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MarsGreen)
        }
      }
    }
  }
}
