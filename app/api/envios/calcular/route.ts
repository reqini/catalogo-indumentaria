import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Schema de validación para cálculo de envío
 */
const calcularEnvioSchema = z.object({
  codigoPostal: z.string().min(4).max(10),
  peso: z.number().positive().max(50), // kg, máximo 50kg
  precio: z.number().nonnegative(),
  provincia: z.string().optional(),
})

/**
 * Calcula el costo de envío según código postal y peso
 * 
 * Implementación mejorada con múltiples transportistas:
 * - OCA Estándar y Express
 * - Correo Argentino
 * - Andreani Estándar y Express
 * - Mercado Envíos (si aplica)
 * 
 * En producción, esto debería integrarse con las APIs reales de cada transportista.
 */
function calcularCostoEnvio(
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
  // Extraer código de área (primeros caracteres del CP)
  const codigoArea = codigoPostal.substring(0, 1).toUpperCase()
  const cpNumero = parseInt(codigoPostal.replace(/\D/g, '')) || 0
  
  // Validar código postal
  if (codigoPostal.length < 4 || codigoPostal.length > 8) {
    return []
  }
  
  // Base de cálculo mejorada (valores más realistas)
  const baseOCA = 2500
  const baseCorreo = 1800
  const baseAndreani = 2800
  const porKgOCA = 600
  const porKgCorreo = 450
  const porKgAndreani = 650
  const porValorOCA = 0.025 // 2.5% del valor del producto
  const porValorCorreo = 0.02 // 2% del valor del producto
  const porValorAndreani = 0.03 // 3% del valor del producto
  
  // Ajuste por zona geográfica (más preciso)
  let multiplicadorZona = 1.0
  if (codigoArea === 'B' || codigoArea === 'C') {
    // Buenos Aires Capital y GBA
    multiplicadorZona = 1.0
  } else if (codigoArea === 'A' || (cpNumero >= 1000 && cpNumero < 2000)) {
    // CABA y alrededores
    multiplicadorZona = 1.1
  } else if (codigoArea >= 'D' && codigoArea <= 'M') {
    // Interior cercano (Córdoba, Rosario, etc.)
    multiplicadorZona = 1.4
  } else {
    // Interior lejano
    multiplicadorZona = 1.8
  }
  
  // Calcular costos base
  const costoOCAEstándar = Math.round(
    (baseOCA + (peso * porKgOCA) + (precio * porValorOCA)) * multiplicadorZona
  )
  const costoOCAExpress = Math.round(costoOCAEstándar * 1.5) // 50% más caro
  
  const costoCorreo = Math.round(
    (baseCorreo + (peso * porKgCorreo) + (precio * porValorCorreo)) * multiplicadorZona
  )
  
  const costoAndreaniEstándar = Math.round(
    (baseAndreani + (peso * porKgAndreani) + (precio * porValorAndreani)) * multiplicadorZona
  )
  const costoAndreaniExpress = Math.round(costoAndreaniEstándar * 1.6) // 60% más caro
  
  // Mercado Envíos (solo disponible para ciertos CP y con límites)
  const costoMercadoEnvíos = precio > 50000 && codigoArea === 'B' 
    ? Math.round(costoOCAEstándar * 0.8) // 20% más barato que OCA
    : null
  
  const metodos: Array<{
    nombre: string
    precio: number
    demora: string
    disponible: boolean
    transportista: string
  }> = [
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
  ]
  
  // Agregar Mercado Envíos si está disponible
  if (costoMercadoEnvíos !== null) {
    metodos.push({
      nombre: 'Mercado Envíos',
      precio: costoMercadoEnvíos,
      demora: '2-4 días hábiles',
      disponible: true,
      transportista: 'Mercado Envíos',
    })
  }
  
  // Ordenar por precio (más barato primero)
  return metodos.sort((a, b) => a.precio - b.precio)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = calcularEnvioSchema.parse(body)
    
    const { codigoPostal, peso, precio } = validatedData
    
    console.log('[API-ENVIOS] Calculando envío:', {
      codigoPostal,
      peso,
      precio,
    })
    
    // Calcular métodos de envío disponibles
    const metodos = calcularCostoEnvio(codigoPostal, peso, precio)
    
    // Filtrar solo métodos disponibles
    const metodosDisponibles = metodos.filter(m => m.disponible)
    
    if (metodosDisponibles.length === 0) {
      return NextResponse.json(
        {
          error: 'No hay métodos de envío disponibles para este código postal',
          metodos: [],
        },
        { status: 400 }
      )
    }
    
    console.log('[API-ENVIOS] Métodos calculados:', metodosDisponibles.length)
    console.log('[API-ENVIOS] 🎯 QA LOG - Cálculo de envío:', {
      codigoPostal,
      peso,
      precio,
      metodosCount: metodosDisponibles.length,
      metodos: metodosDisponibles.map(m => ({ nombre: m.nombre, precio: m.precio, transportista: m.transportista })),
      timestamp: new Date().toISOString(),
    })
    
    return NextResponse.json({
      metodos: metodosDisponibles,
      codigoPostal,
    })
  } catch (error: any) {
    console.error('[API-ENVIOS] Error calculando envío:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        error: error.message || 'Error al calcular envío',
      },
      { status: 500 }
    )
  }
}

