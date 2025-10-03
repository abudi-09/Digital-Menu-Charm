import nodemailer, { Transporter } from "nodemailer";
import twilio from "twilio";

let emailTransporter: Transporter | null = null;

export const isSmsServiceConfigured = () =>
  Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  );

const getEmailTransporter = (): Transporter => {
  if (emailTransporter) {
    return emailTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? Number.parseInt(process.env.SMTP_PORT, 10)
    : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP credentials are not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS"
    );
  }

  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  emailTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return emailTransporter;
};

export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error(
      "SMTP_FROM or SMTP_USER must be set to send transactional emails"
    );
  }

  const transporter = getEmailTransporter();

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
};

let twilioClient: ReturnType<typeof twilio> | null = null;

const getTwilioClient = () => {
  if (twilioClient) {
    return twilioClient;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error(
      "Twilio credentials are not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN"
    );
  }

  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
};

export const sendSms = async (to: string, body: string) => {
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    throw new Error(
      "TWILIO_PHONE_NUMBER is required to send SMS verification codes"
    );
  }

  const client = getTwilioClient();
  await client.messages.create({
    from,
    to,
    body,
  });
};
