"use client";

import { useState } from "react";
import Image from "next/image";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
        <Package className="w-20 h-20 text-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border group">
        <Image
          src={images[selected]}
          alt={`${name} - image ${selected + 1}`}
          fill
          className="object-cover transition-all duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelected((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelected((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={cn("w-2 h-2 rounded-full transition-all", i === selected ? "bg-white w-5" : "bg-white/50")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                i === selected ? "border-primary" : "border-transparent hover:border-primary/40"
              )}
            >
              <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
