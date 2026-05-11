import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetServices } from "@workspace/api-client-react";
import { Zap, ShieldCheck, Clock, Star, ArrowRight, ChevronRight } from "lucide-react";

const categories = ["Design", "Development", "Marketing", "Content", "Security"];

const faqs = [
  { q: "What are points?", a: "Points are our platform currency. 1 point = ₹1. You recharge your wallet using Razorpay and use points to purchase services." },
  { q: "How fast is delivery?", a: "Delivery times vary by service. Each listing shows the exact turnaround time — from 2 days to 60 days depending on scope." },
  { q: "Can I get a refund?", a: "If we're unable to deliver, points are refunded to your wallet automatically. Contact support within 7 days of delivery for revision requests." },
  { q: "Is payment secure?", a: "Yes. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store card details." },
];

export default function HomePage() {
  const { data: servicesData } = useGetServices({ limit: 6 });
  const services = servicesData?.services ?? [];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-32 flex flex-col items-center text-center px-4">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <Badge variant="outline" className="mb-6 text-primary border-primary/30 px-4 py-1.5">
          <Zap className="w-3.5 h-3.5 mr-1.5" /> Premium Digital Services
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-6 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
          Your Vision.<br />Expert Execution.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Browse premium digital services. Pay with wallet points. Get results from vetted professionals — fast, transparent, and reliable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/services">
            <Button size="lg" className="shadow-[0_0_30px_rgba(59,130,246,0.4)] gap-2">
              Browse Services <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">Get Started Free</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 md:gap-16 text-center">
          {[
            { value: "500+", label: "Services Delivered" },
            { value: "99%", label: "Satisfaction Rate" },
            { value: "24h", label: "Avg. First Response" },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Services</h2>
              <p className="text-muted-foreground">Hand-picked by our team for quality and impact</p>
            </div>
            <Link href="/services">
              <Button variant="ghost" className="gap-1 text-primary">
                View all <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="glass-panel overflow-hidden hover:border-primary/30 transition-all duration-300 group cursor-pointer">
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
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground mb-16 max-w-xl mx-auto">Three simple steps to get any digital service done</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Zap, title: "Recharge Wallet", desc: "Add points to your wallet instantly via Razorpay. 1 point = ₹1." },
              { step: "02", icon: Star, title: "Pick a Service", desc: "Browse our curated catalogue. Filter by category, price, and delivery time." },
              { step: "03", icon: ShieldCheck, title: "Get Delivered", desc: "Place your order, track progress, and receive your deliverable on time." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative glass-panel p-8 rounded-xl text-left">
                <div className="text-6xl font-bold text-primary/10 absolute top-4 right-6">{step}</div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-10">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <Link key={cat} href={`/services?category=${cat}`}>
                <Button variant="outline" className="rounded-full hover:bg-primary/10 hover:border-primary/50 hover:text-primary">{cat}</Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="glass-panel rounded-xl p-6">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-white/5 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join hundreds of businesses using Vector Technology for their digital needs.</p>
        <Link href="/register">
          <Button size="lg" className="shadow-[0_0_30px_rgba(59,130,246,0.4)] gap-2">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </PublicLayout>
  );
}
