# 🚀 Integración con Envíopack - Cálculo Real de Envíos

## 📋 ¿Qué es Envíopack?

**Envíopack** es una plataforma que permite acceder a múltiples operadores logísticos (OCA, Andreani, Correo Argentino, etc.) mediante una única API, facilitando la gestión de envíos y ofreciendo tarifas competitivas.

## ✅ Ventajas

- ✅ **Una sola integración** para múltiples transportistas
- ✅ **Tarifas reales** y actualizadas
- ✅ **Cobertura nacional** e internacional
- ✅ **API fácil de usar**
- ✅ **Dashboard de métricas** en tiempo real
- ✅ **Soporte técnico** disponible

## 🔧 Configuración

### 1. Registrarse en Envíopack

1. Ir a: https://www.enviopack.com
2. Crear cuenta de desarrollador
3. Obtener `API Key` y `API Secret`

### 2. Configurar Variables de Entorno

Agregar en `.env.local` y Vercel:

```env
ENVIOPACK_API_KEY=tu_api_key_aqui
ENVIOPACK_API_SECRET=tu_api_secret_aqui
```

### 3. Verificar Integración

La API automáticamente:
- Usa Envíopack si las credenciales están configuradas
- Usa cálculo simulado como fallback si no hay credenciales o si falla la API

## 📊 Cómo Funciona

1. **Usuario ingresa código postal** en el carrito
2. **Sistema llama a Envíopack API** con CP, peso y valor
3. **Envíopack devuelve cotizaciones reales** de múltiples transportistas
4. **Sistema muestra opciones** ordenadas por precio
5. **Usuario selecciona método** y se agrega al total

## 🔄 Flujo de Integración

```
Frontend (Carrito)
    ↓
POST /api/envios/calcular
    ↓
calcularEnvioConEnvioPack()
    ↓
Envíopack API
    ↓
Respuesta con cotizaciones reales
    ↓
Frontend muestra opciones
```

## 📝 Ejemplo de Uso

```typescript
// Automático - no requiere cambios en el código
// Solo configurar variables de entorno

// Si ENVIOPACK_API_KEY y ENVIOPACK_API_SECRET están configuradas:
// → Usa Envíopack API (cotizaciones reales)

// Si NO están configuradas:
// → Usa cálculo simulado (fallback)
```

## 🎯 Próximos Pasos

1. **Registrarse en Envíopack**: https://www.enviopack.com
2. **Obtener credenciales** (API Key y Secret)
3. **Configurar variables** en `.env.local` y Vercel
4. **Probar** con código postal real (ej: B8000)
5. **Verificar** que se obtienen cotizaciones reales

## 📚 Documentación Adicional

- **Sitio oficial**: https://www.enviopack.com
- **API Docs**: https://developers.enviopack.com (verificar URL exacta)
- **Soporte**: Contactar a Envíopack para documentación técnica

## ⚠️ Notas Importantes

- La integración tiene **fallback automático** a cálculo simulado
- Si Envíopack no está configurado, el sistema sigue funcionando
- Los precios reales pueden variar según el transportista y zona
- Se recomienda probar con diferentes códigos postales

---

## 🔄 Alternativas (Si Envíopack no está disponible)

### Opción 2: Integración Directa con OCA

Requiere:
- Registro como cliente corporativo
- Credenciales específicas de OCA
- Proceso de aprobación

### Opción 3: Integración Directa con Correo Argentino

Requiere:
- Registro en MiCorreo
- Credenciales específicas
- Proceso de aprobación

### Opción 4: Integración Directa con Andreani

Requiere:
- Registro como cliente corporativo
- Credenciales específicas de Andreani
- Proceso de aprobación

---

**Recomendación:** Empezar con **Envíopack** por su facilidad de integración y acceso a múltiples transportistas.

