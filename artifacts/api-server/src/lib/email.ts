import nodemailer from "nodemailer";
import { logger } from "./logger";

/* =========================
   SAFE TRANSPORTER FACTORY
========================= */
function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS missing in env");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/* =========================
   BASE FRONTEND URL
========================= */
function getFrontendUrl() {
  return process.env.FRONTEND_URL || "http://localhost:5173";
}

/* =========================
   PASSWORD RESET EMAIL
========================= */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  name: string
): Promise<void> {
  const transporter = getTransporter();

  const resetUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Vector Technology" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Password — Vector Technology",
    html: `
      <div style="font-family: Arial; max-width:600px; margin:auto; background:#111; color:#fff; padding:30px; border-radius:10px;">
        <h2 style="color:#3B82F6;">Password Reset</h2>
        <p>Hi ${name},</p>
        <p>Click below to reset your password (valid for 1 hour).</p>

        <a href="${resetUrl}" 
           style="display:inline-block;padding:12px 20px;background:#3B82F6;color:#fff;text-decoration:none;border-radius:6px;">
           Reset Password
        </a>

        <p style="font-size:12px;color:#aaa;margin-top:20px;">
          If you didn’t request this, ignore this email.
        </p>

        <p style="font-size:12px;color:#aaa;">
          Link: ${resetUrl}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info({ to }, "Reset email sent");
  } catch (err) {
    logger.error({ err, to }, "Reset email failed");
    throw new Error("Email sending failed");
  }
}

/* =========================
   ORDER CONFIRMATION EMAIL
========================= */
export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  serviceName: string,
  orderId: string
): Promise<void> {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"Vector Technology" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order Confirmed — ${serviceName}`,
    html: `
      <div style="font-family:Arial; max-width:600px; margin:auto; background:#111; color:#fff; padding:30px; border-radius:10px;">
        <h2 style="color:#3B82F6;">Order Confirmed</h2>

        <p>Hi ${name},</p>
        <p>Your order <b>${serviceName}</b> has been successfully placed.</p>

        <p style="color:#aaa;">Order ID: ${orderId}</p>

        <p>We will start processing it soon.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info({ to }, "Order email sent");
  } catch (err) {
    logger.error({ err, to }, "Order email failed");
  }
}