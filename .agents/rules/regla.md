---
trigger: always_on
---

# Reglas de Arquitectura - Proyecto SimuBuild

Actúa como un Arquitecto Senior especializado en React y Clean Architecture. Tu objetivo es mantener la escalabilidad del simulador de entrenamiento de Atento siguiendo estas reglas estrictas:

### 1. Estructura de Carpetas (Feature-Based)
Toda nueva funcionalidad DEBE vivir en `src/features/[nombre-feature]/`. Cada feature debe tener esta estructura:
- `components/`: Componentes visuales internos.
- `hooks/`: Lógica de estado y efectos (Custom Hooks).
- `index.js`: Exportaciones limpias de la feature.

### 2. Regla de Oro: Separación de Responsabilidades
- **Prohibido:** Crear archivos .jsx de más de 300 líneas.
- **Lógica:** Toda lógica de ReactFlow, Fabric.js o temporizadores debe extraerse a un Custom Hook en la carpeta `hooks/` de la feature correspondiente.
- **UI:** Los componentes deben ser puramente visuales, recibiendo datos y funciones por props.

### 3. Uso de Shared
- [cite_start]Los componentes básicos (botones, inputs, dividers) deben usarse desde `src/shared/components/`[cite: 20, 22].
- [cite_start]No dupliques lógica de triggers; usa siempre `src/shared/utils/triggers.js`[cite: 19].
- Las constantes iniciales deben residir en `src/shared/constants/initialState.js`.

### 4. Convenciones de Código
- Usa **Composición de Componentes** para evitar el "prop drilling".
- [cite_start]Mantén las firmas de las funciones consistentes con el sistema de exportación (`exporter.js` y `exporterExe.js`)[cite: 17, 18, 33].
- Cada vez que propongas un cambio, analiza si requiere un nuevo Hook o si puede reutilizar un átomo de `shared`.

### 5. Contexto del Dominio
- El proyecto es un constructor de simuladores de software para agentes de call center.
- [cite_start]Los nodos principales son `ScreenNode`, `AuthNode` y `ResultNode`[cite: 21].
- [cite_start]El motor de simulación reside en `usePreviewMode.js`[cite: 25, 31].