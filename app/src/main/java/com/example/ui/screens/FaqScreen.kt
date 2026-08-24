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
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FaqScreen(onBack: () -> Unit) {
  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(
              modifier = Modifier.size(32.dp).background(MarsGreen, RoundedCornerShape(10.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text("❓", fontSize = 14.sp)
            }
            Text("FAQ & How It Works", fontWeight = FontWeight.Black, fontSize = 18.sp)
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
      Text("How a payment flows", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MarsInk)
      Text(
        "A simple chain of accountability connecting tenants, caretakers and landlords.",
        fontSize = 13.sp,
        color = MarsMuted
      )

      listOf(
        "01" to "Tenant pays rent via Mobile Money, cash or bank transfer.",
        "02" to "Caretaker records payment in the mobile Caretaker Hub.",
        "03" to "Official digital receipt with unique reference is generated.",
        "04" to "Landlord is notified instantly in real time.",
        "05" to "Property cashflow and tenant arrears update automatically."
      ).forEach { (step, desc) ->
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MarsCard),
          border = BorderStroke(1.dp, Color(0xFFDFE8E3))
        ) {
          Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(shape = RoundedCornerShape(8.dp), color = MarsSurfaceLight) {
              Text(
                step,
                color = MarsGreen,
                fontWeight = FontWeight.Black,
                fontSize = 14.sp,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
              )
            }
            Text(
              desc,
              fontSize = 13.sp,
              color = MarsInk,
              fontWeight = FontWeight.Bold,
              modifier = Modifier.weight(1f)
            )
          }
        }
      }

      Spacer(Modifier.height(8.dp))
      Text("Frequently Asked Questions", fontSize = 16.sp, fontWeight = FontWeight.Black, color = MarsInk)

      FaqItem(
        question = "Can my caretaker use MARS?",
        answer =
          "Yes! Caretakers get role-based access to record payments, issue receipts and log maintenance without unrestricted owner access."
      )
      FaqItem(
        question = "Can tenants see each other’s information?",
        answer =
          "No. Each tenant has a secure private account showing only their rent balance, payment history and receipts."
      )
      FaqItem(
        question = "Does the app handle real Mobile Money?",
        answer =
          "This version is fully functional for property and cashflow management. Real payment gateway integrations can be connected to MTN/Airtel APIs."
      )
      FaqItem(
        question = "Can I manage multiple properties in Uganda?",
        answer =
          "Yes, landlords can add multiple properties in Kampala, Wakiso, Entebbe and beyond."
      )
    }
  }
}

@Composable
fun FaqItem(question: String, answer: String) {
  Card(
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(containerColor = MarsCard),
    border = BorderStroke(1.dp, Color(0xFFDFE8E3))
  ) {
    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
      Text(question, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MarsInk)
      Text(answer, fontSize = 13.sp, color = MarsMuted, lineHeight = 18.sp)
    }
  }
}
