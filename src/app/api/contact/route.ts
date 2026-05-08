// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function resolveContactRecipients(): string[] {
  const envValue = process.env.CONTACT_FORM_RECIPIENTS ?? process.env.NOTIFY_ADMIN_EMAILS ?? '';
  const recipients = envValue
    .split(/[,;\s]+/)
    .map((x) => x.trim())
    .filter((x) => x.includes('@'));
  if (recipients.length > 0) return [...new Set(recipients)];
  return ['ali.rayyan001@gmail.com'];
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: resolveContactRecipients(),
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>N&A JURISTS - New Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully!'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}