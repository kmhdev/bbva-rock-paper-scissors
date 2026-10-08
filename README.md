# Piedra, papel o tijera

Juego de piedra, papel o tijera contra la máquina. Funciona en el móvil y en el navegador, incluso sin internet.

Reto original: https://bbvaengineering.github.io/challenges/rock-paper-scissors/
Código: https://github.com/kmhdev/bbva-rock-paper-scissors

UI/UX inspirada en proyectos personales, algunos componentes han sido reutilizados.
Quinielazo: https://quiniela-native.vercel.app/
SpainXplorer: https://spainxplorer.vercel.app/

## Cómo se juega

1. Escribe tu nombre y pulsa **Jugar**.
2. Elige piedra, papel o tijera. La máquina responde al segundo.
3. Ganas 1 punto por victoria y pierdes 1 por derrota. Con **Salir** vuelves al inicio.

Si cierras la app y vuelves, sigues donde estabas. Si repites un nombre, retomas sus puntos.

## Extras

- **Ranking**: mejores marcas de cada jugador, en local y (si hay internet) online.
- **Lagarto-Spock**: modo de 5 opciones desde el inicio.
- **Máquina inteligente**: interruptor _Hard mode_ en la partida; aprende tu jugada más repetida.
- **Vibración**: el móvil vibra cuando pierdes.
- **Tema claro/oscuro**: botón arriba a la derecha, se recuerda.
- **Instalable y offline**: se puede instalar como app y jugar en modo avión tras la primera visita.

## Stack y apuntes técnicos

    una sola app que funciona en móvil y en navegador, pudiendo incluso desplegar a las tiendas de Apple y Google.

- **TypeScript:** es JavaScript con etiquetas que dicen qué es cada dato (texto, número, etc.). Como dev lo uso porque me avisa de errores antes de probar la app y me ayuda a cambiar código sin romper nada.
- **Supabase:** guarda el ranking online cuando hay internet.
- **En el móvil:** guarda tus puntos aunque no tengas conexión.
- **Vercel:** donde está publicada y desplegada la app.

La mayor parte del código está documentado con lenguaje natural sencillo. ¡Especialmente las nuevas funcionalidades!

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

## Sección BONUS Fun fact

Hace cuatro años ya hice esta prueba 😄
Para comparar el progreso dejo los enlaces:

- **Repo:** : https://github.com/kmhdev/bbva-rock-paper-scissors-old
- **App desplegada**: https://bbva-rock-paper-scissors-old.vercel.app/
