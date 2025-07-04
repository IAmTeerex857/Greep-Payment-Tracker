import { Calendar, DollarSign, Edit2, LucideDelete, Plus } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { DriverPayment } from "../types";

export function PaymentsPage() {
  const { users, payments, savePayments, updatePayment, deletePayment } =
    useData();
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<DriverPayment | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<DriverPayment | null>(
    null
  );
  const [formData, setFormData] = useState({
    driver_id: "",
    week_start_date: "",
    amount_paid: "",
    balance_carryover: "",
  });

  const drivers = users.filter((u) => u.role === "driver" && u.active);
  console.log("Drivers:", drivers);

  const resetForm = () => {
    setFormData({
      driver_id: "",
      week_start_date: "",
      amount_paid: "",
      balance_carryover: "",
    });
    setEditingPayment(null);
  };

  const handleEdit = (payment: DriverPayment) => {
    setEditingPayment(payment);
    setFormData({
      driver_id: payment.driver_id,
      week_start_date: payment.week_start_date,
      amount_paid: payment.amount_paid.toString(),
      balance_carryover: payment.balance_carryover.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = (payment: DriverPayment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (paymentToDelete && paymentToDelete.id) {
      await deletePayment(paymentToDelete.id);
      setShowDeleteModal(false);
      setPaymentToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPayment && editingPayment.id) {
      // Update existing payment
      const updatedPayment: Partial<DriverPayment> = {
        driver_id: formData.driver_id,
        week_start_date: formData.week_start_date,
        amount_paid: parseFloat(formData.amount_paid),
        balance_carryover: parseFloat(formData.balance_carryover) || 0,
      };

      await updatePayment(editingPayment.id, updatedPayment);
    } else {
      // Create new payment
      const newPayment: DriverPayment = {
        driver_id: formData.driver_id,
        week_start_date: formData.week_start_date,
        amount_paid: parseFloat(formData.amount_paid),
        balance_carryover: parseFloat(formData.balance_carryover) || 0,
        created_at: new Date().toISOString(),
        created_by: currentUser?.id || "",
      };

      await savePayments(newPayment);
    }

    setShowModal(false);
    resetForm();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Manage driver payments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week Start
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance Carryover
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Recorded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments
                .slice()
                .reverse()
                .map((payment) => {
                  const driver = users.find((u) => u.id === payment.driver_id);
                  return (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {driver?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {payment.week_start_date}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-600">
                            ₺{payment.amount_paid.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          ₺{payment.balance_carryover.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(payment)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit payment"
                          >
                            <Edit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(payment)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete payment"
                          >
                            <LucideDelete />
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPayment ? "Edit Payment" : "Record Payment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver
                </label>
                <select
                  required
                  value={formData.driver_id}
                  onChange={(e) =>
                    setFormData({ ...formData, driver_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.week_start_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      week_start_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount_paid}
                  onChange={(e) =>
                    setFormData({ ...formData, amount_paid: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balance Carryover (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance_carryover}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      balance_carryover: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingPayment ? "Update Payment" : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this payment record? This action
              cannot be undone.
            </p>
            {paymentToDelete && (
              <div className="bg-gray-50 p-3 rounded-md mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Driver:</strong>{" "}
                  {users.find((u) => u.id === paymentToDelete.driver_id)?.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Week:</strong> {paymentToDelete.week_start_date}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Amount:</strong> ₺
                  {paymentToDelete.amount_paid.toLocaleString()}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPaymentToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
