# 🔐 Credenciales Completas de Mercado Pago - Producción

## Información de Credenciales

### Credenciales de Producción

| Tipo              | Valor                                                                       | Uso                                        |
| ----------------- | --------------------------------------------------------------------------- | ------------------------------------------ |
| **Access Token**  | `APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974` | Crear preferencias de pago (server-side)   |
| **Public Key**    | `APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6`                              | SDK de Mercado Pago en frontend (opcional) |
| **Client ID**     | `8653596253805253`                                                          | Generar nuevos tokens (opcional)           |
| **Client Secret** | `CgXv3EjqJGcZnXfwofqFfZzNlVhxZBXj`                                          | Generar nuevos tokens (opcional)           |

## 📋 Configuración en Vercel

### Variables Obligatorias

#### 1. MP_ACCESS_TOKEN

```
Name: MP_ACCESS_TOKEN
Value: APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974
Environments: Production, Preview, Development
```

### Variables Opcionales

#### 2. NEXT_PUBLIC_MP_PUBLIC_KEY

```
Name: NEXT_PUBLIC_MP_PUBLIC_KEY
Value: APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6
Environments: Production, Preview, Development
```

#### 3. MP_CLIENT_ID (Solo si necesitas generar tokens)

```
Name: MP_CLIENT_ID
Value: 8653596253805253
Environments: Production, Preview, Development
```

#### 4. MP_CLIENT_SECRET (Solo si necesitas generar tokens)

```
Name: MP_CLIENT_SECRET
Value: CgXv3EjqJGcZnXfwofqFfZzNlVhxZBXj
Environments: Production, Preview, Development
```

## 🔒 Seguridad

### ⚠️ IMPORTANTE

- ❌ **NUNCA** commitear estas credenciales en el repositorio
- ✅ **SOLO** configurarlas en Vercel Dashboard
- ✅ Usar `.env.local` solo para desarrollo local (y agregarlo a `.gitignore`)
- ✅ Rotar credenciales si se comprometen

### Variables Sensibles

- `MP_ACCESS_TOKEN` - ⚠️ SECRETO (server-side only)
- `MP_CLIENT_SECRET` - ⚠️ SECRETO (solo si se usa)
- `NEXT_PUBLIC_MP_PUBLIC_KEY` - ✅ Público (puede estar en frontend)
- `MP_CLIENT_ID` - ✅ Público (puede estar en frontend)

## 🧪 Verificación

### Verificar Localmente

```bash
# Crear .env.local (NO commitear)
cat > .env.local << EOF
MP_ACCESS_TOKEN=APP_USR-8653596253805253-111810-82e52430f28c34008907e68d10af95b0-24582974
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-c5bf7fca-29e2-4cf7-bc4c-947f1f407bd6
EOF

# Verificar
pnpm verify-mp-prod
```

### Verificar en Producción

1. Ve a Vercel Dashboard → Deployments → Último deploy → View Function Logs
2. Busca: `[MP-PAYMENT] ✅ Token configurado correctamente`
3. Si ves errores, verifica que las variables estén configuradas correctamente

## 📚 Referencias

- [Mercado Pago Developers Panel](https://www.mercadopago.com.ar/developers/panel)
- [Documentación MP + Envío](./MERCADOPAGO_ENVIO_COMPLETO.md)
- [Guía de Configuración](./CONFIGURAR_CREDENCIALES_MP_PRODUCCION.md)

---

**Última actualización:** Noviembre 2024
**Estado:** ✅ Credenciales de Producción Configuradas
