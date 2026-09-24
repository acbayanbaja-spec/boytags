import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  Store,
  Tag,
  CheckCircle2,
  Sparkles,
  Utensils,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPeso } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { Button, Card, EmptyState, inputClass } from "@/components/ui";
import { toast } from "sonner";

export function CartPage() {
  const { items, setQty, remove, clear, subtotal, count } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFixed, setDiscountFixed] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [cutlery, setCutlery] = useState(true);

  const freeGiftThreshold = 500;
  const progressToGift = Math.min(100, Math.round((subtotal / freeGiftThreshold) * 100));

  function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "BOYTAGS10") {
      setDiscountPercent(10);
      setDiscountFixed(0);
      setAppliedPromo("BOYTAGS10 (10% OFF)");
      sound.play("success");
      toast.success("Promo BOYTAGS10 applied: 10% discount on entire feast!");
    } else if (code === "FIRSTROAST") {
      setDiscountFixed(50);
      setDiscountPercent(0);
      setAppliedPromo("FIRSTROAST (₱50 OFF)");
      sound.play("success");
      toast.success("Promo FIRSTROAST applied: ₱50 discount!");
    } else {
      sound.play("alert");
      toast.error("Invalid voucher code. Try BOYTAGS10 or FIRSTROAST");
    }
    setPromoCode("");
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100) + discountFixed;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  if (items.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title="Your Order Bag is Empty"
          body="Looks like you haven't added any of our hot roast chicken or sides yet. Browse our Poblacion, Tupi catalog and pick your favorites!"
          action={
            <Link to="/menu">
              <Button className="mt-2 font-bold shadow-md shadow-roast/20">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Tupi Menu
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
            {count} item{count > 1 ? "s" : ""} selected for pickup or delivery from Poblacion, Tupi
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.play("click");
            clear();
          }}
          className="text-xs font-semibold text-danger hover:underline"
        >
          Clear bag
        </button>
      </div>

      {/* Free Reward Progress Bar */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-amber-950">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-600" />
            {subtotal >= freeGiftThreshold
              ? "🎉 You qualified for a FREE House Sawsawan Set!"
              : `Add ${formatPeso(freeGiftThreshold - subtotal)} more for a FREE Sawsawan Set!`}
          </span>
          <span>{progressToGift}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
            style={{ width: `${progressToGift}%` }}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Items List */}
        <div className="space-y-4 lg:col-span-8">
          {items.map(({ product, quantity }) => (
            <Card key={product.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 hover:shadow-md transition">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover bg-cream"
              />

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="display text-base font-bold text-ink">{product.name}</h3>
                  <span className="display text-base font-bold text-roast sm:text-right">
                    {formatPeso(product.price * quantity)}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {product.category?.name || "Main"} • {formatPeso(product.price)} each
                </p>

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
                    onClick={() => {
                      sound.play("click");
                      setQty(product.id, quantity - 1);
                    }}
                    className="grid h-7 w-7 place-items-center rounded-lg hover:bg-paper transition text-ink"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-ink">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.play("click");
                      setQty(product.id, quantity + 1);
                    }}
                    disabled={quantity >= product.availableQty}
                    className="grid h-7 w-7 place-items-center rounded-lg hover:bg-paper transition disabled:opacity-40 text-ink"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.play("click");
                    remove(product.id);
                  }}
                  className="rounded-xl p-2 text-muted hover:bg-rose-50 hover:text-danger transition"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}

          {/* Eco Cutlery Option */}
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-leaf-soft text-leaf">
                <Utensils className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-ink">Include Spoon, Fork & Napkins</p>
                <p className="text-[11px] text-muted">Help reduce plastic by unchecking if eating at home</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={cutlery}
              onChange={(e) => setCutlery(e.target.checked)}
              className="h-4 w-4 rounded border-line text-roast accent-roast cursor-pointer"
            />
          </Card>
        </div>

        {/* Order Summary & Voucher Card */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="sticky top-20 space-y-5 p-6">
            <h2 className="display text-xl font-bold text-ink">Order Summary</h2>

            {/* Voucher code input */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
                  <input
                    type="text"
                    placeholder="Promo code (e.g. BOYTAGS10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className={`${inputClass()} pl-9 py-2 text-xs uppercase`}
                  />
                </div>
                <Button type="submit" variant="outline" size="sm" className="text-xs font-bold">
                  Apply
                </Button>
              </div>
              {appliedPromo && (
                <div className="flex items-center justify-between text-xs font-bold text-leaf bg-leaf-soft/60 px-3 py-1.5 rounded-xl border border-leaf/20">
                  <span>✓ {appliedPromo}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null);
                      setDiscountPercent(0);
                      setDiscountFixed(0);
                    }}
                    className="text-muted hover:text-danger"
                  >
                    ×
                  </button>
                </div>
              )}
            </form>

            <div className="space-y-2.5 border-t border-line pt-4 text-xs sm:text-sm">
              <div className="flex justify-between text-muted">
                <span>Items Subtotal</span>
                <span className="font-semibold text-ink">{formatPeso(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-leaf font-bold">
                  <span>Voucher Discount</span>
                  <span>-{formatPeso(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted">
                <span>Standard Delivery Fee</span>
                <span className="font-semibold text-ink">{formatPeso(40)} (if delivery)</span>
              </div>

              <div className="border-t border-line pt-3 flex justify-between text-base">
                <span className="font-bold text-ink">Estimated Total</span>
                <span className="display font-bold text-roast text-xl">
                  {formatPeso(estimatedTotal)}*
                </span>
              </div>
              <p className="text-[10px] text-muted leading-tight">
                *Final total including delivery fee will be calculated at checkout based on your order type (Free for Store Pickup).
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link to="/checkout">
                <Button className="w-full py-4 text-base font-bold shadow-lg shadow-roast/25">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link
                to="/menu"
                className="block text-center text-xs font-semibold text-roast hover:underline pt-1"
              >
                ← Add more dishes from Tupi menu
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
