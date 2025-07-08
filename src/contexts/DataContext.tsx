import React, { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  DashboardStats,
  DriverPayment,
  Expense,
  InvestorPayout,
  User,
} from "../types";

interface DataContextType {
  users: User[];
  payments: DriverPayment[];
  expenses: Expense[];
  payouts: InvestorPayout[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshPayments: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
  refreshPayouts: () => Promise<void>;
  saveUsers: (newUsers: User[]) => Promise<void>;
  savePayments: (newPayments: DriverPayment[]) => Promise<void>;
  saveExpenses: (newExpenses: Expense[]) => Promise<void>;
  savePayouts: (newPayouts: InvestorPayout[]) => Promise<void>;
  getDashboardStats: () => DashboardStats;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export { DataContext };

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<DriverPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payouts, setPayouts] = useState<InvestorPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      if (data) setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const refreshPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("driver_payments")
        .select("*")
        .order("week_start_date", { ascending: false });
      if (error) throw error;
      if (data) setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const refreshExpenses = async () => {
    try {
      const { data, error } = await supabase.from("expenses").select("*");
      if (error) throw error;
      if (data) setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const refreshPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from("investor_payouts")
        .select("*");
      if (error) throw error;
      if (data) setPayouts(data);
    } catch (error) {
      console.error("Error fetching payouts:", error);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        refreshUsers(),
        refreshPayments(),
        refreshExpenses(),
        refreshPayouts(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data once on mount
  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveUsers = async (newUsers: User[]) => {
    try {
      setIsLoading(true);

      // Optimistic UI update
      setUsers(newUsers);

      // Clear existing users
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .not("role", "eq", "admin"); // Don't delete admin users

      if (deleteError) throw deleteError;

      // Insert new users (excluding admin users from the array)
      const nonAdminUsers = newUsers.filter((user) => user.role !== "admin");

      if (nonAdminUsers.length > 0) {
        const { error: insertError } = await supabase
          .from("users")
          .insert(nonAdminUsers);

        if (insertError) throw insertError;
      }

      // Refresh users list
      await refreshUsers();
    } catch (error) {
      console.error("Error saving users:", error);
      // Revert optimistic update on error
      await refreshUsers();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const savePayments = async (newPayments: DriverPayment[]) => {
    try {
      setIsLoading(true);

      // Clear existing payments
      const { error: deleteError } = await supabase
        .from("driver_payments")
        .delete()
        .gte("id", "");

      if (deleteError) throw deleteError;

      // Insert new payments
      if (newPayments.length > 0) {
        const { error: insertError } = await supabase
          .from("driver_payments")
          .insert(newPayments);

        if (insertError) throw insertError;
      }

      await refreshPayments();
    } catch (error) {
      console.error("Error saving payments:", error);
      await refreshPayments();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      setIsLoading(true);

      // Clear existing expenses
      const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .gte("id", "");

      if (deleteError) throw deleteError;

      // Insert new expenses
      if (newExpenses.length > 0) {
        const { error: insertError } = await supabase
          .from("expenses")
          .insert(newExpenses);

        if (insertError) throw insertError;
      }

      await refreshExpenses();
    } catch (error) {
      console.error("Error saving expenses:", error);
      await refreshExpenses();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const savePayouts = async (newPayouts: InvestorPayout[]) => {
    try {
      setIsLoading(true);

      // Clear existing payouts
      const { error: deleteError } = await supabase
        .from("investor_payouts")
        .delete()
        .gte("id", "");

      if (deleteError) throw deleteError;

      // Insert new payouts
      if (newPayouts.length > 0) {
        const { error: insertError } = await supabase
          .from("investor_payouts")
          .insert(newPayouts);

        if (insertError) throw insertError;
      }

      await refreshPayouts();
    } catch (error) {
      console.error("Error saving payouts:", error);
      await refreshPayouts();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardStats = (): DashboardStats => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate monthly totals
    const monthlyPayments = payments.filter((payment) => {
      const paymentDate = new Date(payment.week_start_date);
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    });

    // Count active drivers and investors
    const activeDrivers = users.filter(
      (user) => user.role === "driver" && user.active
    ).length;
    const activeInvestors = users.filter(
      (user) => user.role === "investor" && user.active
    ).length;

    return {
      totalRevenue: payments.reduce(
        (sum, payment) => sum + payment.amount_paid,
        0
      ),
      totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      totalPayouts: payouts.reduce((sum, payout) => sum + payout.net_amount, 0),
      netProfit:
        payments.reduce((sum, payment) => sum + payment.amount_paid, 0) -
        expenses.reduce((sum, expense) => sum + expense.amount, 0) -
        payouts.reduce((sum, payout) => sum + payout.net_amount, 0),
      activeDrivers,
      activeInvestors,
      pendingPayouts: payouts.filter((payout) => payout.status === "pending")
        .length,
      currentMonthRevenue: monthlyPayments.reduce(
        (sum, payment) => sum + payment.amount_paid,
        0
      ),
    };
  };

  const value: DataContextType = {
    users,
    payments,
    expenses,
    payouts,
    isLoading,
    refreshData,
    refreshUsers,
    refreshPayments,
    refreshExpenses,
    refreshPayouts,
    saveUsers,
    savePayments,
    saveExpenses,
    savePayouts,
    getDashboardStats,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
