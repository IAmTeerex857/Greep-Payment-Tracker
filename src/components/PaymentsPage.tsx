import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { DriverPayment } from '../types';
import { Plus, Calendar, DollarSign } from 'lucide-react';

export function PaymentsPage() {
  const { users, payments, savePayments } = useData();
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    driver_id: '',
    week_start_date: '',
    amount_paid: '',
    balance_carryover: '',
  });

  const drivers = users.filter(u => u.role === 'driver' && u.active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPayment: DriverPayment = {
      id: Date.now().toString(),
      driver_id: formData.driver_id,
      week_start_date: formData.week_start_date,
      amount_paid: parseFloat(formData.amount_paid),
      balance_carryover: parseFloat(formData.balance_carryover) || 0,
      created_at: new Date().toISOString(),
      created_by: currentUser?.id || '',
    };

    savePayments([...payments, newPayment]);
    setShowModal(false);
    setFormData({
      driver_id: '',
      week_start_date: '',
      amount_paid: '',
      balance_carryover: '',
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Manage driver payments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.slice().reverse().map((payment) => {
                const driver = users.find(u => u.id === payment.driver_id);
                return (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{driver?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{payment.week_start_date}</span>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver
                </label>
                <select
                  required
                  value={formData.driver_id}
                  onChange={(e) => setFormData({...formData, driver_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
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
                  onChange={(e) => setFormData({...formData, week_start_date: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, balance_carryover: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      driver_id: '',
                      week_start_date: '',
                      amount_paid: '',
                      balance_carryover: '',
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}