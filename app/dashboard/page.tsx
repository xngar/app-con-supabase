import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  FolderTree,
  Wrench,
  Users,
  ArrowRight,
  Database,
  PlusCircle,
  Activity,
  CheckCircle,
  Lock,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const catQuery = user
    ? supabase.from("categorias").select("*", { count: "exact", head: true }).eq("user_id", user.id)
    : supabase.from("categorias").select("*", { count: "exact", head: true });

  // Fetch counts from all three tables
  const [
    { count: catCount },
    { count: servCount },
    { count: userCount },
  ] = await Promise.all([
    catQuery,
    supabase.from("servicios").select("*", { count: "exact", head: true }),
    supabase.from("usuarios").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    {
      title: "Categorías",
      description: "Gestiona y organiza las categorías del sistema",
      count: catCount ?? 0,
      icon: FolderTree,
      href: "/dashboard/categorias",
      color: "from-blue-500/20 via-blue-500/10 to-transparent",
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      accent: "text-blue-500",
    },
    {
      title: "Servicios",
      description: "Administra los servicios y sus asignaciones",
      count: servCount ?? 0,
      icon: Wrench,
      href: "/dashboard/servicios",
      color: "from-emerald-500/20 via-emerald-500/10 to-transparent",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      accent: "text-emerald-500",
    },
    {
      title: "Usuarios",
      description: "Visualiza y edita los perfiles de usuario registrados",
      count: userCount ?? 0,
      icon: Users,
      href: "/dashboard/usuarios",
      color: "from-purple-500/20 via-purple-500/10 to-transparent",
      badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      accent: "text-purple-500",
    },
  ];

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.nombre ||
    user?.email?.split("@")[0] ||
    "Invitado";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Activity className="h-3.5 w-3.5" />
              {user ? "Panel de Control" : "Modo Lectura"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              ¡Hola, {userName}! 👋
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              {user ? (
                <>
                  Aquí puedes ver y gestionar las tablas de Supabase en tiempo real:{" "}
                  <strong>Categorías</strong>, <strong>Servicios</strong> y{" "}
                  <strong>Usuarios</strong>.
                </>
              ) : (
                <>
                  Estás explorando los datos en <strong>modo lectura</strong>. Para agregar, modificar o eliminar registros, inicia sesión en tu cuenta.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <>
                <Button asChild size="sm" className="rounded-xl shadow-md">
                  <Link href="/dashboard/categorias">
                    <PlusCircle className="mr-1.5 h-4 w-4" />
                    Nueva Categoría
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link href="/dashboard/servicios">
                    <PlusCircle className="mr-1.5 h-4 w-4" />
                    Nuevo Servicio
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="rounded-xl shadow-md">
                <Link href="/auth/login">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Iniciar Sesión para Editar
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-lg"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
              />
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${card.badgeColor} border`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">
                    {card.count}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {card.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-primary">
                  <span>Ver tabla</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Status / Database Overview */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Estado de la Base de Datos
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500">
            <CheckCircle className="h-4 w-4" /> Supabase Activo
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-xl border border-border/40 bg-secondary/20 p-4">
            <p className="text-xs text-muted-foreground font-medium">Tabla</p>
            <p className="font-bold text-foreground mt-0.5">categorias</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Columnas: <code className="text-primary">id, nombre_categoria, created_at</code>
            </p>
          </div>

          <div className="rounded-xl border border-border/40 bg-secondary/20 p-4">
            <p className="text-xs text-muted-foreground font-medium">Tabla</p>
            <p className="font-bold text-foreground mt-0.5">servicios</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Columnas: <code className="text-primary">id, categoria_id, usuario_id, created_at</code>
            </p>
          </div>

          <div className="rounded-xl border border-border/40 bg-secondary/20 p-4">
            <p className="text-xs text-muted-foreground font-medium">Tabla</p>
            <p className="font-bold text-foreground mt-0.5">usuarios</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Columnas: <code className="text-primary">id, nombre, email, edad, image_url</code>
            </p>
          </div>

          <div className="rounded-xl border border-border/40 bg-secondary/20 p-4">
            <p className="text-xs text-muted-foreground font-medium">Tabla</p>
            <p className="font-bold text-foreground mt-0.5">operativo</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Columnas: <code className="text-primary">id, usuario_id, activo, updated_at</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
