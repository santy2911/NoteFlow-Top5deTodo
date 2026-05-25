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
}

export const useNotasStore = create<NotasStore>((set, get) => ({
  notas: [],
  isLoading: false,
  error: null,

  fetchNotas: async () => {
    set({ isLoading: true, error: null });
    try {
      const notas = await getNotas();
      set({ notas, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  agregarNota: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await createNota(data);
      const notas = await getNotas();
      set({ notas, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  actualizarNota: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await updateNota(id, data);
      const notas = await getNotas();
      set({ notas, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
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
}));