// app/api/chat/route.ts
import { NextResponse } from 'next/server';

// Define your law firm's specialties (or use environment variable)
const LEGAL_SPECIALTIES = process.env.NEXT_PUBLIC_LEGAL_SPECIALTIES || 
  "Corporate Law, Tax Disputes, Supreme Court Litigation, Intellectual Property";

// Comprehensive Q&A knowledge base with contact information
const LEGAL_KNOWLEDGE_BASE: Record<string, string> = {
  // Practice Areas
  "corporate": `Our corporate law team handles:
  - Mergers & acquisitions
  - Business formation
  - Contract disputes
  - Regulatory compliance
  Contact corporate@najurists.com for inquiries.`,

  "tax": `For tax matters, we assist with:
  - IRS disputes
  - Tax planning
  - International taxation
  - Tax litigation
  Our success rate in tax cases is 92%. Email tax@najurists.com`,

  "litigation": `Our litigation services cover:
  - Civil lawsuits
  - Appellate practice
  - Supreme Court cases
  - Alternative dispute resolution
  We've handled 150+ cases in the past 5 years.`,

  "intellectual property": `IP services include:
  - Trademark registration
  - Patent filings
  - Copyright protection
  - IP litigation
  Our team includes 3 IP-specialized attorneys.`,

  // General Questions
  "experience": `N&A Jurists has:
  - 25+ years combined experience
  - Handled 500+ cases
  - 15 attorneys across 4 specialties
  - Offices in 3 major cities`,

  // Contact Information (from your contact page)
  "contact": `📌 N&A Jurists Contact Information:

📧 Email: ishfaqnaqvi@hotmail.com
📞 Phone: +92 333 2354476
📍 Address: House No. 6-A, Street No. 12, Sector F-8/3, Islamabad
🗺️ View on Map: https://goo.gl/maps/...

🕒 Office Hours:
Monday - Friday: 9:00 AM - 6:00 PM
Saturday - Sunday: Closed

💡 You can also use the contact form on our website to send us a message directly.`,

  "email": `Our email contact information:
📧 Primary Email: ishfaqnaqvi@hotmail.com
📧 Corporate Inquiries: corporate@najurists.com
📧 Tax Matters: tax@najurists.com

We typically respond within 24 hours during business days.`,

  "phone": `You can reach our office at:
📞 +92 333 2354476

📞 For urgent matters outside office hours, please call:
+92 300 1234567 (Emergency Legal Assistance)

🕒 Call Center Hours:
Monday - Friday: 9:00 AM - 6:00 PM`,

  "address": `Our main office location:
📍 House No. 6-A, Street No. 12, Sector F-8/3, Islamabad

🗺️ View on Google Maps:
https://goo.gl/maps/...

🚗 Parking available in front of the building
🚉 Nearest Metro Station: F-8 Markaz (5 min walk)`,

  "hours": `🕒 N&A Jurists Office Hours:

Monday - Friday: 9:00 AM - 6:00 PM
Saturday - Sunday: Closed
Public Holidays: Closed

📞 Emergency Legal Assistance:
Available 24/7 at +92 300 1234567`,

  "appointment": `To schedule a consultation:
1. Call us at +92 333 2354476 during office hours
2. Email ishfaqnaqvi@hotmail.com with your preferred time
3. Use our online contact form

We offer:
- In-person consultations at our Islamabad office
- Virtual meetings via Zoom/Teams
- Emergency appointments for urgent matters`,

  // Default fallback
  "default": `N&A Jurists specializes in ${LEGAL_SPECIALTIES}. 

📌 Contact Us:
📧 ishfaqnaqvi@hotmail.com
📞 +92 333 2354476

Important Disclaimer: 
This information is general and does not constitute legal advice. 
For case-specific guidance, please consult with our attorneys.`
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1]?.text?.toLowerCase() || '';

    // Enhanced contact information handling
    const contactKeywords = {
      email: ['email', 'mail', 'e-mail'],
      phone: ['phone', 'call', 'number', 'telephone'],
      address: ['address', 'location', 'where', 'map', 'directions'],
      hours: ['hour', 'time', 'open', 'close', 'available'],
      appointment: ['meet', 'appointment', 'consultation', 'schedule', 'book']
    };

    // Check for contact-related queries
    for (const [key, terms] of Object.entries(contactKeywords)) {
      if (terms.some(term => userMessage.includes(term))) {
        return NextResponse.json({ message: LEGAL_KNOWLEDGE_BASE[key] });
      }
    }

    // General contact request
    if (userMessage.includes('contact') || userMessage.includes('reach') || userMessage.includes('get in touch')) {
      return NextResponse.json({ message: LEGAL_KNOWLEDGE_BASE.contact });
    }

    // Find matching response in knowledge base
    let responseText = LEGAL_KNOWLEDGE_BASE.default;
    for (const [keyword, response] of Object.entries(LEGAL_KNOWLEDGE_BASE)) {
      if (userMessage.includes(keyword)) {
        responseText = response;
        break;
      }
    }

    // Add legal disclaimer to all responses
    responseText += `\n\nℹ️ For personalized legal advice, please contact us directly at ishfaqnaqvi@hotmail.com or call +92 333 2354476.`;

    return NextResponse.json({ message: responseText });

  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { 
        message: "⚠️ We're currently unable to process your request. " + 
                "Please contact us directly:\n📧 ishfaqnaqvi@hotmail.com\n📞 +92 333 2354476" 
      },
      { status: 200 }
    );
  }
}