import { useState } from "react";
import { useGetAdminPayments } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, User, Clock, Zap, IndianRupee } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  created: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminPayments();
  const allPayments = data ?? [];
  const payments = allPayments.slice((page - 1) * 20, page * 20);
  const total = allPayments.length;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen flex">
      <Sidebar isAdmin />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Payments</h1>
            <p className="text-muted-foreground mt-1">{total} payment records</p>
          </div>

          <Card className="glass-panel">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No payment records</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="hidden md:grid grid-cols-5 gap-4 px-5 py-3 text-xs text-muted-foreground border-b border-white/5 font-medium uppercase tracking-wider">
                    <div className="col-span-2">User / Payment ID</div>
                    <div>Amount</div>
                    <div>Points</div>
                    <div>Status</div>
                  </div>
                  <div className="divide-y divide-white/5">
                    {payments.map(payment => (
                      <div key={payment.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                          <CreditCard className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1 text-sm font-medium">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                              {payment.userId}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5">
                            {payment.razorpayPaymentId && (
                              <span className="font-mono">{payment.razorpayPaymentId}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />{new Date(payment.createdAt!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 font-bold">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {((payment.amount ?? 0) / 100).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-primary font-medium text-sm">
                          <Zap className="w-3.5 h-3.5" />
                          {payment.pointsAdded?.toLocaleString()} pts
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize shrink-0 ${STATUS_STYLES[payment.status ?? ""] ?? "bg-muted/30 text-muted-foreground"}`}>
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
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
