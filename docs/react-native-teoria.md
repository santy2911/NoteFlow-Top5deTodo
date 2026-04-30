# React Native — Teoría

## ¿Qué diferencia hay entre React Native y una app nativa?

Una app nativa se escribe en el lenguaje propio del sistema operativo: Swift o Objective-C para iOS, Kotlin o Java para Android. Cada plataforma tiene su propio código, sus propios componentes y su propio ciclo de desarrollo.

React Native permite escribir una sola base de código en JavaScript/TypeScript que se convierte en componentes nativos reales. Cuando se un `<View>` en React Native, no se renderiza HTML en un WebView — React Native habla directamente con el sistema operativo para crear vistas nativas. El resultado tiene el aspecto y el rendimiento de una app nativa, pero con un único código fuente.

La arquitectura tiene dos hilos: el JS thread, donde corre la lógica de negocio y los componentes React, y el UI thread nativo, donde se renderizan los componentes del sistema operativo. Si el JS thread se bloquea, la interfaz se congela.

## ¿Qué es el Metro bundler?

Metro es el bundler de JavaScript que usa React Native. Su función es similar a Webpack en proyectos web: toma todos los archivos del proyecto, resuelve las importaciones y genera un único bundle que la app puede ejecutar.

A diferencia de Webpack, Metro está optimizado para mobile: soporta hot reload, gestiona assets nativos (imágenes, fuentes) y está diseñado para trabajar con el bridge de React Native.

## ¿Por qué Expo Go no es suficiente en proyectos reales?

Expo Go es una app genérica instalada en el móvil que permite previsualizar proyectos Expo escaneando un QR, sin necesidad de compilar nada. Es útil para aprender y prototipar rápido.

El problema es que Expo Go solo incluye los módulos nativos que Expo decidió incluir. Si el proyecto necesita módulos nativos personalizados — cámara con configuración específica, notificaciones push, biometría, pagos — Expo Go no los tiene y no los puede cargar.

En proyectos reales se usa un Development Build: un binario propio generado con EAS Build que incluye exactamente los módulos nativos que el proyecto necesita. Es más lento de configurar pero es la única opción viable para apps de producción.

## Sistemas de diseño

### Comparativa: Gluestack UI vs React Native Paper

**Gluestack UI v3** tiene una filosofía similar a Tailwind CSS. Los componentes se construyen aplicando clases utilitarias y el sistema es altamente personalizable. Es ideal cuando se quiere una identidad visual única y se está dispuesto a invertir tiempo en configuración.

El problema en la práctica: la instalación arrastra un stack enorme de dependencias (NativeWind, react-native-worklets, tailwind-variants, react-aria, react-stately, legendapp/motion) que generan conflictos frecuentes con versiones de Expo y React. 

**React Native Paper** implementa Material Design. Los componentes están listos para usar, la instalación es un único paquete sin dependencias problemáticas y la integración con Expo Router es directa.

### Decisión: React Native Paper

Se eligió React Native Paper por tres razones:

1. **Estabilidad**: instalación limpia sin conflictos de dependencias.
2. **Velocidad**: componentes listos para usar que permiten centrarse en la lógica de la app.
3. **Pragmatismo**: para una primera versión funcional, la personalización profunda no es prioritaria. Los tokens de color en `constants/theme.ts` permiten adaptar la apariencia sin necesidad de un sistema de clases utilitarias.

## Navegación con Expo Router

Expo Router ofrece tres patrones de navegación principales que se combinan según las necesidades de la app.

### Tabs (pestañas)

Las pestañas son navegación persistente: el usuario puede saltar entre secciones en cualquier momento y cada pestaña mantiene su propio historial. Se implementan con `<Tabs>` en `app/(tabs)/_layout.tsx`. En Top 5 de Todo se usan para las tres secciones principales: Rankings, Favoritos y Estadísticas.

### Stack (pila)

El Stack es navegación jerárquica: el usuario entra a una pantalla y puede volver atrás. Las pantallas se apilan una sobre otra. En este proyecto, cada pestaña tiene implícitamente su propio Stack — cuando se navega al detalle de un ranking (`rankings/[id].tsx`), se apila sobre la lista y aparece el botón de volver.

### Modal

Un modal se presenta desde abajo interrumpiendo el flujo actual. Se configura con `presentation: 'modal'` en la `Stack.Screen` del layout raíz. En este proyecto se usa para el formulario de crear nuevo ranking (`nuevo-ranking.tsx`): es una acción puntual que no pertenece a ninguna pestaña concreta y el usuario espera poder cancelarla y volver donde estaba.

### Por qué esta combinación

- **Tabs** para la navegación principal porque las tres secciones son independientes y de igual jerarquía.
- **Stack** para el detalle porque es una pantalla hija de Rankings con relación padre-hijo.
- **Modal** para la creación porque es una acción transversal que puede lanzarse desde cualquier pestaña.

## Gestión de estado

### useState

Es el estado local de un componente. Solo ese componente puede leerlo y modificarlo. Útil para cosas simples como abrir/cerrar un modal o controlar un input. El problema aparece cuando dos pantallas necesitan los mismos datos — hay que pasar props por varios niveles.

### Context API

Es la solución nativa de React para compartir estado entre componentes sin pasar props. Se crea un contexto, se envuelve la app en un Provider y cualquier componente puede leerlo. El problema es el rendimiento: cuando el contexto cambia, todos los componentes que lo consumen se re-renderizan.

### Zustand

Es una librería externa de gestión de estado global. A diferencia de Context API, los componentes solo se re-renderizan cuando cambia exactamente el dato que están leyendo. No necesita providers anidados y la sintaxis es más simple. Es el estándar moderno en proyectos React Native.

## Rendimiento en listas

FlatList, el componente nativo de React Native, tiene un problema conocido con listas largas: recicla los componentes de forma poco eficiente, lo que provoca pantallas en blanco al hacer scroll rápido.

FlashList de Shopify lo resuelve con un reciclaje más agresivo. En lugar de destruir y recrear componentes al salir del viewport, los reutiliza directamente cambiando solo sus datos. Esto reduce drásticamente el trabajo del hilo de JavaScript.

La propiedad `estimatedItemSize` le indica a FlashList cuánto espacio ocupará cada elemento antes de renderizarlo. Cuanto más preciso sea el valor, menos recálculos de layout necesita hacer y mejor es el rendimiento resultante.
