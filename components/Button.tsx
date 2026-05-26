import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-semibold tracking-[-0.005em] transition-all active:scale-[0.985] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[color-mix(in_oklch,var(--color-accent)_92%,black)] hover:shadow-[0_0_20px_color-mix(in_oklch,var(--color-accent)_40%,transparent)] shadow-md shadow-orange-500/10",
        secondary: "border-2 border-[color-mix(in_oklch,var(--color-ink)_22%,transparent)] bg-[color-mix(in_oklch,var(--color-band)_80%,transparent)] rounded-[var(--radius-lg)] hover:bg-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] hover:border-[color-mix(in_oklch,var(--color-accent)_45%,transparent)]",
        ghost: "hover:bg-[color-mix(in_oklch,var(--color-ink)_5%,transparent)]",
      },
      size: {
        default: "h-11 px-6 text-[15px] rounded-[var(--radius-md)]",
        lg: "h-[50px] px-7 text-base rounded-[var(--radius-md)]",
      },
    },
    compoundVariants: [
      { variant: "secondary", size: "default", className: "px-5 text-sm" },
      { variant: "secondary", size: "lg", className: "px-6 text-[15px]" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
