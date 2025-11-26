import { NextResponse } from 'next/server'
import { pagoSchema } from '@/utils/validations'
import { getProductById, getProductos } from '@/lib/supabase-helpers'
import { createCompraLog } from '@/lib/supabase-helpers'
import { validateMercadoPagoConfig, getMercadoPagoErrorMessage } from '@/lib/mercadopago/validate'

// CRÍTICO: NO validar al cargar el módulo, validar en runtime para detectar cambios
// Las variables de entorno pueden cambiar entre builds en Vercel

export async function POST(request: Request) {
  try {
    // CRÍTICO: Leer variable directamente primero para diagnóstico
    // Intentar múltiples formas de lectura para asegurar compatibilidad
    const MP_ACCESS_TOKEN_DIRECT =
      process.env.MP_ACCESS_TOKEN ||
      process.env['MP_ACCESS_TOKEN'] ||
      process.env.MERCADOPAGO_ACCESS_TOKEN || // Fallback legacy
      process.env['MERCADOPAGO_ACCESS_TOKEN'] // Fallback legacy
    const VERCEL_ENV = process.env.VERCEL_ENV || 'local'
    const NODE_ENV = process.env.NODE_ENV || 'development'
    const IS_VERCEL = !!process.env.VERCEL

    // Logs detallados de diagnóstico ANTES de validar
    console.log('[MP-PAYMENT] 🔍 DIAGNÓSTICO COMPLETO DE VARIABLES DE ENTORNO')
    console.log('[MP-PAYMENT] ==========================================')
    console.log('[MP-PAYMENT] Entorno:', NODE_ENV)
    console.log('[MP-PAYMENT] VERCEL_ENV:', VERCEL_ENV)
    console.log('[MP-PAYMENT] VERCEL:', IS_VERCEL ? 'SÍ' : 'NO')
    console.log('[MP-PAYMENT] VERCEL_URL:', process.env.VERCEL_URL || 'no definido')
    console.log('[MP-PAYMENT] ------------------------------------------')
    console.log(
      '[MP-PAYMENT] MP_ACCESS_TOKEN (directo):',
      MP_ACCESS_TOKEN_DIRECT ? '✅ PRESENTE' : '❌ NO ENCONTRADO'
    )
    if (MP_ACCESS_TOKEN_DIRECT) {
      console.log('[MP-PAYMENT]   - Longitud:', MP_ACCESS_TOKEN_DIRECT.length)
      console.log('[MP-PAYMENT]   - Empieza con:', MP_ACCESS_TOKEN_DIRECT.substring(0, 15) + '...')
      console.log(
        '[MP-PAYMENT]   - Formato válido:',
        MP_ACCESS_TOKEN_DIRECT.startsWith('APP_USR-') || MP_ACCESS_TOKEN_DIRECT.startsWith('TEST-')
          ? '✅'
          : '❌'
      )
    }

    // Listar TODAS las variables que contienen MP o MERCADO
    const allMPVars = Object.keys(process.env).filter(
      (key) => key.toUpperCase().includes('MP') || key.toUpperCase().includes('MERCADO')
    )
    console.log('[MP-PAYMENT] Variables relacionadas con MP encontradas:', allMPVars.length)
    if (allMPVars.length > 0) {
      allMPVars.forEach((key) => {
        const value = process.env[key]
        const preview = value ? `${value.substring(0, 20)}...` : 'undefined'
        console.log(`[MP-PAYMENT]   - ${key}: ${preview} (length: ${value?.length || 0})`)
      })
    } else {
      console.error('[MP-PAYMENT] ❌ NO se encontraron variables relacionadas con MP')
      console.error(
        '[MP-PAYMENT] ❌ Esto significa que las variables NO están disponibles en este deployment'
      )
      console.error(
        '[MP-PAYMENT] ❌ SOLUCIÓN: Hacer REDEPLOY después de agregar variables en Vercel Dashboard'
      )
    }
    console.log('[MP-PAYMENT] ==========================================')

    // CRÍTICO: Usar token directo si está disponible, incluso si la validación falla
    // Esto permite que funcione aunque la validación sea estricta
    const mpConfig = validateMercadoPagoConfig()
    const MP_ACCESS_TOKEN = MP_ACCESS_TOKEN_DIRECT || mpConfig.accessToken

    console.log('[MP-PAYMENT] Iniciando creación de preferencia')
    console.log('[MP-PAYMENT] Validación de configuración:', {
      isValid: mpConfig.isValid,
      isProduction: mpConfig.isProduction,
      hasAccessToken: !!MP_ACCESS_TOKEN,
      hasDirectToken: !!MP_ACCESS_TOKEN_DIRECT,
      hasConfigToken: !!mpConfig.accessToken,
      tokenLength: MP_ACCESS_TOKEN?.length || 0,
      environment: NODE_ENV,
      vercelEnv: VERCEL_ENV,
      tokenSource: MP_ACCESS_TOKEN_DIRECT ? 'direct' : mpConfig.accessToken ? 'config' : 'none',
    })

    const body = await request.json()
    console.log('[MP-PAYMENT] Body recibido completo:', JSON.stringify(body, null, 2))

    // Validar y parsear con manejo de errores explícito
    let items, back_urls
    try {
      const parsed = pagoSchema.parse(body)
      items = parsed.items
      back_urls = parsed.back_urls
      console.log('[MP-PAYMENT] ✅ Parse exitoso')
      console.log('[MP-PAYMENT] Items:', items.length)
      console.log('[MP-PAYMENT] Back URLs parseadas:', JSON.stringify(back_urls, null, 2))
    } catch (parseError: any) {
      console.error('[MP-PAYMENT] ❌ Error en parse:', parseError)
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: parseError.errors || parseError.message,
        },
        { status: 400 }
      )
    }

    // Validar explícitamente que back_urls tenga todas las propiedades requeridas
    if (!back_urls || typeof back_urls !== 'object') {
      console.error('[MP-PAYMENT] ❌ back_urls no es un objeto:', back_urls)
      return NextResponse.json({ error: 'back_urls debe ser un objeto' }, { status: 400 })
    }

    if (!back_urls.success || !back_urls.failure || !back_urls.pending) {
      console.error('[MP-PAYMENT] ❌ back_urls incompleto:', back_urls)
      return NextResponse.json(
        {
          error: 'back_urls incompleto',
          details: `Faltan: ${!back_urls.success ? 'success' : ''} ${!back_urls.failure ? 'failure' : ''} ${!back_urls.pending ? 'pending' : ''}`,
        },
        { status: 400 }
      )
    }

    // CRÍTICO: Verificar flag de mantenimiento manual (solo si está explícitamente activado)
    const checkoutDisabled = process.env.NEXT_PUBLIC_CHECKOUT_DISABLED === 'true'
    if (checkoutDisabled) {
      console.warn(
        '[MP-PAYMENT] ⚠️ CHECKOUT DESHABILITADO MANUALMENTE (flag NEXT_PUBLIC_CHECKOUT_DISABLED=true)'
      )
      return NextResponse.json(
        {
          ok: false,
          code: 'CHECKOUT_DISABLED',
          message: 'El checkout está temporalmente deshabilitado por mantenimiento.',
          detail: 'manual-toggle',
          help: {
            message:
              'Para habilitar nuevamente, configura NEXT_PUBLIC_CHECKOUT_DISABLED=false en Vercel Dashboard',
          },
        },
        { status: 503 }
      )
    }

    // CRÍTICO: Validar que tenemos un token válido para usar
    // Si tenemos token directo pero la validación falla, intentar usarlo de todas formas
    if (!MP_ACCESS_TOKEN) {
      const errorMessage = getMercadoPagoErrorMessage(mpConfig)

      // Logs detallados del error
      console.error('[MP-PAYMENT] ❌ [ERROR] MP_ACCESS_TOKEN NO CONFIGURADO')
      console.error('[MP-PAYMENT] ==========================================')
      console.error('[MP-PAYMENT] Errores detectados:', mpConfig.errors)
      console.error('[MP-PAYMENT] Access Token presente:', !!MP_ACCESS_TOKEN)
      console.error('[MP-PAYMENT] Access Token (directo) presente:', !!MP_ACCESS_TOKEN_DIRECT)
      console.error('[MP-PAYMENT] Access Token (config) presente:', !!mpConfig.accessToken)
      console.error('[MP-PAYMENT] Access Token length:', MP_ACCESS_TOKEN?.length || 0)
      console.error(
        '[MP-PAYMENT] Access Token starts with:',
        MP_ACCESS_TOKEN?.substring(0, 10) || 'N/A'
      )
      console.error('[MP-PAYMENT] Entorno:', NODE_ENV)
      console.error('[MP-PAYMENT] VERCEL_ENV:', VERCEL_ENV)
      console.error('[MP-PAYMENT] Es Vercel:', IS_VERCEL)
      console.error('[MP-PAYMENT] ==========================================')

      // Retornar error específico de configuración (NO genérico de mantenimiento)
      return NextResponse.json(
        {
          ok: false,
          code: 'MP_ACCESS_TOKEN_MISSING',
          message: 'No se pudo generar el pago. La configuración de Mercado Pago no está completa.',
          detail: IS_VERCEL
            ? 'MP_ACCESS_TOKEN no está configurado en Vercel Dashboard. Configura la variable y haz REDEPLOY.'
            : 'MP_ACCESS_TOKEN no está configurado. Configura la variable en .env.local para desarrollo local.',
          technical: {
            hasToken: !!MP_ACCESS_TOKEN,
            hasTokenDirect: !!MP_ACCESS_TOKEN_DIRECT,
            hasTokenConfig: !!mpConfig.accessToken,
            errors: mpConfig.errors,
            environment: VERCEL_ENV,
            allMPVars: allMPVars,
          },
          help: {
            local: 'Configura MP_ACCESS_TOKEN en .env.local',
            production:
              'Configura MP_ACCESS_TOKEN en Vercel Dashboard → Settings → Environment Variables → Production',
            redeploy: 'Después de agregar la variable, haz REDEPLOY en Vercel',
            docs: '/docs/mercadopago-config.md',
            panel: 'https://www.mercadopago.com.ar/developers/panel',
          },
        },
        { status: 500 } // Internal Server Error - error de configuración, no mantenimiento
      )
    }

    // Advertencia si la validación falla pero tenemos token
    if (!mpConfig.isValid && MP_ACCESS_TOKEN) {
      console.warn('[MP-PAYMENT] ⚠️ Token presente pero validación falló')
      console.warn('[MP-PAYMENT] Errores de validación:', mpConfig.errors)
      console.warn('[MP-PAYMENT] Continuando con token disponible...')
    }

    console.log('[MP-PAYMENT] ✅ Token configurado correctamente')
    console.log('[MP-PAYMENT] Tipo:', mpConfig.isProduction ? 'PRODUCCIÓN' : 'TEST')
    console.log('[MP-PAYMENT] Token length:', MP_ACCESS_TOKEN?.length || 0)
    console.log('[MP-PAYMENT] Token preview:', MP_ACCESS_TOKEN?.substring(0, 15) + '...' || 'N/A')

    // Verificar stock antes de crear preferencia
    // CRÍTICO: Saltar validación de stock para items de envío (id === 'envio')
    console.log('[MP-PAYMENT] Verificando stock para', items.length, 'items')
    for (const item of items) {
      // Saltar validación de stock para envío
      if (item.id === 'envio') {
        console.log('[MP-PAYMENT] ✅ Item de envío detectado, saltando validación de stock')
        continue
      }

      // Buscar producto por ID (preferido) o por nombre (fallback)
      let producto = null

      // Intentar buscar por ID primero (UUID de Supabase)
      if (item.id) {
        producto = await getProductById(item.id)
        console.log(
          `[MP-PAYMENT] Buscando producto por ID: ${item.id}`,
          producto ? '✅ Encontrado' : '❌ No encontrado'
        )
      }

      // Si no se encuentra por ID, buscar por nombre
      if (!producto) {
        const productos = await getProductos({ nombre: item.title })
        producto = productos.length > 0 ? productos[0] : null
        console.log(
          `[MP-PAYMENT] Buscando producto por nombre: ${item.title}`,
          producto ? '✅ Encontrado' : '❌ No encontrado'
        )
      }

      if (!producto) {
        console.error(`[MP-PAYMENT] Producto no encontrado: ${item.title} (ID: ${item.id})`)
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.title}` },
          { status: 404 }
        )
      }

      // Stock en Supabase viene como objeto JSON
      const stockRecord: Record<string, number> = producto.stock || {}

      // Validar stock por talle específico si se proporciona
      if (item.talle) {
        const stockTalle = stockRecord[item.talle] || 0
        console.log(
          `[MP-PAYMENT] Stock de ${item.title} (Talle ${item.talle}): ${stockTalle}, solicitado: ${item.quantity}`
        )

        if (stockTalle < item.quantity) {
          console.error(`[MP-PAYMENT] Stock insuficiente para ${item.title} (Talle ${item.talle})`)
          return NextResponse.json(
            {
              error: `Stock insuficiente para ${item.title} (Talle ${item.talle}). Disponible: ${stockTalle}, Solicitado: ${item.quantity}`,
            },
            { status: 400 }
          )
        }
      } else {
        // Validar stock total si no hay talle específico
        const stockTotal = Object.values(stockRecord).reduce((a: number, b: number) => a + b, 0)
        console.log(
          `[MP-PAYMENT] Stock total de ${item.title}: ${stockTotal}, solicitado: ${item.quantity}`
        )

        if (stockTotal < item.quantity) {
          console.error(`[MP-PAYMENT] Stock insuficiente para ${item.title}`)
          return NextResponse.json(
            {
              error: `Stock insuficiente para ${item.title}. Disponible: ${stockTotal}, Solicitado: ${item.quantity}`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Crear preferencia en Mercado Pago
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'

    // Usar directamente las back_urls parseadas (ya validadas por Zod)
    // Solo usar fallback si realmente faltan
    const finalBackUrls = {
      success: back_urls.success || `${baseUrl}/pago/success`,
      failure: back_urls.failure || `${baseUrl}/pago/failure`,
      pending: back_urls.pending || `${baseUrl}/pago/pending`,
    }

    // Validación CRÍTICA: asegurar que todas las URLs sean strings válidos
    if (typeof finalBackUrls.success !== 'string' || finalBackUrls.success.trim() === '') {
      console.error('[MP-PAYMENT] ❌ CRÍTICO: success URL inválida:', finalBackUrls.success)
      return NextResponse.json(
        {
          error: 'Error de configuración',
          details: 'back_urls.success debe ser una URL válida',
        },
        { status: 500 }
      )
    }

    if (typeof finalBackUrls.failure !== 'string' || finalBackUrls.failure.trim() === '') {
      console.error('[MP-PAYMENT] ❌ CRÍTICO: failure URL inválida:', finalBackUrls.failure)
      return NextResponse.json(
        {
          error: 'Error de configuración',
          details: 'back_urls.failure debe ser una URL válida',
        },
        { status: 500 }
      )
    }

    if (typeof finalBackUrls.pending !== 'string' || finalBackUrls.pending.trim() === '') {
      console.error('[MP-PAYMENT] ❌ CRÍTICO: pending URL inválida:', finalBackUrls.pending)
      return NextResponse.json(
        {
          error: 'Error de configuración',
          details: 'back_urls.pending debe ser una URL válida',
        },
        { status: 500 }
      )
    }

    console.log('[MP-PAYMENT] ✅ Back URLs validadas correctamente:')
    console.log('[MP-PAYMENT]   - success:', finalBackUrls.success)
    console.log('[MP-PAYMENT]   - failure:', finalBackUrls.failure)
    console.log('[MP-PAYMENT]   - pending:', finalBackUrls.pending)

    // Construir objeto de preferencia EXACTAMENTE como lo espera Mercado Pago
    // Orden crítico: back_urls DEBE estar antes de auto_return
    const backUrlsObject = {
      success: finalBackUrls.success,
      failure: finalBackUrls.failure,
      pending: finalBackUrls.pending,
    }

    // Validación FINAL antes de construir el objeto
    if (!backUrlsObject.success || typeof backUrlsObject.success !== 'string') {
      console.error(
        '[MP-PAYMENT] ❌ CRÍTICO: backUrlsObject.success inválido:',
        backUrlsObject.success
      )
      return NextResponse.json(
        {
          error: 'Error crítico',
          details: 'back_urls.success no está definido correctamente',
        },
        { status: 500 }
      )
    }

    console.log(
      '[MP-PAYMENT] Construyendo preferenceData con back_urls:',
      JSON.stringify(backUrlsObject, null, 2)
    )

    // Construir preferenceData - NO incluir auto_return si las URLs son localhost
    // Mercado Pago tiene problemas con auto_return cuando las URLs son localhost
    const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')

    // Extraer payer y external_reference del body si existen
    const payer = (body as any).payer
    const externalReference = (body as any).external_reference || `compra-${Date.now()}`

    const preferenceData: Record<string, any> = {
      items: items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        description: item.talle ? `Talle: ${item.talle}` : item.title,
      })),
      back_urls: {
        success: String(backUrlsObject.success),
        failure: String(backUrlsObject.failure),
        pending: String(backUrlsObject.pending),
      },
      notification_url: `${baseUrl}/api/mp/webhook`,
      statement_descriptor: 'CATALOGO INDUMENTARIA',
      external_reference: externalReference,
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
      },
      additional_info: {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.talle ? `Talle: ${item.talle}` : undefined,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      },
    }

    // Agregar payer si está presente
    if (payer) {
      preferenceData.payer = payer
      console.log('[MP-PAYMENT] ✅ Payer incluido en preferencia')
    }

    // Solo agregar auto_return si NO es localhost (MP requiere URLs públicas para auto_return)
    if (!isLocalhost && preferenceData.back_urls.success) {
      preferenceData.auto_return = 'approved'
      console.log('[MP-PAYMENT] ✅ auto_return agregado (URLs públicas)')
    } else {
      console.log('[MP-PAYMENT] ⚠️ auto_return NO agregado (localhost detectado o URLs inválidas)')
      console.log('[MP-PAYMENT] Las URLs de retorno funcionarán pero sin redirección automática')
    }

    // Validación FINAL del objeto completo antes de enviar
    if (!preferenceData.back_urls || typeof preferenceData.back_urls !== 'object') {
      console.error('[MP-PAYMENT] ❌ CRÍTICO: preferenceData.back_urls no es un objeto')
      return NextResponse.json(
        {
          error: 'Error crítico',
          details: 'back_urls no está definido en preferenceData',
        },
        { status: 500 }
      )
    }

    if (!preferenceData.back_urls.success) {
      console.error('[MP-PAYMENT] ❌ CRÍTICO: preferenceData.back_urls.success no existe')
      console.error(
        '[MP-PAYMENT] preferenceData.back_urls completo:',
        JSON.stringify(preferenceData.back_urls, null, 2)
      )
      return NextResponse.json(
        {
          error: 'Error crítico',
          details: 'back_urls.success no está definido en preferenceData',
        },
        { status: 500 }
      )
    }

    console.log('[MP-PAYMENT] Enviando preferencia a MP:')
    console.log('[MP-PAYMENT] - Items:', preferenceData.items.length)
    console.log('[MP-PAYMENT] - Back URLs:', JSON.stringify(preferenceData.back_urls, null, 2))
    console.log('[MP-PAYMENT] - Notification URL:', preferenceData.notification_url)
    console.log('[MP-PAYMENT] - Auto Return:', preferenceData.auto_return)
    console.log('[MP-PAYMENT] - Request completo:', JSON.stringify(preferenceData, null, 2))

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData),
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        const text = await response.text()
        console.error('[MP-PAYMENT] ❌ [ERROR] Error de Mercado Pago API (texto):', text)
        errorData = { message: text || 'Error desconocido' }
      }

      console.error('[MP-PAYMENT] ❌ [ERROR] Error de Mercado Pago API')
      console.error('[MP-PAYMENT] Status:', response.status)
      console.error('[MP-PAYMENT] Response:', JSON.stringify(errorData, null, 2))
      console.error(
        '[MP-PAYMENT] Request body (sin datos sensibles):',
        JSON.stringify(
          {
            itemsCount: items.length,
            totalAmount: items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
            hasBackUrls: !!back_urls,
          },
          null,
          2
        )
      )

      // Determinar código de error específico según status
      let errorCode = 'CHECKOUT_MP_ERROR'
      let errorMessage =
        'No pudimos generar el pago con Mercado Pago. Intentalo de nuevo en unos minutos.'

      if (response.status === 401) {
        errorCode = 'MP_INVALID_TOKEN'
        errorMessage = 'Credenciales de Mercado Pago inválidas. Verificá la configuración.'
      } else if (response.status === 400) {
        errorCode = 'MP_INVALID_REQUEST'
        errorMessage = 'Datos inválidos enviados a Mercado Pago. Verificá los productos y montos.'
      } else if (response.status >= 500) {
        errorCode = 'MP_SERVER_ERROR'
        errorMessage = 'Error temporal en Mercado Pago. Intentalo de nuevo en unos minutos.'
      }

      return NextResponse.json(
        {
          ok: false,
          code: errorCode,
          message: errorMessage,
          detail: errorData.message || errorData.error || 'Error desconocido de Mercado Pago',
          mpError: errorData.cause || errorData,
        },
        { status: response.status || 500 }
      )
    }

    const data = await response.json()
    console.log('[MP-PAYMENT] ✅ [SUCCESS] Preferencia creada exitosamente')
    console.log('[MP-PAYMENT] Preference ID:', data.id)
    console.log('[MP-PAYMENT] Init Point:', data.init_point?.substring(0, 50) + '...')
    console.log('[MP-PAYMENT] Items:', items.length)
    console.log(
      '[MP-PAYMENT] Total amount:',
      items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
    )
    console.log('[MP-PAYMENT] 🎯 QA LOG - Preferencia creada:', {
      preferenceId: data.id,
      itemsCount: items.length,
      hasShipping: items.some((i) => i.id === 'envio'),
      backUrls: preferenceData.back_urls,
      timestamp: new Date().toISOString(),
    })

    // Guardar logs de compra
    // CRÍTICO: Saltar logs para items de envío (id === 'envio')
    try {
      for (const item of items) {
        // Saltar logs para envío
        if (item.id === 'envio') {
          console.log('[MP-PAYMENT] Saltando log de compra para envío')
          continue
        }

        let producto = null

        // Buscar producto por ID o nombre
        if (item.id) {
          producto = await getProductById(item.id)
        }
        if (!producto) {
          const productos = await getProductos({ nombre: item.title })
          producto = productos.length > 0 ? productos[0] : null
        }

        if (producto) {
          await createCompraLog({
            productoId: producto.id,
            preferenciaId: data.id,
            estado: 'pendiente',
            fecha: new Date().toISOString(),
            metadata: item.talle ? { talle: item.talle } : {},
          })
        }
      }
    } catch (error) {
      console.error('Error saving compra log:', error)
      // No fallar el request si hay error en logs
    }

    return NextResponse.json({
      ok: true,
      init_point: data.init_point,
      preference_id: data.id,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('[MP-PAYMENT] Error de validación:', error.errors)
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }

    console.error('[MP-PAYMENT] Error inesperado:', error)
    return NextResponse.json(
      {
        error: 'Error al procesar el pago',
        details: error.message || 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
