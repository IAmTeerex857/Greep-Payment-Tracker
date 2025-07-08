import { createBrowserRouter, Navigate } from "react-router-dom";
import { Dashboard } from "../components/Dashboard";
import { DriversPage } from "../components/DriversPage";
import { ExpensesPage } from "../components/ExpensesPage";
import { InvestorsPage } from "../components/InvestorsPage";
import { LayoutWrapper } from "../components/LayoutWrapper";
import { Login } from "../components/Login";
import { LoginRoute } from "../components/LoginRoute";
import { PaymentsPage } from "../components/PaymentsPage";
import { PayoutsPage } from "../components/PayoutsPage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { ReportsPage } from "../components/ReportsPage";
import { SettingsPage } from "../components/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <LoginRoute>
        <Login />
      </LoginRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <LayoutWrapper />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "drivers",
        element: <DriversPage />,
      },
      {
        path: "investors",
        element: <InvestorsPage />,
      },
      {
        path: "payments",
        element: <PaymentsPage />,
      },
      {
        path: "expenses",
        element: <ExpensesPage />,
      },
      {
        path: "payouts",
        element: <PayoutsPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
