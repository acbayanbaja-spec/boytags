import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Shield, LogOut, CheckCircle2, AlertCircle, ClipboardList, Bell, ChefHat, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { sound } from "@/lib/sound";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      await api("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
      });
      await refreshUser();
      sound.play("success");
      toast.success("Profile updated successfully!");
    } catch (err) {
      sound.play("alert");
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const isStaff = user.role === "STAFF" || user.role === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="display text-3xl font-bold text-ink">My Account</h1>
          <p className="text-xs text-muted mt-0.5">Manage your personal details and contact numbers for delivery.</p>
        </div>
        <span className="rounded-full bg-roast/10 text-roast px-3 py-1 text-xs font-bold uppercase tracking-wider">
          {user.role}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-danger/30 bg-rose-50 p-4 text-xs text-danger font-bold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form */}
      <Card className="p-6">
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <Field label="Full Name">
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputClass()} pl-10`}
              />
            </div>
          </Field>

          <Field label="Email Address">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
              <input
                type="email"
                disabled
                value={user.email}
                className={`${inputClass()} pl-10 bg-cream cursor-not-allowed opacity-80`}
              />
            </div>
            <span className="text-[11px] text-muted">Email is locked to your Boytag's account.</span>
          </Field>

          <Field label="Mobile Phone (for delivery rider coordination)">
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

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full sm:w-auto px-6 font-bold">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/orders">
          <Card className="flex items-center gap-4 p-4 hover:border-roast/40 transition hover:shadow-sm">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-roast">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">My Order History</p>
              <p className="text-[11px] text-muted">View past and active roast orders</p>
            </div>
          </Card>
        </Link>

        <Link to="/notifications">
          <Card className="flex items-center gap-4 p-4 hover:border-roast/40 transition hover:shadow-sm">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-roast">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">Notifications</p>
              <p className="text-[11px] text-muted">Tupi kitchen status alerts</p>
            </div>
          </Card>
        </Link>

        {isStaff && (
          <Link to="/staff" className="sm:col-span-2">
            <Card className="flex items-center gap-4 p-4 border-amber-300 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400 transition">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-roast text-white">
                <ChefHat className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-ink">Staff & Kitchen Operations Portal</p>
                <p className="text-[11px] text-muted">Access KDS Kitchen Display, queue, and inventory telemetry</p>
              </div>
              <span className="text-xs font-bold text-roast">Open Portal →</span>
            </Card>
          </Link>
        )}
      </div>

      {/* Sign Out Card */}
      <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-rose-200 bg-rose-50/40">
        <div>
          <h3 className="font-bold text-sm text-ink">Sign Out of Boytag's</h3>
          <p className="text-xs text-muted">Safely end your session on this browser.</p>
        </div>
        <Button
          variant="danger"
          onClick={() => {
            sound.play("click");
            logout();
          }}
          className="w-full sm:w-auto font-bold"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
