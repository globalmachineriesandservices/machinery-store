import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function createTransporter() {
  return new Promise<nodemailer.Transporter>((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.verify((error) => {
      if (error) {
        console.error("Email transporter verification failed:", error);
        reject(error);
      } else {
        resolve(transporter);
      }
    });
  });
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"MachineryStore" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email. Please try again later.");
  }
}

export function getContactEmailTemplate(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Message</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background: #333; color: #ccc; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1e3a5f; }
          .value { margin-top: 5px; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #f97316; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0">📧 New Contact Message</h2>
            <p style="margin:5px 0 0;opacity:0.8">You have received a new inquiry</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            ${data.phone ? `
            <div class="field">
              <div class="label">Phone</div>
              <div class="value">${data.phone}</div>
            </div>
            ` : ""}
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${data.subject}</div>
            </div>
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${data.message.replace(/\n/g, "<br>")}</div>
            </div>
          </div>
          <div class="footer">
            <p>This message was sent via the contact form on your website.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getInquiryEmailTemplate(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  productName: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Product Inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { background: #333; color: #ccc; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          .product-highlight { background: #1e3a5f; color: white; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1e3a5f; }
          .value { margin-top: 5px; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #f97316; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0">🔧 Product Information Request</h2>
            <p style="margin:5px 0 0;opacity:0.8">A customer is requesting information about a product</p>
          </div>
          <div class="content">
            <div class="product-highlight">
              <strong>Product:</strong> ${data.productName}
            </div>
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            ${data.phone ? `
            <div class="field">
              <div class="label">Phone</div>
              <div class="value">${data.phone}</div>
            </div>
            ` : ""}
            ${data.company ? `
            <div class="field">
              <div class="label">Company</div>
              <div class="value">${data.company}</div>
            </div>
            ` : ""}
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${data.message.replace(/\n/g, "<br>")}</div>
            </div>
          </div>
          <div class="footer">
            <p>This inquiry was sent via the product page on your website.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getPasswordResetTemplate(data: {
  name: string;
  resetUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; text-align: center; }
          .footer { background: #333; color: #ccc; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          .btn { display: inline-block; background: #f97316; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .warning { font-size: 12px; color: #888; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0">🔐 Password Reset Request</h2>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <a href="${data.resetUrl}" class="btn">Reset My Password</a>
            <p>This link will expire in <strong>1 hour</strong>.</p>
            <p class="warning">If you didn't request this, please ignore this email. Your password won't change.</p>
          </div>
          <div class="footer">
            <p>For security, this link can only be used once.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
