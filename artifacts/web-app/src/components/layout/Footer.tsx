import {
  Zap,
  Instagram,
  Youtube,
  Facebook,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background/80 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">Vector Technology</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              The premium digital services marketplace. High-end execution, precise delivery, and a seamless payment experience.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://www.instagram.com/vector_technologyy?igsh=MWg3ZzY5b2NtbXFrNA==" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/services" className="hover:text-primary transition-colors">Browse Services</Link></li>
              <li><a href="/#how-it-works" className="hover:text-primary transition-colors">How it Works</a></li>
              <li><a href="/#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="/#faq" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
  <h4 className="font-semibold mb-4">Contact</h4>
  <ul className="space-y-3 text-sm text-muted-foreground">
    <li>
      <a
        href="mailto:vectortechnology@55gmail.com"
        className="flex items-center gap-2 hover:text-primary transition-colors">
        <Mail className="w-4 h-4" />
          vectortechnology
      </a>
    </li>

    <li>
      <a
        href="tel:+918936056534"
        className="flex items-center gap-2 hover:text-primary transition-colors"
      >
        <Phone className="w-4 h-4" />
        +91 8936056534
      </a>
    </li>
  </ul>
</div>      

        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2018 Vector Technology Digital Services. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium">Vector Technology</span>
          </div>
        </div>
      </div>

      <a
  href="https://wa.me/918936056534"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
>
  <MessageCircle className="h-7 w-7" />
</a>
    </footer>

    
  );
  
}
