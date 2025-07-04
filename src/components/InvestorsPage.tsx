import { Edit2, Plus, UserCheck, UserX } from "lucide-react";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useData } from "../hooks/useData";
import { User } from "../types";

export function InvestorsPage() {
  const { users, addUser, updateUser, toggleUserStatus } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tier: "X" as "X" | "Y",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const investors = users
    .filter((u) => u.role === "investor")
    .sort((a, b) => {
      // Active users first, then inactive users
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      // If both have same status, sort by name
      return a.name.localeCompare(b.name);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingInvestor) {
        await updateUser(editingInvestor.id, formData);
        toast.success("Investor updated successfully!");
      } else {
        const newInvestor = {
          name: formData.name,
          email: formData.email,
          role: "investor" as const,
          password: "no-login-access", // Placeholder password
          tier: formData.tier,
          created_at: new Date().toISOString(),
          active: true,
          can_login: false,
        };
        await addUser(newInvestor);
        toast.success("Investor added successfully!");
      }

      setShowModal(false);
      setEditingInvestor(null);
      setFormData({ name: "", email: "", tier: "X" });
    } catch (error) {
      console.error("Error saving investor:", error);
      toast.error(
        editingInvestor ? "Failed to update investor" : "Failed to add investor"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (investor: User) => {
    setEditingInvestor(investor);
    setFormData({
      name: investor.name,
      email: investor.email,
      tier: investor.tier as "X" | "Y",
    });
    setShowModal(true);
  };

  const toggleInvestorStatus = async (investorId: string) => {
    try {
      const investor = users.find((u) => u.id === investorId);
      const newStatus = !investor?.active ? "active" : "inactive";

      await toggleUserStatus(investorId);
      toast.success(
        `Investor ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error) {
      console.error("Error toggling investor status:", error);
      toast.error("Failed to update investor status");
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investors</h1>
          <p className="text-gray-600">Manage your investor roster</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Investor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investors.map((investor) => (
                <tr key={investor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {investor.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {investor.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        investor.tier === "X"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      Tier {investor.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ₺{investor.tier === "X" ? "15,000" : "16,500"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        investor.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {investor.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(investor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleInvestorStatus(investor.id)}
                        className={`${
                          investor.active
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {investor.active ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingInvestor ? "Edit Investor" : "Add New Investor"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tier: e.target.value as "X" | "Y",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="X">Tier X (₺15,000/month)</option>
                  <option value="Y">Tier Y (₺16,500/month)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingInvestor(null);
                    setFormData({ name: "", email: "", tier: "X" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingInvestor
                    ? "Update"
                    : "Add"}{" "}
                  Investor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
