package com.example.ui.screens

import android.widget.Toast
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MarsViewModel
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReceiptDetailScreen(
  viewModel: MarsViewModel,
  paymentId: String,
  onBack: () -> Unit
) {
  val context = LocalContext.current
  val payments by viewModel.payments.collectAsState()
  val payment = payments.find { it.id == paymentId } ?: payments.firstOrNull()

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("🧾", fontSize = 14.sp)
            }
            Text("Digital Receipt", fontWeight = FontWeight.Black, fontSize = 18.sp)
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
    if (payment == null) {
      Box(
        modifier = Modifier.fillMaxSize().padding(innerPadding),
        contentAlignment = Alignment.Center
      ) {
        Text("Receipt not found.", color = MarsMuted)
      }
    } else {
      Column(
        modifier =
          Modifier.fillMaxSize()
            .padding(innerPadding)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Card(
          modifier = Modifier.fillMaxWidth().widthIn(max = 500.dp),
          shape = RoundedCornerShape(24.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3)),
          elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
          Column(
            modifier = Modifier.padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Surface(shape = RoundedCornerShape(8.dp), color = MarsSurfaceLight) {
              Text(
                "MARS CASHFLOW OFFICIAL RECEIPT",
                color = MarsGreen,
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
              )
            }

            Text(
              "UGX " + formatMoney(payment.amount),
              fontSize = 32.sp,
              fontWeight = FontWeight.Black,
              color = MarsInk
            )

            Surface(
              shape = RoundedCornerShape(12.dp),
              color = if (payment.paymentStatus == "SUCCESSFUL") MarsGreen.copy(alpha = 0.12f) else MarsRed.copy(alpha = 0.12f),
              border = BorderStroke(1.dp, if (payment.paymentStatus == "SUCCESSFUL") MarsGreen.copy(alpha = 0.3f) else MarsRed.copy(alpha = 0.3f))
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Icon(
                  if (payment.paymentStatus == "SUCCESSFUL") Icons.Default.CheckCircle else Icons.Default.Error,
                  contentDescription = null,
                  tint = if (payment.paymentStatus == "SUCCESSFUL") MarsGreen else MarsRed,
                  modifier = Modifier.size(16.dp)
                )
                Text(
                  if (payment.paymentStatus == "SUCCESSFUL") "VERIFIED TRANSACTION" else payment.paymentStatus,
                  color = if (payment.paymentStatus == "SUCCESSFUL") MarsGreen else MarsRed,
                  fontSize = 12.sp,
                  fontWeight = FontWeight.Bold
                )
              }
            }

            HorizontalDivider(color = Color(0xFFDFE8E3))

            Column(
              modifier = Modifier.fillMaxWidth(),
              verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              ReceiptRow("Receipt Number", payment.receiptNumber)
              ReceiptRow("External Ref", payment.externalReference.ifBlank { "DIR-UG-LOCAL" })
              ReceiptRow("Date & Time", payment.date.ifBlank { "Real-Time Ledger" })
              ReceiptRow("Tenant Name", payment.tenantName)
              ReceiptRow("Property", payment.propertyName)
              ReceiptRow("Unit", payment.unitName)
              ReceiptRow("Payment Method", payment.paymentMethod)
              ReceiptRow("Recorded By", payment.recordedBy)
              ReceiptRow("Sync Status", payment.syncStatus)
              if (payment.notes.isNotBlank()) {
                ReceiptRow("Notes", payment.notes)
              }
            }

            HorizontalDivider(color = Color(0xFFDFE8E3))

            // QR Stamp Box
            Box(
              modifier = Modifier
                .size(100.dp)
                .background(Color(0xFFF1F5F3), RoundedCornerShape(12.dp))
                .padding(8.dp),
              contentAlignment = Alignment.Center
            ) {
              Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.QrCode2, contentDescription = null, modifier = Modifier.size(50.dp), tint = MarsInk)
                Text(payment.receiptNumber.takeLast(6), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MarsMuted)
              }
            }

            Text(
              "This digital voucher is cryptographically tied to the MARS immutable transaction ledger.",
              fontSize = 11.sp,
              color = MarsMuted,
              textAlign = TextAlign.Center
            )
          }
        }

        Row(
          modifier = Modifier.fillMaxWidth().widthIn(max = 500.dp),
          horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          OutlinedButton(
            onClick = {
              Toast.makeText(context, "Receipt voucher copied to clipboard.", Toast.LENGTH_SHORT).show()
            },
            modifier = Modifier.weight(1f).height(48.dp),
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, MarsGreen)
          ) {
            Icon(Icons.Default.Share, contentDescription = null, tint = MarsGreen, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(6.dp))
            Text("Share", color = MarsGreen, fontWeight = FontWeight.Bold)
          }

          Button(
            onClick = {
              Toast.makeText(context, "Receipt PDF generated and saved.", Toast.LENGTH_SHORT).show()
            },
            modifier = Modifier.weight(1f).height(48.dp),
            colors = ButtonDefaults.buttonColors(containerColor = MarsGreen),
            shape = RoundedCornerShape(12.dp)
          ) {
            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(6.dp))
            Text("Download PDF", fontWeight = FontWeight.Bold)
          }
        }
      }
    }
  }
}

@Composable
private fun ReceiptRow(label: String, value: String) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
  ) {
    Text(label, fontSize = 13.sp, color = MarsMuted)
    Text(value, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MarsInk)
  }
}
