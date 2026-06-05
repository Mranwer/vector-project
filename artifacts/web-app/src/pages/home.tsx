import { Link } from "wouter";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/PublicLayout";

import {
  Zap,
  ShieldCheck,
  Star,
  ArrowRight,
 ChevronRight,
  Youtube,
  Globe,
  Megaphone,
} from "lucide-react";

const faqs = [
  {
    q: "What are points?",
    a: "Points are our platform currency. 1 point = ₹1. You recharge your wallet using Razorpay and use points to purchase services.",
  },
  {
    q: "How fast is delivery?",
    a: "Delivery times vary by service. Each listing shows the exact turnaround time — from 2 days to 60 days depending on scope.",
  },
  {
    q: "Can I get a refund?",
    a: "If we're unable to deliver, points are refunded to your wallet automatically. Contact support within 7 days of delivery for revision requests.",
  },
  {
    q: "Is payment secure?",
    a: "Yes. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store card details.",
  },
];

const CATEGORY_ORDER = [
  "YouTube Services",
  "Web & App Development",
  "Meta Ads",
];

const CATEGORY_META: Record<
  string,
  {
    icon: any;
    iconColor: string;
    iconBg: string;
    badge: string;
    badgeColor: string;
    gradient: string;
    slug: string;
    stat: string;
    description: string;
  }
> = {
  "YouTube Services": {
    icon: Youtube,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    badge: "Video Marketing",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    gradient: "from-red-500/20 via-orange-500/10 to-transparent",
    slug: "youtube-services",
    stat: "10K+ Subscribers Delivered",
    description:
      "Grow your YouTube channel with professional video SEO, thumbnail design, channel management, and audience growth strategies.",
  },

  "Web & App Development": {
    icon: Globe,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    badge: "Development",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    slug: "app-web-development",
    stat: "200+ Projects Delivered",
    description:
      "From landing pages to full-stack web apps and mobile applications — fast, modern, and scalable digital products.",
  },

  "Meta Ads": {
    icon: Megaphone,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    badge: "Paid Advertising",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    slug: "meta-ads",
    stat: "₹50L+ Ad Spend Managed",
    description:
      "Drive targeted traffic and sales with expertly managed Facebook & Instagram ad campaigns.",
  },
};

type CategoryType = {
  category: string;
  totalServices: number;
  subcategories?: {
    name: string;
    count: number;
  }[];
};

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services/grouped")
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => {
          const aIndex = CATEGORY_ORDER.indexOf(a.category);
          const bIndex = CATEGORY_ORDER.indexOf(b.category);

          const aOrder = aIndex === -1 ? 999 : aIndex;
          const bOrder = bIndex === -1 ? 999 : bIndex;

          return aOrder - bOrder;
        });

        setCategories(sorted);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-32 flex flex-col items-center text-center px-4 min-h-screen justify-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/60 z-0" />

        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <Badge
            variant="outline"
            className="mb-6 text-primary border-primary/30 px-4 py-1.5 bg-black/30 backdrop-blur"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Premium Digital Services
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-6 text-white">
            Your Vision.
            <br />
            Expert Execution.
          </h1>

          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-10 leading-relaxed">
            Browse premium digital services. Pay with wallet points. Get
            results from vetted professionals — fast, transparent, and reliable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/services">
              <Button
                size="lg"
                className="shadow-[0_0_30px_rgba(59,130,246,0.4)] gap-2"
              >
                Browse Services
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/register">
              <Button size="lg" variant="outline">
                Get Started Free
              </Button>
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-8 md:gap-16 text-center">
            {[
              { value: "500+", label: "Services Delivered" },
              { value: "99%", label: "Satisfaction Rate" },
              { value: "24h", label: "Avg. First Response" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>

                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Featured Services
              </h2>

              <p className="text-muted-foreground">
                Hand-picked by our team for quality and impact
              </p>
            </div>

            <Link href="/services">
              <Button variant="ghost" className="gap-1 text-primary">
                View all
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="glass-panel rounded-xl h-64 animate-pulse"
                  />
                ))
              : categories.map((cat) => {
                  const meta = CATEGORY_META[cat.category];

                  if (!meta) return null;

                  const Icon = meta.icon;

                  return (
                    <Link
                      key={cat.category}
                      href={`/services/category/${meta.slug}`}
                    >
                      <Card className="glass-panel overflow-hidden hover:border-primary/40 transition-all duration-300 group cursor-pointer h-full relative">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-60 pointer-events-none`}
                        />

                        <CardContent className="relative p-6 flex flex-col h-full">
                          <div
                            className={`w-12 h-12 rounded-xl ${meta.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon
                              className={`w-6 h-6 ${meta.iconColor}`}
                            />
                          </div>

                          <Badge
                            variant="outline"
                            className={`w-fit mb-3 text-xs ${meta.badgeColor}`}
                          >
                            {meta.badge}
                          </Badge>

                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {cat.category}
                          </h3>

                          <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                            {meta.description}
                          </p>

                          <ul className="space-y-1.5 mb-5">
                            {cat.subcategories?.map((sub) => (
                              <li
                                key={sub.name}
                                className="flex items-center gap-2 text-xs text-muted-foreground"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                {sub.name} ({sub.count})
                              </li>
                            ))}
                          </ul>

                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-xs text-muted-foreground">
                              {cat.totalServices} services
                            </span>

                            <span className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                              View All
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>

          <p className="text-muted-foreground mb-16 max-w-xl mx-auto">
            Three simple steps to get any digital service done
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Zap,
                title: "Recharge Wallet",
                desc: "Add points to your wallet instantly via Razorpay. 1 point = ₹1.",
              },
              {
                step: "02",
                icon: Star,
                title: "Pick a Service",
                desc: "Browse our curated catalogue. Filter by category, price, and delivery time.",
              },
              {
                step: "03",
                icon: ShieldCheck,
                title: "Get Delivered",
                desc: "Place your order, track progress, and receive your deliverable on time.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="relative glass-panel p-8 rounded-xl text-left"
              >
                <div className="text-6xl font-bold text-primary/10 absolute top-4 right-6">
                  {step}
                </div>

                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="font-bold text-lg mb-2">{title}</h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY BUTTONS */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-10">
            Browse by Category
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat.category];

              if (!meta) return null;

              return (
                <Link
                  key={cat.category}
                  href={`/services/category/${meta.slug}`}
                >
                  <Button
                    variant="outline"
                    className="rounded-full hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                  >
                    {cat.category}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="glass-panel rounded-xl p-6">
                <h3 className="font-semibold mb-2">{q}</h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-white/5 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to get started?
        </h2>

        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Join hundreds of businesses using Vector Technology for their digital
          needs.
        </p>

        <Link href="/register">
          <Button
            size="lg"
            className="shadow-[0_0_30px_rgba(59,130,246,0.4)] gap-2"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </PublicLayout>
  );
}