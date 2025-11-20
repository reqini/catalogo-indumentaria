'use client'

import { useState } from 'react'
import { Truck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShippingMethod {
  nombre: string
  precio: number
  demora: string
  disponible: boolean
}

interface ShippingCalculatorProps {
  onSelectMethod: (method: ShippingMethod) => void
  selectedMethod?: ShippingMethod | null
  totalPrice: number
  totalWeight: number // peso total en kg
}

export default function ShippingCalculator({
  onSelectMethod,
  selectedMethod,
  totalPrice,
  totalWeight,
}: ShippingCalculatorProps) {
  const [codigoPostal, setCodigoPostal] = useState('')
  const [loading, setLoading] = useState(false)
  const [metodos, setMetodos] = useState<ShippingMethod[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    if (!codigoPostal.trim()) {
      toast.error('Por favor, ingresá un código postal')
      return
    }

    if (codigoPostal.length < 4) {
      toast.error('El código postal debe tener al menos 4 caracteres')
      return
    }

    setLoading(true)
    setError(null)
    setMetodos([])

    try {
      const response = await fetch('/api/envios/calcular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigoPostal: codigoPostal.trim(),
          peso: totalWeight || 1, // Default 1kg si no hay peso
          precio: totalPrice,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al calcular envío')
      }

      const data = await response.json()

      if (!data.metodos || data.metodos.length === 0) {
        setError('No hay métodos de envío disponibles para este código postal')
        toast.error('No hay métodos de envío disponibles')
        return
      }

      setMetodos(data.metodos)
      toast.success(`${data.metodos.length} método(s) de envío disponible(s)`)
    } catch (error: any) {
      console.error('Error calculando envío:', error)
      setError(error.message || 'Error al calcular envío')
      toast.error(error.message || 'Error al calcular envío')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
        <Truck size={20} />
        Cálculo de Envío
      </h3>

      <div className="space-y-4">
        {/* Input de código postal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código Postal *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={codigoPostal}
              onChange={(e) => {
                // Solo permitir números y letras, máximo 8 caracteres
                const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0, 8)
                setCodigoPostal(value)
              }}
              placeholder="Ej: B8000"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCalculate()
                }
              }}
            />
            <button
              onClick={handleCalculate}
              disabled={loading || !codigoPostal.trim()}
              className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Calculando...</span>
                </>
              ) : (
                <>
                  <Truck size={18} />
                  <span>Calcular</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="text-xs text-red-600 mt-1">
                Verificá que el código postal sea correcto o intentá con otro.
              </p>
            </div>
          </div>
        )}

        {/* Métodos de envío */}
        {metodos.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Métodos disponibles:
            </p>
            {metodos.map((metodo, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectMethod(metodo)
                  toast.success(`Envío seleccionado: ${metodo.nombre}`)
                }}
                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                  selectedMethod?.nombre === metodo.nombre
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{metodo.nombre}</span>
                      {selectedMethod?.nombre === metodo.nombre && (
                        <CheckCircle2 size={18} />
                      )}
                    </div>
                    <p className={`text-sm ${selectedMethod?.nombre === metodo.nombre ? 'text-gray-200' : 'text-gray-600'}`}>
                      {metodo.demora}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${selectedMethod?.nombre === metodo.nombre ? 'text-white' : 'text-black'}`}>
                      {formatPrice(metodo.precio)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Método seleccionado */}
        {selectedMethod && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="text-green-600" size={20} />
              <span className="font-semibold text-green-800">
                Envío seleccionado: {selectedMethod.nombre}
              </span>
            </div>
            <p className="text-sm text-green-700">
              Costo: {formatPrice(selectedMethod.precio)} • {selectedMethod.demora}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

