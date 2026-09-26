import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Flame,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  Heart,
  X,
  Users,
  Award,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useCart } from "@/context/CartContext";
import { Button, Card, EmptyState, Skeleton } from "@/components/ui";
import { DishImage } from "@/components/DishImage";
import { DishCustomizerModal } from "@/components/DishCustomizerModal";
import type { Product } from "@/types";
import { toast } from "sonner";

export function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [specialFilter, setSpecialFilter] = useState<"all" | "bestseller" | "spicy" | "bilao" | "favorites">("all");
  const [search, setSearch] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const f = localStorage.getItem("boytags.favorites");
      return f ? JSON.parse(f) : ["prod_whole", "prod_liempo"];
    } catch {
      return ["prod_whole", "prod_liempo"];
    }
  });

  const { add, count, subtotal } = useCart();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api<Product[]>("/api/products"),
  });

  const categories = useMemo(() => {
    if (!products) return [];
    const map = new Map<string, string>();
    for (const p of products) {
      if (p.category) {
        map.set(p.category.slug, p.category.name);
      }
    }
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products]);

  const toggleFavorite = (productId: string, name: string) => {
    sound.play("click");
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem("boytags.favorites", JSON.stringify(updated));
      } catch {
        // ignore
      }
      if (!exists) {
        toast.success(`Saved ${name} to your favorites!`);
      }
      return updated;
    });
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.category?.slug === selectedCategory;
      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      let matchSpecial = true;
      if (specialFilter === "bestseller") matchSpecial = Boolean(p.isBestseller || p.badge?.includes("Bestseller"));
      if (specialFilter === "spicy") matchSpecial = Boolean(p.isSpicy || p.name.toLowerCase().includes("spicy") || p.description.toLowerCase().includes("labuyo"));
      if (specialFilter === "bilao") matchSpecial = Boolean(p.category?.slug === "barkada-bilao" || p.name.toLowerCase().includes("bilao") || p.servings?.includes("Feeds"));
      if (specialFilter === "favorites") matchSpecial = favorites.includes(p.id);

      return matchCategory && matchSearch && matchSpecial;
    });
  }, [products, selectedCategory, specialFilter, search, favorites]);

  function getQty(productId: string) {
    return quantities[productId] || 1;
  }

  function setQty(productId: string, delta: number, max: number) {
    sound.play("click");
    setQuantities((prev) => {
      const curr = prev[productId] || 1;
      const next = Math.max(1, Math.min(max, curr + delta));
      return { ...prev, [productId]: next };
    });
  }

  function handleAddToCart(product: Product) {
    const qty = getQty(product.id);
    if (product.soldOut || product.availableQty <= 0) return;
    sound.play("add");
    add(product, qty);
    toast.success(`Added ${qty}× ${product.name} to cart!`, {
      description: `${formatPeso(product.price * qty)} total • Ready for checkout`,
    });
  }

  return (
    <div className="space-y-8 py-4 relative">
      {/* Menu Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-roast mb-1">
            <Flame className="h-3.5 w-3.5" />
            <span>Poblacion, Tupi Main Roasting Pit Catalog</span>
          </div>
          <h1 className="display text-3xl sm:text-4xl font-bold text-ink">Our Fresh Roast Menu</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            All chickens are marinated in garlic, lemongrass, and native herbs, roasted slow over live hardwood coals.
          </p>
        </div>

        {/* Search Bar with Clear Button */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search roast, inasal, bilao, drinks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-line bg-paper pl-10 pr-9 py-2.5 text-sm outline-none transition focus:border-roast focus:ring-4 focus:ring-roast/10 shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Category Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              sound.play("click");
              setSelectedCategory("all");
            }}
            className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${
              selectedCategory === "all"
                ? "bg-roast text-white shadow-md shadow-roast/20"
                : "bg-paper border border-line text-ink hover:border-roast/40"
            }`}
          >
            All Dishes ({products?.length || 0})
          </button>
          {categories.map((c) => {
            const catCount = products?.filter((p) => p.category?.slug === c.slug).length || 0;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => {
                  sound.play("click");
                  setSelectedCategory(c.slug);
                }}
                className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${
                  selectedCategory === c.slug
                    ? "bg-roast text-white shadow-md shadow-roast/20"
                    : "bg-paper border border-line text-ink hover:border-roast/40"
                }`}
              >
                {c.name} ({catCount})
              </button>
            );
          })}
        </div>

        {/* Secondary Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted shrink-0 mr-1">Quick Filter:</span>
          {[
            { id: "all", label: "Show All" },
            { id: "bestseller", label: "🔥 Bestsellers", icon: Award },
            { id: "spicy", label: "🌶️ Spicy Flavor" },
            { id: "bilao", label: "👨‍👩‍👧‍👦 Family Bilao", icon: Users },
            { id: "favorites", label: `❤️ Favorites (${favorites.length})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                sound.play("click");
                setSpecialFilter(item.id as typeof specialFilter);
              }}
              className={`rounded-full px-3 py-1 font-semibold transition shrink-0 ${
                specialFilter === item.id
                  ? "bg-ink text-white"
                  : "bg-cream border border-line text-muted hover:text-ink hover:border-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No Dishes Found"
          body={
            search
              ? `No dishes match "${search}". Try checking for another roasted dish or side.`
              : "No items match your active category and filter."
          }
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setSpecialFilter("all");
              }}
            >
              Reset All Filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isSoldOut = product.soldOut || product.availableQty <= 0;
            const qty = getQty(product.id);
            const isFav = favorites.includes(product.id);

            return (
              <Card
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden p-0 transition duration-300 hover:shadow-2xl hover:border-roast/40"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream">
                  <DishImage
                    src={product.imageUrl}
                    alt={product.name}
                    category={product.category?.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* Favorite Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id, product.name);
                    }}
                    className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur shadow-sm hover:scale-110 active:scale-95 transition"
                    title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                    aria-label="Toggle Favorite"
                  >
                    <Heart
                      className={`h-4 w-4 transition ${
                        isFav ? "fill-roast text-roast" : "text-muted hover:text-roast"
                      }`}
                    />
                  </button>

                  {/* Overlays / Badges */}
                  {isSoldOut ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                      <span className="rounded-full bg-danger px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                        Sold Out Today
                      </span>
                    </div>
                  ) : product.badge ? (
                    <span className="absolute left-3 top-3 rounded-full bg-roast/95 backdrop-blur px-3 py-1 text-xs font-bold text-white shadow-md">
                      {product.badge}
                    </span>
                  ) : product.availableQty <= 5 ? (
                    <span className="absolute left-3 top-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                      Only {product.availableQty} available
                    </span>
                  ) : (
                    <span className="absolute left-3 top-3 rounded-full bg-paper/95 backdrop-blur px-2.5 py-0.5 text-[11px] font-semibold text-leaf shadow-sm">
                      In Stock ({product.availableQty})
                    </span>
                  )}

                  {product.servings && (
                    <span className="absolute left-3 bottom-3 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                      {product.servings}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        {product.category?.name || "Dishes"}
                      </span>
                      <span className="display text-xl font-bold text-roast">{formatPeso(product.price)}</span>
                    </div>

                    <h3 className="display text-lg font-bold text-ink mt-1 group-hover:text-roast transition">
                      {product.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted leading-relaxed line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  {/* Customization & Quantity Action */}
                  <div className="mt-5 pt-4 border-t border-line/60 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      {!isSoldOut ? (
                        <div className="flex items-center rounded-xl border border-line bg-cream p-1">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, -1, product.availableQty)}
                            disabled={qty <= 1}
                            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-paper transition disabled:opacity-40 text-ink"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-ink">{qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(product.id, 1, product.availableQty)}
                            disabled={qty >= product.availableQty}
                            className="grid h-7 w-7 place-items-center rounded-lg hover:bg-paper transition disabled:opacity-40 text-ink"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null}

                      <button
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => {
                          sound.play("click");
                          setCustomizingProduct(product);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink hover:border-roast/40 hover:bg-paper transition disabled:opacity-40 shadow-xs"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5 text-roast" />
                        <span>Customize</span>
                      </button>
                    </div>

                    <Button
                      variant={isSoldOut ? "outline" : "primary"}
                      size="sm"
                      disabled={isSoldOut}
                      onClick={() => handleAddToCart(product)}
                      className={`w-full text-xs font-bold py-2.5 shadow-sm ${
                        isSoldOut ? "cursor-not-allowed opacity-60" : "hover:shadow-md"
                      }`}
                    >
                      {isSoldOut ? (
                        "Sold Out Today"
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                          Add to Order ({formatPeso(product.price * qty)})
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

      {/* Floating Bottom Cart Bar if items present */}
      {count > 0 && (
        <div className="sticky bottom-20 md:bottom-6 z-30 flex justify-center">
          <Link
            to="/cart"
            className="flex items-center gap-4 rounded-full bg-ink px-6 py-3.5 text-white shadow-2xl transition hover:bg-black hover:scale-105 active:scale-95 border border-white/20"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-roast text-xs font-bold text-white">
                {count}
              </span>
              <span className="font-semibold text-xs sm:text-sm">Items in your feast</span>
            </div>
            <span className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="display font-bold text-amber-300 text-sm sm:text-base">
                {formatPeso(subtotal)}
              </span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Dish Customizer Modal */}
      <DishCustomizerModal
        product={customizingProduct}
        open={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
      />
    </div>
  );
}
