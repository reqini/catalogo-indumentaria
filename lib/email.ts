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

  // Import completamente opcional usando require dinámico
  // Esto evita que webpack intente resolver el módulo en build time
  try {
    // Usar require dinámico que solo se ejecuta en runtime
    // Construir el nombre del módulo dinámicamente para evitar análisis estático de webpack
    // eslint-disable-next-line no-implied-eval
    const moduleName = 'node' + 'mailer'
    const requireDynamic = new Function('moduleName', 'return require(moduleName)')
    const nodemailer = requireDynamic(moduleName)

    if (!nodemailer || !nodemailer.createTransport) {
      console.warn('[Email] nodemailer no disponible, usando modo simulado')
      return null
    }

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
    // Si nodemailer no está instalado, simplemente usar modo simulado
    console.warn('[Email] nodemailer no instalado o no disponible, usando modo simulado')
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
