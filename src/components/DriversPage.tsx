import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Plus, UserCheck, UserX } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDriversPaginated } from "../hooks/useDriversPaginated";
import { User } from "../types";
import { DataTable } from "./DataTable";

export function DriversPage() {
  const {
    data: drivers,
    totalCount,
    pageCount,
    isLoading,
    pagination,
    setPagination,
    sorting,
    setSorting,
    addDriver,
    updateDriver,
    toggleDriverStatus,
  } = useDriversPaginated();

  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tier: "A" as "A" | "B",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = useCallback((driver: User) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      tier: driver.tier as "A" | "B",
    });
    setShowModal(true);
  }, []);

  const handleToggleStatus = useCallback(
    async (driverId: string) => {
      try {
        const driver = drivers.find((d) => d.id === driverId);
        const newStatus = !driver?.active ? "active" : "inactive";

        await toggleDriverStatus(driverId);
        toast.success(
          `Driver ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully!`
        );
      } catch (error) {
        console.error("Error toggling driver status:", error);
        toast.error("Failed to update driver status");
      }
    },
    [drivers, toggleDriverStatus]
  );

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {row.getValue("name")}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {row.getValue("email")}
          </div>
        ),
      },
      {
        accessorKey: "tier",
        header: "Tier",
        cell: ({ row }) => {
          const tier = row.getValue("tier") as string;
          return (
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                tier === "A"
                  ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                  : "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
              }`}
            >
              Tier {tier}
            </span>
          );
        },
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.getValue("active") as boolean;
          return (
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                isActive
                  ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const driver = row.original;
          return (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleEdit(driver)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                title="Edit driver"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleStatus(driver.id)}
                className={`transition-colors ${
                  driver.active
                    ? "text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    : "text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                }`}
                title={driver.active ? "Deactivate driver" : "Activate driver"}
              >
                {driver.active ? (
                  <UserX className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        },
      },
    ],
    [handleEdit, handleToggleStatus]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formData);
        toast.success("Driver updated successfully!");
      } else {
        const newDriver = {
          name: formData.name,
          email: formData.email,
          tier: formData.tier,
          password: "no-login-access",
          role: "driver" as const,
          active: true,
          can_login: false,
          created_at: new Date().toISOString(),
        };
        await addDriver(newDriver);
        toast.success("Driver added successfully!");
      }

      setShowModal(false);
      setEditingDriver(null);
      setFormData({ name: "", email: "", tier: "A" });
    } catch (error) {
      console.error("Error saving driver:", error);
      toast.error(
        editingDriver ? "Failed to update driver" : "Failed to add driver"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Drivers
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your driver roster
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Driver
        </button>
      </div>

      <DataTable
        columns={columns}
        data={drivers}
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
              {editingDriver ? "Edit Driver" : "Add New Driver"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tier: e.target.value as "A" | "B",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="A">Tier A</option>
                  <option value="B">Tier B</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDriver(null);
                    setFormData({ name: "", email: "", tier: "A" });
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingDriver
                    ? "Update"
                    : "Add"}{" "}
                  Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
