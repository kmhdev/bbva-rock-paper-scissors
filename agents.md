# Instrucciones básicas sobre el proyecto

- Siempre utilizarás este archivo (agents.md) como referencia en cualquier iteración que hagas sobre el proyecto.
- Antes de dar por bueno cualquier cambio que realices, revisarás los errores de TypeScript y te asegurarás de que no existan errores nuevos.
- La base tanto de arquitectura, code-style, estructura de carpetas y estilos de UI viene de C:\repos\quinielazo\quiniela-native, tómalo de ejemplo siempre en este repo.

# Guía interna de estilos, helpers y estructura de los archivos

- En los archivos de componentes (.tsx/.jsx) solo debe haber lógica de renderizado y ciclo de vida (hooks, useEffect, etc.). Toda la lógica de animaciones, helpers, PanResponder, interpolaciones, cálculos, etc. debe exportarse y centralizarse en el archivo .styles.ts correspondiente. El componente debe estar lo más limpio posible y solo consumir helpers y estilos importados.
- Todas las funciones helpers de animación o utilidades exportadas desde los archivos de estilos (por ejemplo, Header.styles.ts, Sidebar.styles.ts) deben declararse SIEMPRE después de la declaración principal de StyleSheet.create. Nunca antes. Esto mantiene la consistencia y facilita la localización de estilos y helpers.

# Buenas prácticas para tipos e interfaces

- Todas las interfaces y types globales o compartidos deben declararse en la carpeta `types/` (por ejemplo, en `types/types.ts`).
- Los archivos de componentes, servicios y helpers deben importar los tipos desde allí.
- Esto mejora la mantenibilidad, la reutilización y la claridad del código.

# Buenas prácticas sobre estilos y componentes

- Se mantendrá una estructura de componentes donde haya una carpeta con el nombre del componente y dentro nombreComponente.tsx y nombreComponente.styles.ts para los estilos.
- Si un componente requiere lógica o helpers propios (que no sean solo estilos), crear un archivo nombreComponente.helpers.ts en la misma carpeta para centralizar esa lógica.
- Evita utilizar estilos inline inyectados en el jsx

# Comandos OBLIGATORIOS tras cada acción

- Para comprobar errores de TypeScript tras cambios:
  ```sh
  npx tsc --noEmit
  ```
- Para comprobar y corregir errores de ESLint tras cambios:
  ```sh
  npx eslint . --ext .ts,.tsx --fix
  ```
- Para formatear el código con Prettier:
  ```sh
  npx prettier --write .
  ```
- Si se modifica la configuración de ESLint (v9+), asegúrate de que el archivo se llame `eslint.config.mjs` y ejecuta los comandos anteriores para validar la configuración.

---

name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT

---

# Karpathy Guidelines

Behavioral guidelines to reduce common LLM coding mistakes, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
