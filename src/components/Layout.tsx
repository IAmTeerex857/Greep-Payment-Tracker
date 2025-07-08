import {
  Car,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Receipt,
  Settings,
  Sun,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useDarkMode } from "../hooks/useDarkMode";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "drivers", label: "Drivers", icon: Car },
    { id: "investors", label: "Investors", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "payouts", label: "Payouts", icon: DollarSign },
    { id: "reports", label: "Reports", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsSidebarOpen(false); // Close sidebar on mobile when navigating
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Greep Logo" className="h-8 w-auto" />
            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              Payment Management
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className="transform transition-transform duration-300 ease-in-out">
                {isDarkMode ? (
                  <Sun className="w-5 h-5 animate-spin-slow" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </div>
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative lg:translate-x-0 z-50 lg:z-0
        w-64 h-full lg:h-screen bg-white dark:bg-gray-800 shadow-lg flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:block
        inset-y-0 left-0
      `}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <img src="/logo.svg" alt="Greep Logo" className="text-white" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Payment Management
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              <div className="transform transition-transform duration-300 ease-in-out">
                {isDarkMode ? (
                  <Sun className="w-5 h-5 animate-spin-slow" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </div>
            </button>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
                  currentPage === item.id
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-r-2 border-green-700 dark:border-green-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 lg:pt-0 bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    </div>
  );
}
