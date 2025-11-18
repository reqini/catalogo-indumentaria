import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Buscar usuario con token válido
    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      )
    }

    // Actualizar contraseña
    const passwordHash = await bcrypt.hash(password, 10)
    usuario.passwordHash = passwordHash
    usuario.resetToken = undefined
    usuario.resetTokenExpiry = undefined
    await usuario.save()

    return NextResponse.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error: any) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar contraseña' },
      { status: 500 }
    )
  }
}

