# AutoFix System

Sistema de detección y corrección automática de errores para Next.js 14.

## Descripción

El sistema AutoFix detecta errores en tiempo de ejecución (tanto en cliente como servidor), analiza los mensajes de error y stack traces, y aplica correcciones automáticas seguras sin romper el build.

## Características

- ✅ Detección automática de errores en consola y pantalla
- ✅ Análisis inteligente de mensajes de error y stack traces
- ✅ Aplicación de correcciones seguras (sin romper el build)
- ✅ Corrección de imports, dependencias, hooks, rutas, componentes client/server
- ✅ Reportes detallados en `/autofix/reports/`
- ✅ Notificaciones visuales en desarrollo
- ✅ Solo activo en modo desarrollo (deshabilitado en producción)

## Estructura

```
/autofix
├── AutoFixEngine.ts      # Motor principal
├── ErrorBoundary.tsx     # Error boundary mejorado
├── ConsoleInterceptor.ts # Interceptor de console.error
├── FixRegistry.ts        # Registro de reglas de corrección
├── Logger.ts            # Sistema de logging
├── AutoFixInit.tsx      # Componente de inicialización
├── index.ts             # Exportaciones
└── reports/             # Reportes generados
    ├── log.txt          # Log principal
    └── fix-*.json       # Reportes individuales de fixes
```

## Uso

El sistema se inicializa automáticamente en modo desarrollo. No requiere configuración adicional.

### Deshabilitar AutoFix

Para deshabilitar el sistema, agregar a `.env.local`:

```bash
AUTO_FIX=false
```

## Reglas de Corrección

El sistema incluye reglas predefinidas para:

1. **Hydration errors** → Agregar `'use client'`
2. **Module not found** → Sugerir instalación de paquete
3. **Null/undefined access** → Agregar validaciones
4. **ReferenceError** → Declarar variables faltantes
5. **React Hooks errors** → Corregir uso de hooks
6. **Type errors** → Sugerir correcciones de tipos
7. **API route errors** → Verificar métodos HTTP
8. **Import errors** → Corregir paths de import
9. **Next.js hooks** → Agregar `'use client'`
10. **Errores genéricos** → Análisis manual

## Agregar Reglas Personalizadas

```typescript
import { fixRegistry } from '@/autofix'

fixRegistry.registerRule({
  pattern: /mi error personalizado/i,
  type: 'custom',
  description: 'Descripción de la regla',
  priority: 5,
  fix: async (error, context) => {
    return {
      success: true,
      action: 'customFix',
      message: 'Fix aplicado',
      requiresRestart: false,
    }
  },
})
```

## Reportes

Los reportes se guardan en `/autofix/reports/`:

- `log.txt`: Log principal con todos los errores y fixes
- `fix-*.json`: Reportes individuales de cada fix aplicado

## Tests

Ejecutar tests del sistema:

```bash
pnpm test tests/autofix
```

## Integración

El sistema está integrado en `app/layout.tsx`:

```tsx
<AutoFixErrorBoundary>
  <AutoFixInit />
  {/* resto de la app */}
</AutoFixErrorBoundary>
```

## Notas

- El sistema solo funciona en modo desarrollo
- Las correcciones son sugerencias y pueden requerir revisión manual
- Algunos fixes requieren recarga de página
- Los reportes se generan automáticamente

