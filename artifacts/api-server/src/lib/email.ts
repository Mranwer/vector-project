import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env["EMAIL_USER"],
    pass: process.env["EMAIL_PASS"],
  },
});

export async function sendPasswordResetEmail(to: string, resetToken: string, name: string): Promise<void> {
  const resetUrl = `${process.env["FRONTEND_URL"] || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Vector Technology" <${process.env["EMAIL_USER"]}>`,
    to,
    subject: "Reset Your Password — Vector Technology Digital Services",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 40px; border-radius: 12px;">
        <h2 style="color: #3B82F6;">Vector Technology Digital Services</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Reset Password</a>
        <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        <p style="color: #888; font-size: 12px;">Or copy this link: ${resetUrl}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info({ to }, "Password reset email sent");
  } catch (err) {
    logger.error({ err, to }, "Failed to send password reset email");
    throw new Error("Failed to send email");
  }
}

export async function sendOrderConfirmationEmail(to: string, name: string, serviceName: string, orderId: string): Promise<void> {
  const mailOptions = {
    from: `"Vector Technology" <${process.env["EMAIL_USER"]}>`,
    to,
    subject: `Order Confirmed — ${serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 40px; border-radius: 12px;">
        <h2 style="color: #3B82F6;">Order Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Your order for <strong>${serviceName}</strong> has been placed successfully.</p>
        <p style="color: #888;">Order ID: ${orderId}</p>
        <p>We will begin processing your order shortly. You can track your order status in your dashboard.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    logger.error({ err }, "Failed to send order confirmation email");
  }
}
