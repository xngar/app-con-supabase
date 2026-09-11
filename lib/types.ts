export interface Categoria {
  id: string | number;
  user_id?: string;
  nombre_categoria: string;
  created_at?: string;
}

export interface Usuario {
  id: string | number;
  nombre: string;
  edad?: number | string | null;
  email: string;
  created_at?: string;
  image_url?: string | null;
  operativo?: Operativo | Operativo[] | null;
}

export interface Operativo {
  id: string | number;
  usuario_id: string | number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  usuarios?: Usuario | null;
}

export interface Servicio {
  id: string | number;
  categoria_id: string | number;
  usuario_id: string | number;
  created_at?: string;
  // Campos embebidos o relacionados para visualización
  categorias?: Categoria | null;
  usuarios?: Usuario | null;
}

