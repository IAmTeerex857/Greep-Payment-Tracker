import Papa from 'papaparse';
import { User, DriverPayment, Expense, InvestorPayout } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parse CSV data for users
 */
export const parseUsersFromCSV = (csvData: string): User[] => {
  const { data } = Papa.parse(csvData, { header: true });
  
  return data.map((row: any) => ({
    id: row.id || uuidv4(),
    name: row.name,
    email: row.email || `${row.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    role: row.role || 'driver',
    tier: row.tier || 'A',
    can_login: row.can_login === 'true' || false,
    active: row.active === 'true' || true,
    created_at: row.created_at || new Date().toISOString(),
    created_by: row.created_by || 'admin'
  })).filter((row: any) => row.name && row.name.trim() !== '');
};

/**
 * Parse CSV data for driver payments
 */
export const parseDriverPaymentsFromCSV = (csvData: string): DriverPayment[] => {
  const { data } = Papa.parse(csvData, { header: true });
  
  return data.map((row: any) => ({
    id: row.id || uuidv4(),
    driver_id: row.driver_id,
    week_start_date: row.week_start_date,
    amount_paid: parseFloat(row.amount_paid) || 0,
    balance_carryover: parseFloat(row.balance_carryover) || 0,
    notes: row.notes || '',
    created_at: row.created_at || new Date().toISOString(),
    created_by: row.created_by || 'admin'
  })).filter((payment: DriverPayment) => payment.driver_id && payment.week_start_date);
};

/**
 * Parse CSV data for expenses
 */
export const parseExpensesFromCSV = (csvData: string): Expense[] => {
  const { data } = Papa.parse(csvData, { header: true });
  
  return data.map((row: any) => ({
    id: row.id || uuidv4(),
    date: row.date,
    description: row.description,
    amount: parseFloat(row.amount) || 0,
    type: row.type || 'admin',
    paid_by: row.paid_by || 'company',
    user_id: row.user_id,
    notes: row.notes || '',
    created_at: row.created_at || new Date().toISOString(),
    created_by: row.created_by || 'admin'
  })).filter((expense: Expense) => expense.date && expense.description);
};

/**
 * Parse CSV data for investor payouts
 */
export const parseInvestorPayoutsFromCSV = (csvData: string): InvestorPayout[] => {
  const { data } = Papa.parse(csvData, { header: true });
  
  return data.map((row: any) => ({
    id: row.id || uuidv4(),
    investor_id: row.investor_id,
    month: row.month,
    gross_amount: parseFloat(row.gross_amount) || 0,
    deductions: parseFloat(row.deductions) || 0,
    net_amount: parseFloat(row.net_amount) || 0,
    status: row.status || 'pending',
    notes: row.notes || '',
    created_at: row.created_at || new Date().toISOString(),
    created_by: row.created_by || 'admin'
  })).filter((payout: InvestorPayout) => payout.investor_id && payout.month);
};

/**
 * Determine the type of CSV data based on headers
 */
export const determineCSVType = (headers: string[]): 'users' | 'payments' | 'expenses' | 'payouts' | 'unknown' => {
  const headerSet = new Set(headers.map(h => h.toLowerCase()));
  
  if (headerSet.has('role') && headerSet.has('tier') && headerSet.has('name')) {
    return 'users';
  } else if (headerSet.has('driver_id') && headerSet.has('week_start_date') && headerSet.has('amount_paid')) {
    return 'payments';
  } else if (headerSet.has('date') && headerSet.has('description') && headerSet.has('amount') && headerSet.has('type')) {
    return 'expenses';
  } else if (headerSet.has('investor_id') && headerSet.has('month') && headerSet.has('gross_amount')) {
    return 'payouts';
  }
  
  return 'unknown';
};

/**
 * Import data from CSV file
 */
export const importFromCSV = (file: File): Promise<{
  type: 'users' | 'payments' | 'expenses' | 'payouts' | 'unknown';
  data: User[] | DriverPayment[] | Expense[] | InvestorPayout[] | null;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string;
        
        // Parse the first row to get headers
        const firstLineEnd = csvData.indexOf('\n');
        const headerLine = csvData.substring(0, firstLineEnd);
        const headers = Papa.parse(headerLine).data[0] as string[];
        
        const dataType = determineCSVType(headers);
        
        let parsedData = null;
        switch (dataType) {
          case 'users':
            parsedData = parseUsersFromCSV(csvData);
            break;
          case 'payments':
            parsedData = parseDriverPaymentsFromCSV(csvData);
            break;
          case 'expenses':
            parsedData = parseExpensesFromCSV(csvData);
            break;
          case 'payouts':
            parsedData = parseInvestorPayoutsFromCSV(csvData);
            break;
          default:
            parsedData = null;
        }
        
        resolve({
          type: dataType,
          data: parsedData
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};
