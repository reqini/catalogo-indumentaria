# 🎨 Logo "ASÍ SOMOS" - Documentación de Branding

**Versión:** 1.0.0  
**Fecha de creación:** 2025-02-27  
**Estado:** ✅ Aprobado para producción

---

## 📋 ESPECIFICACIONES DEL DISEÑO

### Concepto Visual

El logo "ASÍ SOMOS" está construido con:

- **Franja diagonal única**: Mantiene la proporción, curvatura y espesor original
- **Texto "ASÍ SOMOS"**: Tipografía fuerte, redondeada y moderna
- **Diseño minimalista**: Monocromo sólido, sin sombras, sin efectos 3D, sin degradados

### Paleta de Colores Oficial

```css
/* Colores primarios del branding */
--brand-primary: #7452A8;    /* Violeta pastel intenso */
--brand-secondary: #F7E8B5;  /* Crema / amarillo pastel claro */
```

**Uso:**
- Versión principal: Texto + franja en `#7452A8` sobre fondo `#F7E8B5`
- Versión inversa: Texto + franja en `#F7E8B5` sobre fondo `#7452A8` (para fondos oscuros)

---

## 📁 ARCHIVOS DISPONIBLES

### Logo Principal (Cuadrado)

- **`logo-main.svg`**: Versión vectorial escalable (400x200px viewBox)
- **`logo-main.png`**: Versión rasterizada con fondo transparente (400x200px)

**Uso recomendado:**
- Portadas
- Material institucional
- Aplicaciones móviles
- Favicon (con ajuste de tamaño)

### Logo Horizontal (Header)

- **`logo-horizontal.svg`**: Versión vectorial escalable (600x120px viewBox)
- **`logo-horizontal.png`**: Versión rasterizada con fondo transparente (600x120px)

**Uso recomendado:**
- Header web
- Navbar
- Banners horizontales
- Email signatures

---

## 🧩 INTEGRACIÓN EN EL PROYECTO

### Componentes React Disponibles

#### `LogoAsiSomosMain`

```tsx
import LogoAsiSomosMain from '@/components/branding/LogoAsiSomosMain'

<LogoAsiSomosMain 
  width={200} 
  height={100} 
  className="custom-class" 
/>
```

**Props:**
- `width?: number` - Ancho del logo (default: 200)
- `height?: number` - Alto del logo (default: 100)
- `className?: string` - Clases CSS adicionales
- `variant?: 'default' | 'inverse'` - Versión de color (default: 'default')

#### `LogoAsiSomosHorizontal`

```tsx
import LogoAsiSomosHorizontal from '@/components/branding/LogoAsiSomosHorizontal'

<LogoAsiSomosHorizontal 
  width={300} 
  height={60} 
  className="custom-class" 
/>
```

**Props:**
- `width?: number` - Ancho del logo (default: 300)
- `height?: number` - Alto del logo (default: 60)
- `className?: string` - Clases CSS adicionales
- `variant?: 'default' | 'inverse'` - Versión de color (default: 'default')

### Variables de Tema

```typescript
// En tu archivo de tema o constantes
export const BRAND_COLORS = {
  primary: '#7452A8',
  secondary: '#F7E8B5',
} as const
```

---

## ✅ QA VISUAL - CHECKLIST

### Proporciones y Diseño

- [x] Proporciones mantenidas respecto al diseño original
- [x] Curvatura de la franja original sin deformaciones
- [x] Espesor de la franja consistente en todo el logo
- [x] Tipografía correcta y alineado perfecto
- [x] Ángulo y rotación de la franja preservados

### Calidad Técnica

- [x] No hay píxeles sueltos en versiones rasterizadas
- [x] SVG optimizado y escalable sin pérdida de calidad
- [x] Transparencia correcta en PNG
- [x] Colores exactos según especificación (#7452A8, #F7E8B5)

### Legibilidad

- [x] Legible en tamaños pequeños (favicon y navbar)
- [x] Legible en tamaños grandes (banners)
- [x] Contraste WCAG mínimo AA cumplido
- [x] Claridad en pantallas retina y no retina
- [x] Visualización correcta sobre fondos claros
- [x] Visualización correcta sobre fondos oscuros (versión inversa)

### Responsive

- [x] Se ve perfecto en desktop
- [x] Se ve perfecto en mobile
- [x] Se adapta correctamente a diferentes tamaños de pantalla

### Branding

- [x] Branding consistente con identidad general del proyecto
- [x] No altera elementos prohibidos (mandala, plumas, número 11)
- [x] Mantiene estilo minimalista y premium

---

## 🎯 REGLAS DE USO

### ✅ Permitido

- Escalar el logo manteniendo proporciones
- Usar en fondos claros y oscuros (con variante apropiada)
- Aplicar opacidad para efectos sutiles
- Usar en cualquier tamaño siempre que mantenga legibilidad

### ❌ Prohibido

- Alterar los colores oficiales
- Modificar la curvatura o espesor de la franja
- Agregar sombras, efectos 3D o degradados
- Rotar o distorsionar el logo
- Usar elementos adicionales (mandala, plumas, número 11)
- Cambiar la tipografía o espaciado del texto

---

## 📐 ESPECIFICACIONES TÉCNICAS

### Dimensiones

**Logo Principal:**
- ViewBox: `0 0 400 200`
- Proporción: 2:1 (ancho:alto)
- Tamaño mínimo recomendado: 200x100px
- Tamaño máximo recomendado: 800x400px

**Logo Horizontal:**
- ViewBox: `0 0 600 120`
- Proporción: 5:1 (ancho:alto)
- Tamaño mínimo recomendado: 300x60px
- Tamaño máximo recomendado: 1200x240px

### Formatos

- **SVG**: Vectorial, escalable sin pérdida, recomendado para web
- **PNG**: Rasterizado, fondo transparente, recomendado para casos específicos

### Espaciado Mínimo

- Mínimo espacio libre alrededor del logo: 20% del ancho del logo
- No colocar otros elementos dentro del área de respiro

---

## 🔄 VERSIONADO

Este logo es parte del sistema de branding oficial del proyecto. Cualquier modificación debe:

1. Ser aprobada por el equipo de diseño
2. Actualizar esta documentación
3. Generar nuevas versiones de los assets
4. Actualizar el número de versión en este README

---

## 📞 SOPORTE

Para consultas sobre el uso del logo o solicitudes de modificaciones, contactar al equipo de diseño.

---

**Última actualización:** 2025-02-27  
**Mantenido por:** Equipo de Branding y Diseño

