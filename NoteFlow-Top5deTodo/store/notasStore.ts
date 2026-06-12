import { create } from 'zustand';
import { Nota } from '../types';
import {
  getNotas,
  createNota,
  updateNota,
  deleteNota,
  CreateNotaInput,
  UpdateNotaInput,
} from '@/lib/api';

interface NotasStore {
  notas: Nota[];
  isLoading: boolean;
  error: string | null;
  fetchNotas: () => Promise<void>;
  agregarNota: (data: CreateNotaInput) => Promise<void>;
  actualizarNota: (id: string, data: UpdateNotaInput) => Promise<void>;
  eliminarNota: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
}

const sortNotas = (notas: Nota[]) =>
  [...notas].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

export const useNotasStore = create<NotasStore>((set, get) => ({
  notas: [],
  isLoading: false,
  error: null,

  fetchNotas: async () => {
    set({ isLoading: true, error: null });
    try {
      const notas = await getNotas();
      set({ notas: sortNotas(notas), isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  agregarNota: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const nueva = await createNota(data);
      set((state) => ({
        notas: sortNotas([...state.notas, nueva as unknown as Nota]),
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  actualizarNota: async (id, data) => {
    const previous = get().notas;
    set((state) => ({
      notas: sortNotas(
        state.notas.map((n) => (n.id === id ? { ...n, ...(data as unknown as Partial<Nota>) } : n))
      ),
    }));
    try {
      const actualizada = await updateNota(id, data);
      set((state) => ({
        notas: sortNotas(
          state.notas.map((n) => (n.id === id ? (actualizada as unknown as Nota) : n))
        ),
        isLoading: false,
      }));
    } catch (err) {
      set({ notas: previous, isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  eliminarNota: async (id) => {
    const previous = get().notas;
    set((state) => ({ notas: state.notas.filter((n) => n.id !== id) }));
    try {
      await deleteNota(id);
    } catch (err) {
      set({ notas: previous, error: (err as Error).message });
      throw err;
    }
  },

  togglePinned: async (id) => {
    const nota = get().notas.find((n) => n.id === id);
    if (!nota) return;
    const nextPinned = !nota.is_pinned;
    set((state) => ({
      notas: sortNotas(
        state.notas.map((n) =>
          n.id === id ? { ...n, is_pinned: nextPinned } : n
        )
      ),
    }));
    try {
      await updateNota(id, { is_pinned: nextPinned });
    } catch (err) {
      set((state) => ({
        notas: sortNotas(
          state.notas.map((n) =>
            n.id === id ? { ...n, is_pinned: nota.is_pinned } : n
          )
        ),
        error: (err as Error).message,
      }));
    }
  },
}));