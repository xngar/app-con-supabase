"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Wrench,
  Users,
  Database,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Panel General",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Categorías",
    href: "/dashboard/categorias",
    icon: FolderTree,
    badge: "Tabla",
  },
  {
    title: "Servicios",
    href: "/dashboard/servicios",
    icon: Wrench,
    badge: "Tabla",
  },
  {
    title: "Usuarios",
    href: "/dashboard/usuarios",
    icon: Users,
    badge: "Tabla",
  },
];

interface SidebarProps {
  onNavClick?: () => void;
  className?: string;
}

export function Sidebar({ onNavClick, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border/60 bg-card/60 backdrop-blur-md",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight">
              Supabase Hub
            </h1>
            <p className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Conectado
            </p>
          </div>
        </div>

        {onNavClick && (
          <button
            onClick={onNavClick}
            className="md:hidden rounded-xl p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div>
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Administración
          </p>
          <nav className="mt-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-110",
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="rounded-md bg-secondary/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4 opacity-75" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Project Info Card */}
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-1">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Proyecto Supabase</span>
          </div>
          <p className="text-[11px] text-muted-foreground break-all">
            ID: <code className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">bzqgnfhmegbekzwhnbha</code>
          </p>
          <a
            href="https://supabase.com/dashboard/project/bzqgnfhmegbekzwhnbha"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            Abrir Supabase Studio <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Footer info */}
      <div className="border-t border-border/60 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Next.js + Supabase CRUD
        </p>
      </div>
    </aside>
  );
}
