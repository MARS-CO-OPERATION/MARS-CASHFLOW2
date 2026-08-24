package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.ui.MarsViewModel
import com.example.ui.screens.*
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
  private val viewModel: MarsViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
          val navController = rememberNavController()

          NavHost(navController = navController, startDestination = "login") {
            composable("login") {
              LoginScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) }
              )
            }
            composable("home") {
              MainDashboardScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) }
              )
            }
            composable("main_dashboard") {
              MainDashboardScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) }
              )
            }
            composable("landlord") {
              LandlordDashboardScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("caretaker") {
              CaretakerHubScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onViewReceipt = { paymentId -> navController.navigate("receipt/$paymentId") },
                onBack = { navController.popBackStack() }
              )
            }
            composable("tenant") {
              TenantPortalScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onViewReceipt = { paymentId -> navController.navigate("receipt/$paymentId") },
                onBack = { navController.popBackStack() }
              )
            }
            composable("expenses") {
              ExpensesScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("maintenance") {
              MaintenanceScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("service_providers") {
              ServiceProviderScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("timeline") {
              TimelineScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("income_expense_chart") {
              IncomeExpenseChartScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("document_scanner") {
              DocumentScannerScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("recurring_maintenance") {
              RecurringMaintenanceScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("pdf_export") {
              PdfExportScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("monthly_budget") {
              MonthlyBudgetPlannerScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("tenant_payment_status") {
              TenantPaymentStatusScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("multi_role_selection") {
              MultiRoleSelectionScreen(
                viewModel = viewModel,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
              )
            }
            composable("faq") {
              FaqScreen(onBack = { navController.popBackStack() })
            }
            composable(
              route = "receipt/{paymentId}",
              arguments = listOf(navArgument("paymentId") { type = NavType.StringType })
            ) { backStackEntry ->
              val paymentId = backStackEntry.arguments?.getString("paymentId") ?: ""
              ReceiptDetailScreen(
                viewModel = viewModel,
                paymentId = paymentId,
                onBack = { navController.popBackStack() }
              )
            }
          }
        }
      }
    }
  }
}
