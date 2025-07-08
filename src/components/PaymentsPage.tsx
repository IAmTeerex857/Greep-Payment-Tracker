import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Edit2, Plus, Trash } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DateRange } from "react-date-range";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useGlobalData";
import { usePaymentsPaginated } from "../hooks/usePaymentsPaginated";
import { DriverPayment } from "../types";
import { DataTable } from "./DataTable";

// Import react-date-range styles
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export function PaymentsPage() {
  const { users } = useData();
  const {
    data: payments,
    totalCount,
    pageCount,
    isLoading,
    pagination,
    setPagination,
    sorting,
    setSorting,
    dateFilter,
    setDateFilter,
    addPayment,
    updatePayment,
    deletePayment,
  } = usePaymentsPaginated();

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

  // Date range for filtering
  const [dateRange, setDateRange] = useState([
    {
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
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

  // Update filter when date range changes
  useEffect(() => {
    if (dateRange[0].startDate && dateRange[0].endDate) {
      setDateFilter({
        startDate: dateRange[0].startDate,
        endDate: dateRange[0].endDate,
      });
    }
  }, [dateRange, setDateFilter]);

  const drivers = useMemo(
    () => users.filter((u) => u.role === "driver" && u.active),
    [users]
  );

  const resetForm = useCallback(() => {
    setFormData({
      driver_id: "",
      week_start_date: "",
      amount_paid: "",
      balance_carryover: "",
    });
    setEditingPayment(null);
  }, []);

  const handleEdit = useCallback((payment: DriverPayment) => {
    setEditingPayment(payment);
    setFormData({
      driver_id: payment.driver_id,
      week_start_date: payment.week_start_date,
      amount_paid: payment.amount_paid.toString(),
      balance_carryover: payment.balance_carryover.toString(),
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((payment: DriverPayment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  }, []);

  const calculateBalanceCarryover = useCallback(
    (driverId: string, amountPaid: number) => {
      if (!driverId) return 0;

      const selectedDriver = drivers.find((driver) => driver.id === driverId);
      if (!selectedDriver) return 0;

      const tierAmount =
        selectedDriver.tier === "A"
          ? 760
          : selectedDriver.tier === "B"
          ? 800
          : 0;
      return tierAmount - amountPaid;
    },
    [drivers]
  );

  const handleDriverChange = useCallback(
    (driverId: string) => {
      const amountPaid = parseFloat(formData.amount_paid) || 0;
      const balanceCarryover = calculateBalanceCarryover(driverId, amountPaid);

      setFormData((prev) => ({
        ...prev,
        driver_id: driverId,
        balance_carryover: balanceCarryover.toString(),
      }));
    },
    [formData.amount_paid, calculateBalanceCarryover]
  );

  const handleAmountPaidChange = useCallback(
    (amountPaidStr: string) => {
      const amountPaid = parseFloat(amountPaidStr) || 0;
      const balanceCarryover = calculateBalanceCarryover(
        formData.driver_id,
        amountPaid
      );

      setFormData((prev) => ({
        ...prev,
        amount_paid: amountPaidStr,
        balance_carryover: balanceCarryover.toString(),
      }));
    },
    [formData.driver_id, calculateBalanceCarryover]
  );

  const columns: ColumnDef<DriverPayment>[] = useMemo(
    () => [
      {
        accessorKey: "week_start_date",
        header: "Week Start",
        cell: ({ row }) => (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(row.getValue("week_start_date")).toLocaleDateString()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "driver_id",
        header: "Driver",
        cell: ({ row }) => {
          const driverId = row.getValue("driver_id") as string;
          const driver = users.find((u) => u.id === driverId);
          return (
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {driver?.name || "Unknown Driver"}
            </div>
          );
        },
      },
      {
        accessorKey: "amount_paid",
        header: "Amount Paid",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-green-600 dark:text-green-400">
            ₺{(row.getValue("amount_paid") as number).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "balance_carryover",
        header: "Balance Carryover",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            ₺{(row.getValue("balance_carryover") as number).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Date Recorded",
        cell: ({ row }) => (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(row.getValue("created_at")).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const payment = row.original;
          return (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleEdit(payment)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                title="Edit payment"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(payment)}
                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                title="Delete payment"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPayment && editingPayment.id) {
        // Update existing payment
        const updatedPayment: Partial<DriverPayment> = {
          driver_id: formData.driver_id,
          week_start_date: formData.week_start_date,
          amount_paid: parseFloat(formData.amount_paid),
          balance_carryover: parseFloat(formData.balance_carryover),
        };

        await updatePayment(editingPayment.id, updatedPayment);
        toast.success("Payment updated successfully!");
      } else {
        // Create new payment
        const newPayment: Omit<DriverPayment, "id"> = {
          driver_id: formData.driver_id,
          week_start_date: formData.week_start_date,
          amount_paid: parseFloat(formData.amount_paid),
          balance_carryover: parseFloat(formData.balance_carryover),
          created_at: new Date().toISOString(),
          created_by: currentUser?.id || "",
        };

        await addPayment(newPayment);
        toast.success("Payment added successfully!");
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error("Failed to save payment");
    }
  };

  const confirmDelete = async () => {
    if (paymentToDelete && paymentToDelete.id) {
      try {
        await deletePayment(paymentToDelete.id);
        toast.success("Payment deleted successfully!");
        setShowDeleteModal(false);
        setPaymentToDelete(null);
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error("Failed to delete payment");
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateRangeChange = useCallback((item: any) => {
    if (item.selection.startDate && item.selection.endDate) {
      setDateRange([
        {
          startDate: item.selection.startDate,
          endDate: item.selection.endDate,
          key: "selection",
        },
      ]);

      // Close date picker if both dates are selected and they're different
      if (
        item.selection.startDate.getTime() !== item.selection.endDate.getTime()
      ) {
        setShowDatePicker(false);
      }
    }
  }, []);

  return (
    <div className="p-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track driver payments and balances
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Payment
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-between min-w-[200px] group"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-300 group-hover:text-green-500 transition-colors" />
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
              className={`w-4 h-4 text-gray-400 dark:text-gray-300 group-hover:text-green-500 transition-all duration-200 ${
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
            <div className="absolute top-full mt-2  z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl">
              <DateRange
                editableDateInputs={true}
                onChange={handleDateRangeChange}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                months={1}
                className="border-0"
              />
            </div>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
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
              {editingPayment ? "Edit Payment" : "Add New Payment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Driver
                </label>
                <select
                  required
                  value={formData.driver_id}
                  onChange={(e) => handleDriverChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} (Tier {driver.tier})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Week Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.week_start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      week_start_date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount Paid (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount_paid}
                  onChange={(e) => handleAmountPaidChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Balance Carryover (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  readOnly
                  value={formData.balance_carryover}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  {editingPayment ? "Update" : "Add"} Payment
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
              Delete Payment
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this payment? This action cannot
              be undone.
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
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPaymentToDelete(null);
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
