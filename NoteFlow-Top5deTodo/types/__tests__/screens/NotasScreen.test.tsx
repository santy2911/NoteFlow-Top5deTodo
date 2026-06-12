import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import NotasScreen from '../../app/(tabs)/notas';
import { useNotasStore } from '../../store/notasStore';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../../components/SwipeableActions', () => {
  const React = require('react');
  const { View } = require('react-native');

  return ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
});

const notaBase = {
  id: '1',
  titulo: 'Lista de peliculas',
  contenido: '',
  bloques: [{ id: 'b1', tipo: 'texto' as const, contenido: 'Matrix y Origen' }],
  checklist: [],
  tieneChecklist: false,
  is_pinned: false,
  imagenUri: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

describe('NotasScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    useNotasStore.setState({
      notas: [],
      isLoading: false,
      error: null,
      fetchNotas: jest.fn(),
      agregarNota: jest.fn(),
      actualizarNota: jest.fn(),
      eliminarNota: jest.fn(),
      togglePinned: jest.fn(),
    });
  });

  it('muestra el estado vacio cuando no hay notas', async () => {
    const { getByText } = await render(<NotasScreen />);

    expect(getByText('Notas')).toBeOnTheScreen();
    expect(getByText('No tienes notas todavía')).toBeOnTheScreen();
    expect(getByText('Pulsa + para crear la primera')).toBeOnTheScreen();
  });

  it('renderiza las notas guardadas y permite filtrarlas', async () => {
    useNotasStore.setState({ notas: [notaBase] });

    const { getByPlaceholderText, getByText, queryByText } = await render(<NotasScreen />);

    expect(getByText('1 nota guardada')).toBeOnTheScreen();
    expect(getByText('Lista de peliculas')).toBeOnTheScreen();
    expect(getByText('Matrix y Origen')).toBeOnTheScreen();

    fireEvent.changeText(getByPlaceholderText('Buscar notas...'), 'viajes');

    await waitFor(() => expect(getByText('Sin resultados')).toBeOnTheScreen());

    expect(getByText('Sin resultados')).toBeOnTheScreen();
    expect(queryByText('Lista de peliculas')).toBeNull();
  });

  it('navega a la pantalla de nueva nota al pulsar el boton flotante', async () => {
    const { getByText } = await render(<NotasScreen />);

    fireEvent.press(getByText('add'));

    expect(mockPush).toHaveBeenCalledWith('/notas/nueva-nota');
  });
});
