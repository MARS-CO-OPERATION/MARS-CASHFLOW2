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
fun ExpensesScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val expenses by viewModel.expenses.collectAsState()
  val properties by viewModel.properties.collectAsState()

  var descInput by remember { mutableStateOf("") }
  var amountInput by remember { mutableStateOf("") }
  var categoryInput by remember { mutableStateOf("Maintenance") }
  var selectedProp by remember { mutableStateOf("Kampala Apartments") }

  val totalExpenses = expenses.sumOf { it.amount }

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("📊", fontSize = 14.sp)
            }
            Text("Expenses Manager", fontWeight = FontWeight.Black, fontSize = 18.sp)
          }
        },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
          }
        },
        actions = {
          Button(
            onClick = { onNavigate("document_scanner") },
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
            shape = RoundedCornerShape(10.dp),
            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
          ) {
            Icon(Icons.Default.DocumentScanner, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(4.dp))
            Text("Scan Doc", fontSize = 11.sp, fontWeight = FontWeight.Bold)
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
      // Summary Card (Dark polished hero)
      Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MarsDark),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Text(
            "TOTAL PROPERTY EXPENSES",
            fontSize = 11.sp,
            color = MarsAccent,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
          )
          Text(formatUgx(totalExpenses), fontSize = 28.sp, fontWeight = FontWeight.Black, color = MarsRed)
          Text(
            "Track maintenance, utilities, caretaker wages and repairs.",
            fontSize = 12.sp,
            color = Color(0xFFB7C5BF)
          )
        }
      }

      // Add Expense Form
      Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Text("Record New Expense", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MarsInk)

          var propExpanded by remember { mutableStateOf(false) }
          OutlinedTextField(
            value = selectedProp,
            onValueChange = {},
            readOnly = true,
            label = { Text("Property") },
            trailingIcon = {
              IconButton(onClick = { propExpanded = !propExpanded }) {
                Icon(Icons.Default.ArrowDropDown, null)
              }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
          )
          DropdownMenu(expanded = propExpanded, onDismissRequest = { propExpanded = false }) {
            properties.forEach { p ->
              DropdownMenuItem(
                text = { Text(p.name) },
                onClick = {
                  selectedProp = p.name
                  propExpanded = false
                }
              )
            }
          }

          OutlinedTextField(
            value = descInput,
            onValueChange = { descInput = it },
            label = { Text("Description (e.g. Generator Diesel)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
          )

          OutlinedTextField(
            value = amountInput,
            onValueChange = { amountInput = it },
            label = { Text("Amount (UGX)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
          )

          Text("Category", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MarsInk)
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
          ) {
            listOf("Maintenance", "Utilities", "Caretaker Wage", "Repairs").forEach { cat ->
              FilterChip(
                selected = categoryInput == cat,
                onClick = { categoryInput = cat },
                label = { Text(cat, fontSize = 10.sp) },
                shape = RoundedCornerShape(10.dp)
              )
            }
          }

          Button(
            onClick = {
              val amt = amountInput.toLongOrNull()
              if (descInput.isNotBlank() && amt != null && amt > 0) {
                viewModel.addExpense(selectedProp, descInput, amt, categoryInput)
                descInput = ""
                amountInput = ""
              }
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
            shape = RoundedCornerShape(12.dp)
          ) {
            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("Add Expense", fontWeight = FontWeight.Bold)
          }
        }
      }

      // Expense History
      Text("Expense History", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MarsInk)

      if (expenses.isEmpty()) {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3))
        ) {
          Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
            Text("No expenses logged yet.", color = MarsMuted)
          }
        }
      } else {
        expenses.forEach { exp ->
          Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MarsCard),
            border = BorderStroke(1.dp, Color(0xFFDFE8E3))
          ) {
            Row(
              modifier = Modifier.fillMaxWidth().padding(16.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column(modifier = Modifier.weight(1f)) {
                Text(
                  exp.description,
                  fontWeight = FontWeight.Bold,
                  fontSize = 15.sp,
                  color = MarsInk
                )
                Text(
                  "${exp.propertyName} • ${exp.category}",
                  fontSize = 12.sp,
                  color = MarsMuted
                )
                Text(exp.date, fontSize = 11.sp, color = MarsMuted)
              }
              Text(
                "-${formatUgx(exp.amount)}",
                fontWeight = FontWeight.Black,
                fontSize = 15.sp,
                color = MarsRed
              )
            }
          }
        }
      }
    }
  }
}
