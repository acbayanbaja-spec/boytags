import { Printer, Flame, Clock, UtensilsCrossed } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { formatTime, formatDateTime } from "@/lib/utils";
import type { Order } from "@/types";

export function KitchenTicketModal({
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
    <Modal open={open} title="Kitchen Prep Ticket (KDS)" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Printable Kitchen Slip */}
        <div className="print-area rounded-2xl border-2 border-dashed border-ink bg-paper p-5 font-mono text-xs text-ink space-y-3">
          <div className="border-b-2 border-dashed border-ink pb-2 text-center">
            <span className="font-bold text-sm tracking-wider uppercase">--- KITCHEN PREP TICKET ---</span>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-xl font-black">{order.orderNumber}</span>
              <span className="rounded bg-ink px-2 py-0.5 text-xs font-bold text-paper">
                {order.type}
              </span>
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>TARGET TIME:</span>
              <span className="font-black text-sm">{formatTime(order.scheduledAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>ORDERED AT:</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>PRIORITY:</span>
              <span className="font-bold">{order.priority}</span>
            </div>
            <div className="flex justify-between">
              <span>CUSTOMER:</span>
              <span>{order.customer?.name}</span>
            </div>
          </div>

          {/* Kitchen Notes Banner */}
          {order.customerNotes && (
            <div className="rounded border-2 border-ink p-2 font-bold text-[11px] bg-cream">
              <span>NOTE: </span>
              <span>{order.customerNotes}</span>
            </div>
          )}

          {/* Items Checklist */}
          <div className="border-t-2 border-b-2 border-dashed border-ink py-2 space-y-2">
            <span className="font-bold uppercase tracking-wider block text-[10px]">ITEMS TO PACK:</span>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-2 text-xs">
                <span className="inline-block h-3.5 w-3.5 border border-ink mt-0.5 shrink-0" />
                <span className="font-black text-sm">{item.quantity}×</span>
                <span className="font-bold flex-1">{item.productName}</span>
              </div>
            ))}
          </div>

          <div className="text-center pt-2 text-[10px] text-muted">
            BOYTAG'S STATION 1 - GRILL & EXPEDITER
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 no-print">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" />
            Print Ticket
          </Button>
        </div>
      </div>
    </Modal>
  );
}
