import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Expense } from '../types';
import { Plus, Receipt, Calendar, DollarSign } from 'lucide-react';

export function ExpensesPage() {
  const { users, expenses, saveExpenses } = useData();
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'admin' as 'admin' | 'driver' | 'investor',
    amount: '',
    date: '',
    description: '',
    paid_by: '',
    user_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      paid_by: formData.paid_by,
      user_id: formData.user_id || undefined,
      created_at: new Date().toISOString(),
      created_by: currentUser?.id || '',
    };

    saveExpenses([...expenses, newExpense]);
    setShowModal(false);
    setFormData({
      type: 'admin',
      amount: '',
      date: '',
      description: '',
      paid_by: '',
      user_id: '',
    });
  };

  const getExpenseUser = (expense: Expense) => {
    if (expense.user_id) {
      return users.find(u => u.id === expense.user_id);
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track all business expenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.slice().reverse().map((expense) => {
                const expenseUser = getExpenseUser(expense);
                return (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        expense.type === 'admin' ? 'bg-blue-100 text-blue-800' :
                        expense.type === 'driver' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {expense.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{expense.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-sm font-medium text-red-600">
                          ₺{expense.amount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{expense.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{expense.paid_by}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {expenseUser ? expenseUser.name : '-'}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Type
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'admin' | 'driver' | 'investor', user_id: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin Expense</option>
                  <option value="driver">Driver Expense</option>
                  <option value="investor">Investor Expense</option>
                </select>
              </div>
              
              {(formData.type === 'driver' || formData.type === 'investor') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.type === 'driver' ? 'Driver' : 'Investor'}
                  </label>
                  <select
                    required
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select {formData.type}</option>
                    {users
                      .filter(u => u.role === formData.type && u.active)
                      .map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid By
                </label>
                <input
                  type="text"
                  required
                  value={formData.paid_by}
                  onChange={(e) => setFormData({...formData, paid_by: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Admin, Company Card, etc."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      type: 'admin',
                      amount: '',
                      date: '',
                      description: '',
                      paid_by: '',
                      user_id: '',
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
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}