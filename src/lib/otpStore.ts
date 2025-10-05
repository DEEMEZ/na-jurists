// In-memory OTP store (for production, use Redis or database)
interface OTPData {
  otp: string;
  email: string;
  caseId: string;
  expiresAt: number;
}

interface VerifiedSession {
  email: string;
  caseId: string;
  verifiedAt: number;
}

class OTPStore {
  private otps: Map<string, OTPData> = new Map();
  private verifiedSessions: Map<string, VerifiedSession> = new Map();
  private readonly OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes
  private readonly SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Generate 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP
  storeOTP(email: string, caseId: string, otp: string): void {
    const key = `${email}:${caseId}`;
    this.otps.set(key, {
      otp,
      email,
      caseId,
      expiresAt: Date.now() + this.OTP_EXPIRY,
    });

    // Clean up expired OTPs
    this.cleanupExpiredOTPs();
  }

  // Verify OTP
  verifyOTP(email: string, caseId: string, otp: string): boolean {
    const key = `${email}:${caseId}`;
    const data = this.otps.get(key);

    if (!data) {
      return false;
    }

    if (Date.now() > data.expiresAt) {
      this.otps.delete(key);
      return false;
    }

    if (data.otp !== otp) {
      return false;
    }

    // OTP is valid, delete it and create verified session
    this.otps.delete(key);
    this.createVerifiedSession(email, caseId);
    return true;
  }

  // Create verified session
  private createVerifiedSession(email: string, caseId: string): void {
    const token = this.generateToken();
    this.verifiedSessions.set(token, {
      email,
      caseId,
      verifiedAt: Date.now(),
    });
  }

  // Generate session token
  generateToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // Verify session token
  verifyToken(token: string, caseId: string): boolean {
    const session = this.verifiedSessions.get(token);

    if (!session) {
      return false;
    }

    if (Date.now() - session.verifiedAt > this.SESSION_EXPIRY) {
      this.verifiedSessions.delete(token);
      return false;
    }

    return session.caseId === caseId;
  }

  // Clean up expired OTPs
  private cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [key, data] of this.otps.entries()) {
      if (now > data.expiresAt) {
        this.otps.delete(key);
      }
    }
  }

  // Clean up expired sessions
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [token, session] of this.verifiedSessions.entries()) {
      if (now - session.verifiedAt > this.SESSION_EXPIRY) {
        this.verifiedSessions.delete(token);
      }
    }
  }
}

// Singleton instance
export const otpStore = new OTPStore();

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    otpStore.cleanupExpiredSessions();
  }, 60 * 60 * 1000);
}
