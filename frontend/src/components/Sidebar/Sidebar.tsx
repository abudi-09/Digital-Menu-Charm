import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";
import {
  LogOut,
  X,
  Home,
  List,
  ShoppingCart,
  QrCode,
  Settings,
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { cn } from "@/lib/utils";

interface LinkDef {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const defaultLinks: LinkDef[] = [
  { key: "dashboard", label: "Dashboard", icon: <Home /> },
  { key: "menu_mgmt", label: "Menu Management", icon: <List /> },
  { key: "orders", label: "Orders", icon: <ShoppingCart /> },
  { key: "qr", label: "QR Management", icon: <QrCode /> },
  { key: "settings", label: "Settings", icon: <Settings /> },
];

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  // manage ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:w-64 md:flex md:flex-col md:overflow-y-auto md:bg-background md:py-6 md:px-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">
            GV
          </div>
          <div className="font-semibold text-lg">Grand Vista</div>
        </div>

        <nav
          role="navigation"
          aria-label="Main navigation"
          className="mt-6 flex-1 px-2"
        >
          {defaultLinks.map((l) => (
            <SidebarItem key={l.key} label={l.label} icon={l.icon} />
          ))}
        </nav>

        <div className="mt-auto px-2">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/50">
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>
            <motion.div
              className="fixed inset-0 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
              />

              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation drawer"
                className={cn(
                  "relative h-full w-[70%] max-w-xs bg-background p-4 shadow-lg rounded-r-2xl"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">
                      GV
                    </div>
                    <div className="font-semibold">Grand Vista</div>
                  </div>
                  <button
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="p-2 rounded-md"
                  >
                    <X />
                  </button>
                </div>

                <nav
                  role="navigation"
                  aria-label="Mobile navigation"
                  className="mt-6 flex flex-col gap-2"
                >
                  {defaultLinks.map((l) => (
                    <SidebarItem
                      key={l.key}
                      label={l.label}
                      icon={l.icon}
                      onClick={() => {
                        l.onClick?.();
                        onClose?.();
                      }}
                    />
                  ))}
                </nav>

                <div className="mt-auto">
                  <button
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/50"
                    onClick={onClose}
                  >
                    <LogOut />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.aside>
            </motion.div>
          </FocusTrap>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
