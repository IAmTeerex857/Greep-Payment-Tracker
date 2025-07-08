import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { InvestorPayout } from "../types";
import { useData } from "./useGlobalData";

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface PayoutsResponse {
  data: InvestorPayout[];
  totalCount: number;
  pageCount: number;
}

export function usePayoutsPaginated() {
  const {
    payouts: allData,
    refreshPayouts,
    isLoading: globalLoading,
  } = useData();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState[]>([
    { id: "month", desc: true }, // Most recent payouts first
    { id: "status", desc: false }, // Pending first, then paid
  ]);

  // Filter and sort data in frontend
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...allData];

    // Apply sorting
    if (sorting.length > 0) {
      filtered = filtered.sort((a, b) => {
        for (const sort of sorting) {
          const aValue = a[sort.id as keyof InvestorPayout];
          const bValue = b[sort.id as keyof InvestorPayout];

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

  const addPayout = async (newPayout: Omit<InvestorPayout, "id">) => {
    try {
      const payoutWithId = {
        ...newPayout,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("investor_payouts")
        .insert(payoutWithId);

      if (error) throw error;

      // Refresh the global data
      await refreshPayouts();

      return payoutWithId;
    } catch (error) {
      console.error("Error adding payout:", error);
      throw error;
    }
  };

  const updatePayout = async (
    id: string,
    updatedPayout: Partial<InvestorPayout>
  ) => {
    try {
      const { error } = await supabase
        .from("investor_payouts")
        .update(updatedPayout)
        .eq("id", id);

      if (error) throw error;

      // Refresh the global data
      await refreshPayouts();
    } catch (error) {
      console.error("Error updating payout:", error);
      throw error;
    }
  };

  const deletePayout = async (id: string) => {
    try {
      const { error } = await supabase
        .from("investor_payouts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Refresh the global data
      await refreshPayouts();
    } catch (error) {
      console.error("Error deleting payout:", error);
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
    addPayout,
    updatePayout,
    deletePayout,
    refetch: refreshPayouts,
  };
}
