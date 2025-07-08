import { Car, TrendingUp, Users } from "lucide-react";
import { useData } from "../hooks/useData";

export function Dashboard() {
  const { getDashboardStats, users, payments, payouts } = useData();
  const stats = getDashboardStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Overview of your payment tracking system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <img
                src="/lira.svg"
                alt="Turkish Lira"
                className="w-6 h-6"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)",
                }}
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Net Profit
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{stats.netProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Car className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Active Drivers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeDrivers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Active Investors
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeInvestors}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Recent Payments
          </h3>
          <div className="space-y-4">
            {payments
              .slice(-5)
              .reverse()
              .map((payment) => {
                const driver = users.find((u) => u.id === payment.driver_id);
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {driver?.name || "Unknown Driver"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {payment.week_start_date}
                      </p>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-semibold text-lg">
                      ₺{payment.amount_paid.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            {payments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No payments recorded yet
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Pending Payouts
          </h3>
          <div className="space-y-4">
            {payouts
              .filter((p) => p.status === "pending")
              .map((payout) => {
                const investor = users.find((u) => u.id === payout.investor_id);
                return (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {investor?.name || "Unknown Investor"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {payout.month}
                      </p>
                    </div>
                    <span className="text-orange-600 dark:text-orange-400 font-semibold text-lg">
                      ₺{payout.net_amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            {payouts.filter((p) => p.status === "pending").length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No pending payouts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
