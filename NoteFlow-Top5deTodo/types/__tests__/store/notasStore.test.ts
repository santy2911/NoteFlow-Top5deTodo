import { useNotasStore } from '../../store/notasStore';
import * as api from '../../lib/api';

jest.mock('../../lib/api');

const mockApi = api as jest.Mocked<typeof api>;

const notaBase = {
  id: '1',
  titulo: 'Test',
  contenido: '',
  bloques: [],
  checklist: [],
  tieneChecklist: false,
  is_pinned: false,
  imagenUri: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  useNotasStore.setState({ notas: [], isLoading: false, error: null });
  jest.clearAllMocks();
});

describe('fetchNotas', () => {
  it('carga las notas en el store', async () => {
    mockApi.getNotas.mockResolvedValue([notaBase]);
    await useNotasStore.getState().fetchNotas();
    expect(useNotasStore.getState().notas).toHaveLength(1);
    expect(useNotasStore.getState().notas[0].titulo).toBe('Test');
  });

  it('guarda el error si falla la API', async () => {
    mockApi.getNotas.mockRejectedValue(new Error('fallo red'));
    await useNotasStore.getState().fetchNotas();
    expect(useNotasStore.getState().error).toBe('fallo red');
    expect(useNotasStore.getState().notas).toHaveLength(0);
  });
});

describe('agregarNota', () => {
  it('añade la nota al store', async () => {
    mockApi.createNota.mockResolvedValue(notaBase as any);
    await useNotasStore.getState().agregarNota({ titulo: 'Test', contenido: '' });
    expect(useNotasStore.getState().notas).toHaveLength(1);
  });

  it('guarda el error si falla y relanza la excepción', async () => {
    mockApi.createNota.mockRejectedValue(new Error('error crear'));
    await expect(
      useNotasStore.getState().agregarNota({ titulo: 'X', contenido: '' })
    ).rejects.toThrow('error crear');
    expect(useNotasStore.getState().error).toBe('error crear');
  });
});

describe('eliminarNota', () => {
  it('elimina la nota del store de forma optimista', async () => {
    useNotasStore.setState({ notas: [notaBase] });
    mockApi.deleteNota.mockResolvedValue(undefined as any);
    await useNotasStore.getState().eliminarNota('1');
    expect(useNotasStore.getState().notas).toHaveLength(0);
  });

  it('restaura la nota si la API falla', async () => {
    useNotasStore.setState({ notas: [notaBase] });
    mockApi.deleteNota.mockRejectedValue(new Error('fallo'));
    await expect(useNotasStore.getState().eliminarNota('1')).rejects.toThrow();
    expect(useNotasStore.getState().notas).toHaveLength(1);
  });
});

describe('togglePinned', () => {
  it('invierte is_pinned de forma optimista', async () => {
    useNotasStore.setState({ notas: [notaBase] });
    mockApi.updateNota.mockResolvedValue({ ...notaBase, is_pinned: true } as any);
    await useNotasStore.getState().togglePinned('1');
    expect(useNotasStore.getState().notas[0].is_pinned).toBe(true);
  });

  it('revierte is_pinned si la API falla', async () => {
    useNotasStore.setState({ notas: [{ ...notaBase, is_pinned: false }] });
    mockApi.updateNota.mockRejectedValue(new Error('fallo'));
    await useNotasStore.getState().togglePinned('1');
    expect(useNotasStore.getState().notas[0].is_pinned).toBe(false);
  });

  it('no hace nada si la nota no existe', async () => {
    await useNotasStore.getState().togglePinned('id-inexistente');
    expect(mockApi.updateNota).not.toHaveBeenCalled();
  });
});

describe('sortNotas', () => {
  it('las notas pinneadas aparecen primero', async () => {
    const pinned = { ...notaBase, id: '2', is_pinned: true };
    mockApi.getNotas.mockResolvedValue([notaBase, pinned]);
    await useNotasStore.getState().fetchNotas();
    expect(useNotasStore.getState().notas[0].is_pinned).toBe(true);
  });
});