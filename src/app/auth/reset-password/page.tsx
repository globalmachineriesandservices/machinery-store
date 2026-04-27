"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function PasswordRequirement({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {ok ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      )}
      <span className={cn("text-xs", ok ? "text-green-700" : "text-muted-foreground")}>{label}</span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }
    fetch(`/api/password-reset?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setTokenValid(true);
          setTokenEmail(data.data.email);
        }
      })
      .catch(() => {})
      .finally(() => setValidating(false));
  }, [token]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/password-reset", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...data }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          LINK EXPIRED
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/forgot-password">Request New Link</Link>
        </Button>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          PASSWORD RESET!
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "hsl(var(--primary) / 0.08)" }}>
          <ShieldCheck className="w-7 h-7" style={{ color: "hsl(var(--primary))" }} />
        </div>
        <h1
          className="text-3xl font-extrabold mb-1"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          RESET PASSWORD
        </h1>
        <p className="text-muted-foreground text-sm">
          Set a new password for{" "}
          <span className="font-medium text-foreground">{tokenEmail}</span>
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              className="h-11 pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <PasswordRequirement ok={password.length >= 8} label="8+ characters" />
              <PasswordRequirement ok={/[A-Z]/.test(password)} label="Uppercase letter" />
              <PasswordRequirement ok={/[0-9]/.test(password)} label="Number" />
              <PasswordRequirement ok={/[^A-Za-z0-9]/.test(password)} label="Special character" />
            </div>
          )}
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="••••••••"
              className="h-11 pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Reset Password
        </Button>
      </form>
    </motion.div>
  );
}
