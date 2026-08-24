package com.example.ui.screens

import androidx.compose.runtime.Composable
import com.example.ui.MarsViewModel

/**
 * Landing Home Screen delegating to the unified MainDashboardScreen.
 */
@Composable
fun LandingHomeScreen(viewModel: MarsViewModel, onNavigate: (String) -> Unit) {
  MainDashboardScreen(viewModel = viewModel, onNavigate = onNavigate)
}
