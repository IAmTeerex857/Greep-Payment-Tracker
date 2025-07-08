import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { InvestorPayout } from "../types";

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
  const [data, setData] = useState<InvestorPayout[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState[]>([
    { id: "month", desc: true }, // Most recent payouts first
    { id: "status", desc: false }, // Pending first, then paid
  ]);

  const fetchPayouts = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("investor_payouts")
        .select("*", { count: "exact" });

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

      const { data: payouts, error, count } = await query;

      if (error) throw error;

      setData(payouts || []);
      setTotalCount(count || 0);
      setPageCount(Math.ceil((count || 0) / pagination.pageSize));
    } catch (error) {
      console.error("Error fetching payouts:", error);
      setData([]);
      setTotalCount(0);
      setPageCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

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

      // Refresh the current page
      await fetchPayouts();

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

      // Refresh the current page
      await fetchPayouts();
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

      // Refresh the current page
      await fetchPayouts();
    } catch (error) {
      console.error("Error deleting payout:", error);
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
    addPayout,
    updatePayout,
    deletePayout,
    refetch: fetchPayouts,
  };
}
