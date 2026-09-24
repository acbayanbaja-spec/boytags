import { Printer, CheckCircle2, ShieldCheck, Flame } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { formatDateTime, formatPeso } from "@/lib/utils";
import type { Order } from "@/types";

export function ReceiptModal({
  open,
  order,
  onClose,
}: {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}) {
  if (!order) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <Modal open={open} title="Official Order Receipt" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* Printable Receipt Paper Container */}
        <div className="print-area rounded-2xl border border-line bg-paper p-6 text-ink shadow-sm space-y-4 font-mono text-xs">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-line pb-4">
            <div className="inline-flex items-center gap-1.5 font-sans font-bold text-base text-roast">
              <Flame className="h-5 w-5" />
              <span>BOYTAG'S LECHON MANOK</span>
            </div>
            <p className="text-[11px] text-muted">Maharlika Highway, Brgy. Dila, Santa Rosa, Laguna</p>
            <p className="text-[11px] text-muted">Hotline: (049) 530-0192 / 0917-123-4567</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">BIR Non-VAT Reg: 442-910-388-000</p>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted">Order Ref:</span>
              <span className="font-bold text-ink">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Date/Time:</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Service:</span>
              <span className="font-bold">{order.type === "DELIVERY" ? "Doorstep Delivery" : "Store Counter Pickup"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Customer:</span>
              <span>{order.customer?.name || "Valued Customer"}</span>
            </div>
            {order.delivery && (
              <div className="pt-1 text-[10px] text-muted">
                <span>Address: {order.delivery.address}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-b border-dashed border-line py-3 space-y-2">
            <div className="flex justify-between font-bold text-muted text-[10px] uppercase">
              <span>Qty Item</span>
              <span>Total</span>
            </div>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-[11px]">
                <span className="max-w-[70%]">
                  {item.quantity}× {item.productName}
                </span>
                <span className="font-semibold">{formatPeso(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-muted">
              <span>Subtotal:</span>
              <span>{formatPeso(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Delivery Fee:</span>
              <span>{formatPeso(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-line pt-2 text-ink">
              <span>AMOUNT DUE:</span>
              <span className="text-roast">{formatPeso(order.total)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted pt-1">
              <span>Payment Mode:</span>
              <span>Cash on Hand / Electronic</span>
            </div>
          </div>

          {/* Footer Barcode / Note */}
          <div className="text-center pt-3 border-t border-dashed border-line space-y-1">
            <p className="text-[11px] font-bold text-ink">MARAMING SALAMAT SA PAGTANGKILIK!</p>
            <p className="text-[10px] text-muted">Keep this receipt for order verification.</p>
            <div className="pt-2 font-mono tracking-[0.25em] text-center text-[10px] text-muted">
              * {order.orderNumber} *
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 no-print">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Official Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
}
