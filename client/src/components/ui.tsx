import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, type OrderStatus } from "@/types";

export type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  loading?: boolean;
};

export function Button({
  children,
  className,
  variant = "primary",
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const styles = {
    primary: "bg-roast text-white hover:bg-roast-deep shadow-sm",
    secondary: "bg-ink text-paper hover:bg-black",
    ghost: "bg-transparent hover:bg-line/60",
    danger: "bg-danger text-white hover:bg-red-800",
    outline: "border border-line bg-paper hover:border-ink/30",
  }[variant];
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        styles,
        className,
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </motion.button>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}

export function inputClass(error?: boolean) {
  return cn(
    "w-full rounded-xl border bg-paper px-3.5 py-2.5 text-sm outline-none transition focus:border-roast focus:ring-4 focus:ring-roast/10",
    error ? "border-danger" : "border-line",
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-paper p-5 shadow-card", className)}>{children}</div>;
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone: Record<OrderStatus, string> = {
    PENDING: "bg-amber-100 text-amber-900",
    CONFIRMED: "bg-sky-100 text-sky-900",
    PREPARING: "bg-orange-100 text-orange-900",
    READY: "bg-leaf-soft text-leaf",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-900",
    COMPLETED: "bg-zinc-200 text-zinc-800",
    CANCELLED: "bg-rose-100 text-rose-900",
    UNCLAIMED: "bg-red-600 text-white",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tone[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-paper/70 px-6 py-14 text-center">
      <h3 className="display text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl", className)} />;
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <button className="absolute inset-0" aria-label="Close dialog" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-paper p-5 shadow-2xl">
        <h2 id="dialog-title" className="display text-2xl">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
