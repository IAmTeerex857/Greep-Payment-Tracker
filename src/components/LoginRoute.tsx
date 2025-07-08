import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface LoginRouteProps {
  children: React.ReactNode;
}

export function LoginRoute({ children }: LoginRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show login page
  return <>{children}</>;
}
