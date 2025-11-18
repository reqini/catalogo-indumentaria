import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'your-secret-token'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const path = searchParams.get('path') || '/'

    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    revalidatePath(path)
    
    return NextResponse.json({ revalidated: true, path, now: Date.now() })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error revalidating' },
      { status: 500 }
    )
  }
}

