import { create } from 'zustand';
import { Ranking } from '../types';

interface RankingsStore {
  rankings: Ranking[];
  addRanking: (ranking: Ranking) => void;
  updateRanking: (id: string, updated: Partial<Ranking>) => void;
  deleteRanking: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

export const useRankingsStore = create<RankingsStore>((set) => ({
  rankings: [],
  addRanking: (ranking) =>
    set((state) => ({ rankings: [...state.rankings, ranking] })),
  updateRanking: (id, updated) =>
    set((state) => ({
      rankings: state.rankings.map((r) =>
        r.id === id ? { ...r, ...updated } : r
      ),
    })),
  deleteRanking: (id) =>
    set((state) => ({
      rankings: state.rankings.filter((r) => r.id !== id),
    })),
  toggleFavorite: (id) =>
    set((state) => ({
      rankings: state.rankings.map((r) =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
      ),
    })),
}));