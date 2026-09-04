"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Database,
  FolderTree,
  Wrench,
  Users,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface MainNavbarProps {
  user: User | null;
}

export function MainNavbar({ user }: MainNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 font-bold tracking-tight text-base group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <Database className="h-5 w-5" />
          </div>
          <span className="text-foreground">App con Supabase</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/dashboard/categorias"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FolderTree className="h-4 w-4 text-blue-500" />
            Categorías
          </Link>
          <Link
            href="/dashboard/servicios"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Wrench className="h-4 w-4 text-emerald-500" />
            Servicios
          </Link>
          <Link
            href="/dashboard/usuarios"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Users className="h-4 w-4 text-purple-500" />
            Usuarios
          </Link>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeSwitcher />

          {user ? (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="rounded-xl shadow-sm gap-1.5">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-xl gap-1.5"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>Salir</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-xl">
                <Link href="/auth/login" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar Sesión</span>
                </Link>
              </Button>
              <Button asChild size="sm" variant="default" className="rounded-xl shadow-sm">
                <Link href="/auth/sign-up" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  <span>Registrarse</span>
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Right Controls: ThemeSwitcher + Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeSwitcher />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl p-2 text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            aria-label="Abrir menú de navegación"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1 pt-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
              Módulos
            </p>
            <Link
              href="/dashboard/categorias"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <FolderTree className="h-4 w-4" />
              </div>
              <span>Categorías</span>
            </Link>
            <Link
              href="/dashboard/servicios"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Wrench className="h-4 w-4" />
              </div>
              <span>Servicios</span>
            </Link>
            <Link
              href="/dashboard/usuarios"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <Users className="h-4 w-4" />
              </div>
              <span>Usuarios</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-border/60 space-y-2">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
              Cuenta
            </p>
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-xs text-muted-foreground truncate">
                  Conectado como: <strong className="text-foreground">{user.email}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild size="sm" className="rounded-xl w-full justify-center gap-1.5">
                    <Link href="/dashboard" onClick={closeMenu}>
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      closeMenu();
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="rounded-xl w-full justify-center gap-1.5 text-destructive hover:bg-destructive/10"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    <span>Salir</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-xl w-full justify-center gap-1.5">
                  <Link href="/auth/login" onClick={closeMenu}>
                    <LogIn className="h-4 w-4" />
                    <span>Iniciar Sesión</span>
                  </Link>
                </Button>
                <Button asChild size="sm" className="rounded-xl w-full justify-center gap-1.5">
                  <Link href="/auth/sign-up" onClick={closeMenu}>
                    <UserPlus className="h-4 w-4" />
                    <span>Registrarse</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
