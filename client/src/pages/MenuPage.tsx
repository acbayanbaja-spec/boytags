import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingBag, Plus, Minus, Flame, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Button, Card, EmptyState, Skeleton } from "@/components/ui";
import type { Product } from "@/types";
import { toast } from "sonner";

export function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { add } = useCart();

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
    setQuantities((prev) => {
      const curr = prev[productId] || 1;
      const next = Math.max(1, Math.min(max, curr + delta));
      return { ...prev, [productId]: next };
    });
  }

  function handleAddToCart(product: Product) {
    const qty = getQty(product.id);
    if (product.soldOut || product.availableQty <= 0) return;
    add(product, qty);
    toast.success(`Added ${qty}× ${product.name} to cart!`, {
      description: `${formatPeso(product.price * qty)} total`,
    });
  }

  return (
    <div className="space-y-8 py-4">
      {/* Menu Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-roast mb-1">
            <Flame className="h-3.5 w-3.5" />
            <span>Boytag's Kitchen Catalog</span>
          </div>
          <h1 className="display text-3xl sm:text-4xl font-bold text-ink">Our Fresh Roast Menu</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            All chickens are marinated in garlic, lemongrass, and native herbs, then roasted over live charcoal.
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
            className="w-full rounded-xl border border-line bg-paper pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-roast focus:ring-4 focus:ring-roast/10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            selectedCategory === "all"
              ? "bg-roast text-white shadow-sm"
              : "bg-paper border border-line text-ink hover:border-roast/40"
          }`}
        >
          All Items ({products?.length || 0})
        </button>
        {categories.map((c) => {
          const count = products?.filter((p) => p.category?.slug === c.slug).length || 0;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setSelectedCategory(c.slug)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                selectedCategory === c.slug
                  ? "bg-roast text-white shadow-sm"
                  : "bg-paper border border-line text-ink hover:border-roast/40"
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No items found"
          body={search ? `No dishes match "${search}". Try searching for something else.` : "No items available in this category."}
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
                    <span className="absolute left-3 top-3 rounded-full bg-paper/90 backdrop-blur px-2.5 py-0.5 text-[11px] font-semibold text-leaf">
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

                  {/* Quantity and Add Action */}
                  <div className="mt-5 pt-4 border-t border-line/60 flex items-center justify-between gap-3">
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

                    <Button
                      variant={isSoldOut ? "outline" : "primary"}
                      disabled={isSoldOut}
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 text-xs font-semibold ${isSoldOut ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      {isSoldOut ? (
                        "Sold Out"
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                          Add ({formatPeso(product.price * qty)})
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
    </div>
  );
}
