# BBVA — Rock Paper Scissors (Expo + React Native + Web PWA)

Prueba técnica BBVA: https://bbvaengineering.github.io/challenges/rock-paper-scissors/

Repo público: https://github.com/kmhdev/bbva-rock-paper-scissors
Despliegue web (Vercel): _pendiente — el dueño del repo lo configura en Vercel contra `main`_.

Stack: **Expo SDK 57 + React Native + TypeScript estricto + expo-router + Zustand**,
misma arquitectura que `quiniela-native` (proyecto Expo único para web PWA + iOS/Android,
estilos `StyleSheet` con `ThemeContext`, mobile-first). Package manager: **npm**.

## Requisitos

- Node LTS (>= 20) + npm
- Para móvil: app Expo Go o `npx expo run:android` / `run:ios`

## Instalación

```bash
npm install
```

## Arrancar

```bash
npm run start   # Expo dev: elige iOS / Android / Web
npm run web     # solo web (PWA)
npm run android # build & run Android
npm run ios     # build & run iOS
```

## Calidad (todo en verde)

```bash
npm run typecheck      # tsc --noEmit (strict + noUnusedLocals/Parameters)
npm run lint           # eslint flat: ts + react + hooks + jsx-a11y
npm test               # vitest (lógica) + jest (vistas y componentes)
npm run test:coverage  # cobertura: lógica ~98%, UI ~96% (umbral 80%)
npm run e2e            # Playwright smoke contra dist/ (requiere build)
```

## Build web (PWA)

```bash
npm run build:web  # expo export --platform web -> dist/
```

`dist/` incluye `sw.js` (copiado de `public/`) y el manifest generado desde
`app.json` (nombre, colores, `display: standalone`). Tras la primera visita la
app funciona en modo avión: el service worker cachea el app-shell
(cache-first + fallback a `/index.html`).

## Estructura

```
app/              # rutas expo-router: index (home /), game, ranking, +not-found (-> /)
components/       # ChoiceButton, ScoreBoard, RoundResult, RankingRow (tsx + styles + test)
context/          # ThemeContext (dark/light)
store/            # gameStore (zustand factory testeable) + appStore (wiring prod)
services/         # A scoreService, B gameLogicService, C machineService (+strategies)
utils/            # vibration (haptics/web), pwa (registro SW)
constants/        # reglas BEATS, delays, storage keys, CHOICE_META (labels ES)
supabase/         # schema.sql del ranking online
public/sw.js      # service worker offline
e2e/              # smoke Playwright
```

La vista `game` es delgada: inyecta A (puntuaciones vía store), B (reglas vía
store) y C (estrategias `random`/`smart` intercambiables con la misma firma
`pickMove(context)`). El modo extendido (lagarto-Spock) y la máquina
inteligente se activan sin tocar la vista, solo cambiando el servicio/modo.

## Reglas del juego

- Piedra > tijera, tijera > papel, papel > piedra. Empate si coinciden.
- Al elegir, se muestra tu jugada; tras >= 1,2s (`MACHINE_REVEAL_DELAY_MS`) la
  máquina revela la suya, **siempre distinta de la anterior**.
- Ganar suma 1 punto (`POINTS_PER_WIN`). Salir vuelve a home.
- Reintroducir un nombre existente (insensible a mayúsculas) retoma su puntuación.
- Todo persiste offline (AsyncStorage = localStorage en web); al cerrar y
  reabrir se continúa igual.

## Bonus points implementados (los 4)

1. **Ranking** (`/ranking`): mejor puntuación por jugador, local + Supabase.
2. **Lagarto-Spock**: selector de modo en home; misma interfaz de reglas.
3. **Máquina inteligente**: `SmartMachineStrategy` contrataca tu jugada más
   frecuente (toggle en la vista game).
4. **Vibración al perder**: `navigator.vibrate` en web, `expo-haptics` en nativo.

## Supabase (ranking online, opcional)

Sin configurar, la app funciona 100% offline. Para activar el ranking online:

1. Crea un proyecto en https://supabase.com y ejecuta `supabase/schema.sql`
   (tabla `players` + políticas RLS de lectura/escritura pública).
2. Define en Vercel (o `.env` local):
   `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Al ganar una ronda se sube tu mejor marca (`upsert` solo si la superas);
   el ranking fusiona local + remoto quedándose con la mejor por jugador.

## Accesibilidad y maquetación

- Roles/estados: `button`, `radio` (modo), `switch` (IA), `header`, más
  `accessibilityLabel` en español y estados `selected/disabled/checked`.
- `ThemeContext` dark/light, `SafeAreaProvider`, etiquetas de texto reales
  (renderizan semántica web en RN-web). Sin `div`: todo son `View/Text` con
  estilos por componente (`*.styles.ts`, convención BEM-like por nombres).

## Decisiones técnicas

- Proyecto Expo único (no monorepo): igual que `quiniela-native`, sirve a
  web + nativo con el mismo código.
- Doble runner de tests: **vitest** para lógica pura (rápido, cobertura V8) y
  **jest + jest-expo** para vistas/componentes RN (el entry de RN usa sintaxis
  Flow que Vite no parsea). RNTL v14: `render`/`fireEvent` asíncronos.
- E2E con Playwright contra `dist/` servido en estático.
