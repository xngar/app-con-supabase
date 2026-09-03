"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Loader2,
  ExternalLink,
  LogIn,
  Eye,
} from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
  user: User | null;
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export function Header({ user, onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.nombre ||
    user?.email?.split("@")[0] ||
    null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex items-center gap-1"
          >
            Inicio <ExternalLink className="h-3 w-3" />
          </Link>
          <span className="text-muted-foreground hidden sm:inline">/</span>
          <span className="text-sm font-semibold text-foreground">Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeSwitcher />

        {user ? (
          /* Logged-in user profile */
          <div className="flex items-center gap-3 pl-2 border-l border-border/60">
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {user.email}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase border border-primary/20">
              {displayName?.charAt(0) || <UserIcon className="h-4 w-4" />}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Cerrar sesión"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-1.5 text-xs font-medium">
                Salir
              </span>
            </Button>
          </div>
        ) : (
          /* Guest mode */
          <div className="flex items-center gap-2 pl-2 border-l border-border/60">
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full border border-amber-500/20">
              <Eye className="h-3 w-3" /> Modo Lectura
            </span>
            <Button asChild size="sm" className="rounded-xl shadow-sm">
              <Link href="/auth/login" className="gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                <span>Ingresar</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
