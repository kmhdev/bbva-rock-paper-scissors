# Piedra, papel o tijera

Juego de piedra, papel o tijera contra la máquina. Funciona en el móvil y en el navegador, incluso sin internet.

Reto original: https://bbvaengineering.github.io/challenges/rock-paper-scissors/
Código: https://github.com/kmhdev/bbva-rock-paper-scissors
Web: el despliegue en Vercel lo activa el dueño del repo contra `main`.

## Cómo se juega

1. Escribe tu nombre y pulsa **Jugar**.
2. Elige piedra, papel o tijera. La máquina responde al segundo.
3. Ganas 1 punto por victoria y pierdes 1 por derrota. Con **Salir** vuelves al inicio.

Si cierras la app y vuelves, sigues donde estabas. Si repites un nombre, retomas sus puntos.

## Extras (no los pedía el enunciado)

- **Ranking**: mejores marcas de cada jugador, en local y (si hay internet) online.
- **Lagarto-Spock**: modo de 5 opciones desde el inicio.
- **Máquina inteligente**: interruptor _Hard mode_ en la partida; aprende tu jugada más repetida.
- **Vibración**: el móvil vibra cuando pierdes.
- **Tema claro/oscuro**: botón arriba a la derecha, se recuerda.
- **Instalable y offline**: se puede instalar como app y jugar en modo avión tras la primera visita.

Lo único del bonus que no hay es jugar contra otra persona: siempre juegas contra la máquina.

## Ponerlo en marcha

Necesitas Node 20 o más.

```bash
npm install
npm run web     # solo navegador
npm run start   # elegir móvil o web
```

## Comprobar que todo va bien

```bash
npm run typecheck
npm run lint
npm test
npm run build:web  # genera la carpeta dist/
```

El enunciado completo del reto está en [CHALLENGE.md](./CHALLENGE.md).
