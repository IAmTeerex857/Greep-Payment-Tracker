import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  DashboardStats,
  DriverPayment,
  Expense,
  InvestorPayout,
  User,
} from "../types";

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
          .from("users")
          .select("*");

        if (userError) throw userError;
        if (userData) setUsers(userData);

        // Load payments
        const { data: paymentData, error: paymentError } = await supabase
          .from("driver_payments")
          .select("*");

        if (paymentError) throw paymentError;
        if (paymentData) setPayments(paymentData);

        // Load expenses
        const { data: expenseData, error: expenseError } = await supabase
          .from("expenses")
          .select("*");

        if (expenseError) throw expenseError;
        if (expenseData) setExpenses(expenseData);

        // Load payouts
        const { data: payoutData, error: payoutError } = await supabase
          .from("investor_payouts")
          .select("*");

        if (payoutError) throw payoutError;
        if (payoutData) setPayouts(payoutData);
      } catch (error) {
        console.error("Error loading data:", error);
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
      const { data, error } = await supabase.from("users").select("*");

      if (error) throw error;
      if (data) setUsers(data);
    } catch (error) {
      console.error("Error saving users:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("users").select("*");
      if (data) setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  const savePayments = async (newPayments: DriverPayment) => {
    try {
      setIsLoading(true);

      const { error: insertError } = await supabase
        .from("driver_payments")
        .insert(newPayments);

      if (insertError) throw insertError;

      // Refresh payments list
      const { data, error } = await supabase
        .from("driver_payments")
        .select("*");

      if (error) throw error;
      if (data) setPayments(data);
    } catch (error) {
      console.error("Error saving payments:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("driver_payments").select("*");
      if (data) setPayments(data);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayment = async (
    id: string,
    updatedPayment: Partial<DriverPayment>
  ) => {
    try {
      setIsLoading(true);

      const { error: updateError } = await supabase
        .from("driver_payments")
        .update(updatedPayment)
        .eq("id", id);

      if (updateError) throw updateError;

      // Refresh payments list
      const { data, error } = await supabase
        .from("driver_payments")
        .select("*");

      if (error) throw error;
      if (data) setPayments(data);
    } catch (error) {
      console.error("Error updating payment:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("driver_payments").select("*");
      if (data) setPayments(data);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePayment = async (id: string) => {
    try {
      setIsLoading(true);

      const { error: deleteError } = await supabase
        .from("driver_payments")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Refresh payments list
      const { data, error } = await supabase
        .from("driver_payments")
        .select("*");

      if (error) throw error;
      if (data) setPayments(data);
    } catch (error) {
      console.error("Error deleting payment:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("driver_payments").select("*");
      if (data) setPayments(data);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpenses = async (newExpenses: Expense) => {
    try {
      setIsLoading(true);

      // Clear existing expenses

      const { error: insertError } = await supabase
        .from("expenses")
        .insert(newExpenses);

      if (insertError) throw insertError;

      // Refresh expenses list
      const { data, error } = await supabase.from("expenses").select("*");
      if (error) throw error;

      if (data) setExpenses(data);
    } catch (error) {
      console.error("Error saving expenses:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("expenses").select("*");
      if (data) setExpenses(data);
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpense = async (
    id: string,
    updatedExpense: Partial<Expense>
  ) => {
    try {
      setIsLoading(true);

      const { error: updateError } = await supabase
        .from("expenses")
        .update(updatedExpense)
        .eq("id", id);

      if (updateError) throw updateError;

      // Refresh expenses list
      const { data, error } = await supabase.from("expenses").select("*");

      if (error) throw error;
      if (data) setExpenses(data);
    } catch (error) {
      console.error("Error updating expense:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("expenses").select("*");
      if (data) setExpenses(data);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      setIsLoading(true);

      const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Refresh expenses list
      const { data, error } = await supabase.from("expenses").select("*");

      if (error) throw error;
      if (data) setExpenses(data);
    } catch (error) {
      console.error("Error deleting expense:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("expenses").select("*");
      if (data) setExpenses(data);
    } finally {
      setIsLoading(false);
    }
  };

  const savePayouts = async (newPayouts: InvestorPayout) => {
    try {
      setIsLoading(true);

      const { error: insertError } = await supabase
        .from("investor_payouts")
        .insert(newPayouts);

      if (insertError) throw insertError;

      // Refresh payouts list
      const { data, error } = await supabase
        .from("investor_payouts")
        .select("*");

      if (error) throw error;
      if (data) setPayouts(data);
    } catch (error) {
      console.error("Error saving payouts:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("investor_payouts").select("*");
      if (data) setPayouts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayout = async (
    id: string,
    updatedPayout: Partial<InvestorPayout>
  ) => {
    try {
      setIsLoading(true);

      const { error: updateError } = await supabase
        .from("investor_payouts")
        .update(updatedPayout)
        .eq("id", id);

      if (updateError) throw updateError;

      // Refresh payouts list
      const { data, error } = await supabase
        .from("investor_payouts")
        .select("*");

      if (error) throw error;
      if (data) setPayouts(data);
    } catch (error) {
      console.error("Error updating payout:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("investor_payouts").select("*");
      if (data) setPayouts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePayout = async (id: string) => {
    try {
      setIsLoading(true);

      const { error: deleteError } = await supabase
        .from("investor_payouts")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Refresh payouts list
      const { data, error } = await supabase
        .from("investor_payouts")
        .select("*");

      if (error) throw error;
      if (data) setPayouts(data);
    } catch (error) {
      console.error("Error deleting payout:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("investor_payouts").select("*");
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

    const activeDrivers = users.filter(
      (u) => u.role === "driver" && u.active
    ).length;
    const activeInvestors = users.filter(
      (u) => u.role === "investor" && u.active
    ).length;
    const pendingPayouts = payouts.filter((p) => p.status === "pending").length;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthRevenue = payments
      .filter((p) => p.week_start_date.startsWith(currentMonth))
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

  const addUser = async (newUser: Omit<User, "id">) => {
    try {
      setIsLoading(true);

      // Generate a proper UUID for the user
      const userWithId = {
        ...newUser,
        id: crypto.randomUUID(),
      };

      const { error: insertError } = await supabase
        .from("users")
        .insert(userWithId);

      if (insertError) throw insertError;

      // Refresh users list
      const { data, error } = await supabase.from("users").select("*");

      if (error) throw error;
      if (data) setUsers(data);

      return userWithId;
    } catch (error) {
      console.error("Error adding user:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("users").select("*");
      if (data) setUsers(data);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, updatedUser: Partial<User>) => {
    try {
      setIsLoading(true);

      // Optimistic UI update
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u))
      );

      const { error: updateError } = await supabase
        .from("users")
        .update(updatedUser)
        .eq("id", id);

      if (updateError) throw updateError;

      // Refresh users list
      const { data, error } = await supabase.from("users").select("*");

      if (error) throw error;
      if (data) setUsers(data);
    } catch (error) {
      console.error("Error updating user:", error);

      // Revert optimistic update on error
      const { data } = await supabase.from("users").select("*");
      if (data) setUsers(data);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (id: string) => {
    try {
      const user = users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");

      await updateUser(id, { active: !user.active });
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw error;
    }
  };

  return {
    users,
    payments,
    expenses,
    payouts,
    isLoading,
    saveUsers,
    addUser,
    updateUser,
    toggleUserStatus,
    savePayments,
    updatePayment,
    deletePayment,
    saveExpenses,
    updateExpense,
    deleteExpense,
    savePayouts,
    updatePayout,
    deletePayout,
    getDashboardStats,
  };
}
