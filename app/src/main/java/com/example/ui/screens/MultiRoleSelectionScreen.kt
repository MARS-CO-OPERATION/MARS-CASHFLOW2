package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.RoleAssignmentEntity
import com.example.data.UserRole
import com.example.ui.MarsViewModel
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MultiRoleSelectionScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val currentUser by viewModel.currentUser.collectAsState()
  val currentWorkspace by viewModel.currentWorkspace.collectAsState()
  val userWorkspaces by viewModel.userWorkspaces.collectAsState()

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
      // Welcome & Profile Card
      Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MarsDark),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("AUTHORIZED ACCOUNT", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsAccent, letterSpacing = 1.2.sp)
            Surface(
              shape = RoundedCornerShape(6.dp),
              color = MarsGreen.copy(alpha = 0.3f),
              border = BorderStroke(1.dp, MarsGreen)
            ) {
              Text(
                text = currentUser?.accountStatus ?: "ACTIVE",
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = MarsAccent,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
              )
            }
          }

          Text(
            currentUser?.displayName ?: "Eng. Grace Namubiru",
            fontWeight = FontWeight.Black,
            fontSize = 18.sp,
            color = Color.White
          )

          Text(
            "${currentUser?.phoneNumber ?: "+256 779 999999"} • ${currentUser?.email ?: "multirole@mars.ug"}",
            fontSize = 12.sp,
            color = Color(0xFFC7D4CE)
          )

          if (currentWorkspace != null) {
            Surface(
              shape = RoundedCornerShape(8.dp),
              color = MarsSurfaceLight.copy(alpha = 0.15f),
              modifier = Modifier.fillMaxWidth().padding(top = 6.dp)
            ) {
              Row(
                modifier = Modifier.padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MarsAccent, modifier = Modifier.size(16.dp))
                Text(
                  "Active Workspace: ${currentWorkspace?.workspaceTitle}",
                  fontSize = 12.sp,
                  fontWeight = FontWeight.SemiBold,
                  color = Color.White
                )
              }
            }
          }
        }
      }

      Text("Select Active Workspace:", fontWeight = FontWeight.Black, fontSize = 16.sp, color = MarsInk)

      if (userWorkspaces.isNotEmpty()) {
        userWorkspaces.forEach { assignment ->
          val userRole = UserRole.fromKey(assignment.role)
          val isActive = currentWorkspace?.id == assignment.id

          Card(
            onClick = {
              viewModel.switchWorkspace(assignment)
              onNavigate(userRole.defaultRoute)
            },
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = if (isActive) MarsSurfaceLight else MarsCard),
            border = BorderStroke(if (isActive) 2.dp else 1.dp, if (isActive) MarsGreen else Color(0xFFDFE8E3)),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth().padding(18.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Box(
                  modifier = Modifier.size(44.dp).background(if (isActive) MarsGreen else MarsBg, RoundedCornerShape(12.dp)),
                  contentAlignment = Alignment.Center
                ) {
                  Text(userRole.icon, fontSize = 20.sp)
                }
                Column {
                  Text(
                    assignment.workspaceTitle,
                    fontWeight = FontWeight.Black,
                    fontSize = 14.sp,
                    color = if (isActive) MarsGreen else MarsInk
                  )
                  Text(
                    "${userRole.title} • Role ID: ${assignment.role}",
                    fontSize = 11.sp,
                    color = MarsMuted
                  )
                }
              }
              Icon(Icons.Default.ChevronRight, contentDescription = null, tint = if (isActive) MarsGreen else MarsMuted)
            }
          }
        }
      } else {
        // Fallback default role items
        val defaultRoles = listOf(
          Triple("👑", "Landlord / Owner Workspace", UserRole.LANDLORD),
          Triple("👨🏾💼", "Manager / Caretaker Hub", UserRole.MANAGER),
          Triple("👤", "Tenant / Resident Portal", UserRole.TENANT),
          Triple("🛠️", "Service Provider / Contractor", UserRole.SERVICE_PROVIDER)
        )

        defaultRoles.forEach { (icon, title, role) ->
          Card(
            onClick = {
              val assignment = RoleAssignmentEntity(
                userId = currentUser?.id ?: "CURRENT_USER",
                role = role.name,
                workspaceTitle = title
              )
              viewModel.switchWorkspace(assignment)
              onNavigate(role.defaultRoute)
            },
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
              Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Box(
                  modifier = Modifier.size(44.dp).background(MarsSurfaceLight, RoundedCornerShape(12.dp)),
                  contentAlignment = Alignment.Center
                ) {
                  Text(icon, fontSize = 20.sp)
                }
                Column {
                  Text(title, fontWeight = FontWeight.Black, fontSize = 14.sp, color = MarsInk)
                  Text(role.subtitle, fontSize = 11.sp, color = MarsMuted)
                }
              }
              Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MarsGreen)
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      OutlinedButton(
        onClick = {
          viewModel.logout {
            onNavigate("login")
          }
        },
        modifier = Modifier.fillMaxWidth().height(48.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = MarsRed),
        border = BorderStroke(1.dp, MarsRed.copy(alpha = 0.5f))
      ) {
        Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(8.dp))
        Text("Sign Out of MARS Account", fontWeight = FontWeight.Bold)
      }
    }
  }
}
