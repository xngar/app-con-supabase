"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Servicio, Categoria, Usuario } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  FolderTree,
  User,
  Calendar,
  Lock,
  LogIn,
  Shield,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);

  // Form states
  const [formCategoriaId, setFormCategoriaId] = useState<string>("");
  const [formUsuarioId, setFormUsuarioId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch servicios, categorias, and usuarios
      const [
        { data: servData, error: servError },
        { data: catData },
        { data: userData },
      ] = await Promise.all([
        supabase.from("servicios").select("*").order("id", { ascending: true }),
        supabase.from("categorias").select("*"),
        supabase.from("usuarios").select("*"),
      ]);

      if (servError) throw servError;

      const cats = catData || [];
      const users = userData || [];

      setCategorias(cats);
      setUsuarios(users);

      // Find db user matching current logged in auth user
      if (user?.email) {
        const found = users.find((u) => u.email?.toLowerCase() === user.email?.toLowerCase());
        setDbUser(found || null);
      } else {
        setDbUser(null);
      }

      const mappedServicios: Servicio[] = (servData || []).map((s) => {
        const cat = cats.find((c) => String(c.id) === String(s.categoria_id));
        const usr = users.find((u) => String(u.id) === String(s.usuario_id));
        return {
          ...s,
          categorias: cat || null,
          usuarios: usr || null,
        };
      });

      setServicios(mappedServicios);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar los servicios");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoriaId || !formUsuarioId) {
      setActionError("Por favor selecciona una categoría y un usuario");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const { error: insertError } = await supabase.from("servicios").insert([
        {
          categoria_id: formCategoriaId,
          usuario_id: formUsuarioId,
        },
      ]);

      if (insertError) throw insertError;

      setFormCategoriaId("");
      setFormUsuarioId("");
      setIsCreateOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al registrar el servicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServicio || !formCategoriaId || !formUsuarioId) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const { error: updateError } = await supabase
        .from("servicios")
        .update({
          categoria_id: formCategoriaId,
          usuario_id: formUsuarioId,
        })
        .eq("id", selectedServicio.id);

      if (updateError) throw updateError;

      setIsEditOpen(false);
      setSelectedServicio(null);
      setFormCategoriaId("");
      setFormUsuarioId("");
      await fetchData();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al actualizar el servicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedServicio) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const { error: deleteError } = await supabase
        .from("servicios")
        .delete()
        .eq("id", selectedServicio.id);

      if (deleteError) throw deleteError;

      setIsDeleteOpen(false);
      setSelectedServicio(null);
      await fetchData();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al eliminar el servicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormCategoriaId(categorias[0]?.id ? String(categorias[0].id) : "");
    // Default to current logged-in user ID
    setFormUsuarioId(dbUser?.id ? String(dbUser.id) : (usuarios[0]?.id ? String(usuarios[0].id) : ""));
    setActionError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (serv: Servicio) => {
    setSelectedServicio(serv);
    setFormCategoriaId(String(serv.categoria_id || ""));
    setFormUsuarioId(String(serv.usuario_id || ""));
    setActionError(null);
    setIsEditOpen(true);
  };

  const openDeleteModal = (serv: Servicio) => {
    setSelectedServicio(serv);
    setActionError(null);
    setIsDeleteOpen(true);
  };

  const filteredServicios = servicios.filter((s) => {
    const search = searchTerm.toLowerCase();
    const catName = (s.categorias?.nombre_categoria || "").toLowerCase();
    const userName = (s.usuarios?.nombre || "").toLowerCase();
    const userEmail = (s.usuarios?.email || "").toLowerCase();
    const servId = String(s.id).toLowerCase();
    return (
      catName.includes(search) ||
      userName.includes(search) ||
      userEmail.includes(search) ||
      servId.includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Guest Mode Banner */}
      {!currentUser ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400 text-sm">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              <strong>Modo de solo lectura:</strong> Estás visualizando los servicios públicos. Inicia sesión para registrar o administrar tus servicios.
            </span>
          </div>
          <Button asChild size="sm" className="rounded-xl shrink-0 shadow-sm">
            <Link href="/auth/login">
              <LogIn className="mr-1.5 h-3.5 w-3.5" /> Iniciar Sesión
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
          <Shield className="h-4 w-4 shrink-0" />
          <span>
            <strong>Control por Propietario Activo:</strong> Puedes crear servicios y editar o borrar únicamente los servicios vinculados a tu cuenta (<strong>{currentUser.email}</strong>).
          </span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Wrench className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Servicios
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualiza, vincula y administra los servicios registrados en la base de datos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="rounded-xl"
            title="Refrescar"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          {currentUser && (
            <Button
              onClick={openCreateModal}
              className="rounded-xl shadow-md"
              size="sm"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Nuevo Servicio
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por categoría, usuario o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="text-xs text-muted-foreground ml-auto">
          Mostrando <strong>{filteredServicios.length}</strong> de{" "}
          <strong>{servicios.length}</strong> registros
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
          <Button variant="outline" size="sm" onClick={fetchData}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Cargando servicios...</p>
          </div>
        ) : filteredServicios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
              <Wrench className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {searchTerm ? "No se encontraron coincidencias" : "No hay servicios registrados"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? `No hay resultados que coincidan con "${searchTerm}".`
                : "Aún no hay servicios registrados en la base de datos."}
            </p>
            {!searchTerm && currentUser && (
              <Button
                onClick={openCreateModal}
                size="sm"
                className="mt-4 rounded-xl"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Agregar primer servicio
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID Servicio</th>
                  <th className="px-6 py-4">Categoría Asignada</th>
                  <th className="px-6 py-4">Usuario Responsable</th>
                  <th className="px-6 py-4">Fecha Creación</th>
                  {currentUser && (
                    <th className="px-6 py-4 text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredServicios.map((serv) => {
                  // Ownership check: Is this service owned by the logged-in user?
                  const isOwner =
                    currentUser &&
                    (
                      (dbUser && String(serv.usuario_id) === String(dbUser.id)) ||
                      (serv.usuarios?.email && serv.usuarios.email.toLowerCase() === currentUser.email?.toLowerCase())
                    );

                  return (
                    <tr
                      key={serv.id}
                      className="hover:bg-accent/40 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {serv.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                            <FolderTree className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <p className="font-semibold text-foreground">
                              {serv.categorias?.nombre_categoria || `ID: ${serv.categoria_id}`}
                            </p>
                            {serv.categorias?.nombre_categoria && (
                              <p className="text-[11px] font-mono text-muted-foreground">
                                Cat ID: {serv.categoria_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 font-bold text-xs uppercase">
                            {serv.usuarios?.nombre?.charAt(0) || <User className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-foreground">
                                {serv.usuarios?.nombre || "Usuario"}
                              </p>
                              {isOwner && (
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium px-1.5 py-0.2 rounded-md">
                                  Tuyo
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {serv.usuarios?.email || `User ID: ${serv.usuario_id}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {serv.created_at
                            ? new Date(serv.created_at).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </div>
                      </td>

                      {/* Action buttons: ONLY shown if the user is the OWNER */}
                      {currentUser && (
                        <td className="px-6 py-4 text-right">
                          {isOwner ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(serv)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                                title="Editar mi servicio"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteModal(serv)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                title="Eliminar mi servicio"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/50 italic">
                              Solo lectura
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear Servicio */}
      {currentUser && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => !isSubmitting && setIsCreateOpen(false)}
          title="Crear Nuevo Servicio"
          description="Selecciona la categoría para registrar tu servicio"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="create-categoria">Categoría</Label>
              {categorias.length > 0 ? (
                <select
                  id="create-categoria"
                  value={formCategoriaId}
                  onChange={(e) => setFormCategoriaId(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre_categoria} (ID: {c.id})
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="create-categoria"
                  placeholder="Ingresa categoria_id (ej. 1)"
                  value={formCategoriaId}
                  onChange={(e) => setFormCategoriaId(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-usuario">Usuario Responsable (Tú)</Label>
              {dbUser ? (
                <div className="rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground flex items-center justify-between">
                  <span>{dbUser.nombre} ({dbUser.email})</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">ID: {dbUser.id}</span>
                </div>
              ) : (
                <select
                  id="create-usuario"
                  value={formUsuarioId}
                  onChange={(e) => setFormUsuarioId(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} - {u.email}
                    </option>
                  ))}
                </select>
              )}
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
                  "Guardar Servicio"
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Editar Servicio */}
      {currentUser && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => !isSubmitting && setIsEditOpen(false)}
          title="Editar Servicio"
          description={`Modificando servicio ID: ${selectedServicio?.id}`}
        >
          <form onSubmit={handleEdit} className="space-y-4">
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-categoria">Categoría</Label>
              {categorias.length > 0 ? (
                <select
                  id="edit-categoria"
                  value={formCategoriaId}
                  onChange={(e) => setFormCategoriaId(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre_categoria} (ID: {c.id})
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="edit-categoria"
                  placeholder="categoria_id"
                  value={formCategoriaId}
                  onChange={(e) => setFormCategoriaId(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              )}
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
          title="¿Eliminar Servicio?"
          description="Esta acción borrará el registro de servicio de la base de datos de Supabase."
          maxWidth="sm"
        >
          <div className="space-y-4">
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-sm space-y-1">
              <p className="text-xs text-muted-foreground">Servicio ID: {selectedServicio?.id}</p>
              <p className="font-medium text-foreground">
                Categoría: {selectedServicio?.categorias?.nombre_categoria || selectedServicio?.categoria_id}
              </p>
              <p className="text-xs text-muted-foreground">
                Usuario: {selectedServicio?.usuarios?.nombre || selectedServicio?.usuario_id}
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
