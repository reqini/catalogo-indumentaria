import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Plan from '@/models/Plan'

export async function GET() {
  try {
    await connectDB()
    const planes = await Plan.find({ activo: true }).sort({ precio: 1 }).lean()

    return NextResponse.json(planes)
  } catch (error: any) {
    console.error('Error fetching planes:', error)
    return NextResponse.json(
      { error: 'Error al obtener planes' },
      { status: 500 }
    )
  }
}

