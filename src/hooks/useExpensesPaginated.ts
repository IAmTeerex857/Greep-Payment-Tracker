import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Expense } from "../types";
import { useData } from "./useGlobalData";

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface ExpensesResponse {
  data: Expense[];
  totalCount: number;
  pageCount: number;
}

export function useExpensesPaginated() {
  const {
    expenses: allData,
    refreshExpenses,
    isLoading: globalLoading,
  } = useData();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState[]>([
    { id: "date", desc: true }, // Most recent expenses first
  ]);

  // Filter and sort data in frontend
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...allData];

    // Apply sorting
    if (sorting.length > 0) {
      filtered = filtered.sort((a, b) => {
        for (const sort of sorting) {
          const aValue = a[sort.id as keyof Expense];
          const bValue = b[sort.id as keyof Expense];

          let comparison = 0;
          if (aValue != null && bValue != null) {
            if (aValue < bValue) comparison = -1;
            else if (aValue > bValue) comparison = 1;
          } else if (aValue == null && bValue != null) comparison = 1;
          else if (aValue != null && bValue == null) comparison = -1;

          if (comparison !== 0) {
            return sort.desc ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    return filtered;
  }, [allData, sorting]);

  // Calculate pagination
  const totalCount = filteredAndSortedData.length;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);
  const from = pagination.pageIndex * pagination.pageSize;
  const to = from + pagination.pageSize;
  const data = filteredAndSortedData.slice(from, to);

  const addExpense = async (newExpense: Omit<Expense, "id">) => {
    try {
      const expenseWithId = {
        ...newExpense,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("expenses").insert(expenseWithId);

      if (error) throw error;

      // Refresh the global data
      await refreshExpenses();

      return expenseWithId;
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  };

  const updateExpense = async (
    id: string,
    updatedExpense: Partial<Expense>
  ) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .update(updatedExpense)
        .eq("id", id);

      if (error) throw error;

      // Refresh the global data
      await refreshExpenses();
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;

      // Refresh the global data
      await refreshExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  };

  return {
    data,
    totalCount,
    pageCount,
    isLoading: globalLoading,
    pagination,
    setPagination,
    sorting,
    setSorting,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: refreshExpenses,
  };
}
