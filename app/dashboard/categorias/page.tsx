"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Categoria } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  FolderPlus,
  Calendar,
  Layers,
  Lock,
  LogIn,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);

  // Form states
  const [formNombre, setFormNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCategorias = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check auth state
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data, error: catError } = await supabase
        .from("categorias")
        .select("*")
        .order("id", { ascending: true });

      if (catError) throw catError;
      setCategorias(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar categorías");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const { error: insertError } = await supabase.from("categorias").insert([
        {
          nombre_categoria: formNombre.trim(),
        },
      ]);

      if (insertError) throw insertError;

      setFormNombre("");
      setIsCreateOpen(false);
      await fetchCategorias();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al crear la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoria || !formNombre.trim()) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const { error: updateError } = await supabase
        .from("categorias")
        .update({
          nombre_categoria: formNombre.trim(),
        })
        .eq("id", selectedCategoria.id);

      if (updateError) throw updateError;

      setIsEditOpen(false);
      setSelectedCategoria(null);
      setFormNombre("");
      await fetchCategorias();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al actualizar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategoria) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const { error: deleteError } = await supabase
        .from("categorias")
        .delete()
        .eq("id", selectedCategoria.id);

      if (deleteError) throw deleteError;

      setIsDeleteOpen(false);
      setSelectedCategoria(null);
      await fetchCategorias();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al eliminar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormNombre("");
    setActionError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (cat: Categoria) => {
    setSelectedCategoria(cat);
    setFormNombre(cat.nombre_categoria || "");
    setActionError(null);
    setIsEditOpen(true);
  };

  const openDeleteModal = (cat: Categoria) => {
    setSelectedCategoria(cat);
    setActionError(null);
    setIsDeleteOpen(true);
  };

  const filteredCategorias = categorias.filter((c) =>
    (c.nombre_categoria || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Guest Mode Banner */}
      {!currentUser && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400 text-sm">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              <strong>Modo de solo lectura:</strong> Estás visualizando las categorías públicas. Inicia sesión para crear, editar o eliminar registros.
            </span>
          </div>
          <Button asChild size="sm" className="rounded-xl shrink-0 shadow-sm">
            <Link href="/auth/login">
              <LogIn className="mr-1.5 h-3.5 w-3.5" /> Iniciar Sesión
            </Link>
          </Button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <FolderTree className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Categorías
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualiza, crea, edita y administra los registros de la tabla{" "}
            <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs font-mono">categorias</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCategorias}
            disabled={isLoading}
            className="rounded-xl"
            title="Refrescar"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          {/* Show 'Nueva Categoría' ONLY if authenticated */}
          {currentUser && (
            <Button
              onClick={openCreateModal}
              className="rounded-xl shadow-md"
              size="sm"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Nueva Categoría
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre de categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="text-xs text-muted-foreground ml-auto">
          Mostrando <strong>{filteredCategorias.length}</strong> de{" "}
          <strong>{categorias.length}</strong> registros
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Error al cargar datos</p>
            <p className="text-xs">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCategorias}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Table & Cards */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Cargando categorías...</p>
          </div>
        ) : filteredCategorias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
              <FolderPlus className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {searchTerm ? "No se encontraron coincidencias" : "No hay categorías registradas"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? `No hay resultados que coincidan con "${searchTerm}". Intenta otra búsqueda.`
                : "Aún no se han agregado categorías a la base de datos."}
            </p>
            {!searchTerm && currentUser && (
              <Button
                onClick={openCreateModal}
                size="sm"
                className="mt-4 rounded-xl"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Agregar primera categoría
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nombre de Categoría</th>
                  <th className="px-6 py-4">Fecha Creación</th>
                  {/* Show column 'Acciones' ONLY when authenticated */}
                  {currentUser && (
                    <th className="px-6 py-4 text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredCategorias.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-accent/40 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {cat.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5 font-medium text-foreground">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                          <Layers className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-semibold">{cat.nombre_categoria || "(Sin nombre)"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {cat.created_at
                          ? new Date(cat.created_at).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </div>
                    </td>
                    {/* Render action buttons ONLY when authenticated */}
                    {currentUser && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(cat)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(cat)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear Categoría (Solo accesible si está autenticado) */}
      {currentUser && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => !isSubmitting && setIsCreateOpen(false)}
          title="Crear Nueva Categoría"
          description="Ingresa los datos para registrar una nueva categoría en Supabase"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="create-nombre">Nombre de la Categoría</Label>
              <Input
                id="create-nombre"
                placeholder="Ej. Tecnología, Alfombras, Servicios..."
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  "Guardar Categoría"
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Editar Categoría */}
      {currentUser && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => !isSubmitting && setIsEditOpen(false)}
          title="Editar Categoría"
          description={`Modificando registro ID: ${selectedCategoria?.id}`}
        >
          <form onSubmit={handleEdit} className="space-y-4">
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre de la Categoría</Label>
              <Input
                id="edit-nombre"
                placeholder="Ej. Tecnología..."
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...
                  </>
                ) : (
                  "Actualizar Cambios"
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Confirmar Eliminación */}
      {currentUser && (
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => !isSubmitting && setIsDeleteOpen(false)}
          title="¿Eliminar Categoría?"
          description="Esta acción no se puede deshacer y borrará el registro de Supabase permanentemente."
          maxWidth="sm"
        >
          <div className="space-y-4">
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-sm">
              <p className="text-xs text-muted-foreground">Categoría a eliminar:</p>
              <p className="font-semibold text-foreground mt-0.5">
                {selectedCategoria?.nombre_categoria}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">
                ID: {selectedCategoria?.id}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
                  </>
                ) : (
                  "Sí, Eliminar"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
