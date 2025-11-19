'use client'

import { useState, useRef } from 'react'
import { FileText, Camera, Mic, Upload, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
// import Tesseract from 'tesseract.js' // Comentado hasta instalar: pnpm add tesseract.js

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

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()

      if (fileExtension === 'csv') {
        const text = await file.text()
        onParse(text, 'csv')
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        
        // Convertir a texto estructurado
        const text = jsonData
          .slice(1) // Saltar header
          .map((row: any) => {
            const [nombre, categoria, precio, stock, sku] = row
            return `${nombre} | categoría: ${categoria} | precio: ${precio} | stock: ${stock}${sku ? ` | sku: ${sku}` : ''}`
          })
          .join('\n')
        
        onParse(text, 'csv')
      } else {
        toast.error('Formato de archivo no soportado. Usá CSV o Excel (.xlsx, .xls)')
      }
    } catch (error: any) {
      console.error('Error processing file:', error)
      toast.error('Error al procesar el archivo')
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

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
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
    <div className="bg-white rounded-lg shadow mb-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => onTabChange('ia')}
            className={`flex-1 px-6 py-4 text-center font-semibold border-b-2 transition-colors ${
              activeTab === 'ia'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="inline-block mr-2" size={20} />
            Carga Inteligente IA
          </button>
          <button
            onClick={() => onTabChange('ocr')}
            className={`flex-1 px-6 py-4 text-center font-semibold border-b-2 transition-colors ${
              activeTab === 'ocr'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Camera className="inline-block mr-2" size={20} />
            OCR / Imagen
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'ia' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto de entrada (texto libre, CSV, Excel pegado)
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Pegá aquí tu descripción de productos.

Ejemplo:
${exampleText}

También podés pegar directamente desde Excel o Google Sheets.`}
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                disabled={isProcessing}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleTextParse}
                disabled={isProcessing || !textInput.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

              <label className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
                <Upload size={20} />
                <span>Subir CSV/Excel</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || isProcessing}
                />
              </label>

              <button
                onClick={handleVoiceInput}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subir imagen o screenshot de lista de productos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
                <Camera className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-4">
                  Arrastrá una imagen aquí o hacé clic para seleccionar
                </p>
                <label className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all cursor-pointer">
                  <Upload className="inline-block mr-2" size={20} />
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
                    <Loader2 className="animate-spin mx-auto text-gray-400" size={24} />
                    <p className="text-sm text-gray-600 mt-2">Procesando imagen con OCR...</p>
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

