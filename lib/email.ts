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

  // Import dinámico usando require envuelto en try/catch.
  // Se tipa como any para evitar depender de los tipos de nodemailer en build.
  let nodemailer: any
  try {
    // eslint-disable-next-line global-require
    nodemailer = require('nodemailer')
  } catch {
    console.warn('[Email] nodemailer no instalado, usando modo simulado')
    return null
  }

  cachedTransporter = (nodemailer as any).createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })

  return cachedTransporter
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


