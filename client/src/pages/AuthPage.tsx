import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Phone, User, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button, Field, inputClass, Modal } from "@/components/ui";

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
        setSuccess(`Welcome back, ${user.name}!`);
        setTimeout(() => {
          if (user.role === "STAFF" || user.role === "ADMIN") {
            navigate("/staff");
          } else {
            navigate(next);
          }
        }, 600);
      } else {
        if (!name.trim()) throw new Error("Please enter your name.");
        if (!email.trim() || !email.includes("@")) throw new Error("Please enter a valid email address.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters long.");
        const user = await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
        });
        setSuccess(`Account created! Welcome to Boytag's, ${user.name}.`);
        setTimeout(() => {
          navigate(next);
        }, 600);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
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

  function fillPreset(type: "admin" | "staff" | "customer") {
    setMode("login");
    setError(null);
    if (type === "admin") {
      setEmail("admin@boytags.local");
      setPassword("Admin123!");
    } else if (type === "staff") {
      setEmail("staff@boytags.local");
      setPassword("Staff123!");
    } else {
      setEmail("customer@boytags.local");
      setPassword("Customer123!");
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-paper shadow-2xl md:grid md:grid-cols-12"
      >
        {/* Left Side: Brand Narrative & Visual Depth */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#2a170d] via-[#1f1008] to-[#120703] p-10 text-white md:col-span-5 md:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(194,65,12,0.35),transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-roast text-base font-bold shadow-lg shadow-roast/30 text-white">
                <Flame className="h-5 w-5" />
              </span>
              <span>
                <span className="display block text-xl font-bold tracking-tight text-paper">Boytag's</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-amber-200/80">Lechon Manok & Grill</span>
              </span>
            </Link>
          </div>

          <div className="relative z-10 my-auto space-y-4 py-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Authentic Charcoal Roast</span>
            </div>
            <h2 className="display text-3xl font-semibold leading-tight text-white lg:text-4xl">
              Golden crisp skin, lemongrass aroma, juicy to the bone.
            </h2>
            <p className="text-sm text-amber-100/75 leading-relaxed">
              Order directly from Santa Rosa's favorite chicken house. Real-time kitchen queue tracking and pinpoint delivery to your doorstep.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-2">
              Instant Demo Access
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillPreset("customer")}
                className="rounded-lg bg-white/10 px-2.5 py-1.5 font-medium hover:bg-white/20 transition text-paper"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => fillPreset("staff")}
                className="rounded-lg bg-white/10 px-2.5 py-1.5 font-medium hover:bg-white/20 transition text-paper"
              >
                Staff (Kitchen)
              </button>
              <button
                type="button"
                onClick={() => fillPreset("admin")}
                className="rounded-lg bg-white/10 px-2.5 py-1.5 font-medium hover:bg-white/20 transition text-paper"
              >
                Admin (Manager)
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="p-6 sm:p-10 md:col-span-7 flex flex-col justify-center">
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <div>
              <h1 className="display text-2xl font-bold text-ink">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-xs text-muted mt-0.5">
                {mode === "login"
                  ? "Sign in to track orders, save addresses, and earn points."
                  : "Join Boytag's for lightning-fast roast chicken ordering."}
              </p>
            </div>

            {/* Switch Tabs */}
            <div className="flex rounded-xl bg-cream p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); }}
                className={`rounded-lg px-3 py-1.5 transition ${
                  mode === "login" ? "bg-paper text-roast shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(null); }}
                className={`rounded-lg px-3 py-1.5 transition ${
                  mode === "register" ? "bg-paper text-roast shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Quick presets for mobile */}
          <div className="mb-4 flex items-center gap-1.5 text-xs text-muted md:hidden">
            <span>Quick fill:</span>
            <button type="button" onClick={() => fillPreset("customer")} className="underline text-roast">Customer</button>
            <span>•</span>
            <button type="button" onClick={() => fillPreset("staff")} className="underline text-roast">Staff</button>
            <span>•</span>
            <button type="button" onClick={() => fillPreset("admin")} className="underline text-roast">Admin</button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-rose-50 p-3 text-xs text-danger"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-2 rounded-xl border border-leaf/20 bg-leaf-soft/50 p-3 text-xs text-leaf font-medium"
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

                <Field label="Mobile Contact Number (optional)">
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
                  placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass()} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 rounded p-1 text-muted hover:text-ink focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-ink font-medium">
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
                  onClick={() => { setForgotOpen(true); setForgotSent(false); setForgotResetUrl(null); }}
                  className="font-semibold text-roast hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 text-base font-semibold shadow-md shadow-roast/20"
            >
              {mode === "login" ? "Sign In to Boytag's" : "Create Free Account"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            By continuing, you agree to Boytag's House Rules, Pickup & Delivery Service Guidelines, and Privacy Policy.
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <Modal open={forgotOpen} title="Reset Your Password" onClose={() => setForgotOpen(false)}>
        {forgotSent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-leaf-soft text-leaf">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-ink">Reset instructions sent!</h3>
            <p className="text-xs text-muted">
              If an account matches <strong>{forgotEmail}</strong>, we have prepared a reset link for you.
            </p>
            {forgotResetUrl && (
              <div className="rounded-xl border border-line bg-cream p-3 text-left">
                <p className="text-[11px] font-semibold text-muted uppercase">Local Development Link:</p>
                <Link
                  to={forgotResetUrl.replace("http://localhost:5173", "")}
                  onClick={() => setForgotOpen(false)}
                  className="text-xs font-semibold text-roast underline break-all"
                >
                  Click here to set a new password
                </Link>
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={() => setForgotOpen(false)}>
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-muted">
              Enter your registered email address and we'll send you a link to reset your account password.
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
              <Button type="submit" loading={forgotLoading} className="flex-1">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
