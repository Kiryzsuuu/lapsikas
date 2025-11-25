import nodemailer from 'nodemailer';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Satker Reminder <noreply@satker-reminder.com>';

// Create transporter
const createTransporter = (customConfig = null) => {
  if (customConfig) {
    return nodemailer.createTransport(customConfig);
  }
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
};

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'Verifikasi Email Anda - Satker Reminder',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #212529; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #212529; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Satker Reminder</h1>
          </div>
          <div class="content">
            <h2>Halo, ${name}!</h2>
            <p>Terima kasih telah mendaftar di Satker Reminder. Untuk menyelesaikan pendaftaran Anda, silakan verifikasi email Anda dengan mengklik tombol di bawah ini:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verifikasi Email</a>
            </div>
            <p>Atau salin dan tempel link berikut ke browser Anda:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            <p style="color: #dc3545; margin-top: 20px;"><strong>Link ini akan kedaluwarsa dalam 24 jam.</strong></p>
          </div>
          <div class="footer">
            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
            <p>&copy; 2025 Satker Reminder - Kementerian Pertahanan RI</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'Reset Password - Satker Reminder',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Reset Password</h1>
          </div>
          <div class="content">
            <h2>Halo, ${name}!</h2>
            <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Atau salin dan tempel link berikut ke browser Anda:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            <p style="color: #dc3545; margin-top: 20px;"><strong>Link ini akan kedaluwarsa dalam 1 jam.</strong></p>
            <p style="margin-top: 20px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
            <p>&copy; 2025 Satker Reminder - Kementerian Pertahanan RI</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send custom email (for reminders, etc)
const sendCustomEmail = async (to, subject, text, smtpConfig = null) => {
  const transporter = createTransporter(smtpConfig);
  
  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    text
  };
  
  await transporter.sendMail(mailOptions);
};

export { sendVerificationEmail, sendPasswordResetEmail, sendCustomEmail };
