import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export const metadata = { title: "Unauthorized" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-extrabold mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>ACCESS DENIED</h1>
        <p className="text-muted-foreground mb-8">You don't have permission to access this page. This area is restricted to administrators only.</p>
        <div className="flex gap-3 justify-center">
          <Button asChild><Link href="/">Go Home</Link></Button>
          <Button variant="outline" asChild><Link href="/auth/login">Sign In</Link></Button>
        </div>
      </div>
    </div>
  );
}
