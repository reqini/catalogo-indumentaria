'use client'

import { useState, useRef } from 'react'
import { FileText, Camera, Mic, Upload, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getFileValidator } from '@/lib/bulk-import/file-validator'
import { getBulkImportErrorHandler } from '@/lib/bulk-import/error-handler'

interface BulkImportTabsProps {
  activeTab: 'normal' | 'ia' | 'ocr'
  onTabChange: (tab: 'normal' | 'ia' | 'ocr') => void
  onParse: (input: string, source: 'text' | 'csv' | 'ocr' | 'voice') => void
  isProcessing: boolean
}

export default function BulkImportTabs({
  activeTab,
  onTabChange,
  onParse,
  isProcessing,
}: BulkImportTabsProps) {
  const [textInput, setTextInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleTextParse = () => {
    if (!textInput.trim()) {
      toast.error('Por favor, ingresá texto para analizar')
      return
    }
    onParse(textInput, 'text')
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const errorHandler = getBulkImportErrorHandler()
    const validator = getFileValidator()

    try {
      // Validar archivo primero
      const validation = await validator.validateFile(file)

      if (!validation.isValid) {
        validation.errors.forEach((err) => {
          toast.error(err)
          errorHandler.logError('error', 'FORMATO_NO_SOPORTADO', err)
        })
        return
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach((warn) => {
          toast.error(warn, { duration: 3000 })
        })
      }

      const fileExtension = validation.metadata.extension.toLowerCase()

      if (fileExtension === 'csv' || fileExtension === 'txt') {
        const text = await file.text()
        onParse(text, fileExtension === 'csv' ? 'csv' : 'text')
      } else if (fileExtension === 'json') {
        const text = await file.text()
        // Validar JSON básico
        try {
          JSON.parse(text)
          onParse(text, 'text') // Usar 'text' como tipo ya que el parser maneja JSON internamente
        } catch {
          toast.error('El archivo JSON no es válido')
          errorHandler.logError('error', 'ERROR_PARSE', 'JSON inválido')
        }
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Intentar usar XLSX si está disponible
        try {
          // @ts-ignore - xlsx es opcional
          const XLSX = await import('xlsx')
          const arrayBuffer = await file.arrayBuffer()
          const workbook = XLSX.read(arrayBuffer, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })

          if (jsonData.length === 0) {
            toast.error('El archivo Excel está vacío')
            return
          }

          // Detectar header automáticamente
          const headerRow = jsonData[0] as any[]
          const dataRows = jsonData.slice(1) as any[][]

          // Convertir a formato pipe
          const text = dataRows
            .map((row) => {
              const parts: string[] = []
              headerRow.forEach((header, index) => {
                if (header && row[index]) {
                  const headerLower = String(header).toLowerCase()
                  const value = String(row[index]).trim()

                  // Mapear headers comunes
                  if (headerLower.includes('nombre') || headerLower.includes('name')) {
                    parts.unshift(value) // Nombre al inicio
                  } else if (headerLower.includes('categor') || headerLower.includes('category')) {
                    parts.push(`categoría: ${value}`)
                  } else if (headerLower.includes('precio') || headerLower.includes('price')) {
                    parts.push(`precio: ${value}`)
                  } else if (headerLower.includes('stock') || headerLower.includes('cantidad')) {
                    parts.push(`stock: ${value}`)
                  } else if (headerLower.includes('talle') || headerLower.includes('size')) {
                    parts.push(`talle: ${value}`)
                  } else if (headerLower.includes('color')) {
                    parts.push(`color: ${value}`)
                  } else if (headerLower.includes('sku') || headerLower.includes('code')) {
                    parts.push(`sku: ${value}`)
                  } else {
                    parts.push(`${header}: ${value}`)
                  }
                }
              })
              return parts.join(' | ')
            })
            .filter((line) => line.length > 0)
            .join('\n')

          if (text.trim().length === 0) {
            toast.error('No se pudieron extraer datos del archivo Excel')
            return
          }

          onParse(text, 'csv')
        } catch (xlsxError: any) {
          // Si XLSX no está disponible, mostrar mensaje claro
          if (
            xlsxError.message?.includes('Cannot find module') ||
            xlsxError.code === 'MODULE_NOT_FOUND' ||
            xlsxError.message?.includes('xlsx')
          ) {
            toast.error('Para procesar archivos Excel, instalá la dependencia: pnpm add xlsx', {
              duration: 5000,
            })
            errorHandler.logError(
              'error',
              'FORMATO_NO_SOPORTADO',
              'XLSX no disponible - requiere instalación de dependencia'
            )
          } else {
            toast.error(`Error procesando Excel: ${xlsxError.message}`)
            errorHandler.logError('error', 'ERROR_PARSE', xlsxError.message)
          }
        }
      } else {
        toast.error('Formato de archivo no soportado. Usá CSV, Excel, JSON o TXT')
        errorHandler.logError(
          'error',
          'FORMATO_NO_SOPORTADO',
          `Formato ${fileExtension} no soportado`
        )
      }
    } catch (error: any) {
      console.error('Error processing file:', error)
      toast.error(`Error al procesar el archivo: ${error.message}`)
      errorHandler.logError('error', 'ERROR_PARSE', error.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }

    setIsProcessingOCR(true)

    try {
      toast.loading('Procesando imagen con OCR...', { id: 'ocr' })

      // TODO: Implementar OCR con Tesseract.js cuando esté instalado
      // Por ahora, usar API de OCR externa o placeholder
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/ocr-process', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Error al procesar imagen')
      }

      const data = await response.json()
      toast.success('Imagen procesada correctamente', { id: 'ocr' })
      onParse(data.text, 'ocr')
    } catch (error: any) {
      console.error('Error processing OCR:', error)
      toast.error('Error al procesar la imagen con OCR', { id: 'ocr' })
    } finally {
      setIsProcessingOCR(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Tu navegador no soporta reconocimiento de voz')
      return
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'es-AR'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ')

      setTextInput(transcript)
      onParse(transcript, 'voice')
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      toast.error('Error en reconocimiento de voz')
    }

    recognition.start()
    toast.loading('Escuchando... Hablá ahora', { id: 'voice' })

    setTimeout(() => {
      recognition.stop()
      toast.dismiss('voice')
    }, 10000) // 10 segundos máximo
  }

  const exampleText = `Remera oversize negra | categoría: Remeras | precio: 25000 | stock: 10
Jean mom azul | categoría: Pantalones | precio: 35000 | stock: 5
Buzo hoodie gris | categoría: Buzos | precio: 30000 | stock: 8`

  return (
    <div className="mb-6 rounded-lg bg-white shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => onTabChange('ia')}
            className={`flex-1 border-b-2 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'ia'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="mr-2 inline-block" size={20} />
            Carga Inteligente IA
          </button>
          <button
            onClick={() => onTabChange('ocr')}
            className={`flex-1 border-b-2 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'ocr'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Camera className="mr-2 inline-block" size={20} />
            OCR / Imagen
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'ia' && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Texto de entrada (texto libre, CSV, Excel pegado)
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Pegá aquí tu descripción de productos.

Ejemplo:
${exampleText}

También podés pegar directamente desde Excel, Google Sheets, CSV o JSON.

Formatos soportados:
- Texto estructurado: Nombre | categoría: X | precio: X | stock: X
- CSV: nombre,categoria,precio,stock
- JSON: [{"nombre": "...", "categoria": "...", "precio": 1000}]
- Excel: Subí el archivo .xlsx o .xls`}
                className="h-64 w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                disabled={isProcessing}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleTextParse}
                disabled={isProcessing || !textInput.trim()}
                className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    <span>Analizar con IA</span>
                  </>
                )}
              </button>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50">
                <Upload size={20} />
                <span>Subir Archivo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || isProcessing}
                />
              </label>
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Procesando archivo...</span>
                </div>
              )}

              <button
                onClick={handleVoiceInput}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Mic size={20} />
                <span>Voz → Texto</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ocr' && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Subir imagen o screenshot de lista de productos
              </label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:border-gray-400">
                <Camera className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="mb-4 text-gray-600">
                  Arrastrá una imagen aquí o hacé clic para seleccionar
                </p>
                <label className="inline-block cursor-pointer rounded-lg bg-black px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800">
                  <Upload className="mr-2 inline-block" size={20} />
                  Seleccionar Imagen
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isProcessingOCR}
                  />
                </label>
                {isProcessingOCR && (
                  <div className="mt-4">
                    <Loader2 className="mx-auto animate-spin text-gray-400" size={24} />
                    <p className="mt-2 text-sm text-gray-600">Procesando imagen con OCR...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
