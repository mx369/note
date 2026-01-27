import { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export const Textarea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      "w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-primary",
      className
    )}
    {...props}
  />
);
