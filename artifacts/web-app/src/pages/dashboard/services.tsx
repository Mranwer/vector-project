import { useState } from "react";
import { Link } from "wouter";
import { useGetServices } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Zap, Clock, ShoppingCart } from "lucide-react";

const CATEGORIES = ["All", "Design", "Development", "Marketing", "Content", "Security"];

export default function DashboardServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetServices({
    category: selectedCategory === "All" ? undefined : selectedCategory,
    search: searchQuery || undefined,
    page,
    limit: 9,
  });

  const services = data?.services ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 9);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Browse Services</h1>
            <p className="text-muted-foreground mt-1">Purchase services with your wallet points</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-9"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => { setSelectedCategory(cat); setPage(1); }}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="glass-panel rounded-xl overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No services found</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{total} services available</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map(service => (
                  <Card key={service.id} className="glass-panel overflow-hidden hover:border-primary/30 transition-all group">
                    {service.thumbnail && (
                      <div className="aspect-video overflow-hidden">
                        <img src={service.thumbnail} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">{service.category}</Badge>
                      <h3 className="font-semibold mb-1 text-sm group-hover:text-primary transition-colors">{service.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{service.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-1 text-primary font-bold text-sm">
                          <Zap className="w-3.5 h-3.5" />{service.pointsCost?.toLocaleString()} pts
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />{service.deliveryTime}
                        </span>
                      </div>
                      <Link href={`/services/${service.id}`}>
                        <Button size="sm" className="w-full gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5" /> View & Order
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
