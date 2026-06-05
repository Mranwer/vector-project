import { Link, useParams } from "wouter";
import { useEffect, useState } from "react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Clock, ArrowLeft } from "lucide-react";

const SLUG_TO_CATEGORY: Record<string, string> = {
  "youtube-services": "YouTube Services",
  "app-web-development": "Web & App Development",
  "meta-ads": "Meta Ads",
};

export default function CategoryPage() {
  const { slug } = useParams();
  const categoryName = SLUG_TO_CATEGORY[slug ?? ""] ?? slug ?? "";
  const [services, setServices] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [activeSubcat, setActiveSubcat] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/services?category=${encodeURIComponent(categoryName)}&limit=50`)
      .then(r => r.json())
      .then(d => {
        const svcs = d.services ?? [];
        setServices(svcs);
        const unique = ["All", ...new Set<string>(svcs.map((s: any) => s.subcategory).filter(Boolean))];
        setSubcategories(unique);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryName]);

  const filtered = activeSubcat === "All"
    ? services
    : services.filter(s => s.subcategory === activeSubcat);

  return (
    <PublicLayout>
      <section className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">

          <Link href="/service-details.tsx">
            <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to Services
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
          <p className="text-muted-foreground mb-8">{services.length} services available</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {subcategories.map(sub => (
              <Button
                key={sub}
                variant={activeSubcat === sub ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveSubcat(sub)}
              >
                {sub}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="glass-panel rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No services found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(service => (
                <Link key={service.id} href={`/services/${service.id}`}>
                  <Card className="glass-panel overflow-hidden hover:border-primary/40 transition-all duration-300 group cursor-pointer h-full">
                    {service.thumbnail && (
                      <div className="aspect-video overflow-hidden">
                        <img src={service.thumbnail} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-3 text-xs">{service.subcategory}</Badge>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                      <div className="text-muted-foreground leading-relaxed mb-8">
                        {service.description.split('\n').map((line,i) => (
                          <p key={i} className="mb-1">{line}</p>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-primary font-bold">
                          <Zap />
                          <span>{service.pointsCost?.toLocaleString()} Points</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {service.deliveryTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}