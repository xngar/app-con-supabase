"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Usuario } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Mail,
  User as UserIcon,
  Image as ImageIcon,
  Lock,
  LogIn,
  Hash,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Form states
  const [formNombre, setFormNombre] = useState("");
  const [formEdad, setFormEdad] = useState<string>("18");
  const [formEmail, setFormEmail] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data, error: usrError } = await supabase
        .from("usuarios")
        .select("*")
        .order("id", { ascending: true });

      if (usrError) throw usrError;
      setUsuarios(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formEmail.trim()) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const { error: insertError } = await supabase.from("usuarios").insert([
        {
          nombre: formNombre.trim(),
          edad: formEdad ? parseInt(formEdad, 10) : 18,
          email: formEmail.trim(),
          image_url: formImageUrl.trim() || "",
        },
      ]);

      if (insertError) throw insertError;

      setFormNombre("");
      setFormEdad("18");
      setFormEmail("");
      setFormImageUrl("");
      setIsCreateOpen(false);
      await fetchUsuarios();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al registrar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario || !formNombre.trim() || !formEmail.trim()) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({
          nombre: formNombre.trim(),
          edad: formEdad ? parseInt(formEdad, 10) : 18,
          email: formEmail.trim(),
          image_url: formImageUrl.trim() || "",
        })
        .eq("id", selectedUsuario.id);

      if (updateError) throw updateError;

      setIsEditOpen(false);
      setSelectedUsuario(null);
      setFormNombre("");
      setFormEdad("18");
      setFormEmail("");
      setFormImageUrl("");
      await fetchUsuarios();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al actualizar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUsuario) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const { error: deleteError } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", selectedUsuario.id);

      if (deleteError) throw deleteError;

      setIsDeleteOpen(false);
      setSelectedUsuario(null);
      await fetchUsuarios();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al eliminar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormNombre("");
    setFormEdad("18");
    setFormEmail("");
    setFormImageUrl("");
    setActionError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (usr: Usuario) => {
    setSelectedUsuario(usr);
    setFormNombre(usr.nombre || "");
    setFormEdad(usr.edad ? String(usr.edad) : "18");
    setFormEmail(usr.email || "");
    setFormImageUrl(usr.image_url || "");
    setActionError(null);
    setIsEditOpen(true);
  };

  const openDeleteModal = (usr: Usuario) => {
    setSelectedUsuario(usr);
    setActionError(null);
    setIsDeleteOpen(true);
  };

  const filteredUsuarios = usuarios.filter((u) => {
    const search = searchTerm.toLowerCase();
    const name = (u.nombre || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const id = String(u.id).toLowerCase();
    return name.includes(search) || email.includes(search) || id.includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Guest Mode Banner */}
      {!currentUser && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400 text-sm">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              <strong>Modo de solo lectura:</strong> Estás visualizando los usuarios en modo invitado. Inicia sesión para administrar perfiles.
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
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Usuarios
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualiza, crea, edita y administra los registros de la tabla{" "}
            <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs font-mono">usuarios</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsuarios}
            disabled={isLoading}
            className="rounded-xl"
            title="Refrescar"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          {/* Show 'Nuevo Usuario' ONLY if authenticated */}
          {currentUser && (
            <Button
              onClick={openCreateModal}
              className="rounded-xl shadow-md"
              size="sm"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Nuevo Usuario
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="text-xs text-muted-foreground ml-auto">
          Mostrando <strong>{filteredUsuarios.length}</strong> de{" "}
          <strong>{usuarios.length}</strong> registros
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
          <Button variant="outline" size="sm" onClick={fetchUsuarios}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Cargando usuarios...</p>
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-3">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {searchTerm ? "No se encontraron coincidencias" : "No hay usuarios registrados en la tabla"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? `No hay resultados que coincidan con "${searchTerm}".`
                : "Aún no hay usuarios agregados en la base de datos."}
            </p>
            {!searchTerm && currentUser && (
              <Button
                onClick={openCreateModal}
                size="sm"
                className="mt-4 rounded-xl"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Agregar primer usuario
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Usuario / Nombre</th>
                  <th className="px-6 py-4">Edad</th>
                  <th className="px-6 py-4">Correo Electrónico</th>
                  {/* Show column 'Acciones' ONLY when authenticated */}
                  {currentUser && (
                    <th className="px-6 py-4 text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredUsuarios.map((usr) => (
                  <tr
                    key={usr.id}
                    className="hover:bg-accent/40 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {usr.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {usr.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={usr.image_url}
                            alt={usr.nombre || "Avatar"}
                            className="h-9 w-9 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 font-bold text-xs uppercase border border-purple-500/20">
                            {usr.nombre?.charAt(0) || <UserIcon className="h-4 w-4" />}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground">
                            {usr.nombre || "(Sin nombre)"}
                          </p>
                          <p className="text-[11px] text-muted-foreground md:hidden">
                            {usr.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-foreground">
                      {usr.edad ? `${usr.edad} años` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>{usr.email || "—"}</span>
                      </div>
                    </td>
                    {/* Render action buttons ONLY when authenticated */}
                    {currentUser && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(usr)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(usr)}
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

      {/* Modal: Crear Usuario */}
      {currentUser && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => !isSubmitting && setIsCreateOpen(false)}
          title="Crear Nuevo Usuario"
          description="Ingresa los datos para registrar un usuario en la tabla 'usuarios'"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="create-user-nombre">Nombre Completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="create-user-nombre"
                  placeholder="Ej. María García"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="create-user-edad">Edad</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="create-user-edad"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="18"
                    value={formEdad}
                    onChange={(e) => setFormEdad(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-user-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="create-user-email"
                    type="email"
                    placeholder="maria@ejemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-user-image">URL de Imagen / Avatar (Opcional)</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="create-user-image"
                  type="url"
                  placeholder="https://ejemplo.com/avatar.jpg"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-9"
                />
              </div>
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
                  "Guardar Usuario"
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Editar Usuario */}
      {currentUser && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => !isSubmitting && setIsEditOpen(false)}
          title="Editar Usuario"
          description={`Modificando registro ID: ${selectedUsuario?.id}`}
        >
          <form onSubmit={handleEdit} className="space-y-4">
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-user-nombre">Nombre Completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-user-nombre"
                  placeholder="Ej. María García"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-user-edad">Edad</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-user-edad"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="18"
                    value={formEdad}
                    onChange={(e) => setFormEdad(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-user-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-user-email"
                    type="email"
                    placeholder="maria@ejemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-user-image">URL de Imagen / Avatar</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-user-image"
                  type="url"
                  placeholder="https://ejemplo.com/avatar.jpg"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-9"
                />
              </div>
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
          title="¿Eliminar Usuario?"
          description="Esta acción eliminará el registro de la tabla de usuarios de Supabase."
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
              <p className="font-semibold text-foreground">
                {selectedUsuario?.nombre}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedUsuario?.email}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground">
                ID: {selectedUsuario?.id}
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
