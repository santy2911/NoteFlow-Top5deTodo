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
}

export const useRankingsStore = create<RankingsStore>((set, get) => ({
  rankings: [],
  isLoading: false,
  error: null,

  fetchRankings: async () => {
    set({ isLoading: true, error: null });
    try {
      const rankings = await getRankings();
      set({ rankings, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  addRanking: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newRanking = await createRanking(data);
      set((state) => ({ rankings: [newRanking, ...state.rankings], isLoading: false }));
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  updateRanking: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateRanking(id, data);
      set((state) => ({
        rankings: state.rankings.map((r) => (r.id === id ? updated : r)),
        isLoading: false,
      }));
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
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
      ),
    }));
    try {
      await updateRanking(id, { isFavorite: !ranking.isFavorite });
    } catch (err) {
      set((state) => ({
        rankings: state.rankings.map((r) =>
          r.id === id ? { ...r, isFavorite: ranking.isFavorite } : r
        ),
        error: (err as Error).message,
      }));
    }
  },
}));