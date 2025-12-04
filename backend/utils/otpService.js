/**
 * OTP Service
 * Generates and manages OTP codes for email and phone verification
 */

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get OTP expiry time (5 minutes from now)
const getOTPExpiry = () => {
  const now = new Date();
  return new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
};

// Verify OTP
const verifyOTP = (storedOTP, providedOTP, expiryTime) => {
  // Check if OTP has expired
  if (new Date() > expiryTime) {
    return {
      valid: false,
      message: 'OTP has expired. Please request a new one.',
    };
  }

  // Check if OTP matches
  if (storedOTP !== providedOTP) {
    return {
      valid: false,
      message: 'Invalid OTP. Please try again.',
    };
  }

  return {
    valid: true,
    message: 'OTP verified successfully.',
  };
};

// Send OTP via email (mock implementation - replace with actual email service)
const sendOTPviaEmail = async (email, otp) => {
  // If SENDGRID_API_KEY is set, use SendGrid Web API to send email
  if (process.env.SENDGRID_API_KEY) {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@bidbazzar.local',
        subject: 'Your BidBazaar verification code',
        text: `Your verification code is ${otp}. It expires in 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">BidBazaar Email Verification</h2>
            <p>Your verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #666;">This code will expire in 5 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      };

      console.log(`📧 Attempting to send email to ${email} from ${msg.from}...`);
      const response = await sgMail.send(msg);
      console.log(`✅ Email sent successfully to ${email}. Status:`, response[0].statusCode);
      return { success: true, message: `OTP sent to ${email}` };
    } catch (err) {
      console.error('❌ SendGrid Error Details:');
      console.error('Status Code:', err?.code);
      console.error('Message:', err?.message);
      if (err?.response?.body) {
        console.error('Response Body:', JSON.stringify(err.response.body, null, 2));
      }

      // Log detailed error for debugging
      const errorMessage = err?.response?.body?.errors?.[0]?.message || err?.message || 'Unknown error';
      console.error(`Failed to send email to ${email}: ${errorMessage}`);

      // In development, also log the OTP for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 Email OTP (for testing) to ${email}: ${otp}`);
      }

      // Throw the error so the controller can handle it
      throw new Error(`Email sending failed: ${errorMessage}`);
    }
  }

  // Fallback mock implementation (development)
  console.log(`📧 Email OTP sent to ${email}: ${otp}`);
  return {
    success: true,
    message: `OTP sent to ${email}`,
    otp: otp, // In development only: returned for ease of testing
  };
};

// Send OTP via SMS (using Twilio)
const sendOTPviaSMS = async (phone, otp) => {
  // If Twilio credentials are set, use Twilio to send SMS
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      console.log(`📱 Attempting to send SMS to ${phone} from ${process.env.TWILIO_PHONE_NUMBER}...`);

      const message = await client.messages.create({
        body: `Your BidBazaar verification code is: ${otp}. It expires in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      console.log(`✅ SMS sent successfully to ${phone}. SID:`, message.sid);
      return { success: true, message: `OTP sent to ${phone}` };
    } catch (err) {
      console.error('❌ Twilio Error Details:');
      console.error('Status:', err?.status);
      console.error('Code:', err?.code);
      console.error('Message:', err?.message);
      console.error('More Info:', err?.moreInfo);

      // Log detailed error for debugging
      const errorMessage = err?.message || 'Unknown error';
      console.error(`Failed to send SMS to ${phone}: ${errorMessage}`);

      // In development, also log the OTP for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 SMS OTP (for testing) to ${phone}: ${otp}`);
      }

      // Throw the error so the controller can handle it
      throw new Error(`SMS sending failed: ${errorMessage}`);
    }
  }

  // Fallback mock implementation (development)
  console.log(`📱 SMS OTP sent to ${phone}: ${otp}`);
  return {
    success: true,
    message: `OTP sent to ${phone}`,
    otp: otp, // In development only: returned for ease of testing
  };
};

module.exports = {
  generateOTP,
  getOTPExpiry,
  verifyOTP,
  sendOTPviaEmail,
  sendOTPviaSMS,
};
