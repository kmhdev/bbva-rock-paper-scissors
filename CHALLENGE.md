# Enunciado original — BBVA Rock Paper Scissors

Este fichero conserva el brief de partida del proyecto: el encargo adaptado
con las pautas de calidad y el stack, y el contenido literal del reto publicado
por BBVA Engineering.

- Repo: https://github.com/kmhdev/bbva-rock-paper-scissors
- Reto: https://bbvaengineering.github.io/challenges/rock-paper-scissors/

---

## 1. Encargo adaptado (pautas del proyecto)

### Linter y código limpio

- Configurar un linter y prestar especial atención a que el código sea limpio
  (buenos nombres para funciones, variables, constantes numéricas, ...).

### Separación de responsabilidades

Separar bien el código según el framework. Propuestas (la idea es que todo esté
fragmentado en pequeñas piezas con responsabilidades claras para que sea fácil
de entender, escalar y mantener):

- **Componentes**: según el diseño, pero al menos uno para representar cada
  opción (piedra/papel/tijera), reutilizado esas 3 veces.
- **Vistas**: home y game (pueden ser también componentes).
- **Servicios, mixins o similar**: la vista game sería lo más sencilla posible,
  con estos servicios inyectados:
  - **A**: temas del usuario — almacenar la puntuación de un usuario,
    recuperar la puntuación dado un usuario, etc.
  - **B**: lógica del juego — función a la que se le pasa un par de opciones y
    devuelve quién gana. Si el día de mañana se quiere una lógica más compleja
    (lagarto, spock — hay bonus point), se crearía un servicio similar a B, con
    métodos que se llamen igual pero distinto contenido, y la vista game usaría
    ese servicio.
  - **C**: "inteligencia" de la máquina — función que devuelve la opción que
    elige la máquina. Si se quiere una inteligencia más compleja (hay bonus
    point), se crearía un servicio similar a C, con métodos que se llamen igual
    pero distinto contenido, y la vista game usaría ese servicio.

### Ranking (bonus)

Si se hace el bonus del ranking: vista `ranking`, componente reutilizable para
cada fila, y en el servicio A un método para obtener las puntuaciones de todos
los jugadores.

### PWA offline

App PWA: configurar service worker y manifest para funcionar offline (addons/CLI
del framework o Workbox de Google).

### Tests

Importantísimo incluir tests unitarios con alta cobertura de código. No es
prioritario, pero si da tiempo, tests e2e.

### Persistencia sin backend

Como no hay backend y debe funcionar offline, almacenar los datos de usuarios
con algo sencillo como `localStorage`.

### Maquetación

Etiquetas semánticas siempre que sea posible (en lugar de `div` o similar) y
metodología BEM (o similar) para las clases CSS.

### README

Debe contener todos los pasos para instalar el proyecto, arrancarlo fácilmente
y la URL donde esté desplegado.

### Accesibilidad

Prestar atención a accesibilidad: etiquetas `alt`, `aria-*`, `tabindex`, etc.

### Stack elegido para esta implementación

- **React Native + TypeScript**, tanto para webapp como mobile (proyecto Expo
  único, mobile-first, con posibilidad nativa).
- **Zustand** para gestión de estado.
- **ESLint** como linter.
- **Supabase** como base de datos para los bonus points (ranking, etc.).

---

## 2. Reto original — BBVA Engineering (contenido literal)

Recuperado de https://bbvaengineering.github.io/challenges/rock-paper-scissors/

> Como parte de nuestro proceso de selección, nos gustaría ver qué tipo de
> aplicación eres capaz de desarrollar. **Valoraremos muy positivamente
> cualquier característica adicional**, tanto en la aplicación como en el
> entorno de desarrollo o despliegue, que quieras implementar por tu cuenta.

### Enunciado

Queremos que crees una app móvil web progresiva basada en el juego de
**"Piedra, papel o tijera"**.

La aplicación debe tener una primera vista **"home"** en la que el usuario
introducirá su nombre para registrarse y empezar el juego. Esta primera vista
deberá ser la ruta por defecto y cualquier acceso a una ruta que no exista
debería redirigir a dicha vista.

La vista **"home"** contendrá al menos **un campo de texto** para introducir el
nombre del jugador **y un botón** para iniciar el juego. El botón validará que
se ha introducido un nombre de usuario válido antes de iniciar el juego.

Una vez se ha creado el usuario, se transiciona a la vista de juego **"game"**
siendo ésta una nueva ruta dentro de la app.

La vista **"game"** mostrará el nombre del jugador, los puntos que tiene, tres
botones para seleccionar una jugada (piedra, papel o tijera) y otro para salir.

Cada vez que se haga `click` en uno de los botones de juego, se mostrará por
pantalla la selección realizada. A continuación y **tras pasar al menos un
segundo**, la "máquina" seleccionará su jugada dentro de las tres opciones
posibles. La selección de la "máquina" deberá ser distinta en cada jugada.

Una vez que los dos jugadores tienen una opción seleccionada, se resolverá el
ganador y se mostrará en la vista. Reglas:

- Piedra gana a tijeras.
- Tijeras gana a papel.
- Papel gana a piedra.

Existe la posibilidad de empate (misma opción): nadie gana ni pierde. Cada vez
que el jugador gane una jugada ganará un punto.

El botón de salir permite volver a la vista "home". Si en "home" se introduce
un nombre de jugador que ya existía, se continúa la partida donde el jugador la
dejara.

Si se cerrase la aplicación, al volver se continúa con el mismo estado en el
que estaba: **se deben persistir los datos de todos los jugadores**.

La aplicación **deberá funcionar offline**: con modo avión y tras haberla
abierto al menos una vez, se podrá acceder sin problemas.

La aplicación deberá estar **desplegada y disponible públicamente**.

> **¡RECUERDA!** Los ejemplos visuales mostrados son únicamente orientativos y
> no deben sesgar tu creatividad.

### Requisitos

- La aplicación deberá contener funcionalmente, como mínimo, las instrucciones
  detalladas en el enunciado.
- **El código debe ser público.**
- Se deberán realizar **tests unitarios** de las vistas y de los componentes.
- Alojar en infraestructura pública (Vercel, Netlify, Github Pages, ...).
- **README.md** con las instrucciones para hacer funcionar la aplicación en
  local (más cualquier dato que se considere necesario).

### Otras consideraciones

Cualquier herramienta, librería o framework dentro del ecosistema JavaScript.
Se valoran muy positivamente:

- Calidad, claridad y limpieza del código.
- Componentes reutilizables.
- Otro tipo de tests.
- Análisis estático y formateo.
- Mejoras en flujo/metodología de desarrollo, construcción y despliegue.
- Otras características importantes para una PWA.

### Entregable

Enlace al repositorio con el código y enlace con la aplicación desplegada.

### *Bonus points*

- Incluir vista de "ranking" con la máxima puntuación de cada jugador.
- Jugar contra otro jugador en vez de contra la "máquina".
- Mejorar la "inteligencia" de la "máquina".
- Más opciones: "piedra, papel, tijeras, lagarto o Spock".
- Vibración en el dispositivo cada vez que el usuario pierda.
