# Top 5 de Todo
 
Aplicación móvil desarrollada con React Native y Expo que permite crear y gestionar rankings personales de exactamente 5 elementos sobre cualquier tema.
 
🔗 [Preview en Expo](https://expo.dev/preview/update?message=NoteFlow-Top5deTodo&updateRuntimeVersion=1.0.0&createdAt=2026-05-04T13%3A21%3A55.260Z&slug=exp&projectId=76992a70-89fe-484d-a7e5-7356b5238197&group=437e5d3d-b064-457c-bc95-010244c00428)
 
📋 [Tablero Trello](https://trello.com/b/gbZFPsx6/fullstack-project)
 
---
 
## Instalación y arranque
 
```bash
# Instalar dependencias
npm install
 
# Arrancar en modo desarrollo
npx expo start
```
 
Escanea el QR con la app Expo Go o abre en un emulador.
 
---

## Estructura del proyecto
 
```
top5detodo/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Navegación por pestañas
│   │   ├── rankings/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx       # Lista de rankings
│   │   │   ├── [id].tsx        # Detalle de un ranking
│   │   │   └── nuevo-ranking.tsx
│   │   ├── favoritos.tsx
│   │   └── estadisticas.tsx
│   ├── _layout.tsx             # Layout raíz
│   └── index.tsx               # Redirección al inicio de la app
├── components/
│   └── RankingCard.tsx
├── store/
│   └── rankingsStore.ts
├── types/
│   └── index.ts
├── constants/
│   └── theme.ts
└── docs/
    ├── idea.md
    ├── project-management.md
    ├── react-native-teoria.md
    
```
 
---

## Tecnologías
 
| Tecnología | Uso |
|---|---|
| React Native + Expo | Base de la app |
| Expo Router | Navegación (Tabs, Stack, Modal) |
| Zustand + persist | Estado global y persistencia |
| AsyncStorage | Almacenamiento local |
| Zod | Validación de formularios |
| FlashList | Listas de alto rendimiento |
| React Native Paper | Sistema de diseño |
| Expo Haptics | Feedback táctil |
| TypeScript | Tipado estático |
 
---
 
## Funcionalidades
 
- Crear rankings con título, categoría y 5 posiciones
- Editar y eliminar rankings existentes
- Buscar y filtrar por categoría
- Marcar rankings como favoritos
- Copiar un ranking como texto para compartir
- Estadísticas: totales, favoritos, distribución por categoría e ítem más repetido
- Persistencia de datos con AsyncStorage
  
---
 
## Navegación
 
La app usa tres patrones de navegación de Expo Router:
 
- **Tabs** para las tres secciones principales (Rankings, Favoritos, Estadísticas)
- **Stack** para el detalle de cada ranking dentro de la pestaña Rankings
- **Modal** para el formulario de crear y editar rankings
 