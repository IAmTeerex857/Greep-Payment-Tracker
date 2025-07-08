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

export interface DriversResponse {
  data: User[];
  totalCount: number;
  pageCount: number;
}

export function useDriversPaginated() {
  const [data, setData] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState[]>([
    { id: "active", desc: true }, // Active drivers first
    { id: "name", desc: false }, // Then by name ascending
  ]);

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "driver");

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

      const { data: drivers, error, count } = await query;

      if (error) throw error;

      setData(drivers || []);
      setTotalCount(count || 0);
      setPageCount(Math.ceil((count || 0) / pagination.pageSize));
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setData([]);
      setTotalCount(0);
      setPageCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const addDriver = async (newDriver: Omit<User, "id">) => {
    try {
      const driverWithId = {
        ...newDriver,
        id: crypto.randomUUID(),
        role: "driver" as const,
        can_login: false,
        active: true,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("users").insert(driverWithId);

      if (error) throw error;

      // Refresh the current page
      await fetchDrivers();

      return driverWithId;
    } catch (error) {
      console.error("Error adding driver:", error);
      throw error;
    }
  };

  const updateDriver = async (id: string, updatedDriver: Partial<User>) => {
    try {
      const { error } = await supabase
        .from("users")
        .update(updatedDriver)
        .eq("id", id);

      if (error) throw error;

      // Refresh the current page
      await fetchDrivers();
    } catch (error) {
      console.error("Error updating driver:", error);
      throw error;
    }
  };

  const toggleDriverStatus = async (id: string) => {
    try {
      const driver = data.find((d) => d.id === id);
      if (!driver) throw new Error("Driver not found");

      await updateDriver(id, { active: !driver.active });
    } catch (error) {
      console.error("Error toggling driver status:", error);
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
    addDriver,
    updateDriver,
    toggleDriverStatus,
    refetch: fetchDrivers,
  };
}
