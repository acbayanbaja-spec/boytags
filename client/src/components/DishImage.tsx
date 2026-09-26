import React, { useState, useEffect } from "react";
import { Flame, Utensils, Sparkles } from "lucide-react";

interface DishImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  className?: string;
  category?: string;
  fallbackIcon?: "chicken" | "grill" | "rice" | "drink" | "dessert" | "general";
}

/**
 * World-Class Dish Image component with:
 * 1. Automatic fallback handling (NEVER displays a broken browser icon)
 * 2. Elegant shimmer placeholder while loading
 * 3. Graceful SVG culinary artwork when offline or image link is unreachable
 * 4. Smooth image zoom and opacity transition
 */
export function DishImage({
  src,
  alt,
  className = "",
  category,
  fallbackIcon = "general",
  ...props
}: DishImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Normalize image source: if it matches old broken Unsplash URLs, redirect to local image
  const resolvedSrc = React.useMemo(() => {
    if (!src) return "";
    const s = src.trim();
    if (s.includes("1598103442097-8b70429476eb")) return "/images/dishes/whole-lechon.jpg";
    if (s.includes("1544025162-d76690232f46")) return "/images/dishes/liempo.jpg";
    if (s.includes("1516684738272-bd2d19e0a4aa")) return "/images/dishes/java-rice.jpg";
    if (s.includes("1544145945-f9049b5f6440")) return "/images/dishes/calamansi.jpg";
    return s;
  }, [src]);

  const [imgSrc, setImgSrc] = useState(resolvedSrc);

  useEffect(() => {
    setImgSrc(resolvedSrc);
    setError(false);
  }, [resolvedSrc]);

  // Determine appropriate backup illustration based on dish name/category
  const determineIcon = () => {
    const text = `${alt} ${category || ""}`.toLowerCase();
    if (text.includes("lechon") || text.includes("chicken") || text.includes("inasal") || text.includes("manok")) {
      return "chicken";
    }
    if (text.includes("liempo") || text.includes("pork") || text.includes("sisig") || text.includes("grill") || text.includes("bilao")) {
      return "grill";
    }
    if (text.includes("rice") || text.includes("garlic") || text.includes("java")) {
      return "rice";
    }
    if (text.includes("juice") || text.includes("drink") || text.includes("calamansi") || text.includes("beer") || text.includes("sago")) {
      return "drink";
    }
    if (text.includes("halo") || text.includes("pandan") || text.includes("dessert")) {
      return "dessert";
    }
    return fallbackIcon;
  };

  const currentIcon = determineIcon();

  if (error || !imgSrc) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#2a170e] via-[#1f0e07] to-[#120703] text-amber-200 select-none p-4 ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-roast/20 blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center gap-1.5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-roast/25 border border-amber-500/30 text-amber-300 shadow-inner">
            {currentIcon === "chicken" || currentIcon === "grill" ? (
              <Flame className="h-6 w-6 text-roast animate-pulse" />
            ) : currentIcon === "drink" || currentIcon === "dessert" ? (
              <Sparkles className="h-6 w-6 text-amber-400" />
            ) : (
              <Utensils className="h-6 w-6 text-amber-300" />
            )}
          </div>
          <span className="display font-bold text-xs tracking-wide text-white line-clamp-1 max-w-[90%]">
            {alt}
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-400/80">
            Boytag's Kitchen Fresh
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-cream ${className}`}>
      {/* Shimmer skeleton while image loads */}
      {!loaded && (
        <div className="absolute inset-0 shimmer bg-gradient-to-r from-cream via-amber-100/40 to-cream" />
      )}

      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          // If a remote image failed, try local fallback first
          if (!imgSrc.startsWith("/images/dishes/")) {
            const lower = alt.toLowerCase();
            if (lower.includes("whole")) {
              setImgSrc("/images/dishes/whole-lechon.jpg");
              return;
            }
            if (lower.includes("half")) {
              setImgSrc("/images/dishes/half-lechon.jpg");
              return;
            }
            if (lower.includes("liempo")) {
              setImgSrc("/images/dishes/liempo.jpg");
              return;
            }
            if (lower.includes("inasal")) {
              setImgSrc("/images/dishes/inasal.jpg");
              return;
            }
            if (lower.includes("fried")) {
              setImgSrc("/images/dishes/fried.jpg");
              return;
            }
            if (lower.includes("java")) {
              setImgSrc("/images/dishes/java-rice.jpg");
              return;
            }
            if (lower.includes("garlic")) {
              setImgSrc("/images/dishes/garlic-rice.jpg");
              return;
            }
            if (lower.includes("calamansi")) {
              setImgSrc("/images/dishes/calamansi.jpg");
              return;
            }
            if (lower.includes("sago")) {
              setImgSrc("/images/dishes/sago.jpg");
              return;
            }
          }
          setError(true);
        }}
        className={`h-full w-full object-cover transition-all duration-500 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        {...props}
      />
    </div>
  );
}
