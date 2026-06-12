import { Ranking, Nota, Bloque } from '@/types';
import { getAuth, getIdToken } from '@react-native-firebase/auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface CreateRankingInput {
  title: string;
  category: string;
  is_favorite?: boolean;
  is_pinned?: boolean;
  items: Array<{
    position: number;
    name: string;
  }>;
}

export interface UpdateRankingInput {
  title?: string;
  category?: string;
  is_favorite?: boolean;
  is_pinned?: boolean;
  items?: Array<{
    position: number;
    name: string;
  }>;
}

export interface CreateNotaInput {
  titulo: string;
  contenido: string;
  tiene_checklist?: boolean;
  is_pinned?: boolean;
  imagen_uri?: string | null;
  checklist?: Array<{
    texto: string;
    completado: boolean;
  }>;
  bloques?: Bloque[];
}

export interface UpdateNotaInput {
  titulo?: string;
  contenido?: string;
  tiene_checklist?: boolean;
  is_pinned?: boolean;
  imagen_uri?: string | null;
  checklist?: Array<{
    texto: string;
    completado: boolean;
  }>;
  bloques?: Bloque[];
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const auth = getAuth();
  const usuario = auth.currentUser;
  const token = usuario ? await getIdToken(usuario) : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function getRankings(): Promise<Ranking[]> {
  return apiFetch<Ranking[]>('/rankings');
}

export async function createRanking(data: CreateRankingInput): Promise<Ranking> {
  return apiFetch<Ranking>('/rankings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRanking(id: string, data: UpdateRankingInput): Promise<Ranking> {
  return apiFetch<Ranking>(`/rankings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteRanking(id: string): Promise<void> {
  return apiFetch<void>(`/rankings/${id}`, { method: 'DELETE' });
}

export async function getNotas(): Promise<Nota[]> {
  return apiFetch<Nota[]>('/notas');
}

export async function getNota(id: string): Promise<Nota> {
  return apiFetch<Nota>(`/notas/${id}`);
}

export async function createNota(data: CreateNotaInput): Promise<Nota> {
  return apiFetch<Nota>('/notas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateNota(id: string, data: UpdateNotaInput): Promise<Nota> {
  return apiFetch<Nota>(`/notas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteNota(id: string): Promise<void> {
  return apiFetch<void>(`/notas/${id}`, { method: 'DELETE' });
}