import { useState } from "react";
import { useGetOrders } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock, Zap, Calendar } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const FILTER_OPTIONS = ["all", "pending", "processing", "completed", "cancelled"];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetOrders({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit: 10,
  });

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-muted-foreground mt-1">Track all your service orders</p>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {FILTER_OPTIONS.map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap capitalize"
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                {s}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-panel rounded-xl p-5 flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No orders found</p>
              {statusFilter !== "all" && (
                <Button variant="ghost" className="mt-2" onClick={() => setStatusFilter("all")}>
                  Clear filter
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="glass-panel hover:border-primary/20 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h3 className="font-semibold">{order.notes ?? "Service Order"}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLES[order.status ?? ""] ?? "bg-muted/30 text-muted-foreground"}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.createdAt!).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-primary" />
                            {order.pointsCost?.toLocaleString()} pts
                          </span>
                          {order.deliveryTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {order.deliveryTime}
                            </span>
                          )}
                        </div>
                        {/* {order.notes && (
                          <p className="text-sm text-muted-foreground mt-2 bg-white/5 rounded p-2">{order.notes}</p>
                        )} */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
