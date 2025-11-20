# 📌 Versión Visible en Footer - Documentación

## 🎯 Objetivo

Mostrar información de versión y build en el footer del admin panel para facilitar la identificación de la versión desplegada y debugging en producción.

---

## 🏗 Implementación

### Componente Creado

**Archivo:** `components/admin/VersionFooter.tsx`

**Funcionalidad:**
- Lee variables de entorno de Vercel
- Muestra versión del `package.json`
- Muestra commit hash corto (7 caracteres)
- Muestra branch actual
- Muestra fecha y hora de build formateada
- Muestra entorno (PROD / PREVIEW / DEV) con colores diferenciados

### Variables de Entorno

**Configuración en `next.config.js`:**
```javascript
env: {
  NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || '',
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF || 'main',
  NEXT_PUBLIC_VERCEL_BUILD_TIME: process.env.VERCEL_BUILD_TIME || new Date().toISOString(),
}
```

**Variables Disponibles en Vercel:**
- `VERCEL_ENV`: Entorno actual (`production`, `preview`, `development`)
- `VERCEL_GIT_COMMIT_SHA`: Hash completo del commit
- `VERCEL_GIT_COMMIT_REF`: Branch o tag del commit
- `VERCEL_BUILD_TIME`: Timestamp del build (ISO 8601)

### Integración

**Archivo:** `app/admin/layout.tsx`

```typescript
import VersionFooter from '@/components/admin/VersionFooter'

// En el return del layout:
<main className="ml-64 min-h-screen flex flex-col">
  <div className="flex-1">
    {children}
  </div>
  <VersionFooter />
</main>
```

---

## 🎨 Render Esperado

### Formato Visual

```
v1.0.0 | commit a81c323 | main | 27/02/2025 13:44 | PROD
```

### Colores por Entorno

- **PROD:** Verde (`text-green-600`)
- **PREVIEW:** Amarillo (`text-yellow-600`)
- **DEV:** Gris (`text-gray-500`)

### Responsive

- Desktop: Información en una línea horizontal
- Mobile: Información se apila verticalmente con `flex-wrap`

---

## 🔧 Configuración en Vercel

### Variables Automáticas

Vercel expone automáticamente estas variables en cada deployment:

1. **VERCEL_ENV**: Se establece automáticamente según el entorno
2. **VERCEL_GIT_COMMIT_SHA**: Hash del commit desplegado
3. **VERCEL_GIT_COMMIT_REF**: Branch o tag del commit
4. **VERCEL_BUILD_TIME**: Timestamp del build

### Verificación

Para verificar que las variables están disponibles:

1. Ir a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Las variables `VERCEL_*` están disponibles automáticamente
3. No es necesario configurarlas manualmente

### Fallback para Desarrollo Local

Si las variables no están disponibles (desarrollo local), el componente usa valores por defecto:

- `VERCEL_ENV` → `'development'`
- `VERCEL_GIT_COMMIT_SHA` → `'local'`
- `VERCEL_GIT_COMMIT_REF` → `'main'`
- `VERCEL_BUILD_TIME` → Fecha/hora actual

---

## 📊 Ejemplo de Uso

### En Producción

```
v1.0.0 | commit a81c323 | main | 27/02/2025 13:44 | PROD
```

### En Preview

```
v1.0.0 | commit b92d456 | feature/new-feature | 27/02/2025 14:20 | PREVIEW
```

### En Desarrollo Local

```
v1.0.0 | commit local | main | 27/02/2025 15:30 | DEV
```

---

## 🐛 Troubleshooting

### La versión no se muestra

**Causa:** Variables de entorno no disponibles  
**Solución:** Verificar que `next.config.js` expone las variables correctamente

### El commit hash es "unknown"

**Causa:** `VERCEL_GIT_COMMIT_SHA` no está disponible  
**Solución:** Verificar que el proyecto está conectado a un repositorio Git en Vercel

### La fecha es incorrecta

**Causa:** `VERCEL_BUILD_TIME` no está disponible o formato incorrecto  
**Solución:** Verificar formato ISO 8601 en Vercel

---

## 🔄 Actualización Automática

La versión se actualiza automáticamente en cada deployment de Vercel:

1. **Push a main** → Deploy a producción → Versión actualizada
2. **Push a branch** → Deploy a preview → Versión actualizada
3. **Build local** → Versión con valores por defecto

---

## 📝 Notas Técnicas

### Performance

- El componente carga la versión de forma asíncrona
- Muestra un spinner mientras carga
- No bloquea el renderizado del resto de la página

### Seguridad

- Solo muestra información pública (commit hash, branch, fecha)
- No expone información sensible
- Variables `NEXT_PUBLIC_*` son públicas por diseño

### Accesibilidad

- Usa iconos de `lucide-react` para mejor UX
- Texto legible y contrastado
- Responsive y mobile-friendly

---

## 🎯 Beneficios

1. **Debugging:** Identificar rápidamente qué versión está desplegada
2. **QA:** Verificar que se está testeando la versión correcta
3. **Soporte:** Ayudar a usuarios a reportar problemas con la versión correcta
4. **Transparencia:** Mostrar información de build de forma clara

---

**Última actualización:** $(date +"%Y-%m-%d")

