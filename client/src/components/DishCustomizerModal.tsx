import { useState } from "react";
import { Plus, Minus, ShoppingBag, Flame, Sparkles, Check } from "lucide-react";
import { Modal, Button, Field, inputClass } from "@/components/ui";
import { formatPeso } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";
import { toast } from "sonner";

export function DishCustomizerModal({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [cut, setCut] = useState("Whole (Uncut)");
  const [sauce, setSauce] = useState("House Garlic Liver Gravy");
  const [extraRice, setExtraRice] = useState(false);
  const [extraSauce, setExtraSauce] = useState(false);
  const [specialNotes, setSpecialNotes] = useState("");

  if (!product) return null;

  const isChicken =
    product.name.toLowerCase().includes("lechon") ||
    product.name.toLowerCase().includes("chicken") ||
    product.name.toLowerCase().includes("inasal");

  const extraCost = (extraRice ? 35 : 0) + (extraSauce ? 25 : 0);
  const unitPrice = product.price + extraCost;
  const totalPrice = unitPrice * quantity;

  function handleAdd() {
    if (!product) return;
    sound.play("add");
    // Add product to cart
    add(product, quantity);
    toast.success(`Added ${quantity}× ${product.name} to order!`, {
      description: `${formatPeso(totalPrice)} • Customized & ready in cart`,
    });
    onClose();
  }

  return (
    <Modal open={open} title="Customize Your Dish" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Product Banner */}
        <div className="flex items-center gap-4 rounded-2xl bg-cream p-3 border border-line">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-16 w-16 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1">
            <h3 className="display text-base font-bold text-ink">{product.name}</h3>
            <p className="text-xs text-muted line-clamp-1">{product.description}</p>
            <p className="display text-sm font-bold text-roast mt-1">{formatPeso(product.price)}</p>
          </div>
        </div>

        {/* Cut Options (if Chicken) */}
        {isChicken && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Choose How It's Cut:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Whole (Uncut)", "Cut into 4 pcs", "Cut into 8 pcs"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCut(opt)}
                  className={`rounded-xl border p-2.5 text-xs text-center font-medium transition ${
                    cut === opt
                      ? "border-roast bg-cream text-roast font-bold ring-2 ring-roast/20"
                      : "border-line bg-paper text-ink hover:border-roast/40"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dipping Sauce */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Preferred Dipping Sawsawan:
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              "House Garlic Liver Gravy",
              "Toyomansi & Sili Labuyo",
              "Spiced Sinamak Vinegar",
              "Sweet Chili Glaze",
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSauce(s)}
                className={`rounded-xl border p-2.5 text-left transition ${
                  sauce === s
                    ? "border-roast bg-cream text-roast font-bold ring-2 ring-roast/20"
                    : "border-line bg-paper text-ink hover:border-roast/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add-ons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Recommended Add-ons:
          </label>
          <div className="space-y-2">
            <label className="flex items-center justify-between rounded-xl border border-line bg-paper p-3 text-xs cursor-pointer hover:border-roast/40 transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={extraRice}
                  onChange={(e) => setExtraRice(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-roast accent-roast"
                />
                <span className="font-semibold text-ink">Extra Fragrant Garlic Rice</span>
              </div>
              <span className="font-bold text-roast">+₱35.00</span>
            </label>

            <label className="flex items-center justify-between rounded-xl border border-line bg-paper p-3 text-xs cursor-pointer hover:border-roast/40 transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={extraSauce}
                  onChange={(e) => setExtraSauce(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-roast accent-roast"
                />
                <span className="font-semibold text-ink">Extra House Sawsawan Cup</span>
              </div>
              <span className="font-bold text-roast">+₱25.00</span>
            </label>
          </div>
        </div>

        {/* Special Instructions */}
        <Field label="Special Kitchen Request (Optional)">
          <input
            type="text"
            placeholder="e.g. Extra toasted skin, separate sauces..."
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            className={inputClass()}
          />
        </Field>

        {/* Quantity and Submit */}
        <div className="flex items-center justify-between border-t border-line pt-4 gap-4">
          <div className="flex items-center rounded-xl border border-line bg-cream p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-paper transition disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-9 text-center text-sm font-bold text-ink">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.availableQty, q + 1))}
              disabled={quantity >= product.availableQty}
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-paper transition disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={handleAdd}
            className="flex-1 py-3 text-sm font-bold shadow-lg shadow-roast/20"
          >
            <ShoppingBag className="h-4 w-4 mr-1.5" />
            Add to Order • {formatPeso(totalPrice)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
