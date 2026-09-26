import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Flame,
  AlertCircle,
  CheckCircle2,
  PackageX,
  PackageCheck,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useRealtime } from "@/hooks/useRealtime";
import { Button, Card, Field, Modal, Skeleton, inputClass } from "@/components/ui";
import { DishImage } from "@/components/DishImage";
import type { Product } from "@/types";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function StaffProductsPage() {
  const queryClient = useQueryClient();
  useRealtime();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [availableQty, setAvailableQty] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [active, setActive] = useState(true);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products", "staff"],
    queryFn: () => api<Product[]>("/api/products"),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => api<Category[]>("/api/categories"),
  });

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchCat = selectedCategory === "ALL" || p.category?.slug === selectedCategory;
      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editingProduct) {
        return api<Product>(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return api<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      sound.play("success");
      toast.success(editingProduct ? "Product updated in Tupi catalog!" : "New dish added to Tupi catalog!");
      setModalOpen(false);
      setEditingProduct(null);
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => {
      sound.play("alert");
      toast.error(err.message || "Failed to save product.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      sound.play("alert");
      toast.success("Dish removed from customer catalog.");
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove product.");
    },
  });

  const quickQtyMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      api<Product>(`/api/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ availableQty: Math.max(0, qty) }),
      }),
    onSuccess: (updated) => {
      sound.play("click");
      if (updated.soldOut || updated.availableQty <= 0) {
        toast.warning(`${updated.name} is now marked SOLD OUT.`);
      } else {
        toast.success(`Updated ${updated.name} stock to ${updated.availableQty}.`);
      }
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function openCreate() {
    sound.play("click");
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("/images/dishes/whole-lechon.jpg");
    setAvailableQty("20");
    setCategoryId(categories?.[0]?.id || "");
    setActive(true);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    sound.play("click");
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(String(p.price));
    setImageUrl(p.imageUrl);
    setAvailableQty(String(p.availableQty));
    setCategoryId(p.category?.id || "");
    setActive(p.active);
    setModalOpen(true);
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({
      categoryId,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      imageUrl: imageUrl.trim(),
      availableQty: Number(availableQty),
      active,
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-roast mb-1">
            <Flame className="h-4 w-4" />
            <span>Poblacion, Tupi Inventory & Kitchen Stocks</span>
          </div>
          <h1 className="display text-3xl font-bold text-ink">Menu & Inventory Manager</h1>
          <p className="text-xs text-muted">
            Live counts directly govern customer ordering. Depleted counts are automatically set to SOLD OUT.
          </p>
        </div>

        <Button onClick={openCreate} className="text-xs h-10 px-4 shadow-md shadow-roast/20 font-bold">
          <Plus className="h-4 w-4 mr-1.5" />
          Add New Dish
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              sound.play("click");
              setSelectedCategory("ALL");
            }}
            className={`rounded-2xl px-3.5 py-1.5 transition ${
              selectedCategory === "ALL"
                ? "bg-roast text-white font-bold shadow-sm"
                : "bg-paper border border-line text-ink hover:border-roast/40"
            }`}
          >
            All Categories
          </button>
          {categories?.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                sound.play("click");
                setSelectedCategory(c.slug);
              }}
              className={`rounded-2xl px-3.5 py-1.5 transition ${
                selectedCategory === c.slug
                  ? "bg-roast text-white font-bold shadow-sm"
                  : "bg-paper border border-line text-ink hover:border-roast/40"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search dish name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-line bg-paper pl-9 pr-3 py-2 text-xs outline-none focus:border-roast shadow-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-line bg-paper overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream border-b border-line text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Item</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Price</th>
                  <th className="py-3.5 px-4 font-bold">Available Stock</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((product) => {
                  const isSoldOut = product.soldOut || product.availableQty <= 0;

                  return (
                    <tr key={product.id} className="hover:bg-cream/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <DishImage
                            src={product.imageUrl}
                            alt={product.name}
                            category={product.category?.name}
                            className="h-11 w-11 rounded-xl object-cover bg-cream shrink-0"
                          />
                          <div>
                            <p className="font-bold text-ink text-sm">{product.name}</p>
                            <p className="text-[11px] text-muted line-clamp-1 max-w-xs">{product.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted font-semibold">
                        {product.category?.name || "Main"}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-ink">
                        {formatPeso(product.price)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${isSoldOut ? "text-danger" : "text-ink"}`}>
                            {product.availableQty}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => quickQtyMutation.mutate({ id: product.id, qty: product.availableQty - 1 })}
                              className="rounded-lg border border-line bg-cream px-2 py-0.5 text-[10px] font-bold hover:bg-paper"
                              title="Decrease by 1"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() => quickQtyMutation.mutate({ id: product.id, qty: product.availableQty + 5 })}
                              className="rounded-lg border border-line bg-cream px-2 py-0.5 text-[10px] font-bold hover:bg-paper"
                              title="Add 5 servings"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => quickQtyMutation.mutate({ id: product.id, qty: 0 })}
                              className="rounded-lg border border-danger/30 text-danger bg-rose-50 px-2 py-0.5 text-[10px] font-bold hover:bg-rose-100"
                              title="Set zero (Sold Out)"
                            >
                              0 (Sold Out)
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isSoldOut ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-danger px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            <PackageX className="h-3 w-3" /> SOLD OUT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-leaf-soft text-leaf px-2.5 py-0.5 text-[10px] font-bold">
                            <PackageCheck className="h-3 w-3" /> In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs font-semibold"
                            onClick={() => openEdit(product)}
                          >
                            <Edit2 className="h-3 w-3 mr-1" /> Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-danger hover:bg-rose-50"
                            onClick={() => {
                              if (confirm(`Remove ${product.name} from active menu?`)) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        open={modalOpen}
        title={editingProduct ? "Edit Dish Details" : "Add New Dish to Tupi Menu"}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
          <Field label="Dish Name">
            <input
              type="text"
              required
              placeholder="e.g. Whole Lechon Manok"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass()}
            />
          </Field>

          <Field label="Category">
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass()}
            >
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea
              required
              rows={3}
              placeholder="Describe marinade, herbs, portion size in Tupi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass()}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Price (PHP)">
              <input
                type="number"
                step="0.01"
                required
                placeholder="380.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass()}
              />
            </Field>

            <Field label="Available Inventory Quantity">
              <input
                type="number"
                required
                placeholder="20"
                value={availableQty}
                onChange={(e) => setAvailableQty(e.target.value)}
                className={inputClass()}
              />
            </Field>
          </div>

          <Field label="Image URL & Live Preview">
            <input
              type="text"
              required
              placeholder="/images/dishes/whole-lechon.jpg or https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClass()}
            />
            {/* Quick preset selector */}
            <div className="mt-2 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Quick Pick Preset Dish Photo:</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 border border-line/60 rounded-xl bg-cream/40">
                {[
                  { label: "Whole Lechon", url: "/images/dishes/whole-lechon.jpg" },
                  { label: "Half Lechon", url: "/images/dishes/half-lechon.jpg" },
                  { label: "Spicy Lechon", url: "/images/dishes/spicy-lechon.jpg" },
                  { label: "Grilled Liempo", url: "/images/dishes/liempo.jpg" },
                  { label: "Chicken Inasal", url: "/images/dishes/inasal.jpg" },
                  { label: "Fried Chicken", url: "/images/dishes/fried.jpg" },
                  { label: "Sizzling Sisig", url: "/images/dishes/sisig.jpg" },
                  { label: "Grilled Bangus", url: "/images/dishes/bangus.jpg" },
                  { label: "Fiesta Bilao", url: "/images/dishes/fiesta-bilao.jpg" },
                  { label: "Java Rice", url: "/images/dishes/java-rice.jpg" },
                  { label: "Garlic Rice", url: "/images/dishes/garlic-rice.jpg" },
                  { label: "Sawsawan", url: "/images/dishes/sawsawan.jpg" },
                  { label: "Atchara", url: "/images/dishes/atchara.jpg" },
                  { label: "Calamansi", url: "/images/dishes/calamansi.jpg" },
                  { label: "Sago Gulaman", url: "/images/dishes/sago.jpg" },
                  { label: "Buko Pandan", url: "/images/dishes/buko-pandan.jpg" },
                  { label: "Halo-Halo", url: "/images/dishes/halo-halo.jpg" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      sound.play("click");
                      setImageUrl(preset.url);
                    }}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                      imageUrl === preset.url
                        ? "bg-roast text-white shadow-xs"
                        : "bg-paper border border-line text-ink hover:border-roast/40"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Card */}
            {imageUrl && (
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-cream border border-line p-2.5">
                <DishImage
                  src={imageUrl}
                  alt={name || "Dish Preview"}
                  className="h-16 w-16 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Live Image Preview</span>
                  <p className="font-bold text-xs text-ink truncate">{name || "Dish Name"}</p>
                  <p className="text-[11px] text-roast font-bold mt-0.5">{price ? formatPeso(Number(price)) : "₱0.00"}</p>
                </div>
              </div>
            )}
          </Field>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeCheckbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-line text-roast accent-roast cursor-pointer"
            />
            <label htmlFor="activeCheckbox" className="font-semibold text-ink cursor-pointer">
              Active on Customer Menu
            </label>
          </div>

          <div className="flex gap-2 pt-3 border-t border-line">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saveMutation.isPending}
              className="flex-1 font-bold"
            >
              {editingProduct ? "Save Changes" : "Create Dish"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
