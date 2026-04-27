"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ChevronRight, ExternalLink, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

const segmentLabels: Record<string, string> = {
  admin: "Dashboard", products: "Products", categories: "Categories",
  inquiries: "Inquiries", customers: "Customers", messages: "Messages",
  faqs: "FAQs", company: "Company Settings", profile: "Profile",
  new: "New", edit: "Edit",
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return (
    <nav className="flex items-center gap-1 text-sm">
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = segmentLabels[seg] || seg;
        const isLast = i === segments.length - 1;
        const isId = seg.length > 20;
        return (
          <span key={href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            {isLast || isId ? (
              <span className={isLast ? "font-semibold text-foreground" : "text-muted-foreground"}>
                {isId ? "Detail" : label}
              </span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear">
      {/* SidebarTrigger lives here — works for both desktop toggle and mobile open */}
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumbs />

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" target="_blank" title="View site">
            <ExternalLink className="w-4 h-4" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {session?.user?.name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{session?.user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/company"><Settings className="mr-2 h-4 w-4" />Company Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
