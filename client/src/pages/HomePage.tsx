import { useState, useMemo } from "react";
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
  Truck,
  UtensilsCrossed,
  SlidersHorizontal,
  ChevronRight,
  Phone,
  Store,
  CheckCircle2,
  ChefHat,
  Compass,
  Lock,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button, Card, Skeleton, SafeImage, Modal } from "@/components/ui";
import { DishCustomizerModal } from "@/components/DishCustomizerModal";
import type { Product } from "@/types";

const TARGET_BESTSELLER_SLUGS = [
  "whole-lechon-manok",
  "half-lechon-manok",
  "spicy-labuyo-lechon-manok",
  "barkada-fiesta-roast-bilao",
];

export function HomePage() {
  const { user } = useAuth();
  const { add } = useCart();
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api<Product[]>("/api/products"),
  });

  // Ensure the 4 intended bestselling products appear in authoritative order
  const featured = useMemo(() => {
    if (!products || products.length === 0) return [];
    const ordered: Product[] = [];
    for (const slug of TARGET_BESTSELLER_SLUGS) {
      const match = products.find((p) => p.slug === slug);
      if (match) ordered.push(match);
    }
    // If any slug is not yet in the data, fill up to 4 from products
    if (ordered.length < 4) {
      for (const p of products) {
        if (!ordered.some((o) => o.id === p.id) && ordered.length < 4) {
          ordered.push(p);
        }
      }
    }
    return ordered;
  }, [products]);

  const wholeProduct = featured.find((p) => p.slug === "whole-lechon-manok") || products?.[0];

  function handleOpenCustomizer(product: Product) {
    sound.play("click");
    setCustomizingProduct(product);
  }

  function handleOrderClick(product: Product) {
    if (!user) {
      sound.play("alert");
      setAuthModalOpen(true);
      return;
    }
    handleOpenCustomizer(product);
  }

  return (
    <div className="space-y-16 py-4">
      {/* SECTION 2 & 3: Hero Section featuring authentic Whole Charcoal-Roasted Lechon Manok */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#29140a] via-[#1c0c05] to-[#110502] px-6 py-12 text-white shadow-2xl sm:px-12 sm:py-20 border border-white/10">
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-roast/30 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md">
              <Flame className="h-4 w-4 text-roast animate-pulse" />
              <span>Authentic Charcoal Roast • Poblacion, Tupi, South Cotabato</span>
            </div>

            <h1 className="display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Crisp golden skin. <br />
              Juicy meat. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400">
                Poblacion, Tupi's Pride.
              </span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-amber-100/80 leading-relaxed">
              Boytag's signature whole Lechon Manok is slow-roasted over hardwood coals, infused with crushed native lemongrass and garlic, and served with house-made sawsawan. Fresh daily along South Cotabato - Sarangani Road.
            </p>

            {/* SECTION 4: Clear sign-in and ordering calls to action appropriate to visitor authentication state */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {user ? (
                <>
                  <Link to="/menu">
                    <Button size="lg" className="shadow-lg shadow-roast/30 text-base font-bold bg-roast hover:bg-roast-deep">
                      Explore Full Menu <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </Link>
                  <Link to="/orders">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      View My Orders
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button size="lg" className="shadow-lg shadow-roast/30 text-base font-bold bg-roast hover:bg-roast-deep">
                      Sign In to Order <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </Link>
                  <Link to="/login?mode=register">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10 font-semibold"
                    >
                      Create Free Account
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Operational Fact Badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs">
              <div>
                <p className="display text-xl font-bold text-amber-300">20–30m</p>
                <p className="text-amber-100/70">Average Kitchen Prep</p>
              </div>
              <div>
                <p className="display text-xl font-bold text-amber-300">100%</p>
                <p className="text-amber-100/70">Charcoal Roast Daily</p>
              </div>
              <div>
                <p className="display text-xl font-bold text-amber-300">Tupi & Nearby</p>
                <p className="text-amber-100/70">Doorstep Pinpoint Delivery</p>
              </div>
            </div>
          </div>

          {/* Authentic Whole Lechon Manok Hero Card */}
          <div className="lg:col-span-5">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-4 shadow-2xl backdrop-blur-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/40">
                <SafeImage
                  src="/images/whole-lechon-manok.jpg"
                  alt="Boytag's Whole Lechon Manok - Charcoal roasted chicken with golden skin"
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  fallbackSrc="/images/whole-lechon-manok.jpg"
                  loading="eager"
                  fetchPriority="high"
                />
                <span className="absolute top-3 left-3 rounded-full bg-roast px-3 py-1 text-xs font-bold text-white shadow-md">
                  ★ Bestseller • Signature Roast
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="display text-xl font-bold text-white">Whole Lechon Manok</h3>
                    <p className="text-xs text-amber-200/80">Native garlic & lemongrass marinade • Serves 4–5</p>
                  </div>
                  <span className="display text-2xl font-bold text-amber-300">{formatPeso(380)}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
                  <Button
                    onClick={() => {
                      if (wholeProduct) handleOrderClick(wholeProduct);
                    }}
                    className="w-full text-xs font-bold py-3 bg-roast hover:bg-roast-deep shadow-md"
                  >
                    {user ? (
                      <>
                        <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" /> Order Now • Choose Cut & Sawsawan
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 mr-1.5" /> Sign In to Order • Whole Lechon Manok
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Four-Product Bestselling Section with consistent Bestseller Badge and Order Now */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-line pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-roast flex items-center gap-1.5">
              <Flame className="h-4 w-4" /> Curated House Specialties
            </span>
            <h2 className="display text-3xl font-bold text-ink">Bestselling Roast House Feasts</h2>
            <p className="text-xs text-muted mt-1">
              The four most celebrated dishes from our pit in Poblacion, Tupi. Freshly prepared to order.
            </p>
          </div>
          {user && (
            <Link to="/menu" className="inline-flex items-center text-sm font-bold text-roast hover:underline">
              View full menu catalog <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => {
              const isOut = product.soldOut || product.availableQty <= 0;
              return (
                <Card
                  key={product.id}
                  className="group overflow-hidden p-0 flex flex-col justify-between hover:shadow-xl transition hover:border-roast/40 bg-paper border-line"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                    <SafeImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      fallbackSrc="/images/whole-lechon-manok.jpg"
                      loading="eager"
                    />

                    {/* Curated Bestseller Badge */}
                    <span className="absolute top-3 left-3 rounded-full bg-amber-500/95 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold text-stone-900 shadow-sm flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-roast" /> Bestseller
                    </span>

                    {/* Stock Status Badge */}
                    {isOut ? (
                      <span className="absolute right-3 top-3 rounded-full bg-danger px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
                        SOLD OUT
                      </span>
                    ) : product.availableQty <= 5 ? (
                      <span className="absolute right-3 top-3 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
                        {product.availableQty} left
                      </span>
                    ) : null}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                          {product.category?.name || "Roast"}
                        </span>
                        <span className="display font-bold text-roast text-lg">{formatPeso(product.price)}</span>
                      </div>
                      <h3 className="display text-lg font-bold text-ink mt-1 group-hover:text-roast transition">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Order / Sign-in to Order Button */}
                    <div className="mt-4 pt-3 border-t border-line/60">
                      <Button
                        variant={isOut ? "outline" : "primary"}
                        size="sm"
                        disabled={isOut}
                        onClick={() => handleOrderClick(product)}
                        className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
                      >
                        {isOut ? (
                          "Sold Out Today"
                        ) : user ? (
                          <>
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Order Now
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5" />
                            Sign In to Order
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

      {/* SECTION 6: Restaurant Quality & Preparation Standards */}
      <section className="rounded-3xl border border-line bg-paper p-8 sm:p-12 space-y-8 shadow-sm">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-roast">The Boytag's Standard</span>
          <h2 className="display text-3xl font-bold text-ink">The Modern Filipino Roast House</h2>
          <p className="text-xs text-muted leading-relaxed">
            Every bird is seasoned with respect for traditional Mindanao roasting craft and cooked without shortcuts.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 rounded-2xl bg-cream/60 p-5 border border-line">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-orange-100 text-roast shadow-sm">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-ink">Hardwood Charcoal Roasting</h3>
            <p className="text-xs text-muted leading-relaxed">
              We roast over live hardwood charcoal coals, slowly rotating each spit for balanced heat, crispy mahogany skin, and deep smoky flavor.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl bg-cream/60 p-5 border border-line">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-leaf-soft text-leaf shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-ink">Native Aromatics & Marinade</h3>
            <p className="text-xs text-muted leading-relaxed">
              Stuffed with fresh tanglad (lemongrass), crushed native garlic cloves, sea salt, and kalamansi to infuse every fiber with citrus-garlic juices.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl bg-cream/60 p-5 border border-line">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-800 shadow-sm">
              <ChefHat className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-ink">Roasted Fresh Daily in Tupi</h3>
            <p className="text-xs text-muted leading-relaxed">
              No pre-cooked leftovers. Our spits fire up in Poblacion, Tupi every morning so your order arrives juicy, hot, and freshly carved.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl bg-cream/60 p-5 border border-line">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-sky-700 shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-ink">Thermal Insulated Packaging</h3>
            <p className="text-xs text-muted leading-relaxed">
              Every takeout container is packed into insulated warming carriers so your roast stays piping hot until it reaches your dining table.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: Simple Ordering Process Explanation */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-roast">Simple & Reliable</span>
          <h2 className="display text-3xl font-bold text-ink">How to Order From Boytag's</h2>
          <p className="text-xs text-muted">
            Three easy steps from your phone to your dining table in Tupi.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 space-y-3 border-line bg-paper">
            <div className="flex items-center justify-between">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-roast text-xs font-bold text-white">
                1
              </span>
              <UtensilsCrossed className="h-5 w-5 text-muted" />
            </div>
            <h3 className="font-bold text-base text-ink">1. Choose Roast & Cuts</h3>
            <p className="text-xs text-muted leading-relaxed">
              Select your whole chicken, half portion, or barkada bilao. Pick your cut preference (uncut, 4 pcs, or 8 pcs) and your favorite sawsawan dip.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-line bg-paper">
            <div className="flex items-center justify-between">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-roast text-xs font-bold text-white">
                2
              </span>
              <MapPin className="h-5 w-5 text-muted" />
            </div>
            <h3 className="font-bold text-base text-ink">2. Drop Your Gate Pin</h3>
            <p className="text-xs text-muted leading-relaxed">
              Drop your pinpoint delivery marker directly at your home or landmark anywhere across Poblacion, Tupi and supported nearby barangays.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-line bg-paper">
            <div className="flex items-center justify-between">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-roast text-xs font-bold text-white">
                3
              </span>
              <Clock className="h-5 w-5 text-muted" />
            </div>
            <h3 className="font-bold text-base text-ink">3. Live Telemetry & Delivery</h3>
            <p className="text-xs text-muted leading-relaxed">
              Follow your order in real time as our pitmasters carve, pack, and hand off your warm meal to our delivery rider for prompt arrival.
            </p>
          </Card>
        </div>
      </section>

      {/* SECTION 8: Delivery Coverage & Location Information for Tupi and nearby areas */}
      <section className="rounded-3xl border border-line bg-cream p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-line pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-roast font-bold text-xs uppercase tracking-wider">
              <Store className="h-4 w-4" />
              <span>Boytag's Flagship Roasting Pit</span>
            </div>
            <h2 className="display text-2xl sm:text-3xl font-bold text-ink">
              South Cotabato - Sarangani Road, Poblacion, Tupi
            </h2>
            <p className="text-xs text-muted">
              Serving local residents, families, and road travelers across South Cotabato.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {user ? (
              <Link to="/menu">
                <Button size="lg" className="w-full sm:w-auto text-sm font-bold shadow-md shadow-roast/20 bg-roast hover:bg-roast-deep">
                  Order Now for Pickup or Delivery
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto text-sm font-bold shadow-md shadow-roast/20 bg-roast hover:bg-roast-deep">
                  Sign In to Place Order
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div className="space-y-2 rounded-2xl bg-paper p-4 border border-line">
            <div className="flex items-center gap-2 font-bold text-ink">
              <Clock className="h-4 w-4 text-roast" />
              <span>Operating Hours</span>
            </div>
            <p className="text-muted leading-relaxed">
              Open Daily: <strong>8:30 AM – 8:30 PM</strong>
              <br />
              Kitchen prep time: 20–30 minutes
            </p>
          </div>

          <div className="space-y-2 rounded-2xl bg-paper p-4 border border-line">
            <div className="flex items-center gap-2 font-bold text-ink">
              <Phone className="h-4 w-4 text-roast" />
              <span>Direct Inquiries & Bulk Orders</span>
            </div>
            <p className="text-muted leading-relaxed">
              Landline: <strong>(083) 228-1234</strong>
              <br />
              Mobile: <strong>0917-123-4567</strong>
            </p>
          </div>

          <div className="space-y-2 rounded-2xl bg-paper p-4 border border-line sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 font-bold text-ink">
              <Truck className="h-4 w-4 text-roast" />
              <span>Tupi Delivery Coverage</span>
            </div>
            <p className="text-muted leading-relaxed">
              Poblacion • Crossing Rubber • Polonuling • Bunao • Acmonan • Tubo • Linan • Simbo
            </p>
          </div>
        </div>
      </section>

      {/* Dish Customizer Modal */}
      <DishCustomizerModal
        product={customizingProduct}
        open={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
      />

      {/* Sign In Required Modal */}
      <Modal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In Required to Order"
        maxWidth="max-w-md"
      >
        <div className="space-y-5 text-center py-2">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-orange-500 via-roast to-amber-700 text-white shadow-lg shadow-roast/30">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="display text-xl font-bold text-ink">
              Please Sign In Before Ordering
            </h3>
            <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
              To ensure your Boytag's charcoal roast feast is prepared fresh, accurately tracked
              with live pit telemetry, and delivered promptly to your doorstep in Tupi, please sign in or register first.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs text-amber-950 text-left space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Ordering Member Benefits:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900/80">
              <li>Live charcoal pit and kitchen telemetry updates</li>
              <li>Estimated delivery arrival time shown directly in your account</li>
              <li>Instant in-app notification the moment your roast is done</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <Link to="/login" className="block w-full">
              <Button size="lg" className="w-full font-bold shadow-md shadow-roast/25 py-3 text-sm">
                Sign In to My Account <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/login?mode=register" className="block w-full">
              <Button size="lg" variant="outline" className="w-full font-bold py-3 text-sm">
                Create Free Customer Account
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="text-xs font-semibold text-muted hover:text-ink pt-1 transition"
            >
              Continue Browsing Menu Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
