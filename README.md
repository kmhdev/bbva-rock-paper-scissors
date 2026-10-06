# BBVA — Rock Paper Scissors (Expo + React Native + Web PWA)

Prueba técnica BBVA: https://bbvaengineering.github.io/challenges/rock-paper-scissors/

Repo público: https://github.com/kmhdev/bbva-rock-paper-scissors
Despliegue web (Vercel): _pendiente — el dueño del repo lo configura en Vercel contra `main`_.

Stack: **Expo SDK 57 + React Native + TypeScript estricto + expo-router + Zustand**,
misma arquitectura que `quiniela-native` (proyecto Expo único para web PWA + iOS/Android,
estilos `StyleSheet` con `ThemeContext`, mobile-first). Package manager: **npm**.
Ver [Stack elegido y por qué](#stack-elegido-y-por-qué).

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
App.tsx          # punto único de entrada (como quiniela-native) + app/index.tsx (shim)
views/            # Home, Game, Ranking (cada una: Vista.tsx + Vista.styles.ts)
components/       # ChoiceButton, ScoreBoard, RoundResult, RankingRow (tsx + styles + test)
context/          # ThemeContext (dark/light) + NavigationContext (home|game|ranking)
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

### 1. Ranking (`/ranking`)

Vista de ranking con la mejor puntuación de cada jugador registrado, ordenada
de mayor a menor (desempate alfabético). Componente reutilizable `RankingRow`
(posición + nombre + puntos, con singular `1 pto` / plural `5 pts`).

- Fuente local (siempre disponible offline): `ScoreService.getAllScores()`.
- Fuente online (si Supabase está configurado): `fetchRemoteScores()`.
- Fusión con `mergeScores(local, remote)`: se queda con la **mejor** marca por
  jugador (clave insensible a mayúsculas) y reordena.
- Al ganar una ronda, la vista game sube tu marca con
  `pushRemoteScore(username, score)`: hace `upsert` solo si superas tu mejor
  marca anterior; sin configuración de Supabase es un no-op (la app sigue
  funcionando 100% offline). Ver [Supabase](#supabase-ranking-online-opcional).

### 2. Lagarto-Spock (modo extendido)

Selector de modo en home (`Clásico (3)` / `Lagarto-Spock (5)`). Las reglas viven
en una única tabla `BEATS` (`constants/game.constants.ts`) que ya contiene las
10 relaciones del RPSLS; `decideWinner(player, machine)` no cambia entre modos,
solo el conjunto de opciones (`getChoicesForMode(mode)`). Siguiendo la pauta del
reto, el servicio B expone la misma firma para ambas lógicas, así que la vista
`game` no se toca al cambiar de modo: solo renderiza más `ChoiceButton`.

### 3. Máquina inteligente

Ver [Cómo funciona la máquina inteligente](#cómo-funciona-la-máquina-inteligente).

### 4. Vibración al perder

`utils/vibration.ts` → `vibrateOnLoss()`:

- **Web PWA**: `navigator.vibrate(200)` (`LOSE_VIBRATION_MS`). Solo Android/Chrome
  lo soportan; iOS lo ignora de forma silenciosa, por eso va con feature-detect.
- **Nativo**: `expo-haptics.notificationAsync(Error)`, importado de forma
  perezosa para no acoplar los tests unitarios a módulos nativos.
- La vista `game` la dispara solo cuando el resultado consolidado es `lose`.

## Supabase (ranking online, opcional)

Sin configurar, la app funciona 100% offline. Para activar el ranking online:

1. Crea un proyecto en https://supabase.com y ejecuta `supabase/schema.sql`
   (tabla `players` + políticas RLS de lectura/escritura pública).
2. Define en Vercel (o `.env` local):
   `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Al ganar una ronda se sube tu mejor marca (`upsert` solo si la superas);
   el ranking fusiona local + remoto quedándose con la mejor por jugador.

## Accesibilidad, maquetación y tema

- Roles/estados: `button`, `radio` (modo), `switch` (IA), `header`, más
  `accessibilityLabel` en español y estados `selected/disabled/checked`.
- Sin `div`: todo son `View/Text` con estilos por componente (`*.styles.ts`,
  convención BEM-like por nombres).

### Theme toggle (portado de `quiniela-native`)

Botón `ThemeToggle` arriba a la derecha en home, game y ranking: icono
**sol** en modo oscuro y **luna** en modo claro (`Ionicons`
`sunny-outline`/`moon-outline`), con la misma animación de fade (2x180ms, el
tema cambia a mitad del fundido) que el `ToolbarWeb` de la quiniela.

- Temas con nombre (`constants/theme.constants.ts`): `DARK_THEME` (`#181a1f`,
  por defecto) y `LIGHT_THEME`.
- Persistencia en `services/themeHelpers.ts` (`@bbva-rps:theme` en
  AsyncStorage): al cerrar y reabrir se mantiene tu tema. El `ThemeProvider`
  no renderiza hasta haberlo leído (evita el flashazo de tema).
- En web, `services/webDocumentPresentation.ts` sincroniza el fondo del
  `document` y el `meta theme-color` con el tema activo.

## Cómo funciona la máquina inteligente

Hay dos estrategias intercambiables con la misma interfaz (`services/machineService.ts`):

```ts
interface MachineContext {
  playerHistory: readonly Choice[]; // tus jugadas anteriores
  machineHistory: readonly Choice[]; // jugadas anteriores de la máquina
  availableChoices: readonly Choice[]; // 3 en clásico, 5 en extendido
}
interface MachineStrategy {
  readonly name: string;
  pickMove(context: MachineContext): Choice;
}
```

- **`RandomMachineStrategy`** (por defecto): elige al azar pero **nunca repite
  la jugada anterior de la máquina** si hay alternativas (lo exige el enunciado:
  _"la selección de la máquina deberá ser distinta en cada jugada"_).
- **`SmartMachineStrategy`** (bonus, conmutable con el switch
  _"Máquina inteligente"_ en la vista game): estrategia de **frecuencias con
  contraataque**:

  1. Cuenta tus jugadas (`mostFrequentChoice`) y detecta tu opción más repetida
     (en empate gana la primera vista, determinista).
  2. Calcula qué opciones la vencen (`getCountersFor`, inversa derivada de la
     tabla `BEATS`, sin duplicar reglas) y elige una al azar entre ellas,
     filtrada al modo activo.
  3. Si no hay historial todavía, si los contadores no están en el modo activo
     o si el único contraataque repetiría la jugada anterior, **degrada a la
     estrategia aleatoria** (nunca rompe la regla de no-repetición).

  Ejemplo: si juegas piedra el 80% de las veces, la máquina responderá con papel
  o Spock, que son exactamente las dos opciones que vencen a piedra.

La vista `game` no conoce los detalles: elige estrategia según
`store.smartMachine` y le pasa el contexto. Los singletons compartidos viven en
`services/machineStrategies.ts` para que los tests puedan sustituirlos por una
máquina determinista.

## Stack elegido y por qué

Se pidió explícitamente **React Native + TypeScript para webapp y móvil**,
mobile-first con posibilidad nativa, **Zustand** y **ESLint**. Decisiones:

- **Proyecto Expo único (no monorepo)**: igual que `quiniela-native`. Un solo
  código sirve a web PWA (vía `react-native-web`), iOS y Android, con punto
  único de entrada (`App.tsx` + `index.ts`, `app/index.tsx` es solo un shim
  como en la quiniela). La navegación es por estado
  (`context/NavigationContext`: `home | game | ranking`), sin file-routing:
  más simple de ver a primera vista en `views/`.
- **Zustand con `persist`**: estado de sesión (jugador, modo, racha) + estado de
  la ronda. La puntuación autoritativa vive en el servicio A (`ScoreService`
  sobre AsyncStorage, que en web es localStorage): una sola fuente de verdad,
  testeable con backend en memoria.
- **Supabase solo para el ranking online**: el reto exige funcionar offline y
  sin backend, así que Supabase es un espejo opcional de mejores marcas, nunca
  un requisito. Sin claves, todo sigue funcionando en local.
- **Doble runner de tests**: **vitest** para lógica pura (rápido, cobertura V8)
  y **jest + jest-expo** para vistas/componentes RN (el entry de RN usa sintaxis
  Flow que Vite no parsea). RNTL v14: `render`/`fireEvent` asíncronos. Los tests
  de vistas viven en `tests/` e importan de `views/`.
- **E2E con Playwright** contra `dist/` servido en estático.
- **ESLint 9** (pinado, porque `jsx-a11y@6` aún no soporta ESLint 10) con
  `typescript + react + hooks + jsx-a11y`, y Prettier idéntico a `quiniela-native`.
