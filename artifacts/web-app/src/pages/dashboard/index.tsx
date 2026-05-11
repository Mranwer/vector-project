import { useAuth } from "@/lib/auth";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Zap, Package, Wallet, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${variants[status] ?? "bg-muted/30 text-muted-foreground"}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useGetDashboardSummary();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-muted-foreground mt-1">Here's your account overview</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                title: "Wallet Balance",
                value: isLoading ? null : `${(dashboard?.walletBalance ?? user?.walletBalance ?? 0).toLocaleString()} pts`,
                icon: Wallet,
                color: "text-primary",
                link: "/dashboard/wallet",
              },
              {
                title: "Total Orders",
                value: isLoading ? null : dashboard?.totalOrders?.toString() ?? "0",
                icon: Package,
                color: "text-secondary",
                link: "/dashboard/orders",
              },
              {
                title: "Active Orders",
                value: isLoading ? null : dashboard?.activeOrders?.toString() ?? "0",
                icon: Clock,
                color: "text-yellow-400",
              },
              {
                title: "Completed",
                value: isLoading ? null : dashboard?.completedOrders?.toString() ?? "0",
                icon: CheckCircle,
                color: "text-green-400",
              },
            ].map(({ title, value, icon: Icon, color, link }) => (
              <Card key={title} className="glass-panel">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <p className="text-2xl font-bold">{value}</p>
                  )}
                  {link && (
                    <Link href={link} className="text-xs text-primary hover:underline mt-2 block">
                      View details →
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <Link href="/dashboard/orders" className="text-xs text-primary hover:underline">View all</Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : dashboard?.recentOrders?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No orders yet</p>
                    <Link href="/services" className="text-xs text-primary hover:underline mt-1 block">Browse services</Link>
                  </div>
                ) : (
                  (dashboard?.recentOrders ?? []).map((order) => (
                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{order.serviceName ?? "Service"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt!).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={order.status!} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Wallet Activity */}
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Wallet Activity</CardTitle>
                <Link href="/dashboard/wallet" className="text-xs text-primary hover:underline">View all</Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : dashboard?.recentTransactions?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No transactions yet</p>
                    <Link href="/dashboard/wallet" className="text-xs text-primary hover:underline mt-1 block">Recharge wallet</Link>
                  </div>
                ) : (
                  (dashboard?.recentTransactions ?? []).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <Zap className={`w-5 h-5 ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.createdAt!).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount} pts
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
