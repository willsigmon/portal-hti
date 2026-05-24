import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-display font-semibold tracking-[-0.01em] transition-all active:scale-[0.985] disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-accent)] text-white hover:bg-[color-mix(in_oklch,var(--color-accent)_92%,black)]",
        secondary: "border border-[color-mix(in_oklch,var(--color-ink)_15%,transparent)] hover:bg-[color-mix(in_oklch,var(--color-ink)_5%,transparent)]",
        ghost: "hover:bg-[color-mix(in_oklch,var(--color-ink)_5%,transparent)]",
      },
      size: {
        default: "h-11 px-6 text-[15px] rounded-[var(--radius-md)]",
        lg: "h-14 px-8 text-base rounded-[var(--radius-lg)]",
      },
    },
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
