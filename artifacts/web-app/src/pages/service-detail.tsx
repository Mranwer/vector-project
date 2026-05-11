import { useParams, useLocation } from "wouter";
import { useGetService, useCreateOrder } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Clock, CheckCircle, ShieldCheck, AlertCircle } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { data: service, isLoading } = useGetService(id!);

  const { mutate: placeOrder, isPending: isOrdering } = useCreateOrder({
    mutation: {
      onSuccess() {
        setShowConfirm(false);
        setOrderSuccess(true);
      },
      onError(err: unknown) {
        const e = err as { data?: { error?: string }; message?: string };
        setOrderError(e?.data?.error ?? e?.message ?? "Order failed");
      },
    },
  });

  const handleOrder = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    setOrderError("");
    setShowConfirm(true);
  };

  const confirmOrder = () => {
    if (!service?.id) return;
    placeOrder({ data: { serviceId: service.id } });
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="aspect-video w-full rounded-xl mb-8" />
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </PublicLayout>
    );
  }

  if (!service) {
    return (
      <PublicLayout>
        <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Service not found.</p>
        </div>
      </PublicLayout>
    );
  }

  const canAfford = user && (user.walletBalance ?? 0) >= (service.pointsCost ?? 0);

  return (
    <PublicLayout>
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {service.thumbnail && (
              <div className="aspect-video rounded-xl overflow-hidden">
                <img src={service.thumbnail} alt={service.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <Badge variant="secondary" className="mb-3">{service.category}</Badge>
              <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
            {service.features && service.features.length > 0 && (
              <div className="glass-panel rounded-xl p-6">
                <h2 className="font-semibold text-lg mb-4">What's Included</h2>
                <ul className="space-y-3">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="glass-panel border-primary/20 sticky top-20">
              <CardContent className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Zap className="w-5 h-5" />
                    <span className="text-3xl font-bold">{service.pointsCost?.toLocaleString()}</span>
                    <span className="text-lg text-muted-foreground">pts</span>
                  </div>
                  <p className="text-xs text-muted-foreground">≈ ₹{service.pointsCost?.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Delivery: <strong className="text-foreground">{service.deliveryTime}</strong></span>
                </div>
                {user && (
                  <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                    Your balance: <strong className="text-foreground">{user.walletBalance?.toLocaleString()} pts</strong>
                    {!canAfford && <span className="text-destructive block mt-1">Insufficient balance</span>}
                  </div>
                )}
                <Button
                  className="w-full shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  onClick={handleOrder}
                  disabled={!!user && !canAfford}
                >
                  {!user ? "Login to Order" : !canAfford ? "Insufficient Balance" : "Order Now"}
                </Button>
                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    <a href="/login" className="text-primary hover:underline">Login</a> or{" "}
                    <a href="/register" className="text-primary hover:underline">register</a> to purchase
                  </p>
                )}
                {!canAfford && user && (
                  <Button variant="outline" className="w-full" onClick={() => setLocation("/dashboard/wallet")}>
                    Recharge Wallet
                  </Button>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Secure payment & satisfaction guaranteed
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Order Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-panel border-white/10">
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              You're about to purchase <strong>{service.title}</strong> for <strong>{service.pointsCost?.toLocaleString()} points</strong>.
            </DialogDescription>
          </DialogHeader>
          {orderError && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {orderError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={confirmOrder} disabled={isOrdering}>
              {isOrdering ? "Placing order..." : "Confirm Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={orderSuccess} onOpenChange={() => setOrderSuccess(false)}>
        <DialogContent className="glass-panel border-white/10 text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-xl">Order Placed!</DialogTitle>
            <DialogDescription>
              Your order for <strong>{service.title}</strong> has been placed successfully. Track it in your dashboard.
            </DialogDescription>
            <Button onClick={() => setLocation("/dashboard/orders")}>
              View Orders
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
