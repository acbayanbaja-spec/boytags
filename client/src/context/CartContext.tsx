import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { reconcileCart, type CartCustomization, type CartItem } from "@/lib/cartReconciliation";
import type { Product } from "@/types";

type CartContextValue = {
  items: CartItem[];
  add: (product: Product, quantity?: number, customization?: CartCustomization) => void;
  setQty: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "boytags.cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  // A cart saved while the menu was served from the offline demo store holds ids like "prod_whole",
  // which the live kitchen rejects. Re-point them at the real dishes by slug before checkout.
  const { data: catalog } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api<Product[]>("/api/products"),
  });

  useEffect(() => {
    if (!catalog?.length) return;
    const { items: repaired, dropped } = reconcileCart(items, catalog);
    if (dropped.length) {
      toast.error(`${dropped.join(", ")} ${dropped.length === 1 ? "is" : "are"} no longer on the menu and were removed from your cart.`);
    }
    if (repaired !== items) setItems(repaired);
  }, [catalog, items]);

  const value = useMemo<CartContextValue>(() => {
    const add = (product: Product, quantity = 1, customization?: CartCustomization) => {
      setItems((current) => {
        const found = current.find((item) => item.product.id === product.id);
        if (found) {
          return current.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  product,
                  customization: customization || item.customization,
                }
              : item,
          );
        }
        return [...current, { product, quantity, customization }];
      });
    };
    return {
      items,
      add,
      setQty: (productId, quantity) => {
        setItems((current) =>
          quantity <= 0 ? current.filter((item) => item.product.id !== productId) : current.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
        );
      },
      remove: (productId) => setItems((current) => current.filter((item) => item.product.id !== productId)),
      clear: () => setItems([]),
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
