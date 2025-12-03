import { NextResponse } from 'next/server'
import { isSupabaseEnabled } from '@/lib/supabase'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const diagnostic = {
    status: isSupabaseEnabled ? 'configured' : 'not-configured',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
    },
    variables: {
      NEXT_PUBLIC_SUPABASE_URL: {
        present: !!supabaseUrl,
        length: supabaseUrl?.length || 0,
        preview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'no configurado',
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        present: !!supabaseAnonKey,
        length: supabaseAnonKey?.length || 0,
        preview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'no configurado',
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        present: !!supabaseServiceKey,
        length: supabaseServiceKey?.length || 0,
        preview: supabaseServiceKey ? 'configurado (oculto)' : 'no configurado (opcional)',
      },
    },
    instructions: {
      title: 'Cómo configurar Supabase',
      steps: [
        '1. Ve a https://supabase.com/dashboard y crea un proyecto (o usa uno existente)',
        '2. En tu proyecto, ve a Settings > API',
        '3. Copia la "Project URL" (ejemplo: https://xxxxx.supabase.co)',
        '4. Copia la "anon public" key (la clave pública)',
        '5. En Vercel, ve a tu proyecto > Settings > Environment Variables',
        '6. Agrega estas variables:',
        '   - NEXT_PUBLIC_SUPABASE_URL = tu Project URL',
        '   - NEXT_PUBLIC_SUPABASE_ANON_KEY = tu anon public key',
        '7. (Opcional) Agrega SUPABASE_SERVICE_ROLE_KEY = tu service_role key (para operaciones admin)',
        '8. Redeploya tu aplicación',
      ],
      links: {
        supabaseDashboard: 'https://supabase.com/dashboard',
        supabaseDocs: 'https://supabase.com/docs/guides/getting-started',
      },
    },
    testConnection: null as any,
  }

  // Si está configurado, intentar hacer una conexión de prueba
  if (isSupabaseEnabled) {
    try {
      const { requireSupabase } = await import('@/lib/supabase')
      const { supabaseAdmin } = requireSupabase()

      // Intentar una query simple para verificar conexión
      const { data, error } = await supabaseAdmin.from('tenants').select('count').limit(1)

      diagnostic.testConnection = {
        success: !error,
        error: error?.message || null,
        canConnect: !error,
      }
    } catch (error: any) {
      diagnostic.testConnection = {
        success: false,
        error: error.message,
        canConnect: false,
      }
    }
  }

  return NextResponse.json(diagnostic, {
    status: isSupabaseEnabled ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
