import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Button, Card, Field, inputClass } from "@/components/ui";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Missing or invalid reset token. Please request a new link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="display text-2xl font-bold text-ink">Set New Password</h1>
          <p className="mt-1 text-xs text-muted">
            Enter your new secure password below to regain access to your account.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-rose-50 p-3 text-xs text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-leaf-soft text-leaf">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-ink">Password updated successfully!</h3>
            <p className="text-xs text-muted">
              Redirecting you to the sign in page in a moment...
            </p>
            <Link to="/login">
              <Button className="w-full mt-2">Sign In Now</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="New Password">
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass()} pl-10`}
                />
              </div>
            </Field>

            <Field label="Confirm New Password">
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass()} pl-10`}
                />
              </div>
            </Field>

            <Button type="submit" loading={loading} className="w-full py-3 text-sm font-semibold">
              Update Password
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-muted hover:text-roast underline">
                Return to sign in
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
