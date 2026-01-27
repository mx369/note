import { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-primary",
      className
    )}
    {...props}
  />
);
