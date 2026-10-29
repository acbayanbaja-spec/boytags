import type { Product } from "@/types";

export type CartCustomization = {
  cut?: string;
  sauce?: string;
  specialNotes?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  customization?: CartCustomization;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLiveProductId(id: unknown): id is string {
  return typeof id === "string" && UUID_RE.test(id);
}

function signature(items: CartItem[]): string {
  return items.map((item) => `${item.product.id}:${item.quantity}`).join("|");
}

/**
 * A cart saved while the menu was served from the offline demo store carries placeholder ids such as
 * "prod_whole", which the live kitchen rejects with a validation error. This re-points those entries
 * at the real dish by slug and merges duplicates, so an old cart can still be ordered. Items with no
 * live equivalent are dropped and reported back by name.
 *
 * A catalog served by the demo fallback cannot repair a demo cart, so it is ignored here. The input
 * array reference is returned whenever nothing genuinely changed, which keeps callers loop-free.
 */
export function reconcileCart(items: CartItem[], catalog: Product[]): { items: CartItem[]; dropped: string[] } {
  if (!items.some((item) => !isLiveProductId(item.product?.id))) return { items, dropped: [] };

  const bySlug = new Map(catalog.filter((product) => isLiveProductId(product.id)).map((product) => [product.slug, product]));
  if (!bySlug.size) return { items, dropped: [] };

  const repaired: CartItem[] = [];
  const dropped: string[] = [];

  for (const item of items) {
    const usable = isLiveProductId(item.product?.id) ? item.product : bySlug.get(item.product?.slug);
    if (!usable) {
      dropped.push(item.product?.name || "Untitled dish");
      continue;
    }
    const twin = repaired.find((entry) => entry.product.id === usable.id);
    if (twin) {
      twin.quantity += item.quantity;
      continue;
    }
    repaired.push({ ...item, product: usable });
  }

  if (signature(repaired) === signature(items)) return { items, dropped };
  return { items: repaired, dropped };
}
