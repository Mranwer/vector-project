import { useState } from "react";
import { useGetAdminUsers, useUpdateAdminUser, useAdjustUserWallet } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Wallet, ShieldCheck, Ban, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [walletDialog, setWalletDialog] = useState<{ id: string; name: string } | null>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletType, setWalletType] = useState<"credit" | "debit">("credit");
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useGetAdminUsers({ search: search || undefined, page, limit: 15 });
  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  const { mutate: updateUser } = useUpdateAdminUser({
    mutation: { onSuccess: () => { refetch(); qc.invalidateQueries(); } },
  });

  const { mutate: adjustWallet, isPending: isAdjusting } = useAdjustUserWallet({
    mutation: {
      onSuccess() {
        setWalletDialog(null);
        setWalletAmount("");
        refetch();
        qc.invalidateQueries();
      },
    },
  });

  const handleWalletAdjust = () => {
    if (!walletDialog) return;
    const amt = parseInt(walletAmount);
    if (!amt || amt <= 0) return;
    adjustWallet({ id: walletDialog.id, data: { amount: amt, type: walletType, description: `Admin ${walletType} adjustment` } });
  };

  const STATUS_COLORS: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    suspended: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    banned: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar isAdmin />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Users</h1>
              <p className="text-muted-foreground mt-1">{total} registered users</p>
            </div>
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <Card className="glass-panel">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 shrink-0">
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">{user.name}</p>
                          {user.role === "admin" && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">admin</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5 text-sm">
                        <Wallet className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium">{(user.walletBalance ?? 0).toLocaleString()}</span>
                      </div>
                      <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_COLORS[user.status ?? "active"] ?? ""}`}>
                        {user.status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-panel border-white/10">
                          <DropdownMenuItem onClick={() => setWalletDialog({ id: user.id!, name: user.name! })}>
                            <Wallet className="w-4 h-4 mr-2" /> Adjust Wallet
                          </DropdownMenuItem>
                          {user.status === "active" ? (
                            <DropdownMenuItem className="text-yellow-400" onClick={() => updateUser({ id: user.id!, data: { status: "suspended" } })}>
                              <Ban className="w-4 h-4 mr-2" /> Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-400" onClick={() => updateUser({ id: user.id!, data: { status: "active" } })}>
                              <ShieldCheck className="w-4 h-4 mr-2" /> Activate
                            </DropdownMenuItem>
                          )}
                          {user.role !== "admin" && (
                            <DropdownMenuItem onClick={() => updateUser({ id: user.id!, data: { role: "admin" } })}>
                              <ShieldCheck className="w-4 h-4 mr-2" /> Make Admin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t border-white/5">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <span className="flex items-center px-3 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={!!walletDialog} onOpenChange={() => setWalletDialog(null)}>
        <DialogContent className="glass-panel border-white/10">
          <DialogHeader>
            <DialogTitle>Adjust Wallet — {walletDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={walletType === "credit" ? "default" : "outline"}
                onClick={() => setWalletType("credit")}
                className="flex-1"
              >
                Credit (+)
              </Button>
              <Button
                variant={walletType === "debit" ? "destructive" : "outline"}
                onClick={() => setWalletType("debit")}
                className="flex-1"
              >
                Debit (-)
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (points)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Enter points..."
                value={walletAmount}
                onChange={e => setWalletAmount(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleWalletAdjust} disabled={isAdjusting}>
              {isAdjusting ? "Adjusting..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
