import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useGetServices } from "@workspace/api-client-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Search, Clock, Filter } from "lucide-react";

const categories = ["All", "Design", "Development", "Marketing", "Content", "Security"];

export default function ServicesPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [selectedCategory, setSelectedCategory] = useState(params.get("category") ?? "All");
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
    <PublicLayout>
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">Digital Services</h1>
          <p className="text-muted-foreground">Explore our curated catalogue of premium digital services</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-9"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
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
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-xl overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No services found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{total} services found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="glass-panel overflow-hidden hover:border-primary/30 transition-all duration-300 group">
                  <Link href={`/services/${service.id}`}>
                    {service.thumbnail && (
                      
                      <div className="aspect-video overflow-hidden">
                        <img src={service.thumbnail} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-3 text-xs">{service.category}</Badge>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-primary font-bold">
                          <Zap className="w-4 h-4" />
                          <span>{service.pointsCost?.toLocaleString()} pts</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {service.deliveryTime}
                        </span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
