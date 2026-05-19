import { Ranking } from '@/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface CreateRankingInput {
  title: string;
  category: string;
  is_favorite?: boolean;
  items: Array<{
    position: number;
    name: string;
  }>;
}

export interface UpdateRankingInput {
  title?: string;
  category?: string;
  is_favorite?: boolean;
  items?: Array<{
    position: number;
    name: string;
  }>;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
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