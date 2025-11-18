import connectDB from '@/lib/mongodb'
import { getEnvStatus } from '@/lib/env'
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic'

async function checkMongoDB(): Promise<'ok' | 'fail'> {
  try {
    await connectDB()
    return 'ok'
  } catch (error) {
    console.error('MongoDB check failed:', error)
    return 'fail'
  }
}

async function checkCloudinary(): Promise<'ok' | 'fail' | 'not_configured'> {
  const envStatus = getEnvStatus()
  if (envStatus.cloudinary === 'not_configured') {
    return 'not_configured'
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    await cloudinary.api.ping()
    return 'ok'
  } catch (error) {
    console.error('Cloudinary check failed:', error)
    return 'fail'
  }
}

async function checkMercadoPago(): Promise<'ok' | 'fail' | 'not_configured'> {
  const envStatus = getEnvStatus()
  if (envStatus.mercadoPago === 'not_configured') {
    return 'not_configured'
  }

  try {
    const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    })
    return response.ok ? 'ok' : 'fail'
  } catch (error) {
    console.error('Mercado Pago check failed:', error)
    return 'fail'
  }
}

export default async function StatusPage() {
  const [mongodb, cloudinary, mercadoPago] = await Promise.all([
    checkMongoDB(),
    checkCloudinary(),
    checkMercadoPago(),
  ])

  const envStatus = getEnvStatus()
  const buildVersion = process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev'
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString()

  const allOk = mongodb === 'ok' && envStatus.missing.length === 0

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-black mb-6">Status / Health Check</h1>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium">MongoDB</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                mongodb === 'ok'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {mongodb === 'ok' ? 'OK' : 'FAIL'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium">Cloudinary</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                cloudinary === 'ok'
                  ? 'bg-green-100 text-green-800'
                  : cloudinary === 'not_configured'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {cloudinary === 'ok' ? 'OK' : cloudinary === 'not_configured' ? 'NOT CONFIGURED' : 'FAIL'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium">Mercado Pago</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                mercadoPago === 'ok'
                  ? 'bg-green-100 text-green-800'
                  : mercadoPago === 'not_configured'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {mercadoPago === 'ok' ? 'OK' : mercadoPago === 'not_configured' ? 'NOT CONFIGURED' : 'FAIL'}
            </span>
          </div>
        </div>

        {envStatus.missing.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="font-semibold text-red-800 mb-2">Variables faltantes:</h2>
            <ul className="list-disc list-inside text-red-700">
              {envStatus.missing.map((env) => (
                <li key={env}>{env}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Versión:</span> {buildVersion}
            </p>
            <p>
              <span className="font-medium">Fecha:</span> {new Date(buildDate).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div
            className={`p-4 rounded-lg ${
              allOk ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className={`font-semibold ${allOk ? 'text-green-800' : 'text-red-800'}`}>
              {allOk ? '✅ Sistema operativo' : '❌ Sistema con problemas'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}



