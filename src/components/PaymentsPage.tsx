import { Calendar, Edit2, Plus, Trash } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { DateRange } from "react-date-range";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { DriverPayment } from "../types";

// Import react-date-range styles
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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

  // Filter state - default to current month
  const currentDate = new Date();
  const currentMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const currentMonthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const [dateRange, setDateRange] = useState([
    {
      startDate: currentMonthStart,
      endDate: currentMonthEnd,
      key: "selection",
    },
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const drivers = users.filter((u) => u.role === "driver" && u.active);

  // Filter payments based on date range
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const paymentDate = new Date(payment.week_start_date);
      const startDate = new Date(dateRange[0].startDate);
      const endDate = new Date(dateRange[0].endDate);

      // Set time to start of day for accurate date comparison (ignore time)
      paymentDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999); // Set end date to end of day to make it inclusive

      return paymentDate >= startDate && paymentDate <= endDate;
    });
  }, [payments, dateRange]);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage driver payments
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
          Record Payment
        </button>
      </div>

      {/* Filter Section */}
      <div className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center  gap-4">
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-between min-w-[200px] group"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
                <span className="text-gray-900 dark:text-white font-medium">
                  {dateRange[0].startDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {dateRange[0].endDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 dark:text-gray-300 group-hover:text-blue-500 transition-all duration-200 ${
                  showDatePicker ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDatePicker && (
              <div className="absolute top-full left-0 sm:left-0 sm:right-auto mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl">
                {/* ...existing code... */}
                <DateRange
                  ranges={dateRange}
                  onChange={(ranges) => {
                    setDateRange([
                      {
                        startDate: ranges.selection.startDate || new Date(),
                        endDate: ranges.selection.endDate || new Date(),
                        key: "selection",
                      },
                    ]);
                    // Only close if both dates are selected and endDate is different from startDate
                    if (
                      ranges.selection.startDate &&
                      ranges.selection.endDate &&
                      ranges.selection.startDate.getTime() !==
                        ranges.selection.endDate.getTime()
                    ) {
                      setShowDatePicker(false);
                    }
                  }}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  className="border-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Showing {filteredPayments.length} of {payments.length} payments
        <span className="ml-2">
          • From:{" "}
          {dateRange[0].startDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="ml-2">
          • To:{" "}
          {dateRange[0].endDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Week Start
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Balance Carryover
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date Recorded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Calendar className="w-8 h-8 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                      <p className="text-lg font-medium">No payments found</p>
                      <p className="text-sm">
                        {filteredPayments.length === 0 && payments.length > 0
                          ? "No payments match your selected date range."
                          : "No payments have been recorded yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments
                  .slice()
                  .reverse()
                  .map((payment) => {
                    const driver = users.find(
                      (u) => u.id === payment.driver_id
                    );
                    return (
                      <tr
                        key={payment.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {driver?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-gray-300">
                              {payment.week_start_date}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              ₺{payment.amount_paid.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-gray-300">
                            ₺{payment.balance_carryover.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(payment)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              title="Edit payment"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(payment)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              title="Delete payment"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingPayment ? "Edit Payment" : "Record Payment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Driver
                </label>
                <select
                  required
                  value={formData.driver_id}
                  onChange={(e) => {
                    const driverId = e.target.value;
                    const amountPaid = parseFloat(formData.amount_paid) || 0;
                    let balanceCarryover = 0;

                    // Calculate balance carryover based on driver tier
                    if (driverId) {
                      const selectedDriver = drivers.find(
                        (driver) => driver.id === driverId
                      );
                      if (selectedDriver) {
                        const tierAmount =
                          selectedDriver.tier === "A"
                            ? 760
                            : selectedDriver.tier === "B"
                            ? 800
                            : 0;
                        balanceCarryover = tierAmount - amountPaid;
                      }
                    }

                    setFormData({
                      ...formData,
                      driver_id: driverId,
                      balance_carryover: balanceCarryover.toString(),
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount Paid (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount_paid}
                  onChange={(e) => {
                    const amountPaid = parseFloat(e.target.value) || 0;
                    let balanceCarryover = 0;

                    // Calculate balance carryover based on driver tier
                    if (formData.driver_id) {
                      const selectedDriver = drivers.find(
                        (driver) => driver.id === formData.driver_id
                      );
                      if (selectedDriver) {
                        const tierAmount =
                          selectedDriver.tier === "A"
                            ? 760
                            : selectedDriver.tier === "B"
                            ? 800
                            : 0;
                        balanceCarryover = tierAmount - amountPaid;
                      }
                    }

                    setFormData({
                      ...formData,
                      amount_paid: e.target.value,
                      balance_carryover: balanceCarryover.toString(),
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Balance Carryover (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  readOnly
                  value={formData.balance_carryover}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this payment record? This action
              cannot be undone.
            </p>
            {paymentToDelete && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Driver:</strong>{" "}
                  {users.find((u) => u.id === paymentToDelete.driver_id)?.name}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Week:</strong> {paymentToDelete.week_start_date}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
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
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
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
