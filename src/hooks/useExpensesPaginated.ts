import { useCallback, useEffect, useState } from "react";
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
  // Removed unused destructured elements from useData()
  useData();
  const [data, setData] = useState<Expense[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState[]>([
    { id: "date", desc: true }, // Most recent expenses first
  ]);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("expenses").select("*", { count: "exact" });

      // Apply sorting
      if (sorting.length > 0) {
        const primarySort = sorting[0];
        query = query.order(primarySort.id, { ascending: !primarySort.desc });

        // Apply secondary sort if available
        if (sorting.length > 1) {
          const secondarySort = sorting[1];
          query = query.order(secondarySort.id, {
            ascending: !secondarySort.desc,
          });
        }
      }

      // Apply pagination
      const from = pagination.pageIndex * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);

      const { data: expenses, error, count } = await query;

      if (error) throw error;

      setData(expenses || []);
      setTotalCount(count || 0);
      setPageCount(Math.ceil((count || 0) / pagination.pageSize));
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setData([]);
      setTotalCount(0);
      setPageCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (newExpense: Omit<Expense, "id">) => {
    try {
      const expenseWithId = {
        ...newExpense,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("expenses").insert(expenseWithId);

      if (error) throw error;

      // Refresh the current page
      await fetchExpenses();

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

      // Refresh the current page
      await fetchExpenses();
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;

      // Refresh the current page
      await fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  };

  return {
    data,
    totalCount,
    pageCount,
    isLoading,
    pagination,
    setPagination,
    sorting,
    setSorting,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
}
