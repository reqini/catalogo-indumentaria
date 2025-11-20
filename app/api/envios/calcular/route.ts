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
 * Esta es una implementación básica que simula los costos de:
 * - OCA Estándar
 * - OCA Express
 * - Correo Argentino
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
}> {
  // Extraer código de área (primeros caracteres del CP)
  const codigoArea = codigoPostal.substring(0, 1).toUpperCase()
  
  // Base de cálculo (simulado)
  // En producción, esto vendría de una tabla de tarifas o API externa
  const baseOCA = 2000
  const baseCorreo = 1500
  const porKgOCA = 500
  const porKgCorreo = 400
  const porValorOCA = 0.02 // 2% del valor del producto
  const porValorCorreo = 0.015 // 1.5% del valor del producto
  
  // Ajuste por zona (simulado)
  // Zona A (Buenos Aires Capital): más barato
  // Zona B (GBA): medio
  // Zona C (Interior): más caro
  let multiplicadorZona = 1.0
  if (codigoArea === 'B' || codigoArea === 'C') {
    multiplicadorZona = 1.0 // Capital y GBA
  } else if (codigoArea >= 'A' && codigoArea <= 'Z') {
    multiplicadorZona = 1.3 // Interior
  }
  
  // Calcular costos base
  const costoOCAEstándar = Math.round(
    (baseOCA + (peso * porKgOCA) + (precio * porValorOCA)) * multiplicadorZona
  )
  const costoOCAExpress = Math.round(costoOCAEstándar * 1.4) // 40% más caro
  const costoCorreo = Math.round(
    (baseCorreo + (peso * porKgCorreo) + (precio * porValorCorreo)) * multiplicadorZona
  )
  
  // Verificar disponibilidad según código postal
  // Algunos códigos postales pueden no tener servicio
  const disponible = codigoPostal.length >= 4 && codigoPostal.length <= 8
  
  return [
    {
      nombre: 'OCA Estándar',
      precio: disponible ? costoOCAEstándar : 0,
      demora: '3-5 días hábiles',
      disponible,
    },
    {
      nombre: 'OCA Express',
      precio: disponible ? costoOCAExpress : 0,
      demora: '1-2 días hábiles',
      disponible,
    },
    {
      nombre: 'Correo Argentino',
      precio: disponible ? costoCorreo : 0,
      demora: '4-6 días hábiles',
      disponible,
    },
  ]
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

