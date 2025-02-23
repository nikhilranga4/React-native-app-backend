const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Ensure backend URL is available
const BACKEND_URL = process.env.BACKEND_URL || 'https://react-native-app-backend-ozmx.onrender.com';

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
  :root {
    --color-primary: #000000;
    --color-background: #ffffff;
    --color-text: #2d3748;
    --color-text-light: #718096;
    --color-border: #e2e8f0;
    --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-heading: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: #f7fafc;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .email-wrapper {
    background-color: #f7fafc;
    padding: 40px 20px;
  }

  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: var(--color-background);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1);
  }

  .header {
    background-color: var(--color-primary);
    padding: 40px 20px;
    text-align: center;
  }

  .logo {
    width: 120px;
    height: auto;
    margin-bottom: 20px;
  }

  .header h1 {
    color: var(--color-background);
    margin: 0;
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.025em;
  }

  .content {
    padding: 48px 40px;
    font-family: var(--font-primary);
    color: var(--color-text);
    line-height: 1.6;
  }

  .welcome-message {
    font-family: var(--font-heading);
    font-size: 24px;
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: 24px;
  }

  .button-container {
    text-align: center;
    margin: 32px 0;
  }

  .button {
    display: inline-block;
    background-color: var(--color-primary);
    color: var(--color-background) !important;
    text-decoration: none;
    padding: 16px 32px;
    border-radius: 8px;
    font-weight: 600;
    font-family: var(--font-heading);
    font-size: 16px;
    transition: transform 0.15s ease-in-out;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .button:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .verification-link {
    background-color: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    word-break: break-all;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 14px;
    color: var(--color-text);
    margin: 24px 0;
    border: 1px solid var(--color-border);
  }

  .feature-list {
    margin: 32px 0;
    padding: 24px;
    background-color: #f8fafc;
    border-radius: 12px;
    border: 1px solid var(--color-border);
  }

  .feature-item {
    display: flex;
    align-items: center;
    margin: 16px 0;
    color: var(--color-text);
    font-size: 16px;
  }

  .feature-icon {
    margin-right: 12px;
    font-size: 20px;
  }

  .divider {
    height: 1px;
    background-color: var(--color-border);
    margin: 32px 0;
  }

  .footer {
    text-align: center;
    padding: 32px 0;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-light);
    font-size: 14px;
    line-height: 1.6;
  }

  .social-links {
    margin-top: 20px;
  }

  .social-link {
    display: inline-block;
    margin: 0 8px;
    color: var(--color-text-light);
    text-decoration: none;
  }
`;

const sendVerificationEmail = async (user, verificationUrl) => {
  try {
    const fullVerificationUrl = verificationUrl.startsWith('http') 
      ? verificationUrl 
      : `${BACKEND_URL}${verificationUrl.startsWith('/') ? '' : '/'}${verificationUrl}`;

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
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="header">
                <h1>Welcome to Zonnecta! 🚀</h1>
              </div>
              <div class="content">
                <div class="welcome-message">
                  Hello ${user.fullName}!
                </div>
                
                <p>Thank you for choosing Zonnecta. To get started, please verify your email address by clicking the button below:</p>
                
                <div class="button-container">
                  <a href="${fullVerificationUrl}" class="button">
                    Verify Email Address
                  </a>
                </div>
                
                <p>This link will expire in 24 hours. If you need a new verification link, you can request one from the app.</p>
                
                <div class="divider"></div>
                
                <p style="font-size: 14px; color: var(--color-text-light);">If the button doesn't work, copy and paste this URL into your browser:</p>
                <div class="verification-link">
                  ${fullVerificationUrl}
                </div>
                
                <div class="feature-list">
                  <div class="feature-item">
                    <span class="feature-icon">🔒</span>
                    <span>Secure and encrypted communication</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🌐</span>
                    <span>Access from anywhere, anytime</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">📱</span>
                    <span>Seamless mobile experience</span>
                  </div>
                </div>
                
                <div class="footer">
                  <p>If you didn't create an account with Zonnecta, please ignore this email.</p>
                  <div class="social-links">
                    <a href="#" class="social-link">Twitter</a>
                    <a href="#" class="social-link">LinkedIn</a>
                    <a href="#" class="social-link">Instagram</a>
                  </div>
                  <p style="margin-top: 20px;">© ${new Date().getFullYear()} Zonnecta. All rights reserved.</p>
                </div>
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
      subject: "Welcome to Zonnecta! Your Account is Verified 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${commonStyles}</style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="header">
                <h1>Welcome to Zonnecta! 🎉</h1>
              </div>
              <div class="content">
                <div class="welcome-message">
                  Congratulations, ${user.fullName}!
                </div>

                <p>Your email has been successfully verified, and your Zonnecta account is now fully activated. We're excited to have you join our community!</p>

                <div class="feature-list">
                  <h3 style="margin-top: 0; color: var(--color-primary);">What you can do now:</h3>
                  <div class="feature-item">
                    <span class="feature-icon">✨</span>
                    <span>Access all premium features</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">👤</span>
                    <span>Complete your profile</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🔔</span>
                    <span>Set up notifications</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🤝</span>
                    <span>Connect with others</span>
                  </div>
                </div>

                <div class="button-container">
                  <a href="${process.env.APP_URL || 'zonnecta://app'}" class="button">
                    Open Zonnecta App
                  </a>
                </div>

                <div class="divider"></div>

                <div style="text-align: center;">
                  <h3 style="color: var(--color-primary);">Need Help Getting Started?</h3>
                  <p>Check out our quick start guide or reach out to our support team.</p>
                </div>

                <div class="footer">
                  <p>Welcome to the Zonnecta community!</p>
                  <div class="social-links">
                    <a href="#" class="social-link">Twitter</a>
                    <a href="#" class="social-link">LinkedIn</a>
                    <a href="#" class="social-link">Instagram</a>
                  </div>
                  <p style="margin-top: 20px;">© ${new Date().getFullYear()} Zonnecta. All rights reserved.</p>
                </div>
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