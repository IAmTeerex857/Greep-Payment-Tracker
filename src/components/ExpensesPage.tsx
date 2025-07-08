import { Calendar, Edit2, Plus, Receipt, Trash } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { Expense } from "../types";

export function ExpensesPage() {
  const { users, expenses, saveExpenses, updateExpense, deleteExpense } =
    useData();
  const { user: currentUser } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingExpense && editingExpense.id) {
      // Update existing expense
      const updatedExpense: Partial<Expense> = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        paid_by: formData.paid_by,
        user_id: formData.user_id || undefined,
      };

      await updateExpense(editingExpense.id, updatedExpense);
    } else {
      // Create new expense
      const newExpense: Expense = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        paid_by: formData.paid_by,
        user_id: formData.user_id || undefined,
        created_at: new Date().toISOString(),
        created_by: currentUser?.id || "",
      };

      await saveExpenses(newExpense);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: "admin",
      amount: "",
      date: "",
      description: "",
      paid_by: "",
      user_id: "",
    });
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
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
  };

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (expenseToDelete && expenseToDelete.id) {
      await deleteExpense(expenseToDelete.id);
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    }
  };

  const getExpenseUser = (expense: Expense) => {
    if (expense.user_id) {
      return users.find((u) => u.id === expense.user_id);
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track all business expenses
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Paid By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {expenses
                .slice()
                .reverse()
                .map((expense) => {
                  const expenseUser = getExpenseUser(expense);
                  return (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            expense.type === "admin"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : expense.type === "driver"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          }`}
                        >
                          {expense.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Receipt className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-gray-300">
                            {expense.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            ₺{expense.amount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-gray-300">
                            {expense.date}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-300">
                          {expense.paid_by}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-300">
                          {expenseUser ? expenseUser.name : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit expense"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete expense"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expense Type
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "admin" | "driver" | "investor",
                      user_id: "",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="admin">Admin Expense</option>
                  <option value="driver">Driver Expense</option>
                  <option value="investor">Investor Expense</option>
                </select>
              </div>

              {(formData.type === "driver" || formData.type === "investor") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {formData.type === "driver" ? "Driver" : "Investor"}
                  </label>
                  <select
                    required
                    value={formData.user_id}
                    onChange={(e) =>
                      setFormData({ ...formData, user_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select {formData.type}</option>
                    {users
                      .filter((u) => u.role === formData.type && u.active)
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Paid By
                </label>
                <input
                  type="text"
                  required
                  value={formData.paid_by}
                  onChange={(e) =>
                    setFormData({ ...formData, paid_by: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Admin, Company Card, etc."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingExpense ? "Update Expense" : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this expense record? This action
              cannot be undone.
            </p>
            {expenseToDelete && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Type:</strong> {expenseToDelete.type}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Description:</strong> {expenseToDelete.description}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Amount:</strong> ₺
                  {expenseToDelete.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Date:</strong> {expenseToDelete.date}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setExpenseToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
