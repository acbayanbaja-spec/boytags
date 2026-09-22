import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Clock, MapPin, ShieldCheck, ShoppingBag, Sparkles, Star, Truck, Utensils } from "lucide-react";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Button, Card, Skeleton } from "@/components/ui";
import type { Product } from "@/types";
import { toast } from "sonner";

export function HomePage() {
  const { add } = useCart();
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api<Product[]>("/api/products"),
  });

  const featured = products?.slice(0, 4) || [];

  function handleQuickAdd(product: Product) {
    if (product.soldOut || product.availableQty <= 0) return;
    add(product, 1);
    toast.success(`Added ${product.name} to your cart!`, {
      description: `${formatPeso(product.price)} • Ready for checkout`,
    });
  }

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#24130c] via-[#1d0e07] to-[#140803] px-6 py-12 text-white shadow-2xl sm:px-12 sm:py-20">
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-roast/25 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md">
              <Flame className="h-4 w-4 text-roast" />
              <span>Santa Rosa's Crispiest Charcoal Roast Chicken</span>
            </div>

            <h1 className="display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Crisp skin. Tender meat. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400">
                Garlic-lemongrass perfection.
              </span>
            </h1>

            <p className="max-w-xl text-base text-amber-100/80 leading-relaxed">
              Boytag's signature whole roast chicken, grilled inasal, and savory sides. Prepared fresh over charcoal with live kitchen queue tracking and pinpoint doorstep delivery.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/menu">
                <Button className="h-12 px-6 text-base font-semibold shadow-lg shadow-roast/30">
                  Order Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/menu">
                <Button variant="outline" className="h-12 border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Explore Menu
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs">
              <div>
                <p className="display text-xl font-bold text-amber-300">25–35m</p>
                <p className="text-amber-100/70">Average Prep Time</p>
              </div>
              <div>
                <p className="display text-xl font-bold text-amber-300">100%</p>
                <p className="text-amber-100/70">Fresh Charcoal Roast</p>
              </div>
              <div>
                <p className="display text-xl font-bold text-amber-300">GPS Pin</p>
                <p className="text-amber-100/70">Doorstep Pinpointing</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-3 shadow-2xl backdrop-blur-md">
              <img
                src="https://images.unsplash.com/photo-1598103442097-8b70429476eb?auto=format&fit=crop&w=800&q=80"
                alt="Boytag's Whole Lechon Manok"
                className="h-72 w-full object-cover rounded-2xl sm:h-80"
              />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="display text-lg font-bold text-white">Whole Lechon Manok</h2>
                    <p className="text-xs text-amber-200/80">Signature house marinade • Serves 4–5</p>
                  </div>
                  <span className="display text-lg font-bold text-amber-300">{formatPeso(380)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Operations Pillars */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-start gap-4 p-5 hover:border-roast/30 transition">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-100 text-roast">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-ink">Charcoal Roasted Daily</h3>
            <p className="mt-1 text-xs text-muted">Never reheated or microwaved. Slow-cooked over hardwood coals.</p>
          </div>
        </Card>

        <Card className="flex items-start gap-4 p-5 hover:border-roast/30 transition">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-ink">Live Queue Prioritization</h3>
            <p className="mt-1 text-xs text-muted">Watch your roast move from kitchen prep to packing in real time.</p>
          </div>
        </Card>

        <Card className="flex items-start gap-4 p-5 hover:border-roast/30 transition">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-leaf-soft text-leaf">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-ink">Pinpoint Delivery GPS</h3>
            <p className="mt-1 text-xs text-muted">Drag the map pin directly onto your home, gate, or barangay landmark.</p>
          </div>
        </Card>

        <Card className="flex items-start gap-4 p-5 hover:border-roast/30 transition">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-ink">Hot & Fresh Guarantee</h3>
            <p className="mt-1 text-xs text-muted">Claim alerts prevent cold orders and keep pickups prompt and steamy.</p>
          </div>
        </Card>
      </section>

      {/* Featured Signatures */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-roast">Boytag's Signatures</span>
            <h2 className="display text-3xl font-bold text-ink">Fresh From The Roaster</h2>
          </div>
          <Link to="/menu" className="inline-flex items-center text-sm font-semibold text-roast hover:underline">
            View full menu <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => {
              const isOut = product.soldOut || product.availableQty <= 0;
              return (
                <Card key={product.id} className="group overflow-hidden p-0 flex flex-col justify-between hover:shadow-xl transition">
                  <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {isOut ? (
                      <span className="absolute left-3 top-3 rounded-full bg-danger px-3 py-1 text-xs font-bold text-white shadow-md">
                        SOLD OUT
                      </span>
                    ) : product.availableQty <= 5 ? (
                      <span className="absolute left-3 top-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                        Only {product.availableQty} left
                      </span>
                    ) : null}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                          {product.category?.name || "Main"}
                        </span>
                        <span className="display font-bold text-roast">{formatPeso(product.price)}</span>
                      </div>
                      <h3 className="display text-lg font-bold text-ink mt-1">{product.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted">{product.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line/60">
                      <Button
                        variant={isOut ? "outline" : "primary"}
                        disabled={isOut}
                        onClick={() => handleQuickAdd(product)}
                        className="w-full text-xs font-semibold"
                      >
                        {isOut ? (
                          "Unavailable"
                        ) : (
                          <>
                            <ShoppingBag className="h-3.5 w-3.5" /> Add to Order
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* How It Works Steps */}
      <section className="rounded-3xl border border-line bg-paper p-8 sm:p-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-roast">Simple & Reliable</span>
          <h2 className="display text-3xl font-bold text-ink mt-1">How Boytag's Works</h2>
          <p className="text-xs text-muted mt-2">
            No confusion, no lost riders. Complete transparency from grill to your table.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center space-y-3">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cream border border-line text-roast shadow-sm font-bold text-lg">
              1
            </div>
            <h3 className="font-semibold text-base text-ink">Choose Your Favorites</h3>
            <p className="text-xs text-muted leading-relaxed">
              Select whole or half lechon manok, chicken inasal, garlic rice, and house sawsawan sets from our daily live catalog.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cream border border-line text-roast shadow-sm font-bold text-lg">
              2
            </div>
            <h3 className="font-semibold text-base text-ink">Pin Your Location & Time</h3>
            <p className="text-xs text-muted leading-relaxed">
              Draggable map pin lets riders find your exact gate or street corner. Pick your desired pickup or delivery time.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cream border border-line text-roast shadow-sm font-bold text-lg">
              3
            </div>
            <h3 className="font-semibold text-base text-ink">Track Live Kitchen Status</h3>
            <p className="text-xs text-muted leading-relaxed">
              Receive automatic real-time updates as your chicken enters the prep queue, finishes roasting, and departs for delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Store Location and Contact Banner */}
      <section className="rounded-3xl bg-cream border border-line p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-roast font-semibold text-xs">
            <MapPin className="h-4 w-4" />
            <span>Store Location & Hours</span>
          </div>
          <h2 className="display text-xl sm:text-2xl font-bold text-ink">
            Maharlika Highway, Brgy. Dila, Santa Rosa, Laguna
          </h2>
          <p className="text-xs text-muted">
            Open daily: 9:00 AM – 9:00 PM • Direct hotline: (049) 530-0192 / 0917-123-4567
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/menu">
            <Button className="h-11 px-5 text-sm">Order for Pickup</Button>
          </Link>
          <Link to="/menu">
            <Button variant="outline" className="h-11 px-5 text-sm">Order for Delivery</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
