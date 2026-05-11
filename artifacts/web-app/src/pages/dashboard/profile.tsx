import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) setForm({ name: user.name ?? "", phone: user.phone ?? "" });
  }, [user]);

  const { mutate, isPending } = useUpdateProfile({
    mutation: {
      onSuccess() {
        setSuccess(true);
        setError("");
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        setTimeout(() => setSuccess(false), 3000);
      },
      onError(err: unknown) {
        const e = err as { data?: { error?: string }; message?: string };
        setError(e?.data?.error ?? e?.message ?? "Update failed");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    mutate({ data: { name: form.name, phone: form.phone || undefined } });
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account information</p>
          </div>

          {/* Avatar Card */}
          <Card className="glass-panel mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary border border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user?.name}</p>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">{user?.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-base">Edit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {success && (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4" />
                    Profile updated successfully
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Email (cannot change)</Label>
                  <Input value={user?.email ?? ""} disabled className="opacity-60" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
