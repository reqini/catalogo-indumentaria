export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
  type?: 'compra' | 'registro' | 'recovery' | 'contacto' | 'otro'
}

let cachedTransporter: any | null = null

async function getTransporter(): Promise<any | null> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    // Sin configuración SMTP, usamos modo "simulado" (solo logs)
    return null
  }

  if (cachedTransporter) return cachedTransporter

  // Import dinámico usando import() para evitar errores en build time
  // Se tipa como any para evitar depender de los tipos de nodemailer en build.
  try {
    // Usar import dinámico que no falla en build time si el módulo no existe
    const nodemailerModule = await import('nodemailer').catch(() => null)

    if (!nodemailerModule || !nodemailerModule.default) {
      console.warn('[Email] nodemailer no instalado, usando modo simulado')
      return null
    }

    const nodemailer = nodemailerModule.default

    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

    return cachedTransporter
  } catch (error: any) {
    console.warn('[Email] Error al inicializar nodemailer:', error.message)
    console.warn('[Email] Usando modo simulado')
    return null
  }
}

export async function sendEmail(options: EmailOptions): Promise<{ simulated: boolean }> {
  const transporter = await getTransporter()

  const from = process.env.SMTP_FROM || 'info@catalogo.com'
  const payload = {
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  }

  if (!transporter) {
    // Modo simulación: loguear el email para desarrollo / demo
    console.log('\n[Email SIMULADO]', {
      type: options.type,
      ...payload,
    })
    return { simulated: true }
  }

  await transporter.sendMail(payload)
  return { simulated: false }
}
