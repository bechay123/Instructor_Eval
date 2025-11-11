import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344F1F] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#344F1F] text-[#F2EAD3] shadow-md hover:shadow-lg hover:bg-[#F4991A] hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-red-600 text-white shadow-md hover:shadow-lg hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border border-[#344F1F]/20 bg-white shadow-sm hover:bg-[#F9F5F0] hover:border-[#344F1F]/40 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-[#F4991A] text-white shadow-md hover:shadow-lg hover:bg-[#344F1F] hover:-translate-y-0.5 active:translate-y-0",
        ghost: "hover:bg-[#F9F5F0] hover:text-[#344F1F]",
        link: "text-[#344F1F] underline-offset-4 hover:underline hover:text-[#F4991A]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
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
