export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'driver' | 'investor';
  tier: 'A' | 'B' | 'X' | 'Y';
  created_at: string;
  active: boolean;
  can_login: boolean;
}

export interface DriverPayment {
  id: string;
  driver_id: string;
  week_start_date: string;
  amount_paid: number;
  balance_carryover: number;
  notes?: string;
  created_at: string;
  created_by: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: 'admin' | 'driver' | 'investor';
  paid_by: string;
  user_id?: string; // For driver/investor expenses
  notes?: string;
  created_at: string;
  created_by: string;
}

export interface InvestorPayout {
  id: string;
  investor_id: string;
  month: string;
  gross_amount: number;
  deductions: number;
  net_amount: number;
  status: 'pending' | 'paid';
  notes?: string;
  created_at: string;
  created_by: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  totalPayouts: number;
  netProfit: number;
  activeDrivers: number;
  activeInvestors: number;
  pendingPayouts: number;
  currentMonthRevenue: number;
}