import { useState, useEffect } from 'react';
import { User, DriverPayment, Expense, InvestorPayout, DashboardStats } from '../types';
import { supabase } from '../lib/supabase';

export function useData() {
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<DriverPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payouts, setPayouts] = useState<InvestorPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*');
        
        if (userError) throw userError;
        if (userData) setUsers(userData);
        
        // Load payments
        const { data: paymentData, error: paymentError } = await supabase
          .from('driver_payments')
          .select('*');
        
        if (paymentError) throw paymentError;
        if (paymentData) setPayments(paymentData);
        
        // Load expenses
        const { data: expenseData, error: expenseError } = await supabase
          .from('expenses')
          .select('*');
        
        if (expenseError) throw expenseError;
        if (expenseData) setExpenses(expenseData);
        
        // Load payouts
        const { data: payoutData, error: payoutError } = await supabase
          .from('investor_payouts')
          .select('*');
        
        if (payoutError) throw payoutError;
        if (payoutData) setPayouts(payoutData);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const saveUsers = async (newUsers: User[]) => {
    try {
      setIsLoading(true);
      
      // Optimistic UI update
      setUsers(newUsers);
      
      // Clear existing users
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .not('role', 'eq', 'admin'); // Don't delete admin users
      
      if (deleteError) throw deleteError;
      
      // Insert new users (excluding admin users from the array)
      const nonAdminUsers = newUsers.filter(user => user.role !== 'admin');
      
      if (nonAdminUsers.length > 0) {
        const { error: insertError } = await supabase
          .from('users')
          .insert(nonAdminUsers);
        
        if (insertError) throw insertError;
      }
      
      // Refresh users list
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      if (data) setUsers(data);
      
    } catch (error) {
      console.error('Error saving users:', error);
      
      // Revert optimistic update on error
      const { data } = await supabase.from('users').select('*');
      if (data) setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  const savePayments = async (newPayments: DriverPayment[]) => {
    try {
      setIsLoading(true);
      
      // Optimistic UI update
      setPayments(newPayments);
      
      // Clear existing payments
      const { error: deleteError } = await supabase
        .from('driver_payments')
        .delete()
        .gt('id', '0'); // Delete all records
      
      if (deleteError) throw deleteError;
      
      // Insert new payments
      if (newPayments.length > 0) {
        const { error: insertError } = await supabase
          .from('driver_payments')
          .insert(newPayments);
        
        if (insertError) throw insertError;
      }
      
      // Refresh payments list
      const { data, error } = await supabase
        .from('driver_payments')
        .select('*');
      
      if (error) throw error;
      if (data) setPayments(data);
      
    } catch (error) {
      console.error('Error saving payments:', error);
      
      // Revert optimistic update on error
      const { data } = await supabase.from('driver_payments').select('*');
      if (data) setPayments(data);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      setIsLoading(true);
      
      // Optimistic UI update
      setExpenses(newExpenses);
      
      // Clear existing expenses
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .gt('id', '0'); // Delete all records
      
      if (deleteError) throw deleteError;
      
      // Insert new expenses
      if (newExpenses.length > 0) {
        const { error: insertError } = await supabase
          .from('expenses')
          .insert(newExpenses);
        
        if (insertError) throw insertError;
      }
      
      // Refresh expenses list
      const { data, error } = await supabase
        .from('expenses')
        .select('*');
      
      if (error) throw error;
      if (data) setExpenses(data);
      
    } catch (error) {
      console.error('Error saving expenses:', error);
      
      // Revert optimistic update on error
      const { data } = await supabase.from('expenses').select('*');
      if (data) setExpenses(data);
    } finally {
      setIsLoading(false);
    }
  };

  const savePayouts = async (newPayouts: InvestorPayout[]) => {
    try {
      setIsLoading(true);
      
      // Optimistic UI update
      setPayouts(newPayouts);
      
      // Clear existing payouts
      const { error: deleteError } = await supabase
        .from('investor_payouts')
        .delete()
        .gt('id', '0'); // Delete all records
      
      if (deleteError) throw deleteError;
      
      // Insert new payouts
      if (newPayouts.length > 0) {
        const { error: insertError } = await supabase
          .from('investor_payouts')
          .insert(newPayouts);
        
        if (insertError) throw insertError;
      }
      
      // Refresh payouts list
      const { data, error } = await supabase
        .from('investor_payouts')
        .select('*');
      
      if (error) throw error;
      if (data) setPayouts(data);
      
    } catch (error) {
      console.error('Error saving payouts:', error);
      
      // Revert optimistic update on error
      const { data } = await supabase.from('investor_payouts').select('*');
      if (data) setPayouts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardStats = (): DashboardStats => {
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPayouts = payouts.reduce((sum, p) => sum + p.net_amount, 0);
    const netProfit = totalRevenue - totalExpenses - totalPayouts;
    
    const activeDrivers = users.filter(u => u.role === 'driver' && u.active).length;
    const activeInvestors = users.filter(u => u.role === 'investor' && u.active).length;
    const pendingPayouts = payouts.filter(p => p.status === 'pending').length;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthRevenue = payments
      .filter(p => p.week_start_date.startsWith(currentMonth))
      .reduce((sum, p) => sum + p.amount_paid, 0);

    return {
      totalRevenue,
      totalExpenses,
      totalPayouts,
      netProfit,
      activeDrivers,
      activeInvestors,
      pendingPayouts,
      currentMonthRevenue,
    };
  };

  return {
    users,
    payments,
    expenses,
    payouts,
    isLoading,
    saveUsers,
    savePayments,
    saveExpenses,
    savePayouts,
    getDashboardStats,
  };
}