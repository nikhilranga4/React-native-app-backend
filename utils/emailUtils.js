const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Common email styles
const commonStyles = `
  /* Email client safe fonts */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  --font-heading: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: var(--font-primary);
    line-height: 1.6;
    color: #000000;
  }
  .header {
    background: #000000;
    padding: 40px 20px;
    text-align: center;
    border-radius: 12px 12px 0 0;
  }
  .header h1 {
    font-family: var(--font-heading);
    color: #ffffff;
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.025em;
  }
  .content {
    background-color: #ffffff;
    padding: 40px 30px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .welcome-message {
    font-family: var(--font-heading);
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 24px;
  }
  .button {
    display: inline-block;
    padding: 14px 28px;
    background: #000000;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-family: var(--font-heading);
    margin: 24px 0;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .button:hover,
  .button:visited {
    color: #ffffff !important;
    text-decoration: none;
  }
  .footer {
    text-align: center;
    margin-top: 32px;
    color: #666666;
    font-size: 14px;
    font-family: var(--font-primary);
  }
`;

const sendVerificationEmail = async (user, verificationUrl) => {
  try {
    const info = await transporter.sendMail({
      from: `"Zonnecta" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to Zonnecta - Verify Your Email",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${commonStyles}</style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f8f8;">
          <div class="email-container">
            <div class="header">
              <h1>Welcome to Zonnecta! 🚀</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              
              <p>Hi ${user.fullName},</p>
              <p>Thank you for signing up! We're excited to have you on board. Please verify your email address to get started.</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">
                  Verify Email Address
                </a>
              </div>
              
              <p>Or copy and paste this URL into your browser:</p>
              <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all;">
                ${verificationUrl}
              </div>
              
              <p style="color: #666; font-size: 14px;">This link will expire in 24 hours for security reasons.</p>
              
              <div class="footer">
                <p>If you didn't create an account, you can safely ignore this email.</p>
                <p>© ${new Date().getFullYear()} Zonnecta. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Verification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

const sendWelcomeEmail = async (user) => {
  try {
    const info = await transporter.sendMail({
      from: `"Zonnecta" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to Zonnecta! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${commonStyles}</style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f8f8;">
          <div class="email-container">
            <div class="header">
              <h1>Welcome to Zonnecta! 🎉</h1>
            </div>
            <div class="content">
              <div class="welcome-message">
                Hello ${user.fullName}! 👋
              </div>

              <p>Thank you for verifying your email! Your account is now fully activated and ready to use.</p>

              <p>With your verified account, you can now:</p>
              <ul style="list-style-type: none; padding: 0;">
                <li>✨ Access all features</li>
                <li>🔒 Manage your security settings</li>
                <li>📱 Use our mobile app</li>
                <li>🌟 Get personalized recommendations</li>
              </ul>

              <p>Ready to get started?</p>
              
              <div style="text-align: center;">
                <a href="${process.env.APP_URL}" class="button">
                  Open Zonnecta App
                </a>
              </div>

              <div class="footer">
                <p>Welcome to the Zonnecta community!</p>
                <p>© ${new Date().getFullYear()} Zonnecta. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
}; 