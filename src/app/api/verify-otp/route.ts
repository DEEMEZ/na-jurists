import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, caseId } = await request.json();

    // Validate input
    if (!email || !otp || !caseId) {
      return NextResponse.json(
        { error: 'Email, OTP, and case ID are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = otpStore.verifyOTP(email, caseId, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // Generate access token
    const token = otpStore.generateToken();

    return NextResponse.json(
      {
        success: true,
        message: 'OTP verified successfully',
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
