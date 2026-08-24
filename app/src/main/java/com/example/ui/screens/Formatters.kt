package com.example.ui.screens

import java.text.NumberFormat
import java.util.Locale

fun formatUgx(amount: Long): String {
  val formatter = NumberFormat.getNumberInstance(Locale.US)
  return "UGX ${formatter.format(amount)}"
}

fun formatMoney(amount: Long): String {
  val formatter = NumberFormat.getNumberInstance(Locale.US)
  return formatter.format(amount)
}

fun formatUgxShort(amount: Long): String {
  return when {
    amount >= 1_000_000 -> String.format(Locale.US, "UGX %.2fM", amount / 1_000_000.0)
    amount >= 1_000 -> String.format(Locale.US, "UGX %.0fK", amount / 1_000.0)
    else -> "UGX $amount"
  }
}
