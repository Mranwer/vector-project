import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Zap } from "lucide-react";

export function Navbar() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b-0 border-x-0 rounded-none bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">VTDS</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/services" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/services' ? 'text-primary' : 'text-muted-foreground'}`}>
            Services
          </Link>
          <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            How it Works
          </a>
          <a href="/#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-4">
          {!isLoading && (
            user ? (
              <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>
                <Button variant="default" className="shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                  {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:inline-flex">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" className="shadow-[0_0_20px_rgba(59,130,246,0.4)]">Get Started</Button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
