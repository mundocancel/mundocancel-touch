# Arquitectura de mundocancel Touch

## Capas
- **MundoCore:** Núcleo con registro de módulos, navegación, historial (TimeStack), persistencia en localStorage, paleta de comandos.
- **Renderizado:** Funciones `renderHome()`, `renderProjects()`, etc., que generan HTML a partir del estado.
- **Módulos:** Cada pantalla es un comando registrado con `MundoCore.register()`.

## Estado global
`MundoCore.state` contiene:
- `screen`: pantalla activa.
- `history`: array de estados anteriores.
- `currentIndex`: posición en el historial.

## Flujo de interacción
1. El usuario toca un botón → se llama a `MundoCore.navigate('pantalla')`.
2. `navigate` guarda el estado actual en el historial, actualiza `state.screen` y llama a `render()`.
3. `render` vacía el contenedor principal y ejecuta la función de renderizado correspondiente.
4. La paleta de comandos (`/`) permite ejecutar cualquier comando registrado escribiendo su nombre.

## Persistencia
- Al cambiar de pantalla, `saveState()` guarda el estado en `localStorage`.
- Al cargar la página, `loadState()` restaura la sesión anterior.
- El historial permite deshacer con `Ctrl+Z`.