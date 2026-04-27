import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Package, MessageSquare, ArrowRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    featured: boolean;
    inStock: boolean;
    category: { name: string; slug: string };
    _count?: { reviews: number; inquiries: number };
  };
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-border hover:border-primary/20 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        {product.featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-orange-500 text-white border-0 text-xs">
              <Star className="w-3 h-3 mr-1 fill-current" />Featured
            </Badge>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-foreground text-sm font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Link
            href={`/products?categoryId=${product.category.slug}`}
            className="text-xs font-semibold uppercase tracking-wider text-orange-500 hover:text-orange-600"
          >
            {product.category.name}
          </Link>
          {product._count && product._count.reviews > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {product._count.reviews}
            </span>
          )}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3
            className="font-bold text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem" }}
          >
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
          {product.description}
        </p>

        <Button asChild className="w-full mt-auto group/btn" size="sm">
          <Link href={`/products/${product.slug}`}>
            Request Information
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
