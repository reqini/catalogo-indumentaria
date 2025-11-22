/**
 * Integración con Envíopack API
 * Permite calcular costos reales de envío con múltiples transportistas
 * 
 * Documentación: https://developers.enviopack.com
 */

interface EnvioPackConfig {
  apiKey: string
  apiSecret: string
}

interface EnvioPackQuoteRequest {
  codigo_postal: string
  peso: number // en kg
  precio: number // valor declarado
  provincia?: string
}

interface EnvioPackQuoteResponse {
  carrier: string
  service: string
  price: number
  estimated_delivery_days: number
  available: boolean
}

/**
 * Calcula costos de envío usando Envíopack API
 */
export async function calcularEnvioConEnvioPack(
  codigoPostal: string,
  peso: number,
  precio: number,
  provincia?: string
): Promise<Array<{
  nombre: string
  precio: number
  demora: string
  disponible: boolean
  transportista: string
}>> {
  const apiKey = process.env.ENVIOPACK_API_KEY
  const apiSecret = process.env.ENVIOPACK_API_SECRET

  // Si no hay credenciales, usar cálculo simulado como fallback
  if (!apiKey || !apiSecret) {
    console.warn('[ENVIOPACK] ⚠️ Credenciales no configuradas, usando cálculo simulado')
    return calcularEnvioSimulado(codigoPostal, peso, precio)
  }

  try {
    // Preparar request
    const requestData: EnvioPackQuoteRequest = {
      codigo_postal: codigoPostal,
      peso: Math.max(peso, 0.1), // Mínimo 0.1kg
      precio: precio,
      ...(provincia && { provincia }),
    }

    console.log('[ENVIOPACK] 📤 Calculando envío real:', requestData)

    // Llamar a Envíopack API
    // NOTA: La URL y estructura pueden variar según la versión de la API
    // Verificar documentación oficial: https://developers.enviopack.com o contactar soporte
    const response = await fetch('https://api.enviopack.com/cotizar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Secret': apiSecret,
      },
      body: JSON.stringify(requestData),
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.error('[ENVIOPACK] ❌ Error en API:', response.status, response.statusText)
      // Fallback a cálculo simulado si falla la API
      return calcularEnvioSimulado(codigoPostal, peso, precio)
    }

    const data = await response.json()

    // Transformar respuesta de Envíopack al formato esperado
    const metodos = (data.quotes || []).map((quote: EnvioPackQuoteResponse) => ({
      nombre: `${quote.carrier} - ${quote.service}`,
      precio: Math.round(quote.price),
      demora: `${quote.estimated_delivery_days} días hábiles`,
      disponible: quote.available,
      transportista: quote.carrier,
    }))

    console.log('[ENVIOPACK] ✅ Métodos obtenidos:', metodos.length)

    return metodos.filter((m: any) => m.disponible)
  } catch (error: any) {
    console.error('[ENVIOPACK] ❌ Error calculando envío:', error)
    // Fallback a cálculo simulado si hay error
    return calcularEnvioSimulado(codigoPostal, peso, precio)
  }
}

/**
 * Cálculo simulado como fallback
 */
function calcularEnvioSimulado(
  codigoPostal: string,
  peso: number,
  precio: number
): Array<{
  nombre: string
  precio: number
  demora: string
  disponible: boolean
  transportista: string
}> {
  const codigoArea = codigoPostal.substring(0, 1).toUpperCase()
  const cpNumero = parseInt(codigoPostal.replace(/\D/g, '')) || 0

  if (codigoPostal.length < 4 || codigoPostal.length > 8) {
    return []
  }

  const baseOCA = 2500
  const baseCorreo = 1800
  const baseAndreani = 2800
  const porKgOCA = 600
  const porKgCorreo = 450
  const porKgAndreani = 650
  const porValorOCA = 0.025
  const porValorCorreo = 0.02
  const porValorAndreani = 0.03

  let multiplicadorZona = 1.0
  if (codigoArea === 'B' || codigoArea === 'C') {
    multiplicadorZona = 1.0
  } else if (codigoArea === 'A' || (cpNumero >= 1000 && cpNumero < 2000)) {
    multiplicadorZona = 1.1
  } else if (codigoArea >= 'D' && codigoArea <= 'M') {
    multiplicadorZona = 1.4
  } else {
    multiplicadorZona = 1.8
  }

  const costoOCAEstándar = Math.round(
    (baseOCA + (peso * porKgOCA) + (precio * porValorOCA)) * multiplicadorZona
  )
  const costoOCAExpress = Math.round(costoOCAEstándar * 1.5)
  const costoCorreo = Math.round(
    (baseCorreo + (peso * porKgCorreo) + (precio * porValorCorreo)) * multiplicadorZona
  )
  const costoAndreaniEstándar = Math.round(
    (baseAndreani + (peso * porKgAndreani) + (precio * porValorAndreani)) * multiplicadorZona
  )
  const costoAndreaniExpress = Math.round(costoAndreaniEstándar * 1.6)

  return [
    {
      nombre: 'OCA Estándar',
      precio: costoOCAEstándar,
      demora: '3-5 días hábiles',
      disponible: true,
      transportista: 'OCA',
    },
    {
      nombre: 'OCA Express',
      precio: costoOCAExpress,
      demora: '1-2 días hábiles',
      disponible: true,
      transportista: 'OCA',
    },
    {
      nombre: 'Correo Argentino',
      precio: costoCorreo,
      demora: '4-6 días hábiles',
      disponible: true,
      transportista: 'Correo Argentino',
    },
    {
      nombre: 'Andreani Estándar',
      precio: costoAndreaniEstándar,
      demora: '3-5 días hábiles',
      disponible: true,
      transportista: 'Andreani',
    },
    {
      nombre: 'Andreani Express',
      precio: costoAndreaniExpress,
      demora: '1-2 días hábiles',
      disponible: true,
      transportista: 'Andreani',
    },
  ].sort((a, b) => a.precio - b.precio)
}

