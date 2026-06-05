import { Link } from "wouter";
import { useEffect, useState } from "react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import {
  Youtube,
  Globe,
  Megaphone,
  ArrowRight,
  Star,
  Users,
  Zap,
} from "lucide-react";

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

export default function ServicesPage() {
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
      .catch(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="mb-14 text-center">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1 text-xs tracking-widest uppercase"
          >
            What We Offer
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Services
          </h1>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Premium digital services to grow your brand, build your product,
            and dominate your market.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-14">
          {[
            { icon: Users, label: "Happy Clients", value: "500+" },
            { icon: Star, label: "5-Star Reviews", value: "98%" },
            { icon: Zap, label: "Projects Done", value: "1000+" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="glass-panel rounded-xl p-4 text-center"
            >
              <Icon className="w-5 h-5 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
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
                          <Icon className={`w-6 h-6 ${meta.iconColor}`} />
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
    </PublicLayout>
  );
}