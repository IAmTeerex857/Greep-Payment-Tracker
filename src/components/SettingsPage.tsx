import { AlertTriangle, Download, FileText, Upload } from "lucide-react";
import React, { useState } from "react";
import { useData } from "../hooks/useGlobalData";
import { importFromCSV } from "../utils/importUtils";

export function SettingsPage() {
  const {
    users,
    payments,
    expenses,
    payouts,
    saveUsers,
    savePayments,
    saveExpenses,
    savePayouts,
  } = useData();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const exportAllData = () => {
    const data = {
      users,
      payments,
      expenses,
      payouts,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `greep-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const [importing, setImporting] = useState(false);

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      // Check if it's a JSON file
      if (file.name.toLowerCase().endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);

            if (data.users) saveUsers(data.users);
            if (data.payments) savePayments(data.payments);
            if (data.expenses) saveExpenses(data.expenses);
            if (data.payouts) savePayouts(data.payouts);

            alert("JSON data imported successfully!");
          } catch (error) {
            alert("Error importing JSON data. Please check the file format.");
          } finally {
            setImporting(false);
          }
        };
        reader.readAsText(file);
      }
      // Handle CSV files
      else if (file.name.toLowerCase().endsWith(".csv")) {
        try {
          const result = await importFromCSV(file);

          if (result.type === "unknown" || !result.data) {
            alert(
              "Could not determine the type of CSV data. Please check the file format."
            );
            return;
          }

          switch (result.type) {
            case "users":
              saveUsers(result.data as any);
              break;
            case "payments":
              savePayments(result.data as any);
              break;
            case "expenses":
              saveExpenses(result.data as any);
              break;
            case "payouts":
              savePayouts(result.data as any);
              break;
          }

          alert(`CSV data imported successfully as ${result.type}!`);
        } catch (error) {
          console.error("CSV import error:", error);
          alert("Error importing CSV data. Please check the file format.");
        } finally {
          setImporting(false);
        }
      } else {
        alert("Unsupported file format. Please upload a JSON or CSV file.");
        setImporting(false);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Error importing data. Please check the file format.");
      setImporting(false);
    }
  };

  const resetAllData = () => {
    // Reset to initial state
    const initialUsers = [
      {
        id: "1",
        name: "Admin User",
        email: "admin@greep.com",
        role: "admin" as const,
        tier: "A" as const,
        created_at: new Date().toISOString(),
        active: true,
        can_login: true,
      },
      {
        id: "2",
        name: "John Driver",
        email: "john@greep.com",
        role: "driver" as const,
        tier: "A" as const,
        created_at: new Date().toISOString(),
        active: true,
        can_login: false,
      },
      {
        id: "3",
        name: "Jane Investor",
        email: "jane@greep.com",
        role: "investor" as const,
        tier: "X" as const,
        created_at: new Date().toISOString(),
        active: true,
        can_login: false,
      },
    ];

    saveUsers(initialUsers);
    savePayments([]);
    saveExpenses([]);
    savePayouts([]);

    setShowConfirmReset(false);
    alert("All data has been reset to initial state.");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage system settings and data
        </p>
      </div>

      <div className="space-y-6">
        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Data Management
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={exportAllData}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={importing}
            >
              <Download className="w-4 h-4" /> Export All Data
            </button>

            <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
              {importing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Import JSON
                </>
              )}
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={importData}
                disabled={importing}
              />
            </label>

            <label className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 cursor-pointer">
              {importing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Importing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Import CSV
                </>
              )}
              <input
                type="file"
                accept=".csv"
                onChange={importData}
                className="hidden"
                disabled={importing}
              />
            </label>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            System Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Users
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {payments.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Payments
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {expenses.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Expenses
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {payouts.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Payouts
              </p>
            </div>
          </div>
        </div>

        {/* Tier Configuration */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tier Configuration
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Driver Tiers
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Tier A
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Standard
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Tier B
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Premium
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Investor Tiers
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Tier X
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ₺15,000/month
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Tier Y
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ₺16,500/month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Confirm Reset
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to reset all data? This action cannot be
              undone and will permanently delete all payments, expenses, and
              payouts.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={resetAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
