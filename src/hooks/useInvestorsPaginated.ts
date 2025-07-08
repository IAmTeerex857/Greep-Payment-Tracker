import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "../types";
import { useData } from "./useGlobalData";

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
  const { users, refreshUsers, isLoading: globalLoading } = useData();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState[]>([
    { id: "active", desc: true }, // Active investors first
    { id: "name", desc: false }, // Then by name ascending
  ]);

  // Filter and sort data in frontend
  const filteredAndSortedData = useMemo(() => {
    // Filter only investors
    let filtered = users.filter((user) => user.role === "investor");

    // Apply sorting
    if (sorting.length > 0) {
      filtered = filtered.sort((a, b) => {
        for (const sort of sorting) {
          const aValue = a[sort.id as keyof User];
          const bValue = b[sort.id as keyof User];

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
  }, [users, sorting]);

  // Calculate pagination
  const totalCount = filteredAndSortedData.length;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);
  const from = pagination.pageIndex * pagination.pageSize;
  const to = from + pagination.pageSize;
  const data = filteredAndSortedData.slice(from, to);

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

      // Refresh the global data
      await refreshUsers();

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

      // Refresh the global data
      await refreshUsers();
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
    isLoading: globalLoading,
    pagination,
    setPagination,
    sorting,
    setSorting,
    addInvestor,
    updateInvestor,
    toggleInvestorStatus,
    refetch: refreshUsers,
  };
}
