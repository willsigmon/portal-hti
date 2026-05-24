import { cn } from "@/lib/utils";

interface PhotoProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  aspect?: "landscape" | "portrait" | "square";
}

export function Photo({ src, alt, caption, className, aspect = "landscape" }: PhotoProps) {
  const aspectClass = {
    landscape: "aspect-[16/10]",
    portrait: "aspect-[4/5]",
    square: "aspect-square",
  }[aspect];

  return (
    <figure className={cn("group overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)]", className)}>
      <div className={cn("relative w-full overflow-hidden", aspectClass)}>
        {/* Real photography direction: Use warm, honest HTI distribution photos.
            Subtle contrast boost + slight grain in CSS for texture without looking processed. */}
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.015] [image-rendering:optimizeQuality]"
        />
        {/* Very subtle grain overlay for premium texture per Design Bible */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27 viewBox=%270 0 100 100%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%27 height=%27100%27 filter=%27url(%23n)%27 opacity=%270.035%27/%3E%3C/svg%27')] mix-blend-multiply pointer-events-none" />
      </div>
      {caption && (
        <figcaption className="px-4 py-3 text-sm text-[var(--color-muted)] border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
