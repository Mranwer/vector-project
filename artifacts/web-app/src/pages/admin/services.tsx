import { useState } from "react";
import { useGetAdminServices, useCreateService, useUpdateService } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Zap, Clock, Eye, EyeOff, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["Design", "Development", "Marketing", "Content", "Security"];

interface ServiceForm {
  title: string;
  description: string;
  pointsCost: string;
  deliveryTime: string;
  category: string;
  thumbnail: string;
  features: string;
}

const EMPTY_FORM: ServiceForm = {
  title: "", description: "", pointsCost: "", deliveryTime: "",
  category: "Design", thumbnail: "", features: "",
};

export default function AdminServicesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; id?: string } | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useGetAdminServices();
  const allServices = data ?? [];
  const filtered = allServices.filter(s =>
    !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase())
  );
  const services = filtered.slice((page - 1) * 12, page * 12);
  const total = filtered.length;
  const totalPages = Math.ceil(total / 12);

  const { mutate: createService, isPending: isCreating } = useCreateService({
    mutation: {
      onSuccess() { refetch(); qc.invalidateQueries(); setDialog(null); setForm(EMPTY_FORM); },
    },
  });

  const { mutate: updateService, isPending: isUpdating } = useUpdateService({
    mutation: {
      onSuccess() { refetch(); qc.invalidateQueries(); setDialog(null); },
    },
  });

  const handleSubmit = () => {
    const payload = {
      title: form.title,
      description: form.description,
      pointsCost: parseInt(form.pointsCost),
      deliveryTime: form.deliveryTime,
      category: form.category,
      thumbnail: form.thumbnail || undefined,
      features: form.features ? form.features.split("\n").filter(Boolean) : undefined,
    };
    if (dialog?.mode === "create") {
      createService({ data: payload });
    } else if (dialog?.id) {
      updateService({ id: dialog.id, data: payload });
    }
  };

  const openEdit = (s: typeof services[0]) => {
    setForm({
      title: s.title ?? "",
      description: s.description ?? "",
      pointsCost: String(s.pointsCost ?? ""),
      deliveryTime: s.deliveryTime ?? "",
      category: s.category ?? "Design",
      thumbnail: s.thumbnail ?? "",
      features: (s.features ?? []).join("\n"),
    });
    setDialog({ mode: "edit", id: s.id });
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar isAdmin />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Services</h1>
              <p className="text-muted-foreground mt-1">{total} services in catalogue</p>
            </div>
            <Button className="gap-2" onClick={() => { setForm(EMPTY_FORM); setDialog({ mode: "create" }); }}>
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-9"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-panel rounded-xl p-4 space-y-3">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div key={service.id} className="glass-panel rounded-xl overflow-hidden hover:border-primary/20 transition-all">
                  {service.thumbnail && (
                    <div className="aspect-video overflow-hidden">
                      <img src={service.thumbnail} alt={service.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <Badge variant="secondary" className="text-xs mb-1">{service.category}</Badge>
                        <h3 className="font-semibold text-sm">{service.title}</h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-panel border-white/10">
                          <DropdownMenuItem onClick={() => openEdit(service)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateService({ id: service.id!, data: { status: service.status === "active" ? "inactive" : "active" } })}
                          >
                            {service.status === "active" ? (
                              <><EyeOff className="w-4 h-4 mr-2" /> Deactivate</>
                            ) : (
                              <><Eye className="w-4 h-4 mr-2" /> Activate</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-primary text-sm font-bold">
                        <Zap className="w-3.5 h-3.5" />{service.pointsCost?.toLocaleString()} pts
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />{service.deliveryTime}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${service.status === "active" ? "text-green-400 border-green-400/20 bg-green-400/10" : "text-muted-foreground border-muted"}`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="glass-panel border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "create" ? "Add New Service" : "Edit Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Service title" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the service..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Points Cost</Label>
                <Input type="number" min={1} value={form.pointsCost} onChange={e => setForm(f => ({ ...f, pointsCost: e.target.value }))} placeholder="500" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background/50 px-3 text-sm"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Delivery Time</Label>
              <Input value={form.deliveryTime} onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))} placeholder="e.g. 3-5 days" />
            </div>
            <div className="space-y-1.5">
              <Label>Thumbnail URL (optional)</Label>
              <Input value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label>Features (one per line)</Label>
              <Textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4} placeholder={"Feature 1\nFeature 2\nFeature 3"} />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? "Saving..." : dialog?.mode === "create" ? "Create Service" : "Update Service"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
