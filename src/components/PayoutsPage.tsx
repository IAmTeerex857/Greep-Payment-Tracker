import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { InvestorPayout } from '../types';
import { Plus, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';

export function PayoutsPage() {
  const { users, payouts, savePayouts, expenses } = useData();
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    investor_id: '',
    month: '',
    gross_amount: '',
    status: 'pending' as 'pending' | 'paid',
  });

  const investors = users.filter(u => u.role === 'investor' && u.active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate investor expenses for the month
    const investorExpenses = expenses.filter(expense => 
      expense.type === 'investor' && 
      expense.user_id === formData.investor_id &&
      expense.date.startsWith(formData.month)
    );
    
    const totalExpenses = investorExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const grossAmount = parseFloat(formData.gross_amount);
    const netAmount = grossAmount - totalExpenses;

    const newPayout: InvestorPayout = {
      id: Date.now().toString(),
      investor_id: formData.investor_id,
      month: formData.month,
      gross_amount: grossAmount,
      total_expenses: totalExpenses,
      net_amount: netAmount,
      status: formData.status,
      created_at: new Date().toISOString(),
      created_by: currentUser?.id || '',
    };

    savePayouts([...payouts, newPayout]);
    setShowModal(false);
    setFormData({
      investor_id: '',
      month: '',
      gross_amount: '',
      status: 'pending',
    });
  };

  const togglePayoutStatus = (payoutId: string) => {
    const updatedPayouts = payouts.map(p => 
      p.id === payoutId 
        ? { ...p, status: p.status === 'pending' ? 'paid' : 'pending' }
        : p
    );
    savePayouts(updatedPayouts);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-600">Manage investor payouts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate Payout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Amount
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
              {payouts.slice().reverse().map((payout) => {
                const investor = users.find(u => u.id === payout.investor_id);
                return (
                  <tr key={payout.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{investor?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{payout.month}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-900">
                          ₺{payout.gross_amount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-sm text-red-600">
                          ₺{payout.total_expenses.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-green-600">
                          ₺{payout.net_amount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        payout.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {payout.status === 'paid' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => togglePayoutStatus(payout.id)}
                        className={`${
                          payout.status === 'pending' ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'
                        }`}
                      >
                        {payout.status === 'pending' ? 'Mark Paid' : 'Mark Pending'}
                      </button>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Payout</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investor
                </label>
                <select
                  required
                  value={formData.investor_id}
                  onChange={(e) => {
                    const investor = investors.find(i => i.id === e.target.value);
                    const monthlyRate = investor?.tier === 'X' ? 15000 : 16500;
                    setFormData({
                      ...formData, 
                      investor_id: e.target.value,
                      gross_amount: monthlyRate.toString()
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select investor</option>
                  {investors.map(investor => (
                    <option key={investor.id} value={investor.id}>
                      {investor.name} (Tier {investor.tier})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gross Amount (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.gross_amount}
                  onChange={(e) => setFormData({...formData, gross_amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'pending' | 'paid'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      investor_id: '',
                      month: '',
                      gross_amount: '',
                      status: 'pending',
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
                  Generate Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}