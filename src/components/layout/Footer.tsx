import Link from "next/link";
import Image from "next/image";
import { Cog, Mail, Phone, MapPin, Link2 } from "lucide-react";

interface FooterProps {
  company: {
    name: string; email: string; phone: string; address: string;
    logo: string | null; description: string | null;
    facebook: string | null; twitter: string | null; tiktok: string | null;
    instagram: string | null; whatsApp: string | null;
  } | null;
}

const productCategories = [
  { label: "Generators", href: "/products?category=generators" },
  { label: "Solar Panels", href: "/products?category=solar-panels" },
  { label: "Marine Engines", href: "/products?category=marine-engines" },
  { label: "Water Pumps", href: "/products?category=pumps" },
  { label: "Construction Equipment", href: "/products?category=construction" },
  { label: "Agricultural Machines", href: "/products?category=agricultural" },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

export default function Footer({ company }: FooterProps) {
  const socials = [
    { label: "Facebook", href: company?.facebook },
    { label: "Twitter", href: company?.twitter },
    { label: "tiktok", href: company?.tiktok },
    { label: "Instagram", href: company?.instagram },
    { label: "whatsApp", href: company?.whatsApp },
  ].filter((s): s is { label: string; href: string } => !!s.href);

  return (
    <footer style={{ background: "hsl(var(--primary))", color: "white" }}>
      {/* Top strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4">
                  <Image src={'./logo.svg'} alt={'Global Machineries & Services'} width={40} height={40} className="rounded-lg brightness-200" />
                <span className="font-extrabold text-xl tracking-wide" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {company?.name?.toUpperCase() || "MACHINERYSTORE"}
                </span>
              </Link>

              {company?.description && (
                <p className="text-sm text-white/60 leading-relaxed mb-4">{company.description}</p>
              )}

              {socials.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socials.map(({ href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-orange-500 transition-colors text-xs text-white/70 hover:text-white"
                    >
                      <Link2 className="w-3 h-3" />
                      {label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Products */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-white/40">Products</h4>
              <ul className="space-y-2">
                {productCategories.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-white/40">Company</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-white/40">Contact</h4>
              <div className="space-y-3">
                {company?.email && (
                  <a href={`mailto:${company.email}`} className="flex items-start gap-3 text-sm text-white/70 hover:text-white transition-colors">
                    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-400" />
                    <span>{company.email}</span>
                  </a>
                )}
                {company?.phone && (
                  <a href={`tel:${company.phone}`} className="flex items-start gap-3 text-sm text-white/70 hover:text-white transition-colors">
                    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-400" />
                    <span>{company.phone}</span>
                  </a>
                )}
                {company?.address && (
                  <div className="flex items-start gap-3 text-sm text-white/70">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-400" />
                    <span>{company.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {company?.name || "MachineryStore"}. All rights reserved.</p>
          <p>Industrial Equipment Solutions</p>
        </div>
      </div>
    </footer>
  );
}
