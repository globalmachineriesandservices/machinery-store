"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Cog, User, LogOut, LayoutDashboard, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  company: { name: string; logo: string | null } | null;
  categories: { id: string; name: string; slug: string }[];
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar({ company, categories }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b"
          : "bg-white border-b"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            {company?.logo ? (
              <Image src={company.logo} alt={company.name} width={40} height={40} className="rounded-lg object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--primary))" }}>
                <Cog className="w-5 h-5 text-white" />
              </div>
            )}
            <span
              className="font-extrabold text-lg tracking-wide hidden sm:block"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "hsl(var(--primary))" }}
            >
              {company?.name?.toUpperCase() || "MACHINERYSTORE"}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "text-primary bg-primary/5"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden md:flex">
              <Link href="/contact">Get a Quote</Link>
            </Button>

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user.image || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>
                    <p className="font-medium text-sm">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">{session.user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="mr-2 h-4 w-4" />My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild className="hidden md:flex">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active ? "text-primary bg-primary/5" : "text-foreground/70 hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t space-y-2">
                {session?.user ? (
                  <>
                    {session.user.role === "ADMIN" && (
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/admin">Admin Panel</Link>
                      </Button>
                    )}
                    <Button variant="destructive" className="w-full" onClick={() => signOut({ callbackUrl: "/" })}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="w-full"><Link href="/auth/login">Sign In</Link></Button>
                    <Button asChild variant="outline" className="w-full"><Link href="/auth/register">Create Account</Link></Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
