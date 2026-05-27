import { create } from 'zustand';
import { Ranking } from '../types';
import {
  getRankings,
  createRanking,
  updateRanking,
  deleteRanking,
  CreateRankingInput,
  UpdateRankingInput,
} from '@/lib/api';

interface RankingsStore {
  rankings: Ranking[];
  isLoading: boolean;
  error: string | null;
  fetchRankings: () => Promise<void>;
  addRanking: (data: CreateRankingInput) => Promise<void>;
  updateRanking: (id: string, data: UpdateRankingInput) => Promise<void>;
  deleteRanking: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
}

const sortRankings = (rankings: Ranking[]) =>
  [...rankings].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

export const useRankingsStore = create<RankingsStore>((set, get) => ({
  rankings: [],
  isLoading: false,
  error: null,

  fetchRankings: async () => {
    set({ isLoading: true, error: null });
    try {
      const rankings = await getRankings();
      set({ rankings: sortRankings(rankings), isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  addRanking: async (data) => {
  set({ isLoading: true, error: null });
  try {
    await createRanking(data);
    const rankings = await getRankings();
    set({ rankings: sortRankings(rankings), isLoading: false });
  } catch (err) {
    set({ isLoading: false, error: (err as Error).message });
    throw err;
  }
},

  updateRanking: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await updateRanking(id, data);
      const rankings = await getRankings();
      set({ rankings: sortRankings(rankings), isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  deleteRanking: async (id) => {
    const previous = get().rankings;
    set((state) => ({ rankings: state.rankings.filter((r) => r.id !== id) }));
    try {
      await deleteRanking(id);
    } catch (err) {
      set({ rankings: previous, error: (err as Error).message });
      throw err;
    }
  },

  toggleFavorite: async (id) => {
    const ranking = get().rankings.find((r) => r.id === id);
    if (!ranking) return;
    set((state) => ({
      rankings: state.rankings.map((r) =>
        r.id === id ? { ...r, is_favorite: !r.is_favorite } : r
      ),
    }));
    try {
      await updateRanking(id, { is_favorite: !ranking.is_favorite });
    } catch (err) {
      set((state) => ({
        rankings: state.rankings.map((r) =>
          r.id === id ? { ...r, is_favorite: ranking.is_favorite } : r
        ),
        error: (err as Error).message,
      }));
    }
  },

  togglePinned: async (id) => {
    const ranking = get().rankings.find((r) => r.id === id);
    if (!ranking) return;
    const nextPinned = !ranking.is_pinned;
    set((state) => ({
      rankings: sortRankings(
        state.rankings.map((r) =>
          r.id === id ? { ...r, is_pinned: nextPinned } : r
        )
      ),
    }));
    try {
      await updateRanking(id, { is_pinned: nextPinned });
    } catch (err) {
      set((state) => ({
        rankings: sortRankings(
          state.rankings.map((r) =>
            r.id === id ? { ...r, is_pinned: ranking.is_pinned } : r
          )
        ),
        error: (err as Error).message,
      }));
    }
  },
}));
