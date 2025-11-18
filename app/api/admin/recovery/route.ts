import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() })

    if (!usuario) {
      // Por seguridad, no revelar si el email existe
      return NextResponse.json({
        message: 'Si el email existe, recibirás un correo con instrucciones',
      })
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date()
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Expira en 1 hora

    usuario.resetToken = resetToken
    usuario.resetTokenExpiry = resetTokenExpiry
    await usuario.save()

    const resetLink = `${
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }/admin/reset/${resetToken}`

    // Enviar email (real si hay SMTP configurado, simulado si no)
    await sendEmail({
      to: email,
      subject: 'Recuperación de contraseña - CatalogoIndumentaria',
      type: 'recovery',
      text: `Para restablecer tu contraseña, hacé clic en el siguiente enlace:\n\n${resetLink}\n\nSi no solicitaste este cambio, ignorá este mensaje.`,
      html: `<p>Para restablecer tu contraseña, hacé clic en el siguiente enlace:</p>
             <p><a href="${resetLink}" target="_blank" rel="noopener noreferrer">${resetLink}</a></p>
             <p>Si no solicitaste este cambio, ignorá este mensaje.</p>`,
    })

    return NextResponse.json({
      message: 'Si el email existe, recibirás un correo con instrucciones',
      ...(process.env.NODE_ENV === 'development' && { resetLink }),
    })
  } catch (error: any) {
    console.error('Error in recovery:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar solicitud' },
      { status: 500 }
    )
  }
}

