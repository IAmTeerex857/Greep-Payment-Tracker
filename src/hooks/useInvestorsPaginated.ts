import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "../types";

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface InvestorsResponse {
  data: User[];
  totalCount: number;
  pageCount: number;
}

export function useInvestorsPaginated() {
  const [data, setData] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState[]>([
    { id: "active", desc: true }, // Active investors first
    { id: "name", desc: false }, // Then by name ascending
  ]);

  const fetchInvestors = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "investor");

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

      const { data: investors, error, count } = await query;

      if (error) throw error;

      setData(investors || []);
      setTotalCount(count || 0);
      setPageCount(Math.ceil((count || 0) / pagination.pageSize));
    } catch (error) {
      console.error("Error fetching investors:", error);
      setData([]);
      setTotalCount(0);
      setPageCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  const addInvestor = async (newInvestor: Omit<User, "id">) => {
    try {
      const investorWithId = {
        ...newInvestor,
        id: crypto.randomUUID(),
        role: "investor" as const,
        can_login: false,
        active: true,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("users").insert(investorWithId);

      if (error) throw error;

      // Refresh the current page
      await fetchInvestors();

      return investorWithId;
    } catch (error) {
      console.error("Error adding investor:", error);
      throw error;
    }
  };

  const updateInvestor = async (id: string, updatedInvestor: Partial<User>) => {
    try {
      const { error } = await supabase
        .from("users")
        .update(updatedInvestor)
        .eq("id", id);

      if (error) throw error;

      // Refresh the current page
      await fetchInvestors();
    } catch (error) {
      console.error("Error updating investor:", error);
      throw error;
    }
  };

  const toggleInvestorStatus = async (id: string) => {
    try {
      const investor = data.find((d) => d.id === id);
      if (!investor) throw new Error("Investor not found");

      await updateInvestor(id, { active: !investor.active });
    } catch (error) {
      console.error("Error toggling investor status:", error);
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
    addInvestor,
    updateInvestor,
    toggleInvestorStatus,
    refetch: fetchInvestors,
  };
}
