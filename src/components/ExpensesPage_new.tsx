import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Plus, Trash } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useExpensesPaginated } from "../hooks/useExpensesPaginated";
import { useData } from "../hooks/useGlobalData";
import { Expense } from "../types";
import { DataTable } from "./DataTable";

export function ExpensesPage() {
  const { users } = useData();
  const { user: currentUser } = useAuth();
  const {
    data: expenses,
    totalCount,
    pageCount,
    isLoading,
    pagination,
    setPagination,
    sorting,
    setSorting,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpensesPaginated();

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    type: "admin" as "admin" | "driver" | "investor",
    amount: "",
    date: "",
    description: "",
    paid_by: "",
    user_id: "",
  });

  const handleEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      type: expense.type,
      amount: expense.amount.toString(),
      date: expense.date,
      description: expense.description,
      paid_by: expense.paid_by,
      user_id: expense.user_id || "",
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((expense: Expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = async () => {
    if (expenseToDelete && expenseToDelete.id) {
      try {
        await deleteExpense(expenseToDelete.id);
        toast.success("Expense deleted successfully!");
        setShowDeleteModal(false);
        setExpenseToDelete(null);
      } catch (error) {
        console.error("Error deleting expense:", error);
        toast.error("Failed to delete expense");
      }
    }
  };

  const columns: ColumnDef<Expense>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(row.getValue("date")).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          return (
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                type === "admin"
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
                  : type === "driver"
                  ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                  : "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {row.getValue("description")}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-red-600 dark:text-red-400">
            ₺{(row.getValue("amount") as number).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "paid_by",
        header: "Paid By",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {row.getValue("paid_by")}
          </div>
        ),
      },
      {
        accessorKey: "user_id",
        header: "Related User",
        cell: ({ row }) => {
          const userId = row.getValue("user_id") as string;
          if (!userId) return <span className="text-gray-400">N/A</span>;
          const user = users.find((u) => u.id === userId);
          return (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {user?.name || "Unknown User"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const expense = row.original;
          return (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleEdit(expense)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                title="Edit expense"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(expense)}
                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                title="Delete expense"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [users, handleEdit, handleDelete]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingExpense && editingExpense.id) {
        const updatedExpense: Partial<Expense> = {
          type: formData.type,
          amount: parseFloat(formData.amount),
          date: formData.date,
          description: formData.description,
          paid_by: formData.paid_by,
          user_id: formData.user_id || undefined,
        };

        await updateExpense(editingExpense.id, updatedExpense);
        toast.success("Expense updated successfully!");
      } else {
        const newExpense: Omit<Expense, "id"> = {
          type: formData.type,
          amount: parseFloat(formData.amount),
          date: formData.date,
          description: formData.description,
          paid_by: formData.paid_by,
          user_id: formData.user_id || undefined,
          created_at: new Date().toISOString(),
          created_by: currentUser?.id || "",
        };

        await addExpense(newExpense);
        toast.success("Expense added successfully!");
      }

      setShowModal(false);
      setEditingExpense(null);
      setFormData({
        type: "admin",
        amount: "",
        date: "",
        description: "",
        paid_by: "",
        user_id: "",
      });
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error("Failed to save expense");
    }
  };

  const getFilteredUsers = () => {
    if (formData.type === "driver") {
      return users.filter((u) => u.role === "driver");
    } else if (formData.type === "investor") {
      return users.filter((u) => u.role === "investor");
    }
    return [];
  };

  return (
    <div className="p-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track and manage business expenses
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        pageCount={pageCount}
        totalCount={totalCount}
        isLoading={isLoading}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "admin" | "driver" | "investor",
                      user_id: "", // Reset user_id when type changes
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="driver">Driver</option>
                  <option value="investor">Investor</option>
                </select>
              </div>
              {formData.type !== "admin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {formData.type === "driver" ? "Driver" : "Investor"}
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) =>
                      setFormData({ ...formData, user_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a {formData.type}</option>
                    {getFilteredUsers().map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe the expense..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paid By
                </label>
                <input
                  type="text"
                  required
                  value={formData.paid_by}
                  onChange={(e) =>
                    setFormData({ ...formData, paid_by: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Who paid for this expense?"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpense(null);
                    setFormData({
                      type: "admin",
                      amount: "",
                      date: "",
                      description: "",
                      paid_by: "",
                      user_id: "",
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
                  {editingExpense ? "Update" : "Add"} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Expense
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setExpenseToDelete(null);
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
