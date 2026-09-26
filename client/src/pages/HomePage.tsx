import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Flame,
  Clock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UtensilsCrossed,
  SlidersHorizontal,
  ChevronRight,
  Phone,
  Store,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useCart } from "@/context/CartContext";
import { Button, Card, Skeleton } from "@/components/ui";
import { DishImage } from "@/components/DishImage";
import { DishCustomizerModal } from "@/components/DishCustomizerModal";
import type { Product } from "@/types";
import { toast } from "sonner";

export function HomePage() {
  const { add } = useCart();
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api<Product[]>("/api/products"),
  });

  const featured = products?.slice(0, 4) || [];

  function handleQuickAdd(product: Product) {
    if (product.soldOut || product.availableQty <= 0) return;
    sound.play("add");
    add(product, 1);
    toast.success(`Added ${product.name} to your cart!`, {
      description: `${formatPeso(product.price)} • Ready for pickup or delivery`,
    });
  }

  function handleOpenCustomizer(product: Product) {
    sound.play("click");
    setCustomizingProduct(product);
  }

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#29140a] via-[#1c0c05] to-[#110502] px-6 py-12 text-white shadow-2xl sm:px-12 sm:py-20">
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-roast/30 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md">
              <Flame className="h-4 w-4 text-roast animate-pulse" />
              <span>Poblacion, Tupi's Most Famous Lechon Manok</span>
            </div>

            <h1 className="display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Crisp skin. Tender meat. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400">
                Poblacion, Tupi's Pride.
              </span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-amber-100/80 leading-relaxed">
              Boytag's signature charcoal-roasted whole chicken, grilled inasal, and authentic sawsawan sets. Conveniently located along the South Cotabato - Sarangani Road in Poblacion, Tupi, with real-time kitchen tracking and prompt delivery.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/menu">
                <Button size="lg" className="shadow-lg shadow-roast/30 text-base font-bold">
                  Order Now <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/menu">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  Explore Full Menu
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs">
              <div>
                <p className="display text-xl font-bold text-amber-300">20–30m</p>
                <p className="text-amber-100/70">Average Prep Time</p>
              </div>
              <div>
                <p className="display text-xl font-bold text-amber-300">100%</p>
                <p className="text-amber-100/70">Charcoal Roast Daily</p>
              </div>
              <div>
                <p className="display text-xl font-bold text-amber-300">Tupi & Nearby</p>
                <p className="text-amber-100/70">Fast Local Delivery</p>
              </div>
            </div>
          </div>

          {/* Hero Featured Card */}
          <div className="lg:col-span-5">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-3.5 shadow-2xl backdrop-blur-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <DishImage
                  src="/images/dishes/whole-lechon.jpg"
                  alt="Boytag's Whole Lechon Manok"
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-roast px-3 py-1 text-xs font-bold text-white shadow-md">
                  ★ #1 Tupi Bestseller
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="display text-xl font-bold text-white">Whole Lechon Manok</h3>
                    <p className="text-xs text-amber-200/80">Garlic lemongrass marinade • Serves 4–5</p>
                  </div>
                  <span className="display text-xl font-bold text-amber-300">{formatPeso(380)}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
                  <Button
                    onClick={() => {
                      if (products?.[0]) handleOpenCustomizer(products[0]);
                    }}
                    className="flex-1 text-xs font-bold py-2.5"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-1" /> Customize & Order
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Operations Pillars */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-start gap-4 p-5 hover:border-roast/40 transition">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-100 text-roast shadow-sm">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink">Hardwood Charcoal Roasted</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Always fresh on the spit. Slow-cooked over hardwood coals for crisp, mahogany crackling skin.
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-4 p-5 hover:border-roast/40 transition">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 shadow-sm">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink">Live KDS Queue Telemetry</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Follow your order in real time as our Tupi pitmasters roast, carve, and pack your feast.
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-4 p-5 hover:border-roast/40 transition">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-leaf-soft text-leaf shadow-sm">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink">Pinpoint Delivery in Tupi</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Drag your GPS pin right to your gate in Poblacion, Crossing Rubber, Polonuling, or nearby barangays.
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-4 p-5 hover:border-roast/40 transition">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800 shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink">Steaming Hot Guarantee</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Thermal insulated warmer boxes keep your chicken hot from our oven to your dining table.
            </p>
          </div>
        </Card>
      </section>

      {/* Featured Signatures */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-roast">Boytag's Signatures</span>
            <h2 className="display text-3xl font-bold text-ink">Fresh From Our Tupi Roaster</h2>
          </div>
          <Link to="/menu" className="inline-flex items-center text-sm font-bold text-roast hover:underline">
            View full menu <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-88 w-full rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => {
              const isOut = product.soldOut || product.availableQty <= 0;
              return (
                <Card
                  key={product.id}
                  className="group overflow-hidden p-0 flex flex-col justify-between hover:shadow-xl transition hover:border-roast/30"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                    <DishImage
                      src={product.imageUrl}
                      alt={product.name}
                      category={product.category?.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {isOut ? (
                      <span className="absolute left-3 top-3 rounded-full bg-danger px-3 py-1 text-xs font-bold text-white shadow-md">
                        SOLD OUT
                      </span>
                    ) : product.badge ? (
                      <span className="absolute left-3 top-3 rounded-full bg-roast/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                        {product.badge}
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
                        <span className="display font-bold text-roast text-base">{formatPeso(product.price)}</span>
                      </div>
                      <h3 className="display text-lg font-bold text-ink mt-1 group-hover:text-roast transition">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line/60 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isOut}
                        onClick={() => handleOpenCustomizer(product)}
                        className="px-2 text-xs"
                        title="Customize Cuts & Sauces"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant={isOut ? "outline" : "primary"}
                        size="sm"
                        disabled={isOut}
                        onClick={() => handleQuickAdd(product)}
                        className="flex-1 text-xs font-bold"
                      >
                        {isOut ? "Sold Out" : "Quick Add"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Local Customer Testimonials Carousel/Grid */}
      <section className="rounded-3xl border border-line bg-paper p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-roast">Loved by Locals & Travelers</span>
          <h2 className="display text-3xl font-bold text-ink">What Tupi is Saying</h2>
          <p className="text-xs text-muted">
            The landmark stopover along South Cotabato - Sarangani Road.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-5 space-y-3 bg-cream/50 border-line">
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-ink italic leading-relaxed">
              "Every time we travel from Koronadal to GenSan, stopping at Boytag's in Poblacion Tupi is mandatory. The chicken skin is incredibly crisp and the lemongrass aroma fills the whole car!"
            </p>
            <div className="pt-2 border-t border-line/50">
              <p className="font-bold text-xs text-ink">Atty. Roberto D.</p>
              <p className="text-[10px] text-muted">Frequent Traveler, South Cotabato</p>
            </div>
          </Card>

          <Card className="p-5 space-y-3 bg-cream/50 border-line">
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-ink italic leading-relaxed">
              "The online ordering system is a game changer! I ordered while at the Tupi Municipal Hall and by the time I walked over, my chicken was packed in the warmer ready to go."
            </p>
            <div className="pt-2 border-t border-line/50">
              <p className="font-bold text-xs text-ink">Maria Jocelyn T.</p>
              <p className="text-[10px] text-muted">Poblacion, Tupi Resident</p>
            </div>
          </Card>

          <Card className="p-5 space-y-3 bg-cream/50 border-line">
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-ink italic leading-relaxed">
              "Their grilled liempo and whole lechon manok combo fed our entire family reunion in Crossing Rubber. The liver sauce is 10/10."
            </p>
            <div className="pt-2 border-t border-line/50">
              <p className="font-bold text-xs text-ink">Dennis Alcantara</p>
              <p className="text-[10px] text-muted">Tupi, South Cotabato</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Store Location & Direct Contact Banner */}
      <section className="rounded-3xl bg-cream border border-line p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-roast font-bold text-xs uppercase tracking-wider">
            <Store className="h-4 w-4" />
            <span>Boytag's Main Flagship & Roasting Pit</span>
          </div>
          <h2 className="display text-2xl sm:text-3xl font-bold text-ink">
            South Cotabato - Sarangani Road, Poblacion, Tupi
          </h2>
          <p className="text-xs text-muted">
            Open daily: 8:30 AM – 8:30 PM • Direct hotline: (083) 228-1234 / 0917-123-4567
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link to="/menu">
            <Button size="lg" className="text-sm font-bold shadow-md shadow-roast/20">
              Order for Pickup
            </Button>
          </Link>
          <Link to="/menu">
            <Button size="lg" variant="outline" className="text-sm font-bold">
              Order for Delivery
            </Button>
          </Link>
        </div>
      </section>

      {/* Dish Customizer Modal */}
      <DishCustomizerModal
        product={customizingProduct}
        open={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
}
