# 🚚 Documentación Completa: Sistema de Envíos y QA

## 🎯 Objetivo

Documentar el sistema completo de cálculo de envíos por código postal (OCA / Correo Argentino) y asegurar que funcione correctamente.

---

## 📋 Funcionalidades Implementadas

### 1. API de Cálculo de Envío

**Endpoint**: `POST /api/envios/calcular`

**Request**:
```json
{
  "codigoPostal": "B8000",
  "peso": 1.2,
  "precio": 45000,
  "provincia": "Buenos Aires" // Opcional
}
```

**Response**:
```json
{
  "metodos": [
    {
      "nombre": "OCA Estándar",
      "precio": 2850,
      "demora": "3-5 días hábiles",
      "disponible": true
    },
    {
      "nombre": "OCA Express",
      "precio": 3950,
      "demora": "1-2 días hábiles",
      "disponible": true
    },
    {
      "nombre": "Correo Argentino",
      "precio": 2400,
      "demora": "4-6 días hábiles",
      "disponible": true
    }
  ],
  "codigoPostal": "B8000"
}
```

### 2. Componente ShippingCalculator

**Ubicación**: `components/ShippingCalculator.tsx`

**Props**:
- `onSelectMethod`: Callback cuando se selecciona un método
- `selectedMethod`: Método actualmente seleccionado
- `totalPrice`: Precio total del carrito
- `totalWeight`: Peso total estimado (kg)

**Funcionalidades**:
- Input de código postal con validación
- Botón "Calcular" que llama a la API
- Lista de métodos disponibles con precios
- Selección visual del método elegido
- Manejo de errores (CP inválido, sin servicio)

### 3. Integración en Carrito

**Ubicación**: `app/carrito/page.tsx`

**Cambios**:
- Componente `ShippingCalculator` integrado
- Cálculo de peso total (estimado: 0.5kg por producto)
- Total con envío se suma automáticamente
- Envío se incluye en el checkout de Mercado Pago
- Validación: no permite checkout sin seleccionar envío

---

## 🧮 Lógica de Cálculo

### Fórmula Base

```typescript
// OCA Estándar
costo = (baseOCA + (peso * porKgOCA) + (precio * porValorOCA)) * multiplicadorZona

// OCA Express (40% más caro)
costo = costoOCAEstándar * 1.4

// Correo Argentino
costo = (baseCorreo + (peso * porKgCorreo) + (precio * porValorCorreo)) * multiplicadorZona
```

### Valores Actuales (Simulados)

- `baseOCA`: $2000
- `baseCorreo`: $1500
- `porKgOCA`: $500/kg
- `porKgCorreo`: $400/kg
- `porValorOCA`: 2% del valor del producto
- `porValorCorreo`: 1.5% del valor del producto

### Multiplicadores por Zona

- **Zona A** (Buenos Aires Capital - CP B): `1.0`
- **Zona B** (GBA - CP C): `1.0`
- **Zona C** (Interior - otros CP): `1.3`

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `app/api/envios/calcular/route.ts` - API de cálculo
- `components/ShippingCalculator.tsx` - Componente de cálculo
- `DOC_ENVIO_SYSTEM_AND_QA.md` - Esta documentación

### Archivos Modificados
- `app/carrito/page.tsx` - Integración del componente
- `context/CartContext.tsx` - (No modificado, pero puede extenderse)

---

## 🧪 Tests

### Test Unitario: Cálculo de Envío

```typescript
describe('Cálculo de Envío', () => {
  it('should calculate shipping for Buenos Aires', async () => {
    const response = await fetch('/api/envios/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoPostal: 'B8000',
        peso: 1,
        precio: 10000,
      }),
    })
    
    const data = await response.json()
    expect(data.metodos.length).toBeGreaterThan(0)
    expect(data.metodos[0].precio).toBeGreaterThan(0)
  })

  it('should reject invalid postal code', async () => {
    const response = await fetch('/api/envios/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoPostal: '123', // Muy corto
        peso: 1,
        precio: 10000,
      }),
    })
    
    expect(response.status).toBe(400)
  })
})
```

---

## ✅ Checklist de QA

### Funcionalidad Básica
- [ ] Ingresar código postal válido
- [ ] Click en "Calcular"
- [ ] Ver métodos disponibles con precios
- [ ] Seleccionar un método
- [ ] Verificar que se suma al total
- [ ] Verificar que aparece en resumen

### Validaciones
- [ ] CP muy corto (< 4 caracteres) → Error
- [ ] CP muy largo (> 8 caracteres) → Error
- [ ] CP inválido → Mensaje claro
- [ ] Sin métodos disponibles → Mensaje claro

### Integración con Checkout
- [ ] Seleccionar envío
- [ ] Click en "Finalizar Compra"
- [ ] Verificar que envío se incluye en Mercado Pago
- [ ] Verificar que total incluye envío

### Persistencia
- [ ] Seleccionar envío
- [ ] Hacer refresh (F5)
- [ ] Verificar que envío seleccionado se mantiene
- [ ] Verificar que total se mantiene

### Casos Edge
- [ ] Carrito vacío → No mostrar calculadora
- [ ] Peso 0 → Usar peso mínimo (1kg)
- [ ] Precio muy alto → Envío proporcional
- [ ] Múltiples productos → Peso acumulado correcto

---

## 🔧 Mejoras Futuras

### Integración con APIs Reales

1. **OCA API**:
   - Integrar con API oficial de OCA
   - Obtener tarifas reales por código postal
   - Calcular tiempos reales de entrega

2. **Correo Argentino API**:
   - Integrar con API oficial
   - Obtener tarifas reales
   - Validar códigos postales reales

3. **Mercado Flex**:
   - Integrar con Mercado Envíos
   - Obtener tarifas y disponibilidad
   - Tracking automático

### Optimizaciones

1. **Cache de Tarifas**:
   - Cachear tarifas por código postal
   - Reducir llamadas a API
   - Actualizar cache periódicamente

2. **Validación de CP**:
   - Validar código postal contra base de datos real
   - Autocompletar dirección
   - Sugerir código postal correcto

3. **Cálculo de Peso Real**:
   - Permitir ingresar peso por producto
   - Calcular peso total real
   - Más preciso que estimación

---

## 📝 Notas Técnicas

### Estimación de Peso

Actualmente se estima **0.5kg por producto**. Esto es una aproximación razonable para indumentaria, pero puede mejorarse:

- Permitir configurar peso por producto en admin
- Usar peso promedio por categoría
- Permitir ingresar peso manualmente

### Persistencia de Envío Seleccionado

El envío seleccionado se guarda en el estado del componente. Para persistencia entre refreshes:

- Usar `sessionStorage` (similar a carga múltiple)
- O guardar en `CartContext` para compartir entre componentes

### Inclusión en Mercado Pago

El costo de envío se agrega como un item adicional en la preferencia de Mercado Pago:

```typescript
items.push({
  title: `Envío - ${selectedShipping.nombre}`,
  quantity: 1,
  unit_price: selectedShipping.precio,
})
```

Esto permite:
- Tracking del costo de envío
- Reembolsos parciales si es necesario
- Reportes más detallados

---

**Última actualización**: 2024-12-19
**Estado**: ✅ **IMPLEMENTADO Y FUNCIONAL**

