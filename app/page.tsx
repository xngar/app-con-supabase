import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import {
  Database,
  FolderTree,
  Wrench,
  Users,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { MainNavbar } from "@/components/main-navbar";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch real public categories and services
  const [{ data: categorias }, { data: servicios }] = await Promise.all([
    supabase.from("categorias").select("*").order("id", { ascending: true }),
    supabase.from("servicios").select("*").order("id", { ascending: true }),
  ]);

  const catList = categorias || [];
  const servList = servicios || [];

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top Main Navbar Responsive */}
      <MainNavbar user={user} />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-12 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary animate-in fade-in slide-in-from-top-4">
          <Sparkles className="h-3.5 w-3.5" />
          Conectado en Vivo a Supabase
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-[1.15]">
          Catálogo & Gestión de Datos con{" "}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 bg-clip-text text-transparent">
            Supabase
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Cualquier visitante puede ver el catálogo de <strong>Categorías</strong> y{" "}
          <strong>Servicios</strong> en tiempo real. Para crear, editar o eliminar registros,
          inicia sesión de forma segura.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {user ? (
            <Button asChild size="lg" className="rounded-2xl gap-2 text-base px-6 shadow-lg shadow-primary/20">
              <Link href="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                Ir al Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="rounded-2xl gap-2 text-base px-6 shadow-lg shadow-primary/20">
                <Link href="/auth/login">
                  <Lock className="h-4 w-4" />
                  Iniciar Sesión
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl text-base px-6">
                <Link href="/dashboard/categorias">
                  Ver Tablas Públicas
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Live Database Categories Preview */}
        <div className="w-full pt-8 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-blue-500" />
                Categorías en Supabase ({catList.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Registros activos leídos directamente desde la base de datos
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-xl text-primary text-xs">
              <Link href="/dashboard/categorias">
                Administrar <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {catList.length > 0 ? (
              catList.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm hover:border-primary/40 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      <Layers className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {cat.nombre_categoria}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        ID: {cat.id}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                    {cat.created_at ? new Date(cat.created_at).toLocaleDateString("es-ES") : ""}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No hay categorías cargadas aún.
              </div>
            )}
          </div>
        </div>

        {/* Feature Grid / Modules Preview */}
        <div className="w-full pt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4 text-left">
            Explorar Módulos
          </p>
          <div className="grid gap-6 sm:grid-cols-3 text-left">
            <Link
              href="/dashboard/categorias"
              className="group rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm hover:border-blue-500/50 hover:shadow-lg transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <FolderTree className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                Categorías ({catList.length})
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Visualiza y administra las categorías registradas en Supabase.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Ver tabla <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/dashboard/servicios"
              className="group rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm hover:border-emerald-500/50 hover:shadow-lg transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                Servicios ({servList.length})
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Visualiza los servicios y sus relaciones con usuarios y categorías.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Ver tabla <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/dashboard/usuarios"
              className="group rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm hover:border-purple-500/50 hover:shadow-lg transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                Usuarios
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Gestiona perfiles, nombres y correos de usuarios.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Ver tabla <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>

        {/* Supabase status badge */}
        <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/50 bg-secondary/30 px-4 py-2 text-xs text-muted-foreground break-all">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Proyecto ID:</span>
          <code className="font-mono font-semibold text-foreground break-all">bzqgnfhmegbekzwhnbha</code>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <p>Aplicacion Mantenimiento Usuarios</p>
      </footer>
    </main>
  );
}
