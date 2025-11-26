# Theme Builder - Generador de Design Tokens

Una herramienta web profesional para crear, visualizar y exportar design tokens / themes en tiempo real.

## 🎯 ¿Qué hace la herramienta?

Theme Builder te permite:

- **Crear themes completos** con colores, tipografías, spacing, radius, shadows y breakpoints
- **Ver cambios en tiempo real** con una vista previa interactiva
- **Guardar presets** para reutilizar themes más tarde
- **Exportar a múltiples formatos**: JSON, CSS Variables, Tailwind Config, JSS/MUI, Bootstrap SCSS
- **Aplicar themes a la landing** para ver cómo se ven en un sitio real

## 🚀 Cómo correr el proyecto

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm

### Instalación

```bash
# Instalar dependencias
pnpm install

# Correr en desarrollo
pnpm dev

# Build para producción
pnpm build

# Iniciar producción
pnpm start
```

El proyecto estará disponible en `http://localhost:3000`

## 📖 Cómo usar el Builder

### 1. Acceder al Builder

Navega a `/builder` o haz click en "Abrir Generador de Temas" desde la landing.

### 2. Personalizar el Theme

Usa los controles en el panel izquierdo para modificar:

- **Colores**: Primary, Secondary, Background, Surface, Text, etc.
- **Tipografía**: Fuentes base y títulos, tamaños, pesos
- **Spacing**: Escala de espaciado (XS, SM, MD, LG, XL)
- **Radius & Shadow**: Bordes redondeados y sombras
- **Breakpoints**: Puntos de quiebre responsive

### 3. Ver Cambios en Tiempo Real

La vista previa a la derecha se actualiza automáticamente cuando modificas cualquier token.

### 4. Guardar Presets

1. Personaliza tu theme
2. Ingresa un nombre en "Guardar theme actual"
3. Click en "Guardar"
4. El preset aparecerá en la lista y se guardará en localStorage

### 5. Aplicar Presets

Click en "Aplicar" junto a cualquier preset guardado para cargarlo.

### 6. Exportar Theme

1. Ve a la sección "Exportar Theme"
2. Selecciona el formato deseado (JSON, CSS, Tailwind, etc.)
3. Click en el botón de copiar para copiar al portapapeles
4. Pega el contenido en tu proyecto

## 📤 Formatos de Exportación

### JSON

Formato completo del theme en JSON estructurado. Útil para almacenar o compartir.

### CSS Variables

Variables CSS listas para usar en tu proyecto:

```css
:root {
  --color-primary: #3b82f6;
  --font-base: 'Inter', sans-serif;
  --spacing-md: 16px;
  /* ... */
}
```

### Tailwind Config

Configuración para extender Tailwind CSS:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        /* ... */
      },
      fontFamily: {
        /* ... */
      },
      // ...
    },
  },
}
```

### JSS / MUI

Objeto JavaScript listo para usar con Material-UI o JSS:

```js
const theme = {
  palette: {
    /* ... */
  },
  typography: {
    /* ... */
  },
  // ...
}
```

### Bootstrap SCSS

Variables SCSS para Bootstrap:

```scss
$primary: #3b82f6;
$font-family-base: 'Inter', sans-serif;
// ...
```

## 💾 Cómo funcionan los Presets

Los presets se guardan automáticamente en `localStorage` del navegador. Esto significa:

- ✅ Los presets persisten entre sesiones
- ✅ Cada usuario tiene sus propios presets
- ✅ No se requiere backend ni base de datos
- ⚠️ Los presets son específicos del navegador/dispositivo

### Operaciones con Presets

- **Guardar**: Crea un nuevo preset con el theme actual
- **Aplicar**: Carga un preset guardado
- **Renombrar**: Cambia el nombre de un preset
- **Eliminar**: Borra un preset permanentemente
- **Resetear**: Vuelve al theme por defecto

## 🎨 Aplicar Theme a la Landing

1. Personaliza tu theme en el builder
2. Opcionalmente guárdalo como preset
3. Ve a la landing principal (`/`)
4. Click en "Aplicar Theme Actual" (si hay presets guardados)
5. La landing se actualizará con los colores y estilos del theme

## 🏗️ Arquitectura

### Estructura de Archivos

```
app/
  builder/
    page.tsx          # Página principal del builder
    layout.tsx        # Layout específico del builder
  page.tsx            # Landing page

components/
  theme/
    ThemeControlsPanel.tsx    # Panel de controles
    ThemePreviewDemo.tsx      # Vista previa
    ThemePresetsManager.tsx    # Gestor de presets
    ExportPanel.tsx            # Panel de exportación

lib/
  theme-context.tsx           # Context API para theme global
  theme-exporters.ts          # Funciones de exportación

types/
  theme.ts                    # Tipos TypeScript
```

### Flujo de Datos

1. **ThemeProvider** maneja el estado global del theme
2. Los **componentes** leen y actualizan el theme via `useTheme()`
3. Los cambios se **persisten** automáticamente en localStorage
4. La **vista previa** se actualiza reactivamente
5. Los **exportadores** transforman el theme a diferentes formatos

## 🧪 Tests

### Tests Unitarios

```bash
pnpm test
```

Tests disponibles:

- `tests/theme/exporters.test.ts` - Validación de funciones de exportación
- `tests/theme/presets.test.ts` - Validación de manejo de presets

### Tests E2E

```bash
pnpm test:e2e
```

Tests E2E disponibles:

- `qa/e2e/theme-builder.spec.ts` - Flujo completo del builder

## 📝 Documentación Adicional

- **QA Completo**: Ver `qa/QA_THEME_BUILDER.md`
- **Casos de Prueba**: Ver archivo QA para lista completa

## 🔮 Futuras Mejoras Sugeridas

1. **Importar themes** - Permitir importar JSON existente
2. **Más fuentes** - Expandir lista de Google Fonts disponibles
3. **Más formatos** - Agregar soporte para SASS, LESS, Styled Components
4. **Historial** - Guardar versiones de themes
5. **Compartir** - Generar URLs compartibles para themes
6. **Templates** - Themes predefinidos para empezar rápido
7. **Exportar como archivo** - Descargar directamente en lugar de copiar
8. **Validación avanzada** - Validar contrastes de colores, accesibilidad
9. **Modo oscuro** - Theme builder con modo oscuro
10. **Colaboración** - Compartir themes entre usuarios

## 🛠️ Tecnologías Utilizadas

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **React** - Biblioteca UI
- **Tailwind CSS** - Estilos utility-first
- **Google Fonts** - Tipografías web
- **Vitest** - Testing unitario
- **Playwright** - Testing E2E
- **localStorage** - Persistencia de datos

## 📄 Licencia

Este proyecto es parte del catálogo de indumentaria.

---

**Versión:** 1.0.0  
**Última actualización:** 26/11/2025
