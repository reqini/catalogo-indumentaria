/**
 * Integración con Mercado Envíos Flex API
 * Documentación: https://developers.mercadolibre.com.ar/es_ar/guia-para-servicios/envios-flex
 */

const MERCADO_ENVIOS_API_BASE = 'https://api.mercadolibre.com'

interface MercadoEnvioRequest {
  codigoPostal: string
  peso: number // en kg
  precio: number // en ARS
  dimensiones?: {
    alto: number // en cm
    ancho: number // en cm
    largo: number // en cm
  }
}

interface MercadoEnvioResponse {
  nombre: string
  precio: number
  demora: string
  disponible: boolean
  transportista: string
  servicioId?: string
}

/**
 * Calcula costo de envío usando Mercado Envíos Flex API
 * 
 * IMPORTANTE: Requiere credenciales de Mercado Libre
 * - MP_ACCESS_TOKEN (el mismo que se usa para pagos)
 * 
 * Si no hay credenciales o falla, retorna null y se usa cálculo simulado
 */
export async function calcularMercadoEnvios(
  request: MercadoEnvioRequest
): Promise<MercadoEnvioResponse | null> {
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

  // Si no hay token o es de test, usar cálculo simulado
  if (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN.startsWith('TEST-')) {
    console.log('[MERCADO-ENVIOS] ⚠️ Token no configurado o es de test, usando cálculo simulado')
    return null
  }

  try {
    // Extraer código postal numérico (ej: B8000 -> 8000)
    const cpNumero = request.codigoPostal.replace(/\D/g, '')
    
    if (!cpNumero || cpNumero.length < 4) {
      console.log('[MERCADO-ENVIOS] ⚠️ Código postal inválido, usando cálculo simulado')
      return null
    }

    // Dimensiones por defecto si no se proporcionan (paquete estándar)
    const dimensiones = request.dimensiones || {
      alto: 10, // cm
      ancho: 20, // cm
      largo: 30, // cm
    }

    // Peso mínimo 0.1kg para Mercado Envíos
    const pesoKg = Math.max(request.peso, 0.1)

    // Llamar a la API de Mercado Envíos
    // NOTA: La API real puede requerir más parámetros según la documentación oficial
    const response = await fetch(
      `${MERCADO_ENVIOS_API_BASE}/shipments/options?zip_code=${cpNumero}&weight=${pesoKg}&dimensions=${dimensiones.alto}x${dimensiones.ancho}x${dimensiones.largo}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      // Si la API no está disponible o falla, usar cálculo simulado
      console.log(`[MERCADO-ENVIOS] ⚠️ API no disponible (${response.status}), usando cálculo simulado`)
      return null
    }

    const data = await response.json()

    // Procesar respuesta de Mercado Envíos
    // La estructura puede variar según la versión de la API
    if (data.options && data.options.length > 0) {
      const option = data.options[0] // Tomar la primera opción disponible
      
      return {
        nombre: 'Mercado Envíos Flex',
        precio: option.cost || option.price || 0,
        demora: option.estimated_delivery_time || '2-4 días hábiles',
        disponible: true,
        transportista: 'Mercado Envíos',
        servicioId: option.id,
      }
    }

    return null
  } catch (error: any) {
    console.error('[MERCADO-ENVIOS] ❌ Error calculando envío:', error.message)
    // En caso de error, retornar null para usar cálculo simulado
    return null
  }
}

