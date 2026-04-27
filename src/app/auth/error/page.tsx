"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration: "There's a server configuration issue. Please contact support.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link is invalid or has expired.",
  OAuthAccountNotLinked:
    "This email is already linked to a different sign-in method. Please use your original sign-in method.",
  Default: "An unexpected authentication error occurred.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>

      <h1
        className="text-3xl font-extrabold mb-2"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        AUTHENTICATION ERROR
      </h1>

      <p className="text-muted-foreground text-sm mb-2 max-w-sm mx-auto">{message}</p>

      {error !== "Default" && (
        <p className="text-xs text-muted-foreground mb-8 font-mono bg-muted px-3 py-1 rounded-full inline-block">
          Error code: {error}
        </p>
      )}

      <div className="space-y-3 mt-8">
        <Button asChild className="w-full">
          <Link href="/auth/login">
            <ArrowLeft className="w-4 h-4 mr-2" />Try Again
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </motion.div>
  );
}
