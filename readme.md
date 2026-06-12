[![React Native](https://img.shields.io/badge/-React_Native-05122A?style=for-the-badge&logo=react)](https://reactnative.dev) [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev) [![TypeScript](https://shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=FFF)](https://www.typescriptlang.org) [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com) [![Next](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org) [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)

# NoteFlow — Top 5 de Todo

> Crea rankings y notas desde tu móvil, con cuenta propia y acceso desde cualquier dispositivo.

App móvil para Android desarrollada con React Native y Expo. Permite crear rankings Top 5 por categorías, escribir notas con formato y checklists, marcar favoritos, anclar contenido y añadir recordatorios. Los datos se sincronizan en tiempo real con una API REST propia desplegada en Vercel.

| Despliegue | URL |
|------------|-----|
| API | [note-flow-top5de-todo-api.vercel.app](https://note-flow-top5de-todo-api.vercel.app) |
| Repo API | [NoteFlow-Top5deTodo-Api](https://github.com/santy2911/NoteFlow-Top5deTodo-Api) |

---

## Características

- Autenticación con Firebase (registro, login, persistencia de sesión)
- Rankings Top 5 por categoría con podio visual y vista de detalle
- Notas con bloques de texto, checklists y adjunto de imagen
- Recordatorios con notificaciones push (DateTimePicker nativo Android)
- Avatar de usuario con subida a AWS S3 mediante presigned URLs
- Favoritos y anclado de rankings y notas
- Búsqueda y filtrado por categoría con pills interactivas
- Swipe para anclar o eliminar rankings
- Estadísticas de uso en la pantalla de perfil
- Animaciones con Reanimated 4

---

## Tecnologías

| Mobile | Uso |
|--------|-----|
| React Native 0.81 + Expo 54 | Framework principal |
| Expo Router | Navegación basada en ficheros |
| Zustand | Estado global (rankings, notas) |
| Firebase JS SDK 12 | Autenticación y Firestore |
| React Native Reanimated 4 | Animaciones y gestos |
| React Native Paper | Componentes UI base |
| Zod | Validación de formularios |
| FlashList | Listas de alto rendimiento |

| Backend | Uso |
|---------|-----|
| Next.js 16 (App Router) | API REST con Route Handlers |
| Neon PostgreSQL | Base de datos serverless |
| Firebase Admin SDK | Verificación de tokens JWT |
| AWS S3 | Almacenamiento de avatares |
| Zod | Validación de entrada |

| Auxiliares | Uso |
|------------|-----|
| EAS Build | Compilación y distribución APK |
| Vercel | Despliegue del backend |
| Figma | Diseño de UI previo a implementación |

---

## Estructura del proyecto

```
NoteFlow-Top5deTodo/
├── app/
│   ├── _layout.tsx               # Layout raíz con auth guard
│   ├── login.tsx                 # Pantalla de login
│   ├── registro.tsx              # Pantalla de registro
│   └── (tabs)/
│       ├── _layout.tsx           # Tab bar
│       ├── notas/                # Pantalla de notas + detalle + nueva nota
│       ├── rankings/             # Pantalla de rankings + detalle + nuevo ranking
│       ├── favoritos/            # Pantalla de favoritos + detalle
│       └── perfil.tsx            # Estadísticas y perfil de usuario
├── components/
│   ├── RankingCard.tsx           # Tarjeta de ranking reutilizable
│   └── SwipeableActions.tsx      # Swipe con anclar/eliminar
├── store/
│   ├── rankingsStore.ts          # Zustand store de rankings
│   └── notasStore.ts             # Zustand store de notas
├── lib/
│   ├── api.ts                    # Cliente HTTP con token Firebase
│   ├── firebase.ts               # Inicialización Firebase
│   └── notificaciones.ts         # Recordatorios con expo-notifications
├── constants/
│   └── theme.ts                  # Paleta de colores, tipografía, helpers
├── types/
│   └── index.ts                  # Tipos globales (Ranking, Nota, Bloque...)
├── eas.json                      # Configuración de builds EAS
└── app.json                      # Configuración Expo

NoteFlow-Top5deTodo-Api/
├── app/
│   └── api/
│       ├── rankings/             # GET, POST /rankings + GET, PATCH, DELETE /rankings/[id]
│       ├── notas/                # GET, POST /notas + GET, PUT, DELETE /notas/[id]
│       └── avatar/               # GET presigned URL para subida a S3
├── lib/
│   ├── db.ts                     # Conexión Neon con @neondatabase/serverless
│   └── firebaseAdmin.ts          # Verificación de tokens JWT
└── sql/
    └── schema.sql                # Esquema de base de datos
```

---

## Descargar y ejecutar

```bash
# Clonar el repositorio
git clone https://github.com/santy2911/NoteFlow-Top5deTodo.git
cd NoteFlow-Top5deTodo

# Instalar dependencias
npm install

# Crear .env con las variables necesarias
cp .env.example .env
# → Rellenar EXPO_PUBLIC_API_URL y las claves de Firebase

# Iniciar en Expo Go (funcionalidades limitadas, sin módulos nativos)
npx expo start

# Build APK de prueba con EAS
eas build --profile preview --platform android
```

---

## Desplegar en Vercel

### API (backend)

1. Conectar el repo `NoteFlow-Top5deTodo-Api` a Vercel
2. Añadir las variables de entorno en el panel de Vercel:
   - `DATABASE_URL` — cadena de conexión Neon PostgreSQL
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON` — JSON de Firebase Admin (service account)
   - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`
3. Desplegar — Vercel detecta Next.js automáticamente

### App móvil

1. Configurar `eas.json` con el `projectId` de Expo
2. Añadir `EXPO_PUBLIC_API_URL` en el perfil correspondiente de `eas.json`
3. Ejecutar `eas build --profile preview --platform android` para generar el APK
