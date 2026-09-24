import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";
import { Loader2, X, Star, Printer, CheckCircle2, Volume2, VolumeX, ShieldCheck, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { STATUS_LABEL, type OrderStatus } from "@/types";

export type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "glow";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-roast text-white hover:bg-roast-deep shadow-sm shadow-roast/20 active:bg-[#832b0e]",
    secondary: "bg-ink text-paper hover:bg-black active:bg-neutral-900",
    ghost: "bg-transparent text-ink hover:bg-line/60 active:bg-line/80",
    danger: "bg-danger text-white hover:bg-red-800 shadow-sm shadow-red-600/20 active:bg-red-900",
    outline: "border border-line bg-paper text-ink hover:border-roast/40 hover:bg-cream/50 active:bg-line/40",
    glow: "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 hover:brightness-105",
  }[variant];

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-6 py-3.5 text-base rounded-2xl gap-2.5",
  }[size];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.play("click");
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer",
        variantStyles,
        sizeStyles,
        className,
      )}
      disabled={loading || disabled}
      onClick={handleClick}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : null}
      {children}
    </motion.button>
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
        {hint && <span className="text-[11px] text-muted">{hint}</span>}
      </div>
      {children}
      {error ? <span className="block text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}

export function inputClass(error?: boolean) {
  return cn(
    "w-full rounded-xl border bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-roast focus:ring-4 focus:ring-roast/10 placeholder:text-muted/60",
    error ? "border-danger bg-red-50/20" : "border-line",
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-paper p-5 shadow-card transition duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone: Record<OrderStatus, { bg: string; text: string; dot: string; pulse?: boolean }> = {
    PENDING: { bg: "bg-amber-100/80 border border-amber-300", text: "text-amber-900", dot: "bg-amber-500", pulse: true },
    CONFIRMED: { bg: "bg-sky-100/80 border border-sky-300", text: "text-sky-900", dot: "bg-sky-500", pulse: false },
    PREPARING: { bg: "bg-orange-100/90 border border-orange-300", text: "text-orange-950", dot: "bg-orange-600", pulse: true },
    READY: { bg: "bg-emerald-100/80 border border-emerald-300", text: "text-emerald-950", dot: "bg-emerald-600", pulse: true },
    OUT_FOR_DELIVERY: { bg: "bg-indigo-100/80 border border-indigo-300", text: "text-indigo-950", dot: "bg-indigo-600", pulse: true },
    COMPLETED: { bg: "bg-zinc-100 border border-zinc-300", text: "text-zinc-800", dot: "bg-zinc-500", pulse: false },
    CANCELLED: { bg: "bg-rose-100 border border-rose-300", text: "text-rose-900", dot: "bg-rose-500", pulse: false },
    UNCLAIMED: { bg: "bg-red-600 text-white shadow-sm", text: "text-white font-bold", dot: "bg-white", pulse: true },
  };

  const current = tone[status] || tone.PENDING;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        current.bg,
        current.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", current.dot, current.pulse && "animate-ping")} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-paper/60 px-6 py-14 text-center">
      {icon ? (
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-cream border border-line text-roast">
          {icon}
        </div>
      ) : null}
      <h3 className="display text-2xl font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-muted leading-relaxed">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
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
  maxWidth = "max-w-md",
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={cn(
              "relative z-10 w-full overflow-hidden rounded-3xl border border-line bg-paper p-6 shadow-2xl",
              maxWidth,
            )}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <h2 className="display text-xl font-bold text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-muted hover:bg-cream hover:text-ink transition"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SoundToggle() {
  const [enabled, setEnabled] = useState(sound.isEnabled());

  function toggle() {
    const next = sound.toggle();
    setEnabled(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={enabled ? "Sound effects enabled (click to mute)" : "Sound effects muted (click to unmute)"}
      className={cn(
        "rounded-full p-2 transition",
        enabled ? "text-roast hover:bg-line/50" : "text-muted/60 hover:text-muted hover:bg-line/40",
      )}
      aria-label="Toggle sound effects"
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasLength, hasNumber, hasUpper, hasSpecial].filter(Boolean).length;

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Unbreakable"];
  const strengthColors = ["bg-zinc-300", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-600"];

  if (!password) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              step <= score ? strengthColors[score] : "bg-line",
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>Security rating:</span>
        <span className="font-semibold text-ink">{strengthLabels[score]}</span>
      </div>
    </div>
  );
}
