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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-black">Status / Health Check</h1>

        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="font-medium">MongoDB</span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                mongodb === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {mongodb === 'ok' ? 'OK' : 'FAIL'}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="font-medium">Cloudinary</span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                cloudinary === 'ok'
                  ? 'bg-green-100 text-green-800'
                  : cloudinary === 'not_configured'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {cloudinary === 'ok'
                ? 'OK'
                : cloudinary === 'not_configured'
                  ? 'NOT CONFIGURED'
                  : 'FAIL'}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="font-medium">Mercado Pago</span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                mercadoPago === 'ok'
                  ? 'bg-green-100 text-green-800'
                  : mercadoPago === 'not_configured'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {mercadoPago === 'ok'
                ? 'OK'
                : mercadoPago === 'not_configured'
                  ? 'NOT CONFIGURED'
                  : 'FAIL'}
            </span>
          </div>
        </div>

        {envStatus.missing.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <h2 className="mb-2 font-semibold text-red-800">Variables faltantes:</h2>
            <ul className="list-inside list-disc text-red-700">
              {envStatus.missing.map((env) => (
                <li key={env}>{env}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-1 text-sm text-gray-600">
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
            className={`rounded-lg p-4 ${
              allOk ? 'border border-green-200 bg-green-50' : 'border border-red-200 bg-red-50'
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
