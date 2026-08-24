package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MarsViewModel
import com.example.ui.theme.*

data class MonthlyTrend(
  val month: String,
  val income: Long,
  val expense: Long
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IncomeExpenseChartScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val payments by viewModel.payments.collectAsState()
  val expenses by viewModel.expenses.collectAsState()

  val months = listOf("Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026")
  
  val baseIncome = payments.sumOf { it.amount }.coerceAtLeast(15000000L)
  val baseExpense = expenses.sumOf { it.amount }.coerceAtLeast(3200000L)

  val trendData = remember(payments, expenses) {
    listOf(
      MonthlyTrend("Mar", (baseIncome * 0.85).toLong(), (baseExpense * 0.9).toLong()),
      MonthlyTrend("Apr", (baseIncome * 0.92).toLong(), (baseExpense * 0.8).toLong()),
      MonthlyTrend("May", (baseIncome * 0.88).toLong(), (baseExpense * 1.1).toLong()),
      MonthlyTrend("Jun", (baseIncome * 0.95).toLong(), (baseExpense * 0.95).toLong()),
      MonthlyTrend("Jul", (baseIncome * 1.02).toLong(), (baseExpense * 0.85).toLong()),
      MonthlyTrend("Aug", baseIncome, baseExpense)
    )
  }

  var selectedMetric by remember { mutableStateOf("Both") }
  var hoveredIndex by remember { mutableStateOf<Int?>(5) }

  val maxVal = trendData.maxOf { maxOf(it.income, it.expense) }.coerceAtLeast(1L).toFloat() * 1.2f

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("📈", fontSize = 14.sp)
            }
            Text("Income & Expense Trends", fontWeight = FontWeight.Black, fontSize = 18.sp)
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
          Text("FINANCIAL ANALYTICS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsAccent, letterSpacing = 1.sp)
          Text("Compare monthly rental collections against operating expenses with interactive trend visualization.", fontSize = 13.sp, color = Color(0xFFC7D4CE), lineHeight = 18.sp)
        }
      }

      // Legend & Filter Row
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
          Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(10.dp).background(MarsGreen, RoundedCornerShape(2.dp)))
            Text("Income", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MarsInk)
          }
          Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(10.dp).background(MarsRed, RoundedCornerShape(2.dp)))
            Text("Expense", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MarsInk)
          }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
          listOf("Both", "Income", "Expense").forEach { opt ->
            FilterChip(
              selected = selectedMetric == opt,
              onClick = { selectedMetric = opt },
              label = { Text(opt, fontSize = 10.sp) },
              shape = RoundedCornerShape(8.dp)
            )
          }
        }
      }

      // Chart Card
      Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
      ) {
        Column(
          modifier = Modifier.padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("6-Month Cashflow Trend", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MarsInk)
            if (hoveredIndex != null) {
              Surface(shape = RoundedCornerShape(8.dp), color = MarsSurfaceLight) {
                Text(
                  months[hoveredIndex!!],
                  fontWeight = FontWeight.Bold,
                  fontSize = 12.sp,
                  color = MarsGreen,
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
              }
            }
          }

          // Canvas Bar Chart
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .height(240.dp)
              .padding(vertical = 8.dp)
          ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
              val width = size.width
              val height = size.height
              val barWidth = width / (trendData.size * 2.5f)
              val spacing = (width - (barWidth * 2 * trendData.size)) / (trendData.size + 1)

              // Draw horizontal grid lines
              for (i in 0..4) {
                val y = height * (i / 4f)
                drawLine(
                  color = Color(0xFFDFE8E3).copy(alpha = 0.5f),
                  start = Offset(0f, y),
                  end = Offset(width, y),
                  strokeWidth = 1f
                )
              }

              trendData.forEachIndexed { index, item ->
                val xLeft = spacing + index * (barWidth * 2 + spacing)
                
                val incomeHeight = (item.income.toFloat() / maxVal) * height
                val expenseHeight = (item.expense.toFloat() / maxVal) * height

                if (selectedMetric == "Both" || selectedMetric == "Income") {
                  drawRect(
                    color = MarsGreen,
                    topLeft = Offset(xLeft, height - incomeHeight),
                    size = Size(barWidth, incomeHeight)
                  )
                }

                if (selectedMetric == "Both" || selectedMetric == "Expense") {
                  drawRect(
                    color = MarsRed.copy(alpha = 0.85f),
                    topLeft = Offset(xLeft + barWidth + 4f, height - expenseHeight),
                    size = Size(barWidth, expenseHeight)
                  )
                }
              }
            }
          }

          // Month X-Axis Labels
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceAround
          ) {
            trendData.forEach { item ->
              Text(item.month, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsMuted)
            }
          }
        }
      }

      // Hovered Month Breakdown Card
      if (hoveredIndex != null) {
        val current = trendData[hoveredIndex!!]
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = MarsSurfaceLight),
          border = BorderStroke(1.dp, MarsGreen.copy(alpha = 0.3f))
        ) {
          Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Text("Summary for ${months[hoveredIndex!!]}", fontWeight = FontWeight.Black, fontSize = 14.sp, color = MarsInk)
              val net = current.income - current.expense
              Text("Net: ${formatUgx(net)}", fontWeight = FontWeight.Black, fontSize = 14.sp, color = if (net >= 0) MarsGreen else MarsRed)
            }

            HorizontalDivider(color = Color(0xFFDFE8E3))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Column {
                Text("Total Income", fontSize = 11.sp, color = MarsMuted)
                Text(formatUgx(current.income), fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsGreen)
              }
              Column(horizontalAlignment = Alignment.End) {
                Text("Total Expenses", fontSize = 11.sp, color = MarsMuted)
                Text(formatUgx(current.expense), fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsRed)
              }
            }
          }
        }
      }

      // Month Selector Quick Buttons
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        trendData.forEachIndexed { index, item ->
          OutlinedButton(
            onClick = { hoveredIndex = index },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.outlinedButtonColors(
              containerColor = if (hoveredIndex == index) MarsGreen.copy(alpha = 0.1f) else Color.Transparent
            ),
            border = BorderStroke(1.dp, if (hoveredIndex == index) MarsGreen else Color(0xFFDFE8E3)),
            contentPadding = PaddingValues(4.dp)
          ) {
            Text(item.month, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (hoveredIndex == index) MarsGreen else MarsInk)
          }
        }
      }
    }
  }
}
