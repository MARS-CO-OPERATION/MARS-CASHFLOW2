package com.example.ui.screens

import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.net.Uri
import androidx.core.content.FileProvider
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MarsViewModel
import com.example.ui.theme.*
import java.io.File
import java.io.FileOutputStream

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfExportScreen(
  viewModel: MarsViewModel,
  onNavigate: (String) -> Unit,
  onBack: () -> Unit
) {
  val context = LocalContext.current
  val properties by viewModel.properties.collectAsState()
  val payments by viewModel.payments.collectAsState()
  val expenses by viewModel.expenses.collectAsState()
  val tenants by viewModel.tenants.collectAsState()

  var selectedPeriod by remember { mutableStateOf("August 2026") }
  var reportType by remember { mutableStateOf("Tax & Cashflow Summary") }
  var exportedFileUri by remember { mutableStateOf<Uri?>(null) }
  var statusMessage by remember { mutableStateOf<String?>(null) }

  val totalIncome = payments.sumOf { it.amount }
  val totalExpense = expenses.sumOf { it.amount }
  val netProfit = totalIncome - totalExpense

  fun generateAndSavePdf(): File? {
    try {
      val pdfDocument = PdfDocument()
      val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4 size
      val page = pdfDocument.startPage(pageInfo)
      val canvas: Canvas = page.canvas
      val paint = Paint()

      // Header background
      paint.color = android.graphics.Color.parseColor("#101915")
      canvas.drawRect(0f, 0f, 595f, 100f, paint)

      // Title
      paint.color = android.graphics.Color.parseColor("#3DDC84")
      paint.textSize = 20f
      paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      canvas.drawText("MARS CASHFLOW - FINANCIAL REPORT", 40f, 45f, paint)

      paint.color = android.graphics.Color.parseColor("#C7D4CE")
      paint.textSize = 12f
      paint.typeface = Typeface.DEFAULT
      canvas.drawText("Period: $selectedPeriod | Generated for Tax & Record Keeping", 40f, 70f, paint)

      // Summary Box
      paint.color = android.graphics.Color.parseColor("#F4F7F5")
      canvas.drawRect(40f, 130f, 555f, 230f, paint)

      paint.color = android.graphics.Color.parseColor("#101915")
      paint.textSize = 14f
      paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      canvas.drawText("EXECUTIVE FINANCIAL SUMMARY", 60f, 160f, paint)

      paint.textSize = 12f
      paint.typeface = Typeface.DEFAULT
      canvas.drawText("Total Rental Collections: ${formatUgx(totalIncome)}", 60f, 185f, paint)
      canvas.drawText("Total Operating Expenses: ${formatUgx(totalExpense)}", 60f, 205f, paint)
      
      paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      paint.color = android.graphics.Color.parseColor("#1F8A58")
      canvas.drawText("Net Taxable Profit: ${formatUgx(netProfit)}", 330f, 195f, paint)

      // Section: Payments
      paint.color = android.graphics.Color.parseColor("#101915")
      paint.textSize = 14f
      paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      canvas.drawText("RECENT RENTAL PAYMENTS (INCOME)", 40f, 270f, paint)

      paint.textSize = 10f
      paint.typeface = Typeface.DEFAULT
      var yPos = 295f
      payments.take(6).forEach { p ->
        canvas.drawText("• ${p.date} - ${p.tenantName} (${p.propertyName}): ${formatUgx(p.amount)} [${p.paymentMethod}]", 50f, yPos, paint)
        yPos += 20f
      }

      // Section: Expenses
      yPos += 20f
      paint.textSize = 14f
      paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      canvas.drawText("OPERATING EXPENSES & REPAIRS", 40f, yPos, paint)

      yPos += 25f
      paint.textSize = 10f
      paint.typeface = Typeface.DEFAULT
      expenses.take(6).forEach { e ->
        canvas.drawText("• ${e.date} - ${e.propertyName} [${e.category}]: ${formatUgx(e.amount)} - ${e.description}", 50f, yPos, paint)
        yPos += 20f
      }

      // Footer
      paint.color = android.graphics.Color.parseColor("#71807A")
      paint.textSize = 10f
      canvas.drawText("Certified Statement generated securely via MARS Cashflow Android App.", 40f, 800f, paint)

      pdfDocument.finishPage(page)

      val file = File(context.cacheDir, "Mars_Cashflow_Report_$selectedPeriod.pdf")
      val outputStream = FileOutputStream(file)
      pdfDocument.writeTo(outputStream)
      pdfDocument.close()
      outputStream.close()

      return file
    } catch (e: Exception) {
      e.printStackTrace()
      return null
    }
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
              Text("📄", fontSize = 14.sp)
            }
            Text("Export Financial PDF Report", fontWeight = FontWeight.Black, fontSize = 18.sp)
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
      if (statusMessage != null) {
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
              statusMessage ?: "",
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
          Text("TAX & AUDIT READY", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MarsAccent, letterSpacing = 1.sp)
          Text("Export professional itemized financial statements, income statements, and expense ledgers formatted as high-resolution PDF documents.", fontSize = 13.sp, color = Color(0xFFC7D4CE), lineHeight = 18.sp)
        }
      }

      // Period Selection
      Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3))
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Text("Select Reporting Period", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsInk)
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            listOf("August 2026", "Q2 2026", "Full Year 2026").forEach { period ->
              FilterChip(
                selected = selectedPeriod == period,
                onClick = { selectedPeriod = period },
                label = { Text(period, fontSize = 11.sp) },
                shape = RoundedCornerShape(10.dp)
              )
            }
          }
        }
      }

      // Report Type Selection
      Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MarsCard),
        border = BorderStroke(1.dp, Color(0xFFDFE8E3))
      ) {
        Column(
          modifier = Modifier.padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Text("Select Report Template", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MarsInk)
          listOf("Tax & Cashflow Summary", "Itemized Income & Expense Ledger").forEach { type ->
            Row(
              modifier = Modifier.fillMaxWidth(),
              verticalAlignment = Alignment.CenterVertically
            ) {
              RadioButton(
                selected = reportType == type,
                onClick = { reportType = type }
              )
              Text(type, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MarsInk)
            }
          }
        }
      }

      // Action Buttons
      Button(
        onClick = {
          val file = generateAndSavePdf()
          if (file != null) {
            val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
            exportedFileUri = uri
            statusMessage = "PDF generated successfully: ${file.name}"
          } else {
            statusMessage = "Failed to generate PDF document."
          }
        },
        modifier = Modifier.fillMaxWidth().height(52.dp),
        colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
        shape = RoundedCornerShape(14.dp)
      ) {
        Icon(Icons.Default.PictureAsPdf, contentDescription = null)
        Spacer(Modifier.width(8.dp))
        Text("Generate PDF Report", fontWeight = FontWeight.Bold, fontSize = 15.sp)
      }

      if (exportedFileUri != null) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          OutlinedButton(
            onClick = {
              val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(exportedFileUri, "application/pdf")
                flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
              }
              try {
                context.startActivity(intent)
              } catch (e: Exception) {
                statusMessage = "No PDF viewer app found on device."
              }
            },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(12.dp)
          ) {
            Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(4.dp))
            Text("View PDF", fontSize = 12.sp)
          }

          Button(
            onClick = {
              val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, exportedFileUri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
              }
              try {
                context.startActivity(Intent.createChooser(shareIntent, "Share Financial PDF Report"))
              } catch (e: Exception) {
                statusMessage = "No sharing application found: ${e.localizedMessage}"
              }
            },
            modifier = Modifier.weight(1f),
            colors = ButtonDefaults.buttonColors(containerColor = MarsDark),
            shape = RoundedCornerShape(12.dp)
          ) {
            Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(4.dp))
            Text("Share / Send", fontSize = 12.sp, fontWeight = FontWeight.Bold)
          }
        }
      }
    }
  }
}
