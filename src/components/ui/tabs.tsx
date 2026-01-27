import { ReactNode } from "react";
import { cn } from "../../utils/cn";

export const Tabs = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("flex gap-2 border-b border-border", className)}>{children}</div>
);

export const Tab = ({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "border-b-2 px-3 py-2 text-sm font-medium transition",
      active ? "border-primary text-primary" : "border-transparent text-muted-foreground"
    )}
  >
    {children}
  </button>
);
