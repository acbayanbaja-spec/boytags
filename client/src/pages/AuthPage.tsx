import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  ShieldCheck,
  Star,
  ChefHat,
  Crown,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { sound } from "@/lib/sound";
import { Button, Field, inputClass, Modal, PasswordStrengthMeter } from "@/components/ui";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotResetUrl, setForgotResetUrl] = useState<string | null>(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get("next") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "login") {
        if (!email.trim() || !password) {
          throw new Error("Please enter both email and password.");
        }
        const user = await login(email.trim(), password, rememberMe);
        sound.play("success");
        setSuccess(`Welcome back, ${user.name}!`);
        setTimeout(() => {
          if (user.role === "STAFF" || user.role === "ADMIN") {
            navigate(next !== "/" ? next : "/staff");
          } else {
            navigate(next);
          }
        }, 500);
      } else {
        if (!name.trim()) throw new Error("Please enter your full name.");
        if (!email.trim() || !email.includes("@")) throw new Error("Please enter a valid email address.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters long.");
        const user = await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
        });
        sound.play("success");
        setSuccess(`Account created! Welcome to Boytag's, ${user.name}.`);
        setTimeout(() => {
          navigate(next);
        }, 500);
      }
    } catch (err) {
      sound.play("alert");
      setError(err instanceof Error ? err.message : "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Quick 1-click preset login helper
  async function quickLoginAs(role: "admin" | "staff" | "customer") {
    setError(null);
    setMode("login");
    const credentials = {
      admin: { email: "admin@boytags.local", pass: "Admin123!" },
      staff: { email: "staff@boytags.local", pass: "Staff123!" },
      customer: { email: "customer@boytags.local", pass: "Customer123!" },
    }[role];

    setEmail(credentials.email);
    setPassword(credentials.pass);
    setLoading(true);

    try {
      const user = await login(credentials.email, credentials.pass, true);
      sound.play("success");
      setSuccess(`Signed in as ${user.name} (${user.role})!`);
      setTimeout(() => {
        if (user.role === "STAFF" || user.role === "ADMIN") {
          navigate("/staff");
        } else {
          navigate(next);
        }
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quick login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      const res = await api<{ sent: boolean; resetUrl?: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      sound.play("success");
      setForgotSent(true);
      if (res.resetUrl) {
        setForgotResetUrl(res.resetUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process password reset.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-paper shadow-2xl md:grid md:grid-cols-12"
      >
        {/* Left Side: Brand Immersion & Instant Demo Roles */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#28150c] via-[#1a0c06] to-[#100602] p-10 text-white md:col-span-5 md:flex overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(194,65,12,0.35),transparent_65%)] pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-roast text-white shadow-lg shadow-roast/40">
                <Flame className="h-6 w-6" />
              </span>
              <span>
                <span className="display block text-2xl font-bold tracking-tight text-paper">Boytag's</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
                  Lechon Manok & Grill
                </span>
              </span>
            </Link>
          </div>

          {/* Central Hero Tagline */}
          <div className="relative z-10 my-auto space-y-4 py-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Santa Rosa's Premier Roast Chicken</span>
            </div>
            <h2 className="display text-3xl font-bold leading-snug text-white lg:text-4xl">
              Golden crackling skin, juicy meat, garlic-infused aroma.
            </h2>
            <p className="text-xs text-amber-100/75 leading-relaxed">
              Real-time kitchen queue tracking, live roaster monitoring, and pinpoint doorstep delivery across Laguna.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-amber-300">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold">4.9/5</span>
              <span className="text-amber-100/60">• 3,400+ Santa Rosa Orders</span>
            </div>
          </div>

          {/* 1-Click Instant Role Sign-in Quick Access */}
          <div className="relative z-10 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                ⚡ 1-Click Instant Demo Login
              </p>
              <span className="text-[10px] text-amber-200/60">Zero typing needed</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLoginAs("customer")}
                className="group flex flex-col items-center gap-1 rounded-xl bg-white/10 p-2.5 text-center transition hover:bg-white/20 active:scale-95"
              >
                <ShoppingBag className="h-4 w-4 text-amber-300 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Customer</span>
                <span className="text-[9px] text-amber-200/70">Order & Track</span>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs("staff")}
                className="group flex flex-col items-center gap-1 rounded-xl bg-white/10 p-2.5 text-center transition hover:bg-white/20 active:scale-95"
              >
                <ChefHat className="h-4 w-4 text-orange-400 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Kitchen</span>
                <span className="text-[9px] text-amber-200/70">KDS Queue</span>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs("admin")}
                className="group flex flex-col items-center gap-1 rounded-xl bg-white/10 p-2.5 text-center transition hover:bg-white/20 active:scale-95"
              >
                <Crown className="h-4 w-4 text-yellow-300 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Manager</span>
                <span className="text-[9px] text-amber-200/70">Full Access</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Form & Controls */}
        <div className="p-6 sm:p-10 md:col-span-7 flex flex-col justify-center">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
            <div>
              <h1 className="display text-2xl font-bold text-ink">
                {mode === "login" ? "Sign In to Boytag's" : "Create Your Account"}
              </h1>
              <p className="text-xs text-muted mt-0.5">
                {mode === "login"
                  ? "Track active orders, save favorite delivery pins, and earn rewards."
                  : "Join today for lightning-fast roast chicken ordering in Santa Rosa."}
              </p>
            </div>

            {/* Switch Tabs with sliding indicator */}
            <div className="flex rounded-2xl bg-cream p-1 text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.play("click");
                  setMode("login");
                  setError(null);
                }}
                className={`rounded-xl px-4 py-1.5 transition ${
                  mode === "login"
                    ? "bg-paper text-roast font-bold shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.play("click");
                  setMode("register");
                  setError(null);
                }}
                className={`rounded-xl px-4 py-1.5 transition ${
                  mode === "register"
                    ? "bg-paper text-roast font-bold shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Quick 1-click bar on mobile */}
          <div className="mb-4 flex items-center justify-between rounded-xl bg-cream p-2 text-xs md:hidden">
            <span className="font-bold text-[11px] text-muted">Quick Fill:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => quickLoginAs("customer")}
                className="font-bold text-roast underline text-[11px]"
              >
                Customer
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => quickLoginAs("staff")}
                className="font-bold text-roast underline text-[11px]"
              >
                Kitchen
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => quickLoginAs("admin")}
                className="font-bold text-roast underline text-[11px]"
              >
                Admin
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 flex items-center gap-2.5 rounded-2xl border border-danger/30 bg-rose-50 p-3.5 text-xs text-danger font-medium"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 flex items-center gap-2.5 rounded-2xl border border-leaf/30 bg-leaf-soft/60 p-3.5 text-xs text-leaf font-bold"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <Field label="Full Name">
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`${inputClass()} pl-10`}
                    />
                  </div>
                </Field>

                <Field label="Mobile Phone Number (Optional)">
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                    <input
                      type="tel"
                      placeholder="0917 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`${inputClass()} pl-10`}
                    />
                  </div>
                </Field>
              </motion.div>
            )}

            <Field label="Email Address">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass()} pl-10`}
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={mode === "register" ? "Minimum 8 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass()} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 rounded-lg p-1 text-muted hover:text-ink transition focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "register" && <PasswordStrengthMeter password={password} />}
            </Field>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-ink font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-roast focus:ring-roast accent-roast"
                />
                <span>Remember this device</span>
              </label>

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    sound.play("click");
                    setForgotOpen(true);
                    setForgotSent(false);
                    setForgotResetUrl(null);
                  }}
                  className="font-semibold text-roast hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3.5 text-base font-bold shadow-lg shadow-roast/20 mt-2"
            >
              {mode === "login" ? "Sign In to Boytag's" : "Create Free Account"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          {/* House Guarantee note */}
          <div className="mt-8 pt-4 border-t border-line text-center text-xs text-muted flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-leaf" />
            <span>Secure 256-bit encryption • Boytag's Santa Rosa Quality Guarantee</span>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <Modal open={forgotOpen} title="Reset Your Password" onClose={() => setForgotOpen(false)}>
        {forgotSent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-leaf-soft text-leaf shadow-sm">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-ink">Reset Instructions Prepared!</h3>
            <p className="text-xs text-muted leading-relaxed">
              If an account matches <strong>{forgotEmail}</strong>, password reset instructions are ready.
            </p>
            {forgotResetUrl && (
              <div className="rounded-2xl border border-line bg-cream p-3.5 text-left space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Development Reset Link:
                </span>
                <Link
                  to={forgotResetUrl.replace(window.location.origin, "")}
                  onClick={() => setForgotOpen(false)}
                  className="block text-xs font-semibold text-roast underline break-all"
                >
                  Click here to set your new password →
                </Link>
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={() => setForgotOpen(false)}>
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <p className="text-muted leading-relaxed">
              Enter your registered email address below and we'll provide instructions to reset your account password.
            </p>
            <Field label="Email Address">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className={`${inputClass()} pl-10`}
                />
              </div>
            </Field>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setForgotOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={forgotLoading} className="flex-1 font-bold">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
