import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useCreateOrder } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  ZapIcon,
} from "lucide-react";

interface ServicePackage {
  _id: string;
  tier: string;
  group: string;
  pointsCost: number;
  deliveryTime: string;
  features: string[];
  status: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  pointsCost: number;
  deliveryTime: string;
  category: string;
  subcategory: string;
  features: string[];
  packages: ServicePackage[];
}

function getTierStyle(tier: string) {
  switch (tier) {
    case "Basic":    return { card: "border-white/10 bg-muted/5",           badge: "bg-muted text-muted-foreground" };
    case "Standard": return { card: "border-blue-500/30 bg-blue-500/5",     badge: "bg-blue-500/20 text-blue-400" };
    case "Advanced": return { card: "border-purple-500/30 bg-purple-500/5", badge: "bg-purple-500/20 text-purple-400" };
    default:         return { card: "border-white/10 bg-muted/5",           badge: "bg-muted text-muted-foreground" };
  }
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/services/${id}`)
      .then(r => r.json())
      .then(data => {
        setService(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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

  const handleOrder = (pkg: ServicePackage) => {
    if (!user) { navigate("/login"); return; }
    setSelectedPackage(pkg);
    setOrderError("");
    setShowConfirm(true);
  };

  const handleOrderDirect = () => {
    if (!user) { navigate("/login"); return; }
    if (!service) return;
    setSelectedPackage(null);
    setOrderError("");
    setShowConfirm(true);
  };

  const confirmOrder = () => {
    if (!service) return;

    if (selectedPackage) {
      // Package order — package ki _id use karo
      placeOrder({
        data: {
          serviceId: service.id,
          packageId: selectedPackage._id,
          notes: `${selectedPackage.tier} - ${selectedPackage.group}`,
        },
      });
    } else {
      // Direct service order
      placeOrder({
        data: {
          serviceId: service.id,
        },
      });
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-panel rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!service) {
    return (
      <PublicLayout>
        <div className="pt-24 text-center text-muted-foreground">
          Service not found.
        </div>
      </PublicLayout>
    );
  }

  const userBalance = user?.walletBalance ?? 0;
  const hasPackages = service.packages && service.packages.length > 0;

  return (
    <PublicLayout>
      <section className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Back */}
          <Link href="/services">
            <Button variant="ghost" className="mb-8 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Services
            </Button>
          </Link>

          {/* Service Header */}
          <div className="mb-10">
            {service.thumbnail && (
              <img
                src={service.thumbnail}
                alt={service.title}
                className="w-full max-h-64 object-cover rounded-2xl mb-6"
              />
            )}

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary">{service.category}</Badge>
              <Badge variant="outline">{service.subcategory}</Badge>
            </div>

            <h1 className="text-3xl font-bold mb-2">{service.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <ZapIcon className="w-4 h-4 text-primary" />
                <strong className="text-primary">{service.pointsCost.toLocaleString()} pts</strong>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {service.deliveryTime}
              </span>
            </div>

            <div className="text-muted-foreground text-sm leading-relaxed mb-4">
              {service.description.split('\n').map((line, i) => (
                <p key={i} className="mb-1">{line}</p>
              ))}
            </div>

            {service.features.length > 0 && (
              <ul className="space-y-1.5 mb-6">
                {service.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            )}

            {user && (
              <div className="inline-flex items-center gap-2 text-sm bg-primary/5 border border-primary/10 rounded-xl px-4 py-2 mb-6">
                <ZapIcon className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Your Balance:</span>
                <strong className="text-primary">{userBalance.toLocaleString()} pts</strong>
              </div>
            )}

            {/* Direct order button (no packages) */}
            {!hasPackages && (
              <Button
                size="lg"
                disabled={!!user && userBalance < service.pointsCost}
                onClick={handleOrderDirect}
              >
                {!user
                  ? "Login to Order"
                  : userBalance < service.pointsCost
                  ? "Insufficient Balance"
                  : `Order Now — ${service.pointsCost.toLocaleString()} pts`}
              </Button>
            )}
          </div>

          {/* Packages */}
          {hasPackages && (
            <>
              <h2 className="text-2xl font-bold mb-6">Choose a Package</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {service.packages.map((pkg) => {
                  const affordable = userBalance >= pkg.pointsCost;
                  const style = getTierStyle(pkg.tier);

                  return (
                    <div
                      key={pkg._id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 hover:border-white/30 transition-all ${style.card}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
                            {pkg.tier}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {pkg.deliveryTime}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground mb-3">{pkg.group}</div>

                        <div className="text-2xl font-black text-primary mb-4">
                          {pkg.pointsCost} pts
                        </div>

                        <ul className="space-y-1.5">
                          {pkg.features.map((feat, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                              {feat}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2 mt-auto">
                        {user && !affordable && (
                          <p className="text-xs text-destructive text-center font-medium">
                            Insufficient balance
                          </p>
                        )}
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={!!user && !affordable}
                          onClick={() => handleOrder(pkg)}
                        >
                          {!user ? "Login to Order" : !affordable ? "Insufficient Balance" : "Order Now"}
                        </Button>
                        {user && !affordable && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full text-xs underline"
                            onClick={() => navigate("/dashboard/wallet")}
                          >
                            Recharge Wallet
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </section>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-panel border-white/10">
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              {selectedPackage ? (
                <>
                  <strong>{selectedPackage.tier} Package</strong> — {selectedPackage.group} for{" "}
                  <strong>{selectedPackage.pointsCost.toLocaleString()} points</strong>
                </>
              ) : (
                <>
                  <strong>{service?.title}</strong> for{" "}
                  <strong>{service?.pointsCost.toLocaleString()} points</strong>
                </>
              )}
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
              Aapka order successfully place ho gaya.
            </DialogDescription>
            <Button onClick={() => navigate("/dashboard/orders")}>View Orders</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}