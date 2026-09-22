import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
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

  const value = useMemo<CartContextValue>(() => {
    const add = (product: Product, quantity = 1) => {
      setItems((current) => {
        const found = current.find((item) => item.product.id === product.id);
        if (found) {
          return current.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + quantity, product } : item,
          );
        }
        return [...current, { product, quantity }];
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
