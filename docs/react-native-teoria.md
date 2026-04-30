# React Native — Teoría

## ¿Qué diferencia hay entre React Native y una app nativa?

Una app nativa se escribe en el lenguaje propio del sistema operativo: Swift o Objective-C para iOS, Kotlin o Java para Android. Cada plataforma tiene su propio código, sus propios componentes y su propio ciclo de desarrollo.

React Native permite escribir una sola base de código en JavaScript/TypeScript que se convierte en componentes nativos reales. Cuando se usa un `<View>` en React Native, no se renderiza HTML en un WebView — React Native habla directamente con el sistema operativo para crear vistas nativas. El resultado tiene el aspecto y el rendimiento de una app nativa, pero con un único código fuente.

La arquitectura tiene dos hilos: el JS thread, donde corre la lógica de negocio y los componentes React, y el UI thread nativo, donde se renderizan los componentes del sistema operativo. Si el JS thread se bloquea, la interfaz se congela.

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