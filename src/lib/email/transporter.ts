import nodemailer, { type Transporter } from "nodemailer";

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

export type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

let cachedTransporter: Transporter | null = null;
let lastConfigKey = "";

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  let pass = process.env.SMTP_PASS?.trim();
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) {
    return null; // Development / mock mode
  }

  // Sanitize Google App Password if spaces are present (e.g. "aewn ngao vvrn tjaa")
  if (host.includes("gmail") && pass.includes(" ")) {
    pass = pass.replace(/\s+/g, "");
  }

  const currentConfigKey = `${host}:${port}:${user}:${pass}`;
  if (cachedTransporter && lastConfigKey === currentConfigKey) {
    return cachedTransporter;
  }

  lastConfigKey = currentConfigKey;
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return cachedTransporter;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions): Promise<SendEmailResult> {
  const defaultFrom =
    process.env.SMTP_FROM?.trim() ||
    `"${process.env.NEXT_PUBLIC_APP_NAME || "Scan My Record"}" <notifications@scanmyrecord.com>`;

  const transporter = getTransporter();

  if (!transporter) {
    // Development / mock transport logger
    console.log("--------------------------------------------------");
    console.log("📧 [TRANSACTIONAL EMAIL DISPATCH - DEV PREVIEW]");
    console.log(`To: ${to}`);
    console.log(`From: ${from || defaultFrom}`);
    console.log(`Subject: ${subject}`);
    console.log("Status: Delivered (Mock mode - configure SMTP in .env for live sending)");
    console.log("--------------------------------------------------");

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: from || defaultFrom,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, " "),
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email via SMTP";
    console.error("❌ [EMAIL SEND ERROR]:", message);
    return {
      success: false,
      error: message,
    };
  }
}
