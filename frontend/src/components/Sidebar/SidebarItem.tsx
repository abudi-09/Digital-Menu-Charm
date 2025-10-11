import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SidebarItemProps {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const SidebarItem = ({
  label,
  icon,
  active,
  onClick,
}: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        active ? "text-primary font-semibold" : "text-foreground"
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="flex-1">{label}</span>
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary"
        />
      )}
    </button>
  );
};

export default SidebarItem;
