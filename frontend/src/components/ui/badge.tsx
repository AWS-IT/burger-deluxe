import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-orange-100 text-orange-800 hover:bg-orange-200",
        secondary:
          "border-transparent bg-cream-100 text-brown-800 hover:bg-cream-200",
        destructive:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        outline: "text-foreground border-cream-300",
        new: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        popular: "border-transparent bg-orange-100 text-orange-800 hover:bg-orange-200",
        spicy: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        vegetarian: "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }