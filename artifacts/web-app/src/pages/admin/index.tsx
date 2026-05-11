import { useGetAdminStats } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Package, CreditCard, Wallet, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-400" },
    { title: "Total Orders", value: stats?.totalOrders, icon: Package, color: "text-purple-400" },
    { title: "Total Revenue", value: stats?.totalRevenue ? `₹${stats.totalRevenue.toLocaleString()}` : "₹0", icon: CreditCard, color: "text-green-400" },
    { title: "Active Services", value: stats?.activeServices, icon: Activity, color: "text-cyan-400" },
    { title: "Pending Orders", value: stats?.pendingOrders, icon: TrendingUp, color: "text-orange-400" },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar isAdmin />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform overview and statistics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {statCards.map(({ title, value, icon: Icon, color }) => (
              <Card key={title} className="glass-panel">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-3xl font-bold">{value ?? 0}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Stats Summary */}
          {!isLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-panel">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Order Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Pending", count: stats.pendingOrders ?? 0, color: "bg-yellow-400" },
                      { label: "Processing", count: stats.pendingOrders ?? 0, color: "bg-blue-400" },
                      { label: "Completed", count: (stats.totalOrders ?? 0) - (stats.pendingOrders ?? 0), color: "bg-green-400" },
                      { label: "Other", count: 0, color: "bg-red-400" },
                    ].map(({ label, count, color }) => {
                      const pct = stats.totalOrders ? Math.round((count / stats.totalOrders) * 100) : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-panel">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <a href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Manage Users</span>
                    </a>
                    <a href="/admin/services" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>Manage Services</span>
                    </a>
                    <a href="/admin/orders" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <Package className="w-4 h-4 text-purple-400" />
                      <span>Review Orders</span>
                    </a>
                    <a href="/admin/payments" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <CreditCard className="w-4 h-4 text-green-400" />
                      <span>View Payments</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
