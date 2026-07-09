import { Auth, getAuth } from 'firebase-admin/auth';

export class FireAuthService {
  private readonly auth: Auth = getAuth();

  static #instance: FireAuthService;
  private constructor() {}
  static getInstance() {
    if (!FireAuthService.#instance) {
      FireAuthService.#instance = new FireAuthService();
    }
    return FireAuthService.#instance;
  }

  async verifyIdToken(idToken: string) {
    return this.auth.verifyIdToken(idToken);
  }

  async createSessionCookie(idToken: string, expiresInMs: number) {
    return this.auth.createSessionCookie(idToken, { expiresIn: expiresInMs });
  }

  async revokeUserTokens(uid: string) {
    return this.auth.revokeRefreshTokens(uid);
  }

  async getUser(uid: string) {
    return this.auth.getUser(uid);
  }

  async getUserByPhoneNumber(phoneNumber: string) {
    return this.auth.getUserByPhoneNumber(phoneNumber);
  }

  async createUserWithPhone(phoneNumber: string) {
    return this.auth.createUser({ phoneNumber });
  }

  async deleteUser(uid: string) {
    return this.auth.deleteUser(uid);
  }

  async isTokenValid(idToken: string) {
    try {
      const decoded = await this.auth.verifyIdToken(idToken, true);
      return { valid: true, uid: decoded.uid };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }
}
