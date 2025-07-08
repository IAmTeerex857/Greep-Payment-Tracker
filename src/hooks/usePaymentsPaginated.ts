import { useCallback, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { DriverPayment } from "../types";
import { useData } from "./useGlobalData";

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface PaymentsResponse {
  data: DriverPayment[];
  totalCount: number;
  pageCount: number;
}

export function usePaymentsPaginated() {
  const {
    payments: allData,
    refreshPayments,
    isLoading: globalLoading,
  } = useData();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState[]>([
    { id: "week_start_date", desc: true }, // Most recent payments first
  ]);
  const [dateFilter, setDateFilter] = useState<{
    startDate: Date;
    endDate: Date;
  }>(() => {
    const currentDate = new Date();
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const currentMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    return {
      startDate: currentMonthStart,
      endDate: currentMonthEnd,
    };
  });

  // Fetch all data once
  const fetchAllPayments = useCallback(async () => {
    // Data is already available from global context
    // No need to fetch again
  }, []);

  // Filter and sort data in frontend
  const filteredAndSortedData = useMemo(() => {
    let filtered = allData;

    // Apply date filter
    if (dateFilter.startDate && dateFilter.endDate) {
      // Normalize dates to remove time component for accurate comparison
      const startDate = new Date(dateFilter.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999);

      filtered = allData.filter((payment) => {
        // Parse the payment date and normalize it
        const paymentDate = new Date(payment.week_start_date);
        paymentDate.setHours(0, 0, 0, 0);

        // Inclusive date comparison
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }

    // Apply sorting
    if (sorting.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        for (const sort of sorting) {
          const aValue = a[sort.id as keyof DriverPayment];
          const bValue = b[sort.id as keyof DriverPayment];

          let comparison = 0;
          if (aValue && bValue) {
            if (aValue < bValue) comparison = -1;
            else if (aValue > bValue) comparison = 1;
          }

          if (comparison !== 0) {
            return sort.desc ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    return filtered;
  }, [allData, dateFilter, sorting]);

  // Calculate pagination
  const totalCount = filteredAndSortedData.length;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);
  const from = pagination.pageIndex * pagination.pageSize;
  const to = from + pagination.pageSize;
  const data = filteredAndSortedData.slice(from, to);

  const addPayment = async (newPayment: Omit<DriverPayment, "id">) => {
    try {
      const paymentWithId = {
        ...newPayment,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("driver_payments")
        .insert(paymentWithId);

      if (error) throw error;

      // Refresh the data
      await refreshPayments();

      return paymentWithId;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };

  const updatePayment = async (
    id: string,
    updatedPayment: Partial<DriverPayment>
  ) => {
    try {
      const { error } = await supabase
        .from("driver_payments")
        .update(updatedPayment)
        .eq("id", id);

      if (error) throw error;

      // Refresh the data
      await refreshPayments();
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from("driver_payments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Refresh the data
      await refreshPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
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
    dateFilter,
    setDateFilter,
    addPayment,
    updatePayment,
    deletePayment,
    refetch: fetchAllPayments,
  };
}
