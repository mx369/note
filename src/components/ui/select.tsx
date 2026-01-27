import { ReactNode } from "react";
import { cn } from "../../utils/cn";

export const Select = ({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) => (
  <select
    className={cn(
      "w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-primary",
      className
    )}
    {...props}
  >
    {children}
  </select>
);
