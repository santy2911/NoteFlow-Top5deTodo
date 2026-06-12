export interface RankingItem {
  id: string;
  name: string;
  position: number;
}

export interface Ranking {
  id: string;
  title: string;
  category: string;
  is_favorite: boolean;
  is_pinned: boolean;
  items: [RankingItem, RankingItem, RankingItem, RankingItem, RankingItem];
  created_at: string;
  updated_at: string;
}

export interface ItemChecklist {
  id: string;
  texto: string;
  completado: boolean;
}

export type TipoBloque = 'texto' | 'checklist';

export interface Bloque {
  id: string;
  tipo: TipoBloque;
  contenido: string;
  completado?: boolean;
  subrayado?: boolean;
  esChecklist?: boolean;
}

export interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  tieneChecklist: boolean;
  is_pinned: boolean;
  checklist: ItemChecklist[];
  bloques: Bloque[];
  imagenUri: string | null;
  created_at: string;
  updated_at: string;
}
