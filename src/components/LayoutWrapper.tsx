import { Outlet, useLocation } from "react-router-dom";
import { Layout } from "./Layout";

export function LayoutWrapper() {
  const location = useLocation();

  // Extract the current page from the pathname
  const currentPage = location.pathname.slice(1) || "dashboard";

  return (
    <Layout currentPage={currentPage}>
      <Outlet />
    </Layout>
  );
}
