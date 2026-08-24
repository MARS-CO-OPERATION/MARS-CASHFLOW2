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

data class BudgetItem(
  val id: String,
  val category: String,
  val budgetedAmount: Long,
  val actualAmount: Long,
  val type: String // "Income" or "Expense"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MonthlyBudgetPlannerScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val properties by viewModel.properties.collectAsState()
  val payments by viewModel.payments.collectAsState()
  val expenses by viewModel.expenses.collectAsState()

  var budgetItems by remember {
    mutableStateOf(
      mutableListOf(
        BudgetItem("1", "Rental Income (Kampala Heights)", 12000000L, 12000000L, "Income"),
        BudgetItem("2", "Rental Income (Ntinda Apartments)", 6500000L, 6000000L, "Income"),
        BudgetItem("3", "Commercial Space Lease", 4500000L, 4500000L, "Income"),
        BudgetItem("4", "Property Maintenance & Repairs", 2000000L, 1850000L, "Expense"),
        BudgetItem("5", "Security & Guard Services", 1200000L, 1200000L, "Expense"),
        BudgetItem("6", "Property Tax & Municipal Rates", 1500000L, 1500000L, "Expense"),
        BudgetItem("7", "Utilities (Common Area Power/Water)", 800000L, 750000L, "Expense"),
        BudgetItem("8", "Insurance & Liability", 900000L, 900000L, "Expense")
      )
    )
  }

  var showAddDialog by remember { mutableStateOf(false) }
  var newCategory by remember { mutableStateOf("") }
  var newAmount by remember { mutableStateOf("") }
  var newType by remember { mutableStateOf("Expense") }
  var successMessage by remember { mutableStateOf<String?>(null) }

  val totalBudgetedIncome = budgetItems.filter { it.type == "Income" }.sumOf { it.budgetedAmount }
  val totalBudgetedExpense = budgetItems.filter { it.type == "Expense" }.sumOf { it.budgetedAmount }
  val projectedNet = totalBudgetedIncome - totalBudgetedExpense

  val totalActualIncome = budgetItems.filter { it.type == "Income" }.sumOf { it.actualAmount }
  val totalActualExpense = budgetItems.filter { it.type == "Expense" }.sumOf { it.actualAmount }
  val actualNet = totalActualIncome - totalActualExpense

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("🧮", fontSize = 14.sp)
            }
            Text("Monthly Budget Planner", fontWeight = FontWeight.Black, fontSize = 18.sp)
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
            Text("Add Item", fontSize = 11.sp, fontWeight = FontWeight.Bold)
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
          Text("RENTAL CASHFLOW FORECASTING", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsAccent, letterSpacing = 1.sp)
          Text("Plan expected monthly rental revenue against projected operating expenses to optimize property yields and net cashflow.", fontSize = 13.sp, color = Color(0xFFC7D4CE), lineHeight = 18.sp)
        }
      }

      // Executive Summary Card
      Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          Text("August 2026 Budget Overview", fontWeight = FontWeight.Black, fontSize = 15.sp, color = MarsInk)

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Column {
              Text("Projected Net Cashflow", fontSize = 11.sp, color = MarsMuted)
              Text(formatUgx(projectedNet), fontWeight = FontWeight.Black, fontSize = 18.sp, color = MarsGreen)
            }
            Column(horizontalAlignment = Alignment.End) {
              Text("Actual Net Cashflow", fontSize = 11.sp, color = MarsMuted)
              Text(formatUgx(actualNet), fontWeight = FontWeight.Black, fontSize = 18.sp, color = MarsDark)
            }
          }

          HorizontalDivider(color = Color(0xFFDFE8E3))

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Column {
              Text("Budgeted Income", fontSize = 11.sp, color = MarsMuted)
              Text(formatUgx(totalBudgetedIncome), fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MarsGreen)
            }
            Column(horizontalAlignment = Alignment.End) {
              Text("Budgeted Expenses", fontSize = 11.sp, color = MarsMuted)
              Text(formatUgx(totalBudgetedExpense), fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MarsRed)
            }
          }
        }
      }

      // Budget Items List Header
      Text("Itemized Budget & Forecast", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = MarsInk)

      Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        budgetItems.forEach { item ->
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
                Text(item.category, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsInk)
                Surface(
                  shape = RoundedCornerShape(6.dp),
                  color = if (item.type == "Income") MarsGreen.copy(alpha = 0.15f) else MarsRed.copy(alpha = 0.15f)
                ) {
                  Text(
                    item.type,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    color = if (item.type == "Income") MarsGreen else MarsRed,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                  )
                }
              }

              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
              ) {
                Column {
                  Text("Budgeted", fontSize = 11.sp, color = MarsMuted)
                  Text(formatUgx(item.budgetedAmount), fontWeight = FontWeight.Bold, fontSize = 13.sp, color = MarsInk)
                }
                Column(horizontalAlignment = Alignment.End) {
                  Text("Actual YTD", fontSize = 11.sp, color = MarsMuted)
                  Text(formatUgx(item.actualAmount), fontWeight = FontWeight.Bold, fontSize = 13.sp, color = if (item.type == "Income") MarsGreen else MarsRed)
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
        title = { Text("Add Budget Item", fontWeight = FontWeight.Bold) },
        text = {
          Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(
              value = newCategory,
              onValueChange = { newCategory = it },
              label = { Text("Category / Description") },
              singleLine = true,
              shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
              value = newAmount,
              onValueChange = { newAmount = it },
              label = { Text("Monthly Amount (UGX)") },
              singleLine = true,
              shape = RoundedCornerShape(12.dp)
            )

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              listOf("Income", "Expense").forEach { t ->
                FilterChip(
                  selected = newType == t,
                  onClick = { newType = t },
                  label = { Text(t, fontSize = 12.sp) },
                  shape = RoundedCornerShape(10.dp)
                )
              }
            }
          }
        },
        confirmButton = {
          Button(
            onClick = {
              val amt = newAmount.toLongOrNull() ?: 1000000L
              if (newCategory.isNotBlank()) {
                budgetItems.add(
                  BudgetItem(
                    id = (budgetItems.size + 1).toString(),
                    category = newCategory,
                    budgetedAmount = amt,
                    actualAmount = amt,
                    type = newType
                  )
                )
                successMessage = "Successfully added budget item!"
                showAddDialog = false
                newCategory = ""
                newAmount = ""
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen)
          ) {
            Text("Save Budget Item")
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
