/**
 * Integración con OCA API
 * 
 * NOTA: OCA requiere credenciales comerciales y contacto directo
 * Esta es una estructura base que puede completarse cuando se obtengan las credenciales
 */

interface OCARequest {
  codigoPostal: string
  peso: number // en kg
  precio: number // en ARS
  dimensiones?: {
    alto: number
    ancho: number
    largo: number
  }
}

interface OCAResponse {
  nombre: string
  precio: number
  demora: string
  disponible: boolean
  transportista: string
}

/**
 * Calcula costo de envío usando OCA API
 * 
 * IMPORTANTE: Requiere credenciales comerciales de OCA
 * - OCA_API_KEY
 * - OCA_API_SECRET
 * 
 * Contactar a OCA para obtener acceso a su API
 */
export async function calcularOCA(
  request: OCARequest
): Promise<OCAResponse[] | null> {
  const OCA_API_KEY = process.env.OCA_API_KEY
  const OCA_API_SECRET = process.env.OCA_API_SECRET

  // Si no hay credenciales, retornar null para usar cálculo simulado
  if (!OCA_API_KEY || !OCA_API_SECRET) {
    console.log('[OCA-API] ⚠️ Credenciales no configuradas, usando cálculo simulado')
    return null
  }

  try {
    // TODO: Implementar llamada real a OCA API cuando se obtengan las credenciales
    // La estructura de la API puede variar según la versión
    
    // Ejemplo de estructura esperada:
    /*
    const response = await fetch('https://api.oca.com.ar/envios/cotizar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OCA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codigo_postal: request.codigoPostal,
        peso: request.peso,
        dimensiones: request.dimensiones,
      }),
    })

    const data = await response.json()
    
    return [
      {
        nombre: 'OCA Estándar',
        precio: data.estandar?.costo || 0,
        demora: data.estandar?.demora || '3-5 días hábiles',
        disponible: true,
        transportista: 'OCA',
      },
      {
        nombre: 'OCA Express',
        precio: data.express?.costo || 0,
        demora: data.express?.demora || '1-2 días hábiles',
        disponible: true,
        transportista: 'OCA',
      },
    ]
    */

    // Por ahora retornar null para usar cálculo simulado
    return null
  } catch (error: any) {
    console.error('[OCA-API] ❌ Error calculando envío:', error.message)
    return null
  }
}

