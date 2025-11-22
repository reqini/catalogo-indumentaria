import { NextResponse } from 'next/server'
import { pagoSchema } from '@/utils/validations'
import { getProductById, getProductos } from '@/lib/supabase-helpers'
import { createCompraLog } from '@/lib/supabase-helpers'
import { validateMercadoPagoConfig, getMercadoPagoErrorMessage } from '@/lib/mercadopago/validate'

// Validar configuración de Mercado Pago al cargar el módulo
const mpConfig = validateMercadoPagoConfig()
const MP_ACCESS_TOKEN = mpConfig.accessToken

export async function POST(request: Request) {
  try {
    console.log('[MP-PAYMENT] Iniciando creación de preferencia')
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
          details: parseError.errors || parseError.message
        },
        { status: 400 }
      )
    }
    
    // Validar explícitamente que back_urls tenga todas las propiedades requeridas
    if (!back_urls || typeof back_urls !== 'object') {
      console.error('[MP-PAYMENT] ❌ back_urls no es un objeto:', back_urls)
      return NextResponse.json(
        { error: 'back_urls debe ser un objeto' },
        { status: 400 }
      )
    }
    
    if (!back_urls.success || !back_urls.failure || !back_urls.pending) {
      console.error('[MP-PAYMENT] ❌ back_urls incompleto:', back_urls)
      return NextResponse.json(
        { 
          error: 'back_urls incompleto',
          details: `Faltan: ${!back_urls.success ? 'success' : ''} ${!back_urls.failure ? 'failure' : ''} ${!back_urls.pending ? 'pending' : ''}`
        },
        { status: 400 }
      )
    }

    // Validar configuración de Mercado Pago
    if (!mpConfig.isValid) {
      const errorMessage = getMercadoPagoErrorMessage(mpConfig)
      console.error('[MP-PAYMENT] ❌ Mercado Pago no configurado correctamente')
      console.error('[MP-PAYMENT] Errores detectados:', mpConfig.errors)
      console.error('[MP-PAYMENT] Access Token presente:', !!MP_ACCESS_TOKEN)
      console.error('[MP-PAYMENT] Access Token length:', MP_ACCESS_TOKEN?.length || 0)
      console.error('[MP-PAYMENT] Access Token starts with:', MP_ACCESS_TOKEN?.substring(0, 10) || 'N/A')
      console.error('[MP-PAYMENT] Entorno:', process.env.NODE_ENV || 'development')
      console.error('[MP-PAYMENT] VERCEL_ENV:', process.env.VERCEL_ENV || 'local')
      
      return NextResponse.json(
        { 
          error: 'Mercado Pago no configurado',
          details: errorMessage,
          errors: mpConfig.errors,
          help: {
            local: 'Configura MP_ACCESS_TOKEN en .env.local',
            production: 'Configura MP_ACCESS_TOKEN en Vercel Dashboard → Settings → Environment Variables',
            docs: '/docs/configuracion-mercadopago.md',
            panel: 'https://www.mercadopago.com.ar/developers/panel',
          },
        },
        { status: 500 }
      )
    }
    
    console.log('[MP-PAYMENT] ✅ Token configurado correctamente')
    console.log('[MP-PAYMENT] Tipo:', mpConfig.isProduction ? 'PRODUCCIÓN' : 'TEST')
    console.log('[MP-PAYMENT] Token length:', MP_ACCESS_TOKEN?.length || 0)
    console.log('[MP-PAYMENT] Token preview:', MP_ACCESS_TOKEN?.substring(0, 15) + '...' || 'N/A')

    // Verificar stock antes de crear preferencia
    console.log('[MP-PAYMENT] Verificando stock para', items.length, 'items')
    for (const item of items) {
      // Buscar producto por ID (preferido) o por nombre (fallback)
      let producto = null
      
      // Intentar buscar por ID primero (UUID de Supabase)
      if (item.id) {
        producto = await getProductById(item.id)
        console.log(`[MP-PAYMENT] Buscando producto por ID: ${item.id}`, producto ? '✅ Encontrado' : '❌ No encontrado')
      }
      
      // Si no se encuentra por ID, buscar por nombre
      if (!producto) {
        const productos = await getProductos({ nombre: item.title })
        producto = productos.length > 0 ? productos[0] : null
        console.log(`[MP-PAYMENT] Buscando producto por nombre: ${item.title}`, producto ? '✅ Encontrado' : '❌ No encontrado')
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
        console.log(`[MP-PAYMENT] Stock de ${item.title} (Talle ${item.talle}): ${stockTalle}, solicitado: ${item.quantity}`)
        
        if (stockTalle < item.quantity) {
          console.error(`[MP-PAYMENT] Stock insuficiente para ${item.title} (Talle ${item.talle})`)
          return NextResponse.json(
            { error: `Stock insuficiente para ${item.title} (Talle ${item.talle}). Disponible: ${stockTalle}, Solicitado: ${item.quantity}` },
            { status: 400 }
          )
        }
      } else {
        // Validar stock total si no hay talle específico
        const stockTotal = Object.values(stockRecord).reduce(
          (a: number, b: number) => a + b,
          0
        )
        console.log(`[MP-PAYMENT] Stock total de ${item.title}: ${stockTotal}, solicitado: ${item.quantity}`)
        
        if (stockTotal < item.quantity) {
          console.error(`[MP-PAYMENT] Stock insuficiente para ${item.title}`)
          return NextResponse.json(
            { error: `Stock insuficiente para ${item.title}. Disponible: ${stockTotal}, Solicitado: ${item.quantity}` },
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
          details: 'back_urls.success debe ser una URL válida'
        },
        { status: 500 }
      )
    }
    
    if (typeof finalBackUrls.failure !== 'string' || finalBackUrls.failure.trim() === '') {
      console.error('[MP-PAYMENT] ❌ CRÍTICO: failure URL inválida:', finalBackUrls.failure)
      return NextResponse.json(
        { 
          error: 'Error de configuración',
          details: 'back_urls.failure debe ser una URL válida'
        },
        { status: 500 }
      )
    }
    
    if (typeof finalBackUrls.pending !== 'string' || finalBackUrls.pending.trim() === '') {
      console.error('[MP-PAYMENT] ❌ CRÍTICO: pending URL inválida:', finalBackUrls.pending)
      return NextResponse.json(
        { 
          error: 'Error de configuración',
          details: 'back_urls.pending debe ser una URL válida'
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
      console.error('[MP-PAYMENT] ❌ CRÍTICO: backUrlsObject.success inválido:', backUrlsObject.success)
      return NextResponse.json(
        { 
          error: 'Error crítico',
          details: 'back_urls.success no está definido correctamente'
        },
        { status: 500 }
      )
    }
    
    console.log('[MP-PAYMENT] Construyendo preferenceData con back_urls:', JSON.stringify(backUrlsObject, null, 2))
    
    // Construir preferenceData - NO incluir auto_return si las URLs son localhost
    // Mercado Pago tiene problemas con auto_return cuando las URLs son localhost
    const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
    
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
      external_reference: `compra-${Date.now()}`,
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
          details: 'back_urls no está definido en preferenceData'
        },
        { status: 500 }
      )
    }
    
    if (!preferenceData.back_urls.success) {
      console.error('[MP-PAYMENT] ❌ CRÍTICO: preferenceData.back_urls.success no existe')
      console.error('[MP-PAYMENT] preferenceData.back_urls completo:', JSON.stringify(preferenceData.back_urls, null, 2))
      return NextResponse.json(
        { 
          error: 'Error crítico',
          details: 'back_urls.success no está definido en preferenceData'
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
    
    const response = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preferenceData),
      }
    )

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        const text = await response.text()
        console.error('[MP-PAYMENT] Error de Mercado Pago (texto):', text)
        errorData = { message: text || 'Error desconocido' }
      }
      
      console.error('[MP-PAYMENT] ❌ Error de Mercado Pago API')
      console.error('[MP-PAYMENT] Status:', response.status)
      console.error('[MP-PAYMENT] Response:', JSON.stringify(errorData, null, 2))
      console.error('[MP-PAYMENT] Request body:', JSON.stringify({
        items: items.map(i => ({ title: i.title, quantity: i.quantity, unit_price: i.unit_price })),
        back_urls,
      }, null, 2))
      
      return NextResponse.json(
        { 
          error: 'Error al crear preferencia de pago',
          details: errorData.message || errorData.error || 'Error desconocido de Mercado Pago',
          mpError: errorData,
        },
        { status: response.status || 500 }
      )
    }

    const data = await response.json()
    console.log('[MP-PAYMENT] ✅ Preferencia creada exitosamente')
    console.log('[MP-PAYMENT] Preference ID:', data.id)
    console.log('[MP-PAYMENT] Init Point:', data.init_point?.substring(0, 50) + '...')
    console.log('[MP-PAYMENT] Items:', items.length)
    console.log('[MP-PAYMENT] 🎯 QA LOG - Preferencia creada:', {
      preferenceId: data.id,
      itemsCount: items.length,
      hasShipping: items.some(i => i.id === 'envio'),
      backUrls: preferenceData.back_urls,
      timestamp: new Date().toISOString(),
    })

    // Guardar logs de compra
    try {
      for (const item of items) {
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
    }

    return NextResponse.json({
      init_point: data.init_point,
      preference_id: data.id,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('[MP-PAYMENT] Error de validación:', error.errors)
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[MP-PAYMENT] Error inesperado:', error)
    return NextResponse.json(
      { 
        error: 'Error al procesar el pago',
        details: error.message || 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

