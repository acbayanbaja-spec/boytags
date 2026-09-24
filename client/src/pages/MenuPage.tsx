import { useState, useMemo } from "react";
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
  Check,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useCart } from "@/context/CartContext";
import { Button, Card, EmptyState, Skeleton } from "@/components/ui";
import { DishCustomizerModal } from "@/components/DishCustomizerModal";
import type { Product } from "@/types";
import { toast } from "sonner";

export function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

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

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.category?.slug === selectedCategory;
      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, search]);

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
            <span>Poblacion, Tupi Kitchen Catalog</span>
          </div>
          <h1 className="display text-3xl sm:text-4xl font-bold text-ink">Our Fresh Roast Menu</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            All chickens are marinated in garlic, lemongrass, and native herbs, then roasted over live charcoal in our Tupi pit.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search chicken, rice, drinks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-line bg-paper pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-roast focus:ring-4 focus:ring-roast/10 shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            sound.play("click");
            setSelectedCategory("all");
          }}
          className={`shrink-0 rounded-2xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            selectedCategory === "all"
              ? "bg-roast text-white shadow-sm"
              : "bg-paper border border-line text-ink hover:border-roast/40"
          }`}
        >
          All Items ({products?.length || 0})
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
              className={`shrink-0 rounded-2xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                selectedCategory === c.slug
                  ? "bg-roast text-white shadow-sm"
                  : "bg-paper border border-line text-ink hover:border-roast/40"
              }`}
            >
              {c.name} ({catCount})
            </button>
          );
        })}
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
          body={search ? `No items match "${search}". Try searching for another dish.` : "No items available in this category."}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isSoldOut = product.soldOut || product.availableQty <= 0;
            const qty = getQty(product.id);

            return (
              <Card
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden p-0 transition hover:shadow-xl hover:border-roast/30"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {isSoldOut ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                      <span className="rounded-full bg-danger px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                        Sold Out For Today
                      </span>
                    </div>
                  ) : product.availableQty <= 5 ? (
                    <span className="absolute left-3 top-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                      Only {product.availableQty} available
                    </span>
                  ) : (
                    <span className="absolute left-3 top-3 rounded-full bg-paper/90 backdrop-blur px-2.5 py-0.5 text-[11px] font-semibold text-leaf shadow-sm">
                      In Stock ({product.availableQty})
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
                      <span className="display text-lg font-bold text-roast">{formatPeso(product.price)}</span>
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
                        className="inline-flex items-center gap-1 rounded-xl border border-line bg-cream px-2.5 py-1.5 text-xs font-semibold text-ink hover:border-roast/40 transition disabled:opacity-40"
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
                      className={`w-full text-xs font-bold py-2.5 ${isSoldOut ? "cursor-not-allowed opacity-60" : ""}`}
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
            className="flex items-center gap-4 rounded-full bg-ink px-6 py-3 text-white shadow-2xl transition hover:bg-black hover:scale-105 active:scale-95 border border-white/20"
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
