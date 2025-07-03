import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { User, DriverPayment, Expense, InvestorPayout } from '../types';

// Convert data to CSV and trigger download
export const exportToCSV = (data: any[], fileName: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate PDF and trigger download
export const exportToPDF = (
  data: any[],
  fileName: string,
  title: string,
  columns: { header: string; dataKey: string }[]
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
  
  // @ts-ignore - jspdf-autotable extends jsPDF but TypeScript doesn't know about it
  doc.autoTable({
    startY: 40,
    head: [columns.map(col => col.header)],
    body: data.map(item => columns.map(col => item[col.dataKey])),
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 40 }
  });
  
  doc.save(`${fileName}.pdf`);
};

// Format monthly report data for export
export const formatMonthlyReportForExport = (
  selectedMonth: string,
  users: User[],
  payments: DriverPayment[],
  expenses: Expense[],
  payouts: InvestorPayout[]
) => {
  const monthlyPayments = payments.filter(p => p.week_start_date.startsWith(selectedMonth));
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
  const monthlyPayouts = payouts.filter(p => p.month === selectedMonth);
  
  // Format payment data
  const paymentData = monthlyPayments.map(p => {
    const driver = users.find(u => u.id === p.driver_id);
    return {
      driver_name: driver?.name || 'Unknown',
      driver_tier: driver?.tier || 'Unknown',
      week_start: p.week_start_date,
      amount: p.amount_paid,
      notes: p.notes || ''
    };
  });
  
  // Format expense data
  const expenseData = monthlyExpenses.map(e => {
    return {
      date: e.date,
      type: e.type,
      description: e.description,
      amount: e.amount,
      notes: e.notes || ''
    };
  });
  
  // Format payout data
  const payoutData = monthlyPayouts.map(p => {
    const investor = users.find(u => u.id === p.investor_id);
    return {
      investor_name: investor?.name || 'Unknown',
      investor_tier: investor?.tier || 'Unknown',
      month: p.month,
      gross_amount: p.gross_amount,
      deductions: p.deductions,
      net_amount: p.net_amount,
      status: p.status,
      notes: p.notes || ''
    };
  });
  
  // Summary data
  const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount_paid, 0);
  const monthlyExpenseTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyPayoutTotal = monthlyPayouts.reduce((sum, p) => sum + p.net_amount, 0);
  const monthlyProfit = monthlyRevenue - monthlyExpenseTotal - monthlyPayoutTotal;
  
  const summaryData = [
    { category: 'Revenue', amount: monthlyRevenue },
    { category: 'Expenses', amount: monthlyExpenseTotal },
    { category: 'Payouts', amount: monthlyPayoutTotal },
    { category: 'Profit', amount: monthlyProfit }
  ];
  
  return {
    paymentData,
    expenseData,
    payoutData,
    summaryData,
    monthlyRevenue,
    monthlyExpenseTotal,
    monthlyPayoutTotal,
    monthlyProfit
  };
};

// Format backup data for export
export const formatBackupDataForExport = (
  users: User[],
  payments: DriverPayment[],
  expenses: Expense[],
  payouts: InvestorPayout[]
) => {
  // Format users for export (excluding sensitive data)
  const userData = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    tier: u.tier,
    active: u.active ? 'Yes' : 'No',
    created_at: u.created_at
  }));
  
  // Format payments for export
  const paymentData = payments.map(p => {
    const driver = users.find(u => u.id === p.driver_id);
    return {
      id: p.id,
      driver_name: driver?.name || 'Unknown',
      week_start: p.week_start_date,
      amount: p.amount_paid,
      notes: p.notes || ''
    };
  });
  
  // Format expenses for export
  const expenseData = expenses.map(e => ({
    id: e.id,
    date: e.date,
    type: e.type,
    description: e.description,
    amount: e.amount,
    notes: e.notes || ''
  }));
  
  // Format payouts for export
  const payoutData = payouts.map(p => {
    const investor = users.find(u => u.id === p.investor_id);
    return {
      id: p.id,
      investor_name: investor?.name || 'Unknown',
      month: p.month,
      gross_amount: p.gross_amount,
      deductions: p.deductions,
      net_amount: p.net_amount,
      status: p.status,
      notes: p.notes || ''
    };
  });
  
  return {
    userData,
    paymentData,
    expenseData,
    payoutData
  };
};
