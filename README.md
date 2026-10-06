# BBVA — Rock Paper Scissors (Expo + React Native + Web PWA)

Prueba técnica BBVA: https://bbvaengineering.github.io/challenges/rock-paper-scissors/

Stack: Expo + React Native + TypeScript + expo-router + Zustand.
Estilo: igual que `quiniela-native` (StyleSheet + ThemeContext, mobile-first).
Package manager: npm. Deploy web: Vercel (pendiente URL).

> Estado: TODO 0 — repo inicializado. Scaffold Expo en TODO 1.

## Requisitos

- Node LTS + npm
- Expo CLI via `npx expo`

## Instalación

```bash
npm install
```

## Arrancar

```bash
npm run start   # Expo dev (iOS/Android/Web)
npm run web     # solo web
npm run android # solo android
npm run ios     # solo ios
```

## Tests / calidad

```bash
npm run typecheck
npm run lint
npm test
```

## Despliegue

- Web PWA en Vercel: URL pendiente.
- `npm run build:web` genera `dist/` via `expo export --platform web`.

## Estructura (objetivo)

```
app/              # routes: home (/), game, ranking, +not-found
components/       # ChoiceButton, ScoreBoard, RoundResult, RankingRow...
store/            # zustand gameStore persistido
services/         # A scores, B game-logic, C machine
constants/ utils/ context/ types/
supabase/         # schema.sql para ranking online
```

## Reglas del juego

- Piedra > tijeras, tijeras > papel, papel > piedra. Empate si igual.
- La máquina elige tras >=1s y distinto en cada jugada (se garantiza evitando repetir la anterior).
- Ganar suma 1 punto. Salir vuelve a home. Nombre existente retoma partida.
- Todo persiste offline; online Supabase solo para ranking (bonus).
