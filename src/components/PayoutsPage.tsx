import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Clock, Edit2, Plus, Trash } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useGlobalData";
import { usePayoutsPaginated } from "../hooks/usePayoutsPaginated";
import { InvestorPayout } from "../types";
import { DataTable } from "./DataTable";

export function PayoutsPage() {
  const { users, expenses } = useData();
  const {
    data: payouts,
    totalCount,
    pageCount,
    isLoading,
    pagination,
    setPagination,
    sorting,
    setSorting,
    addPayout,
    updatePayout,
    deletePayout,
  } = usePayoutsPaginated();

  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingPayout, setEditingPayout] = useState<InvestorPayout | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payoutToDelete, setPayoutToDelete] = useState<InvestorPayout | null>(
    null
  );
  const [formData, setFormData] = useState({
    investor_id: "",
    month: "",
    gross_amount: "",
    status: "pending" as "pending" | "paid",
  });

  const investors = users.filter((u) => u.role === "investor" && u.active);

  const handleEdit = useCallback((payout: InvestorPayout) => {
    setEditingPayout(payout);
    setFormData({
      investor_id: payout.investor_id,
      month: payout.month.substring(0, 7), // Convert "YYYY-MM-DD" to "YYYY-MM"
      gross_amount: payout.gross_amount.toString(),
      status: payout.status,
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((payout: InvestorPayout) => {
    setPayoutToDelete(payout);
    setShowDeleteModal(true);
  }, []);

  const columns: ColumnDef<InvestorPayout>[] = useMemo(
    () => [
      {
        accessorKey: "month",
        header: "Month",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(row.getValue("month")).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </div>
        ),
      },
      {
        accessorKey: "investor_id",
        header: "Investor",
        cell: ({ row }) => {
          const investorId = row.getValue("investor_id") as string;
          const investor = users.find((u) => u.id === investorId);
          return (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {investor?.name || "Unknown Investor"}
            </div>
          );
        },
      },
      {
        accessorKey: "gross_amount",
        header: "Gross Amount",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            ₺{(row.getValue("gross_amount") as number).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "total_expenses",
        header: "Expenses",
        cell: ({ row }) => (
          <div className="text-sm text-red-600 dark:text-red-400">
            ₺{(row.getValue("total_expenses") as number).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "net_amount",
        header: "Net Amount",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-green-600 dark:text-green-400">
            ₺{(row.getValue("net_amount") as number).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                status === "paid"
                  ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                  : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
              }`}
            >
              {status === "paid" ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </>
              )}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const payout = row.original;
          return (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleEdit(payout)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                title="Edit payout"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(payout)}
                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                title="Delete payout"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, users]
  );

  // Calculate total expenses for the selected month and investor
  const calculateExpenses = (investorId: string, month: string) => {
    const monthStart = new Date(month + "-01");
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    );

    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expense.type === "investor" &&
          expense.user_id === investorId &&
          expenseDate >= monthStart &&
          expenseDate <= monthEnd
        );
      })
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const grossAmount = parseFloat(formData.gross_amount);
      const totalExpenses = calculateExpenses(
        formData.investor_id,
        formData.month
      );
      const netAmount = grossAmount - totalExpenses;

      if (editingPayout && editingPayout.id) {
        // Update existing payout
        const updatedPayout: Partial<InvestorPayout> = {
          investor_id: formData.investor_id,
          month: formData.month + "-01", // Convert "YYYY-MM" to "YYYY-MM-01"
          gross_amount: grossAmount,
          total_expenses: totalExpenses,
          net_amount: netAmount,
          status: formData.status,
        };

        await updatePayout(editingPayout.id, updatedPayout);
      } else {
        // Create new payout
        const newPayout: Omit<InvestorPayout, "id"> = {
          investor_id: formData.investor_id,
          month: formData.month + "-01", // Convert "YYYY-MM" to "YYYY-MM-01"
          gross_amount: grossAmount,
          total_expenses: totalExpenses,
          net_amount: netAmount,
          status: formData.status,
          created_at: new Date().toISOString(),
          created_by: currentUser?.id || "",
        };

        await addPayout(newPayout);
      }

      setShowModal(false);
      setEditingPayout(null);
      setFormData({
        investor_id: "",
        month: "",
        gross_amount: "",
        status: "pending",
      });
    } catch (error) {
      console.error("Error saving payout:", error);
    }
  };

  const confirmDelete = async () => {
    if (payoutToDelete && payoutToDelete.id) {
      try {
        await deletePayout(payoutToDelete.id);
        setShowDeleteModal(false);
        setPayoutToDelete(null);
      } catch (error) {
        console.error("Error deleting payout:", error);
      }
    }
  };

  const previewExpenses =
    formData.investor_id && formData.month
      ? calculateExpenses(formData.investor_id, formData.month)
      : 0;

  const previewNetAmount = formData.gross_amount
    ? parseFloat(formData.gross_amount) - previewExpenses
    : 0;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payouts
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage investor payouts and distributions
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Payout
        </button>
      </div>

      <DataTable
        columns={columns}
        data={payouts}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        pageCount={pageCount}
        totalCount={totalCount}
        isLoading={isLoading}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {editingPayout ? "Edit Payout" : "Add New Payout"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investor
                </label>
                <select
                  required
                  value={formData.investor_id}
                  onChange={(e) =>
                    setFormData({ ...formData, investor_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Investor</option>
                  {investors.map((investor) => (
                    <option key={investor.id} value={investor.id}>
                      {investor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month
                </label>
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({ ...formData, month: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gross Amount (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.gross_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, gross_amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Preview calculations */}
              {formData.investor_id && formData.month && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      Gross Amount:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₺
                      {parseFloat(
                        formData.gross_amount || "0"
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      Total Expenses:
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -₺{previewExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2">
                    <span className="text-gray-900 dark:text-white">
                      Net Amount:
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      ₺{previewNetAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "pending" | "paid",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPayout(null);
                    setFormData({
                      investor_id: "",
                      month: "",
                      gross_amount: "",
                      status: "pending",
                    });
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  {editingPayout ? "Update" : "Add"} Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Payout
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this payout? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPayoutToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
