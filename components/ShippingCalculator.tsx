'use client'

import { useState } from 'react'
import { Truck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShippingMethod {
  nombre: string
  precio: number
  demora: string
  disponible: boolean
  transportista?: string
  tipo?: 'envio' | 'retiro_local' // Tipo de método
}

interface ShippingCalculatorProps {
  onSelectMethod: (method: ShippingMethod | null) => void
  selectedMethod?: ShippingMethod | null
  totalPrice: number
  totalWeight: number // peso total en kg
  showRetiroLocal?: boolean // Mostrar opción de retiro en local
}

export default function ShippingCalculator({
  onSelectMethod,
  selectedMethod,
  totalPrice,
  totalWeight,
  showRetiroLocal = true,
}: ShippingCalculatorProps) {
  const [codigoPostal, setCodigoPostal] = useState('')
  const [loading, setLoading] = useState(false)
  const [metodos, setMetodos] = useState<ShippingMethod[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tipoEntrega, setTipoEntrega] = useState<'envio' | 'retiro_local'>('envio')

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

  // Manejar selección de retiro en local
  const handleRetiroLocal = () => {
    const retiroMethod: ShippingMethod = {
      nombre: 'Retiro en el local',
      precio: 0,
      demora: 'Disponible de lunes a viernes de 9 a 18hs',
      disponible: true,
      tipo: 'retiro_local',
    }
    setTipoEntrega('retiro_local')
    onSelectMethod(retiroMethod)
    setMetodos([])
    setError(null)
  }

  // Manejar cambio a envío
  const handleCambioAEnvio = () => {
    setTipoEntrega('envio')
    onSelectMethod(null)
    setMetodos([])
    setCodigoPostal('')
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-black">
        <Truck size={20} />
        Método de Entrega
      </h3>

      <div className="space-y-4">
        {/* Selector de tipo de entrega */}
        {showRetiroLocal && (
          <div className="mb-4">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Tipo de Entrega *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCambioAEnvio}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  tipoEntrega === 'envio'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <div className="mb-1 font-semibold">Envío a domicilio</div>
                <div
                  className={`text-sm ${tipoEntrega === 'envio' ? 'text-gray-200' : 'text-gray-600'}`}
                >
                  Recibí tu pedido en tu dirección
                </div>
              </button>
              <button
                onClick={handleRetiroLocal}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  tipoEntrega === 'retiro_local'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <div className="mb-1 font-semibold">Retiro en el local</div>
                <div
                  className={`text-sm ${tipoEntrega === 'retiro_local' ? 'text-gray-200' : 'text-gray-600'}`}
                >
                  Retirá tu pedido por el local
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Si es retiro en local, mostrar mensaje */}
        {tipoEntrega === 'retiro_local' && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Retiro en el local:</strong> Vas a retirar tu pedido por el local. Te vamos a
              contactar con la dirección y horarios de retiro.
            </p>
          </div>
        )}

        {/* Input de código postal (solo si es envío) */}
        {tipoEntrega === 'envio' && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Código Postal *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={codigoPostal}
                onChange={(e) => {
                  // Solo permitir números y letras, máximo 8 caracteres
                  const value = e.target.value
                    .replace(/[^A-Za-z0-9]/g, '')
                    .toUpperCase()
                    .substring(0, 8)
                  setCodigoPostal(value)
                }}
                placeholder="Ej: B8000"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCalculate()
                  }
                }}
              />
              <button
                onClick={handleCalculate}
                disabled={loading || !codigoPostal.trim()}
                className="flex items-center gap-2 rounded-lg bg-black px-6 py-2 font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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
        )}

        {/* Error (solo si es envío) */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 flex-shrink-0 text-red-600" size={20} />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="mt-1 text-xs text-red-600">
                Verificá que el código postal sea correcto o intentá con otro.
              </p>
            </div>
          </div>
        )}

        {/* Métodos de envío (solo si es envío) */}
        {tipoEntrega === 'envio' && metodos.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Métodos disponibles:</p>
            {metodos.map((metodo, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectMethod(metodo)
                  toast.success(`Envío seleccionado: ${metodo.nombre}`)
                }}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  selectedMethod?.nombre === metodo.nombre
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold">{metodo.nombre}</span>
                      {selectedMethod?.nombre === metodo.nombre && <CheckCircle2 size={18} />}
                    </div>
                    <p
                      className={`text-sm ${selectedMethod?.nombre === metodo.nombre ? 'text-gray-200' : 'text-gray-600'}`}
                    >
                      {metodo.demora}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${selectedMethod?.nombre === metodo.nombre ? 'text-white' : 'text-black'}`}
                    >
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
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={20} />
              <span className="font-semibold text-green-800">
                {selectedMethod.tipo === 'retiro_local'
                  ? 'Tipo de entrega seleccionado:'
                  : 'Envío seleccionado:'}{' '}
                {selectedMethod.nombre}
              </span>
            </div>
            <p className="text-sm text-green-700">
              {selectedMethod.tipo === 'retiro_local'
                ? selectedMethod.demora
                : `Costo: ${formatPrice(selectedMethod.precio)} • ${selectedMethod.demora}`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
