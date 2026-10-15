import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Flame,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  Filter,
  ArrowUpDown,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useCart } from "@/context/CartContext";
import { Button, Card, EmptyState, Skeleton, SafeImage } from "@/components/ui";
import { DishCustomizerModal } from "@/components/DishCustomizerModal";
import type { Product } from "@/types";

const TARGET_BESTSELLER_SLUGS = [
  "whole-lechon-manok",
  "half-lechon-manok",
  "spicy-labuyo-lechon-manok",
  "barkada-fiesta-roast-bilao",
];

export function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bestsellerOnly, setBestsellerOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [search, setSearch] = useState<string>("");
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  const { count, subtotal } = useCart();

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

    let list = products.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.category?.slug === selectedCategory;
      const isBestseller = p.bestseller || TARGET_BESTSELLER_SLUGS.includes(p.slug);
      const matchBestseller = !bestsellerOnly || isBestseller;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q));
      return matchCategory && matchBestseller && matchSearch;
    });

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else {
      // Sort featured bestsellers to the top in specific order
      list = [...list].sort((a, b) => {
        const aIdx = TARGET_BESTSELLER_SLUGS.indexOf(a.slug);
        const bIdx = TARGET_BESTSELLER_SLUGS.indexOf(b.slug);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return (a.category?.sortOrder ?? 99) - (b.category?.sortOrder ?? 99);
      });
    }

    return list;
  }, [products, selectedCategory, bestsellerOnly, search, sortBy]);

  function handleOrderNow(product: Product) {
    if (product.soldOut || product.availableQty <= 0) return;
    sound.play("click");
    setCustomizingProduct(product);
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
            All chickens are marinated in garlic, lemongrass, and native herbs, then roasted slowly over live hardwood charcoal in our Tupi pit.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search roast chicken, rice, sides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-line bg-paper pl-10 pr-9 py-2.5 text-sm outline-none transition focus:border-roast focus:ring-4 focus:ring-roast/10 shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-muted hover:text-ink p-0.5"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sorting Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
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

        {/* Secondary Filters: Bestseller Toggle & Price Sorter */}
        <div className="flex items-center gap-2">
          {/* Bestseller Filter Toggle */}
          <button
            type="button"
            onClick={() => {
              sound.play("click");
              setBestsellerOnly(!bestsellerOnly);
            }}
            className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition ${
              bestsellerOnly
                ? "border-amber-500 bg-amber-100 text-amber-900 shadow-sm"
                : "border-line bg-paper text-muted hover:border-roast/40 hover:text-ink"
            }`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${bestsellerOnly ? "text-roast" : "text-amber-500"}`} />
            <span>★ Bestsellers</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-paper px-3 py-1.5 text-xs text-muted shadow-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => {
                sound.play("click");
                setSortBy(e.target.value as any);
              }}
              className="bg-transparent font-semibold text-ink outline-none cursor-pointer pr-1"
            >
              <option value="featured">Featured Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips / Reset */}
      {(selectedCategory !== "all" || bestsellerOnly || search) && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted font-medium">Filtering by:</span>
          {selectedCategory !== "all" && (
            <span className="rounded-full bg-cream border border-line px-2.5 py-1 text-ink font-semibold flex items-center gap-1">
              Category: {categories.find((c) => c.slug === selectedCategory)?.name}
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="hover:text-danger ml-1"
              >
                ×
              </button>
            </span>
          )}
          {bestsellerOnly && (
            <span className="rounded-full bg-amber-50 border border-amber-300 px-2.5 py-1 text-amber-900 font-semibold flex items-center gap-1">
              ★ Curated Bestsellers
              <button
                type="button"
                onClick={() => setBestsellerOnly(false)}
                className="hover:text-danger ml-1"
              >
                ×
              </button>
            </span>
          )}
          {search && (
            <span className="rounded-full bg-cream border border-line px-2.5 py-1 text-ink font-semibold flex items-center gap-1">
              "{search}"
              <button
                type="button"
                onClick={() => setSearch("")}
                className="hover:text-danger ml-1"
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setBestsellerOnly(false);
              setSearch("");
              setSortBy("featured");
            }}
            className="text-roast underline font-bold hover:text-roast-deep ml-2"
          >
            Reset All
          </button>
        </div>
      )}

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
              ? `No items match "${search}". Try searching for another roast, side dish, or sauce.`
              : "No items match your selected category or bestseller filter."
          }
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setBestsellerOnly(false);
                setSortBy("featured");
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
            const isBestseller = product.bestseller || TARGET_BESTSELLER_SLUGS.includes(product.slug);

            return (
              <Card
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden p-0 transition hover:shadow-xl hover:border-roast/40 bg-paper border-line"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream">
                  <SafeImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    fallbackSrc="/images/whole-lechon-manok.jpg"
                  />

                  {/* Curated Bestseller Badge */}
                  {isBestseller && (
                    <span className="absolute left-3 top-3 rounded-full bg-amber-500/95 backdrop-blur px-2.5 py-0.5 text-[11px] font-bold text-stone-900 shadow-sm flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-roast" /> Bestseller
                    </span>
                  )}

                  {/* Stock Availability Indicator */}
                  {isSoldOut ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                      <span className="rounded-full bg-danger px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                        Sold Out For Today
                      </span>
                    </div>
                  ) : product.availableQty <= 5 ? (
                    <span className="absolute right-3 top-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                      Only {product.availableQty} available
                    </span>
                  ) : (
                    <span className="absolute right-3 top-3 rounded-full bg-paper/90 backdrop-blur px-2.5 py-0.5 text-[11px] font-semibold text-leaf shadow-sm">
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
                      <span className="display text-xl font-bold text-roast">{formatPeso(product.price)}</span>
                    </div>

                    <h3 className="display text-lg font-bold text-ink mt-1 group-hover:text-roast transition">
                      {product.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted leading-relaxed line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  {/* Action: Consistent Order Now button */}
                  <div className="mt-5 pt-4 border-t border-line/60">
                    <Button
                      variant={isSoldOut ? "outline" : "primary"}
                      size="sm"
                      disabled={isSoldOut}
                      onClick={() => handleOrderNow(product)}
                      className={`w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 ${
                        isSoldOut ? "cursor-not-allowed opacity-60" : "bg-roast hover:bg-roast-deep shadow-sm"
                      }`}
                    >
                      {isSoldOut ? (
                        "Sold Out Today"
                      ) : (
                        <>
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          Order Now • {formatPeso(product.price)}
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
              <span className="font-semibold text-xs sm:text-sm">Items in your order bag</span>
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
