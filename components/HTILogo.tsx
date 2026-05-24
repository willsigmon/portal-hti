// Uses the actual official logo image you provided.
// Place your logo file in /public as hti-official-logo.png

export function HTILogo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <img
      src="/hti-official-logo.png"
      alt="HUBZone Technology Initiative"
      className={className}
    />
  );
}
