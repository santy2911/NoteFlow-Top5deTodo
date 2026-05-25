![React Native](https://img.shields.io/badge/-React_Native-05122A?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=FFF)

# 🏆 Top 5 de Todo
> Crea y gestiona tus rankings personales de exactamente 5 elementos

Aplicación móvil desarrollada con React Native y Expo que permite organizar tus favoritos sobre cualquier tema: películas, música, videojuegos, series, etc.

| Despliegue | URL |
|------------|-----|
| Preview Expo | [Abrir en Expo](https://expo.dev/preview/update?message=NoteFlow-Top5deTodo&updateRuntimeVersion=1.0.0&createdAt=2026-05-25T14%3A00%3A23.555Z&slug=exp&projectId=76992a70-89fe-484d-a7e5-7356b5238197&group=c44ea6ab-351d-455a-99ef-9c072e9e7cc3) |
| Trello | [Tablero del proyecto](https://trello.com/b/gbZFPsx6/fullstack-project) |

---

## Características

- Crear rankings con título, categoría y exactamente 5 posiciones
- Editar y eliminar rankings existentes con confirmación
- Buscar y filtrar rankings por categoría en tiempo real
- Marcar rankings como favoritos y verlos en una pestaña dedicada
- Copiar un ranking como texto para compartir
- Estadísticas: totales, favoritos, distribución por categoría e ítem más repetido
- Persistencia de datos: los rankings se guardan aunque se cierre la app

---

## Tecnologías

| Núcleo | Uso |
|--------|-----|
| React Native + Expo | Base de la aplicación móvil |
| Expo Router | Navegación (Tabs, Stack, Modal) |
| TypeScript | Tipado estático |

| Estado y datos | Uso |
|----------------|-----|
| Zustand + persist | Estado global y persistencia |
| AsyncStorage | Almacenamiento local en el dispositivo |
| Zod | Validación de formularios |

| UI y experiencia | Uso |
|------------------|-----|
| React Native Paper | Sistema de diseño |
| FlashList | Listas de alto rendimiento |
| Expo Haptics | Feedback táctil |
| Expo Clipboard | Copiar rankings al portapapeles |

---

## Estructura del proyecto

```
top5detodo/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx             # Define las 3 pestañas con sus iconos
│   │   ├── rankings/
│   │   │   ├── _layout.tsx         # Configura el Stack dentro de Rankings
│   │   │   ├── index.tsx           # Lista de rankings con buscador y filtros
│   │   │   ├── [id].tsx            # Detalle de un ranking: ver, editar, eliminar
│   │   │   └── nuevo-ranking.tsx   # Formulario para crear o editar un ranking
│   │   ├── favoritos.tsx           # Lista de rankings marcados como favoritos
│   │   └── estadisticas.tsx        # Métricas y distribución de los rankings
│   ├── _layout.tsx                 # Layout raíz, monta el provider de Paper
│   └── index.tsx                   # Redirige al inicio de la app
├── components/
│   └── RankingCard.tsx             # Tarjeta reutilizable para mostrar un ranking
├── store/
│   └── rankingsStore.ts            # Estado global con Zustand y persistencia
├── types/
│   └── index.ts                    # Interfaces Ranking y RankingItem
├── constants/
│   └── theme.ts                    # Colores, tipografía y espaciados
└── docs/
    ├── idea.md                     # Descripción del proyecto y funcionalidades
    ├── project-management.md       # Gestión del trabajo con Trello
    ├── react-native-teoria.md      # Fundamentos teóricos de React Native
```

---

## Instalar y ejecutar

```bash
git clone https://github.com/santy2911/NoteFlow-Top5deTodo.git
cd top5detodo
npm install
npx expo start
```

Escanea el QR con la app Expo Go o abre en un emulador.