import { FileSpreadsheet, FileText, Loader, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useData } from "../hooks/useData";
import {
  exportToCSV,
  exportToPDF,
  formatMonthlyReportForExport,
} from "../utils/exportUtils";

export function ReportsPage() {
  const { users, payments, expenses, payouts, getDashboardStats, isLoading } =
    useData();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const stats = getDashboardStats();

  const monthlyPayments = payments.filter((p) =>
    p.week_start_date.startsWith(selectedMonth)
  );
  const monthlyExpenses = expenses.filter((e) =>
    e.date.startsWith(selectedMonth)
  );
  const monthlyPayouts = payouts.filter((p) => p.month === selectedMonth);

  const monthlyRevenue = monthlyPayments.reduce(
    (sum, p) => sum + p.amount_paid,
    0
  );
  const monthlyExpenseTotal = monthlyExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const monthlyPayoutTotal = monthlyPayouts.reduce(
    (sum, p) => sum + p.net_amount,
    0
  );
  const monthlyProfit =
    monthlyRevenue - monthlyExpenseTotal - monthlyPayoutTotal;

  const exportDataToCSV = () => {
    try {
      setExportLoading("csv");
      const { paymentData, expenseData, payoutData, summaryData } =
        formatMonthlyReportForExport(
          selectedMonth,
          users,
          payments,
          expenses,
          payouts
        );

      // Export payments
      exportToCSV(paymentData, `greep-payments-${selectedMonth}`);

      // Export expenses
      exportToCSV(expenseData, `greep-expenses-${selectedMonth}`);

      // Export payouts
      exportToCSV(payoutData, `greep-payouts-${selectedMonth}`);

      // Export summary
      exportToCSV(summaryData, `greep-summary-${selectedMonth}`);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Error exporting to CSV. Please try again.");
    } finally {
      setExportLoading(null);
    }
  };

  const exportDataToPDF = () => {
    try {
      setExportLoading("pdf");
      const { paymentData, expenseData, payoutData, summaryData } =
        formatMonthlyReportForExport(
          selectedMonth,
          users,
          payments,
          expenses,
          payouts
        );

      // Log summary data for reporting purposes
      console.log("Summary data for PDF export:", summaryData);

      // Define columns for PDF export
      const columns = [
        { header: "Category", dataKey: "category" },
        { header: "Amount", dataKey: "amount" },
        { header: "Details", dataKey: "details" },
        { header: "Date", dataKey: "date" },
      ];

      // Export to PDF
      exportToPDF(
        [...paymentData, ...expenseData, ...payoutData],
        `greep-report-${selectedMonth}`,
        `Greep Payment Tracker - Monthly Report (${selectedMonth})`,
        columns
      );
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Error exporting to PDF. Please try again.");
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Financial analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportDataToCSV}
            disabled={exportLoading !== null}
            className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors ${
              exportLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {exportLoading === "csv" ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-5 h-5" />
            )}
            Export CSV
          </button>
          <button
            onClick={exportDataToPDF}
            disabled={exportLoading !== null}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors ${
              exportLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {exportLoading === "pdf" ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Month for Analysis
        </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading data...</p>
          </div>
        </div>
      )}

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <img
                src="/lira.svg"
                alt="Turkish Lira"
                className="w-6 h-6"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)",
                }}
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₺{monthlyRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <img
                src="/lira.svg"
                alt="Turkish Lira"
                className="w-6 h-6"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(25%) sepia(100%) saturate(5968%) hue-rotate(355deg) brightness(85%) contrast(118%)",
                }}
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Monthly Expenses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₺{monthlyExpenseTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <img
                src="/lira.svg"
                alt="Turkish Lira"
                className="w-6 h-6"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(55%) sepia(98%) saturate(2075%) hue-rotate(359deg) brightness(101%) contrast(101%)",
                }}
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Monthly Payouts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₺{monthlyPayoutTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Monthly Profit
              </p>
              <p
                className={`text-2xl font-bold ${
                  monthlyProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ₺{monthlyProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Driver Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Driver Performance
          </h3>
          <div className="space-y-4">
            {users
              .filter((u) => u.role === "driver" && u.active)
              .map((driver) => {
                const driverPayments = monthlyPayments.filter(
                  (p) => p.driver_id === driver.id
                );
                const totalEarned = driverPayments.reduce(
                  (sum, p) => sum + p.amount_paid,
                  0
                );
                return (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{driver.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Tier {driver.tier}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">
                        ₺{totalEarned.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {driverPayments.length} payment
                        {driverPayments.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            {users.filter((u) => u.role === "driver" && u.active).length ===
              0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No active drivers found</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Expense Breakdown
          </h3>
          <div className="space-y-4">
            {["admin", "driver", "investor"].map((type) => {
              const typeExpenses = monthlyExpenses.filter(
                (e) => e.type === type
              );
              const totalAmount = typeExpenses.reduce(
                (sum, e) => sum + e.amount,
                0
              );
              return (
                <div
                  key={type}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {type} Expenses
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {typeExpenses.length} item
                      {typeExpenses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-red-600">
                      ₺{totalAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {totalAmount > 0 && monthlyExpenseTotal > 0
                        ? `${(
                            (totalAmount / monthlyExpenseTotal) *
                            100
                          ).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          All-Time Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600 mb-2">
              ₺{stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600 mb-2">
              ₺{stats.totalExpenses.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600 mb-2">
              ₺{stats.totalPayouts.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-gray-600">Total Payouts</p>
          </div>
          <div className="text-center">
            <p
              className={`text-3xl font-bold mb-2 ${
                stats.netProfit >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              ₺{stats.netProfit.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-gray-600">Net Profit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
