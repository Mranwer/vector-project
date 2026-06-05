import { useState } from "react";
import { Link, useLocation } from "wouter";
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
  Image,
  Video,
  Youtube,
} from "lucide-react";

// ─── Seed Data (hardcoded — API pe depend nahi) ───────────────────────────────

interface Package {
  tier: "Basic" | "Standard" | "Advanced";
  group: string;
  pointsCost: number;
  deliveryTime: string;
  features: string[];
  serviceTitle: string;
}

const ALL_PACKAGES: Package[] = [
  // ── Thumbnail Design ──
  {
    serviceTitle: "Thumbnail Design",
    tier: "Basic",
    group: "Thumbnail",
    pointsCost: 20,
    deliveryTime: "1 day",
    features: ["1 Thumbnail", "HD Quality", "1 Revision"],
  },
  {
    serviceTitle: "Thumbnail Design",
    tier: "Standard",
    group: "Thumbnail",
    pointsCost: 29,
    deliveryTime: "2 days",
    features: ["3 Thumbnails", "Professional Design", "3 Revisions"],
  },
  {
    serviceTitle: "Thumbnail Design",
    tier: "Advanced",
    group: "Thumbnail",
    pointsCost: 39,
    deliveryTime: "2 days",
    features: ["5 Thumbnails", "CTR Optimized Design", "Source File Included", "Unlimited Revisions"],
  },

  // ── YouTube Shorts (Under 1 Min) ──
  {
    serviceTitle: "YouTube Shorts (Under 1 Min)",
    tier: "Basic",
    group: "Video <1min",
    pointsCost: 39,
    deliveryTime: "2 days",
    features: ["1 Short Video", "Basic Cuts", "Background Music"],
  },
  {
    serviceTitle: "YouTube Shorts (Under 1 Min)",
    tier: "Standard",
    group: "Video <1min",
    pointsCost: 49,
    deliveryTime: "3 days",
    features: ["3 Short Videos", "Captions", "Transitions", "Color Correction"],
  },
  {
    serviceTitle: "YouTube Shorts (Under 1 Min)",
    tier: "Advanced",
    group: "Video <1min",
    pointsCost: 69,
    deliveryTime: "4 days",
    features: ["5 Short Videos", "Motion Graphics", "Premium Effects", "Unlimited Revisions"],
  },

  // ── 1–3 Minute Video Editing ──
  {
    serviceTitle: "1–3 Minute Video Editing",
    tier: "Basic",
    group: "Video 1-3min",
    pointsCost: 49,
    deliveryTime: "2 days",
    features: ["Basic Editing", "Cuts & Trims", "Background Music"],
  },
  {
    serviceTitle: "1–3 Minute Video Editing",
    tier: "Standard",
    group: "Video 1-3min",
    pointsCost: 69,
    deliveryTime: "3 days",
    features: ["Transitions", "Captions", "Color Grading", "2 Revisions"],
  },
  {
    serviceTitle: "1–3 Minute Video Editing",
    tier: "Advanced",
    group: "Video 1-3min",
    pointsCost: 79,
    deliveryTime: "5 days",
    features: ["Motion Graphics", "Sound Design", "Premium Effects", "Unlimited Revisions"],
  },

  // ── 1–5 Minute Video Editing ──
  {
    serviceTitle: "1–5 Minute Video Editing",
    tier: "Basic",
    group: "Video 1-5min",
    pointsCost: 59,
    deliveryTime: "3 days",
    features: ["Basic Editing", "Cuts & Trims", "Background Music"],
  },
  {
    serviceTitle: "1–5 Minute Video Editing",
    tier: "Standard",
    group: "Video 1-5min",
    pointsCost: 79,
    deliveryTime: "5 days",
    features: ["Transitions", "Captions", "Color Grading", "2 Revisions"],
  },
  {
    serviceTitle: "1–5 Minute Video Editing",
    tier: "Advanced",
    group: "Video 1-5min",
    pointsCost: 99,
    deliveryTime: "7 days",
    features: ["Motion Graphics", "Sound Design", "Premium Effects", "Unlimited Revisions"],
  },
];

// Group by serviceTitle
const GROUPED = ALL_PACKAGES.reduce<Record<string, Package[]>>((acc, pkg) => {
  if (!acc[pkg.serviceTitle]) acc[pkg.serviceTitle] = [];
  acc[pkg.serviceTitle].push(pkg);
  return acc;
}, {});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getServiceIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("thumbnail")) return <Image className="w-5 h-5 text-primary" />;
  if (lower.includes("channel")) return <Youtube className="w-5 h-5 text-primary" />;
  if (lower.includes("video") || lower.includes("editing") || lower.includes("short")) return <Video className="w-5 h-5 text-primary" />;
  return <ZapIcon className="w-5 h-5 text-primary" />;
}

function getTierStyle(tier: string) {
  switch (tier) {
    case "Basic":    return { card: "border-white/10 bg-muted/5",          badge: "bg-muted text-muted-foreground" };
    case "Standard": return { card: "border-blue-500/30 bg-blue-500/5",    badge: "bg-blue-500/20 text-blue-400" };
    case "Advanced": return { card: "border-purple-500/30 bg-purple-500/5", badge: "bg-purple-500/20 text-purple-400" };
    default:         return { card: "border-white/10 bg-muted/5",          badge: "bg-muted text-muted-foreground" };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceDetailsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

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

  const handleOrder = (pkg: Package) => {
    if (!user) { navigate("/login"); return; }
    setSelectedPackage(pkg);
    setOrderError("");
    setShowConfirm(true);
  };

  const confirmOrder = () => {
    if (!selectedPackage) return;
    placeOrder({
      data: {
        serviceId: selectedPackage.serviceTitle, // fallback — ya aap actual serviceId pass kar sakte ho
        selectedServiceName: `${selectedPackage.tier} - ${selectedPackage.group}`,
        pointsCost: selectedPackage.pointsCost,
      },
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

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

          {/* Page Heading */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">All Service Packages</h1>
            <p className="text-muted-foreground text-sm">
              Apni zaroorat ke hisaab se koi bhi package choose karo
            </p>
            {user && (
              <div className="inline-flex items-center gap-2 mt-4 text-sm bg-primary/5 border border-primary/10 rounded-xl px-4 py-2">
                <ZapIcon className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Your Balance:</span>
                <strong className="text-primary">{user.walletBalance?.toLocaleString() ?? 0} pts</strong>
              </div>
            )}
          </div>

          {/* ── All Services + Packages ─────────────────────────────────── */}
          <div className="space-y-12">
            {Object.entries(GROUPED).map(([serviceTitle, packages]) => (
              <div key={serviceTitle}>

                {/* Service Header */}
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
                  <div className="p-2 rounded-xl bg-primary/10">
                    {getServiceIcon(serviceTitle)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{serviceTitle}</h2>
                    <p className="text-xs text-muted-foreground">
                      {packages.length} packages available
                    </p>
                  </div>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map((pkg, idx) => {
                    const userBalance = user?.walletBalance ?? 0;
                    const affordable = pkg.pointsCost === 0 || userBalance >= pkg.pointsCost;
                    const style = getTierStyle(pkg.tier);

                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 hover:border-white/30 transition-all ${style.card}`}
                      >
                        <div>
                          {/* Tier badge + Delivery */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
                              {pkg.tier}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {pkg.deliveryTime}
                            </div>
                          </div>

                          {/* Group */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                            {getServiceIcon(serviceTitle)}
                            <span>{pkg.group}</span>
                          </div>

                          {/* Price */}
                          <div className="text-2xl font-black text-primary mb-4">
                            {pkg.pointsCost === 0 ? "Free" : `${pkg.pointsCost} pts`}
                          </div>

                          {/* Features */}
                          <ul className="space-y-1.5">
                            {pkg.features.map((feat, fIdx) => (
                              <li key={fIdx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* CTA */}
                        <div className="space-y-2 mt-auto">
                          {user && !affordable && (
                            <p className="text-xs text-destructive text-center font-medium">
                              Insufficient balance
                            </p>
                          )}
                          <Button
                            size="sm"
                            className="w-full"
                            variant={pkg.pointsCost === 0 ? "outline" : "default"}
                            disabled={!!user && !affordable}
                            onClick={() => handleOrder(pkg)}
                          >
                            {!user
                              ? "Login to Order"
                              : !affordable
                              ? "Insufficient Balance"
                              : pkg.pointsCost === 0
                              ? "Get for Free"
                              : "Order Now"}
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
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-panel border-white/10">
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              Aap order karne wale hain{" "}
              <strong>{selectedPackage?.tier} Package ({selectedPackage?.group})</strong>{" "}
              from <strong>{selectedPackage?.serviceTitle}</strong> for{" "}
              <strong>
                {selectedPackage?.pointsCost === 0
                  ? "Free"
                  : `${selectedPackage?.pointsCost?.toLocaleString()} points`}
              </strong>.
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
              Aapka <strong>{selectedPackage?.tier} package</strong> successfully place ho gaya.
            </DialogDescription>
            <Button onClick={() => navigate("/dashboard/orders")}>View Orders</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}