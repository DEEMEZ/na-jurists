import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { otpStore } from '@/lib/otpStore';

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email, caseId } = await request.json();

    // Validate input
    if (!email || !caseId) {
      return NextResponse.json(
        { error: 'Email and case ID are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = otpStore.generateOTP();

    // Store OTP
    otpStore.storeOTP(email, caseId, otp);

    // Send email
    const mailOptions = {
      from: `"NA Jurists" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Case Details Access',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #2c415e 0%, #4a6789 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .otp-box {
              background: white;
              border: 2px dashed #2c415e;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
              border-radius: 8px;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #2c415e;
              letter-spacing: 8px;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 15px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NA Jurists</h1>
              <p>Case Details Access Verification</p>
            </div>
            <div class="content">
              <h2>Your One-Time Password (OTP)</h2>
              <p>Hello,</p>
              <p>You requested access to view case details on NA Jurists. Use the OTP below to verify your email address:</p>

              <div class="otp-box">
                <div style="color: #666; font-size: 14px; margin-bottom: 10px;">Your OTP Code</div>
                <div class="otp-code">${otp}</div>
                <div style="color: #666; font-size: 12px; margin-top: 10px;">Valid for 10 minutes</div>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • Do not share this OTP with anyone<br>
                • This OTP will expire in 10 minutes<br>
                • If you didn't request this, please ignore this email
              </div>

              <p>If you have any questions, please contact our support team.</p>

              <p>Best regards,<br><strong>NA Jurists Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} NA Jurists. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Your OTP for NA Jurists case access is: ${otp}. This OTP is valid for 10 minutes. Do not share this code with anyone.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'OTP sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
