import { useState } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  Wallet, 
  ShoppingCart, 
  Package, 
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Zap,
  Users,
  Briefcase,
  CreditCard,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const userRoutes = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
    { href: "/dashboard/services", label: "Services", icon: ShoppingCart },
    { href: "/dashboard/orders", label: "Orders", icon: Package },
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
  ];

  const adminRoutes = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/services", label: "Services", icon: Briefcase },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
  ];

  const routes = isAdmin ? adminRoutes : userRoutes;

  const NavLinks = () => (
    <>
      {routes.map((route) => {
        const isActive = location === route.href;
        return (
          <Link key={route.href} href={route.href}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer group",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}>
              <route.icon className={cn("w-5 h-5", isActive ? "text-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full" : "group-hover:text-foreground")} />
              <span className="font-medium">{route.label}</span>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" className="glass-panel" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 w-64 glass-panel border-y-0 border-l-0 rounded-none z-40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 group mb-8">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Vector Technology {isAdmin && <span className="text-primary text-xs ml-1 bg-primary/10 px-1 py-0.5 rounded">ADMIN</span>}</span>
          </Link>

          <nav className="space-y-1">
            <NavLinks />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold uppercase border border-secondary/30">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}