"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      // Always show success to prevent email enumeration
      setEmail(data.email);
      setSent(true);
    } catch {
      // Still show success
      setEmail(data.email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1
          className="text-3xl font-extrabold mb-2"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          CHECK YOUR EMAIL
        </h1>
        <p className="text-muted-foreground text-sm mb-2">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{email}</span>, we've sent a
          password reset link.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          The link expires in 1 hour. Check your spam folder if you don't see it.
        </p>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSent(false)}
          >
            Try a different email
          </Button>
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Sign In
            </Link>
          </Button>
        </div>
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
          <Mail className="w-7 h-7" style={{ color: "hsl(var(--primary))" }} />
        </div>
        <h1
          className="text-3xl font-extrabold mb-1"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          FORGOT PASSWORD?
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            className="mt-1 h-11"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Send Reset Link
        </Button>
      </form>

      <Button asChild variant="ghost" className="w-full mt-3">
        <Link href="/auth/login">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Sign In
        </Link>
      </Button>
    </motion.div>
  );
}
