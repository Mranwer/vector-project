import { useState } from "react";
import { useGetAdminOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Package, Search, MoreVertical, Clock, Zap, User, CheckCircle, XCircle, Loader } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_FILTERS = ["all", "pending", "processing", "completed", "cancelled"];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useGetAdminOrders({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
  });

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  const { mutate: updateStatus } = useUpdateOrderStatus({
    mutation: { onSuccess: () => { refetch(); qc.invalidateQueries(); } },
  });

  return (
    <div className="min-h-screen flex">
      <Sidebar isAdmin />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="text-muted-foreground mt-1">{total} total orders</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or service..."
                className="pl-9"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {STATUS_FILTERS.map(s => (
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
          </div>

          <Card className="glass-panel">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No orders found</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {orders.map(order => (
                    
                    <div
  key={order.id}
  className="p-5 border-b border-white/5 hover:bg-white/5 transition-colors"
>
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <Package className="w-5 h-5 text-primary" />

        <h3 className="font-semibold text-base">
          {order.notes ?? "Unknown Service"}
        </h3>

        <span
          className={`text-xs px-2 py-1 rounded-full border font-medium capitalize ${STATUS_STYLES[order.status ?? ""]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">

        <p>
          <strong>Order ID:</strong> {order.id}
        </p>

        <p>
          <strong>User:</strong> {order.userId}
        </p>

        <p>
          <strong>Points:</strong> {order.pointsCost} pts
        </p>

        <p>
          <strong>Date:</strong>{" "}
          {new Date(order.createdAt!).toLocaleDateString()}
        </p>

        {order.deliveryTime && (
          <p>
            <strong>Delivery:</strong> {order.deliveryTime}
          </p>
        )}
      </div>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Actions
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {order.status !== "processing" && (
          <DropdownMenuItem
            onClick={() =>
              updateStatus({
                id: order.id!,
                data: { status: "processing" },
              })
            }
          >
            Mark Processing
          </DropdownMenuItem>
        )}

        {order.status !== "completed" && (
          <DropdownMenuItem
            onClick={() =>
              updateStatus({
                id: order.id!,
                data: { status: "completed" },
              })
            }
          >
            Mark Completed
          </DropdownMenuItem>
        )}

        {order.status !== "cancelled" && (
          <DropdownMenuItem
            onClick={() =>
              updateStatus({
                id: order.id!,
                data: { status: "cancelled" },
              })
            }
          >
            Cancel Order
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>

  </div>
</div>
                  ))}
                </div>
              )}






              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t border-white/5">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <span className="flex items-center px-3 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
