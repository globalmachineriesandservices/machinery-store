import Link from "next/link";
import Image from "next/image"
import { Cog } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "hsl(var(--primary))" }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
            style={{ background: "hsl(var(--accent))" }}
          />
          <div className="absolute bottom-0 -left-20 w-64 h-64 rounded-full opacity-5 bg-white" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
          >
            <Image
              src='logo-dark.png'
              alt='Global Machineries & Services'
              width={48}
              height={48}
              className='object-contain'
            />
          </div>
          <span
            className="text-white font-extrabold text-xl tracking-wide"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            MACHINERYSTORE
          </span>
        </Link>

        {/* Center content */}
        <div className="relative">
          <div
            className="inline-block text-orange-400 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ background: "rgba(249,115,22,0.15)" }}
          >
            Industrial Equipment Specialists
          </div>
          <h2
            className="text-5xl font-extrabold text-white leading-none mb-6"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            POWER YOUR<br />
            <span style={{ color: "hsl(var(--accent))" }}>OPERATIONS</span><br />
            WITH CONFIDENCE
          </h2>
          <p className="text-white/60 leading-relaxed max-w-md">
            Access pricing, technical specifications, and expert support for generators, solar systems, marine engines, pumps, and more.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {["Generators", "Solar Panels", "Marine Engines", "Water Pumps", "Construction", "Agricultural"].map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-white/30 text-xs">
          © {new Date().getFullYear()} MachineryStore. All rights reserved.
        </p>
      </div>

      {/* Right — form area */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-background min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(var(--primary))" }}
          >
            <Cog className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-extrabold tracking-wide"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "hsl(var(--primary))" }}
          >
            MACHINERYSTORE
          </span>
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
