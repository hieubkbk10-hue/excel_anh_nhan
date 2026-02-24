import * as React from "react"
import { cn } from "../../lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorColor?: string;
  height?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorColor = "bg-primary", height = "h-2", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-secondary",
        height,
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full w-full flex-1 transition-all", indicatorColor)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }
