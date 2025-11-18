import { NextResponse } from 'next/server'
import { products } from '../data/mockData'

export async function GET() {
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newProduct = {
      id: Date.now().toString(),
      ...body,
    }
    products.push(newProduct)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating product' },
      { status: 500 }
    )
  }
}

