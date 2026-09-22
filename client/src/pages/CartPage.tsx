import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPeso } from "@/lib/utils";
import { Button, Card, EmptyState } from "@/components/ui";

export function CartPage() {
  const { items, setQty, remove, clear, subtotal, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title="Your Cart is Empty"
          body="Looks like you haven't added any of our delicious roast chicken or sides yet. Browse the menu and find something tasty!"
          action={
            <Link to="/menu">
              <Button className="mt-2">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Today's Menu
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h1 className="display text-3xl font-bold text-ink">Your Order Bag</h1>
          <p className="text-xs text-muted mt-0.5">
            {count} item{count > 1 ? "s" : ""} selected for pickup or delivery
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-xs font-semibold text-danger hover:underline"
        >
          Clear bag
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Items List */}
        <div className="space-y-4 lg:col-span-8">
          {items.map(({ product, quantity }) => (
            <Card key={product.id} className="flex flex-col sm:flex-row items-center gap-4 p-4">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="display text-base font-bold text-ink">{product.name}</h3>
                  <span className="display text-sm font-bold text-roast sm:text-right">
                    {formatPeso(product.price * quantity)}
                  </span>
                </div>
                <p className="text-xs text-muted">{product.category?.name} • {formatPeso(product.price)} each</p>

                {product.availableQty < quantity && (
                  <p className="text-xs text-danger font-medium">
                    Only {product.availableQty} available right now. Please adjust.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-line bg-cream p-1">
                  <button
                    type="button"
                    onClick={() => setQty(product.id, quantity - 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg hover:bg-paper transition text-ink"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-ink">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQty(product.id, quantity + 1)}
                    disabled={quantity >= product.availableQty}
                    className="grid h-7 w-7 place-items-center rounded-lg hover:bg-paper transition disabled:opacity-40 text-ink"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  className="rounded-xl p-2 text-muted hover:bg-rose-50 hover:text-danger transition"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <Card className="sticky top-20 space-y-6 p-6">
            <h2 className="display text-xl font-bold text-ink">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Items Subtotal</span>
                <span className="font-semibold text-ink">{formatPeso(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Standard Delivery Fee</span>
                <span className="font-semibold text-ink">{formatPeso(40)} (if delivery)</span>
              </div>
              <div className="border-t border-line pt-3 flex justify-between text-base">
                <span className="font-bold text-ink">Estimated Total</span>
                <span className="display font-bold text-roast text-xl">{formatPeso(subtotal)}*</span>
              </div>
              <p className="text-[11px] text-muted">
                *Final total including delivery fee will be calculated at checkout based on your order type.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link to="/checkout">
                <Button className="w-full py-3.5 text-base font-semibold shadow-md shadow-roast/25">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/menu" className="block text-center text-xs font-semibold text-roast hover:underline pt-2">
                ← Add more items
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
