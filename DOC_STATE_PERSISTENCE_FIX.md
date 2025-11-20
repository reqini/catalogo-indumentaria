# 🔄 Fix de Persistencia de Estado (Refresh/F5 Bug)

## 🎯 Objetivo

Resolver el bug donde al hacer F5 (refresh), la UI pierde estado y no vuelve a aparecer la pantalla de carga múltiple ni cambios recientes.

---

## 🔴 Problema Detectado

### Síntoma
Al hacer F5 en el admin panel:
- La UI pierde estado
- La pantalla de carga múltiple no vuelve a aparecer
- Los cambios recientes se pierden
- Los filtros y búsquedas se resetean

### Causa Raíz
Los componentes del admin usan `useState` para valores que deberían persistir:
- `inputText` en carga múltiple se resetea al valor inicial
- `parsedProducts` se pierde
- `currentStep` vuelve a 1
- Filtros y búsquedas se resetean

---

## ✅ Solución Implementada

### Estrategia: Persistencia con sessionStorage

Usamos `sessionStorage` (en lugar de `localStorage`) porque:
- Se limpia al cerrar la pestaña (más seguro)
- Persiste durante la sesión (incluye refresh)
- No interfiere con otras pestañas

### Componentes Afectados

1. **Carga Múltiple** (`app/admin/productos/carga-inteligente/page.tsx`)
2. **Listado de Productos** (`app/admin/productos/page.tsx`)
3. **Categorías** (`app/admin/categorias/page.tsx`)
4. **Banners** (`app/admin/banners/page.tsx`)

---

## 📝 Implementación

### Hook Personalizado: usePersistedState

```typescript
import { useState, useEffect } from 'react'

function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Leer del sessionStorage al montar
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading ${key} from sessionStorage:`, error)
      return initialValue
    }
  })

  // Guardar en sessionStorage cuando cambia
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.error(`Error saving ${key} to sessionStorage:`, error)
    }
  }, [key, state])

  return [state, setState]
}
```

### Uso en Carga Múltiple

```typescript
// ANTES
const [inputText, setInputText] = useState(EXAMPLE_TEXT)
const [parsedProducts, setParsedProducts] = useState<EnhancedProduct[]>([])
const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

// DESPUÉS
const [inputText, setInputText] = usePersistedState('bulk-import-input', EXAMPLE_TEXT)
const [parsedProducts, setParsedProducts] = usePersistedState<EnhancedProduct[]>('bulk-import-products', [])
const [currentStep, setCurrentStep] = usePersistedState<1 | 2 | 3>('bulk-import-step', 1)
```

### Uso en Listado de Productos

```typescript
// ANTES
const [searchTerm, setSearchTerm] = useState('')
const [filterActivo, setFilterActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos')
const [currentPage, setCurrentPage] = useState(1)

// DESPUÉS
const [searchTerm, setSearchTerm] = usePersistedState('products-search', '')
const [filterActivo, setFilterActivo] = usePersistedState<'todos' | 'activos' | 'inactivos'>('products-filter-activo', 'todos')
const [currentPage, setCurrentPage] = usePersistedState('products-page', 1)
```

---

## 🧪 Tests

### Test de Persistencia

```typescript
test('should persist state across page refresh', async ({ page }) => {
  // Ir a carga múltiple
  await page.goto('/admin/productos/carga-inteligente')
  
  // Modificar input
  await page.fill('textarea', 'Producto test | categoría: Test | precio: 1000')
  
  // Procesar
  await page.click('button:has-text("Procesar")')
  await page.waitForSelector('table', { timeout: 10000 })
  
  // Hacer refresh
  await page.reload()
  
  // Verificar que el estado se mantiene
  const textareaValue = await page.locator('textarea').inputValue()
  expect(textareaValue).toContain('Producto test')
  
  // Verificar que la tabla sigue visible
  await expect(page.locator('table')).toBeVisible()
})
```

---

## 📁 Archivos Modificados

- `hooks/usePersistedState.ts` - Hook personalizado (NUEVO)
- `app/admin/productos/carga-inteligente/page.tsx` - Usar hook
- `app/admin/productos/page.tsx` - Usar hook para filtros
- `app/admin/categorias/page.tsx` - Usar hook si aplica
- `app/admin/banners/page.tsx` - Usar hook si aplica

---

## ✅ Checklist de QA

- [ ] **Refresh en carga múltiple**
  - [ ] Modificar input
  - [ ] Procesar productos
  - [ ] Hacer F5
  - [ ] Verificar que input se mantiene
  - [ ] Verificar que productos procesados se mantienen
  - [ ] Verificar que step se mantiene

- [ ] **Refresh en listado de productos**
  - [ ] Aplicar filtros
  - [ ] Buscar productos
  - [ ] Cambiar página
  - [ ] Hacer F5
  - [ ] Verificar que filtros se mantienen
  - [ ] Verificar que búsqueda se mantiene
  - [ ] Verificar que página se mantiene

- [ ] **Navegación entre rutas**
  - [ ] Ir a carga múltiple
  - [ ] Modificar estado
  - [ ] Ir a productos
  - [ ] Volver a carga múltiple
  - [ ] Verificar que estado se mantiene

- [ ] **Cerrar y abrir pestaña**
  - [ ] Modificar estado
  - [ ] Cerrar pestaña
  - [ ] Abrir nueva pestaña
  - [ ] Verificar que estado se resetea (sessionStorage)

---

**Última actualización**: 2024-12-19
**Estado**: ✅ **IMPLEMENTADO**

