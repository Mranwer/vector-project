import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useGetWallet, useGetTransactions, useCreateRechargeOrder, useVerifyRecharge } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, TrendingUp, TrendingDown, AlertCircle, Plus, Star, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
 
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}
 
function loadRazorpay(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}
 
interface Package {
  id: string;
  name: string;
  price: number;
  points: number;
  popular?: boolean;
  color: string;
  description: string;
}
 
const PACKAGES: Package[] = [
  {
    id: "package1",
    name: "Package 1",
    price: 449,
    points: 200,
    color: "border-slate-200 dark:border-slate-700",
    description: "Perfect to get started",
  },
  {
    id: "package2",
    name: "Package 2",
    price: 949,
    points: 400,
    color: "border-blue-200 dark:border-blue-800",
    description: "Most value for casual users",
  },
  {
    id: "package3",
    name: "Package 3",
    price: 1899,
    points: 800,
    popular: true,
    color: "border-primary/40",
    description: "Best for regular usage",
  },
  {
    id: "package4",
    name: "Package 4",
    price: 3299,
    points: 1600,
    color: "border-purple-300 dark:border-purple-700",
    description: "Maximum value for power users",
  },
  {
    id: "package5",
    name: "Package 5",
    price: 3999,
    points: 2000,
    color: "border-amber-300 dark:border-amber-700",
    description: "Ultimate access, best deal",
  },
];
 
export default function WalletPage() {
  const { user } = useAuth();
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useGetWallet();
  const { data: txData, isLoading: txLoading } = useGetTransactions({ limit: 20 });
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [rechargeError, setRechargeError] = useState("");
  const [showRecharge, setShowRecharge] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
 
  const { mutate: createOrder } = useCreateRechargeOrder({
    mutation: {
      async onSuccess(order) {
        await loadRazorpay();
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Vector Technology",
          description: `Wallet Recharge - ${selectedPackage?.name}`,
          order_id: order.orderId,
          handler: async (response: Record<string, string>) => {
            verifyPayment({
              data: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });
          },
          theme: { color: "#3B82F6" },
        };
        const rp = new window.Razorpay(options);
        rp.open();
        setIsProcessing(false);
        setShowRecharge(false);
      },
      onError(err: unknown) {
        const e = err as { data?: { error?: string }; message?: string };
        setRechargeError(e?.data?.error ?? e?.message ?? "Failed to create order");
        setIsProcessing(false);
      },
    },
  });
 
  const { mutate: verifyPayment } = useVerifyRecharge({
    mutation: {
      onSuccess() {
        refetchWallet();
        setSelectedPackage(null);
      },
      onError(err: unknown) {
        const e = err as { data?: { error?: string }; message?: string };
        setRechargeError(e?.data?.error ?? e?.message ?? "Verification failed");
      },
    },
  });
 
  const handleRecharge = () => {
    if (!selectedPackage) {
      setRechargeError("Please select a package");
      return;
    }
    setRechargeError("");
    setIsProcessing(true);
    createOrder({ data: { amount: selectedPackage.price } });
  };
 
  const transactions = txData?.transactions ?? [];
 
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Wallet</h1>
            <p className="text-muted-foreground mt-1">Manage your points balance</p>
          </div>
 
          {/* Balance Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="glass-panel border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground text-sm">Available Balance</p>
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                {walletLoading ? (
                  <Skeleton className="h-10 w-40" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">
                      {(wallet?.balance ?? 0).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">points</span>
                  </div>
                )}
                <Button className="mt-5 gap-2" onClick={() => setShowRecharge(true)}>
                  <Plus className="w-4 h-4" /> Recharge Wallet
                </Button>
              </CardContent>
            </Card>
 
            <Card className="glass-panel">
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground text-sm font-medium">Quick Stats</p>
                {txLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4 text-green-400" /> Total Recharged
                      </span>
                      <span className="font-bold text-green-400">
                        +
                        {transactions
                          .filter((t) => t.type === "credit")
                          .reduce((s, t) => s + (t.amount ?? 0), 0)
                          .toLocaleString()}{" "}
                        pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingDown className="w-4 h-4 text-red-400" /> Total Spent
                      </span>
                      <span className="font-bold text-red-400">
                        -
                        {transactions
                          .filter((t) => t.type === "debit")
                          .reduce((s, t) => s + (t.amount ?? 0), 0)
                          .toLocaleString()}{" "}
                        pts
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
 
          {/* Transaction History */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No transactions yet</p>
                  <Button className="mt-4" size="sm" onClick={() => setShowRecharge(true)}>
                    Recharge Now
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 py-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === "credit" ? "bg-green-500/10" : "bg-red-500/10"
                        }`}
                      >
                        {tx.type === "credit" ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt!).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-sm ${
                            tx.type === "credit" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {tx.type === "credit" ? "+" : "-"}
                          {tx.amount?.toLocaleString()} pts
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
 
      {/* Recharge Dialog */}
      <Dialog
        open={showRecharge}
        onOpenChange={(open) => {
          setShowRecharge(open);
          if (!open) {
            setSelectedPackage(null);
            setRechargeError("");
          }
        }}
      >
        <DialogContent className="glass-panel border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose a Package</DialogTitle>
            <DialogDescription>
              Select a recharge package to add points to your wallet.
            </DialogDescription>
          </DialogHeader>
 
          <div className="space-y-4">
            {rechargeError && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {rechargeError}
              </div>
            )}
 
            {/* Package Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                const valuePerRupee = (pkg.points / pkg.price).toFixed(2);
 
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative text-left rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer
                      ${isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : `${pkg.color} bg-white/5 hover:bg-white/10`
                      }
                      ${pkg.popular ? "sm:col-span-2" : ""}
                    `}
                  >
                    {/* Popular badge */}
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground gap-1 px-3 py-0.5 text-xs">
                          <Star className="w-3 h-3 fill-current" /> Most Popular
                        </Badge>
                      </span>
                    )}
 
                    <div className={`flex items-center justify-between ${pkg.popular ? "sm:flex-row" : "flex-col items-start gap-2"}`}>
                      <div>
                        <p className="font-semibold text-sm">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{pkg.description}</p>
                      </div>
 
                      <div className={`${pkg.popular ? "text-right" : "w-full"}`}>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-2xl font-bold text-primary">
                            {pkg.points.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">points</span>
                        </div>
                        <p className="text-base font-semibold">₹{pkg.price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{valuePerRupee} pts/₹</p>
                      </div>
                    </div>
 
                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
 
            {/* Summary & Pay */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              {selectedPackage ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Selected:</span>
                  <span className="font-medium">
                    {selectedPackage.name} — {selectedPackage.points.toLocaleString()} pts for ₹{selectedPackage.price.toLocaleString()}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Select a package above to continue
                </p>
              )}
 
              <Button
                className="w-full"
                onClick={handleRecharge}
                disabled={isProcessing || !selectedPackage}
              >
                {isProcessing
                  ? "Processing..."
                  : selectedPackage
                  ? `Pay ₹${selectedPackage.price.toLocaleString()} via Razorpay`
                  : "Select a Package"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}