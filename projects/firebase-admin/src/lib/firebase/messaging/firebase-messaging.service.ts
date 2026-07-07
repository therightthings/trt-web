import { getMessaging, Messaging } from 'firebase-admin/messaging';

export class FirebaseMessagingService {
  private readonly messaging: Messaging = getMessaging();

  static #instance: FirebaseMessagingService;
  private constructor() {
    console.log('[firebase-messaging-service] create instance');
  }
  static getInstance() {
    if (!FirebaseMessagingService.#instance) {
      FirebaseMessagingService.#instance = new FirebaseMessagingService();
    }
    return FirebaseMessagingService.#instance;
  }

  async sendToDevice(
    token: string,
    payload: { title?: string; body?: string },
    data?: Record<string, string>,
  ) {
    if (!token) throw new Error('Missing device token');

    const message = {
      token,
      notification: {
        title: payload?.title || 'No title',
        body: payload?.body || 'No body',
      },
      data: data || {},
    };

    return this.messaging.send(message);
  }

  async sendToMultipleDevices(
    tokens: string[],
    payload: { title?: string; body?: string },
    data?: Record<string, string>,
  ) {
    if (!tokens || tokens.length === 0) throw new Error('Missing device tokens');

    const message = {
      tokens,
      notification: {
        title: payload?.title || 'No title',
        body: payload?.body || 'No body',
      },
      data: data || {},
    };

    return this.messaging.sendEachForMulticast(message);
  }

  async sendToTopic(
    topic: string,
    payload: { title?: string; body?: string },
    data?: Record<string, string>,
  ) {
    if (!topic) throw new Error('Missing topic name');

    const message = {
      topic,
      notification: {
        title: payload?.title || 'No title',
        body: payload?.body || 'No body',
      },
      data: data || {},
    };

    return this.messaging.send(message);
  }

  async subscribeToTopic(token: string, topic: string) {
    if (!token || !topic) throw new Error('Missing token or topic');
    return this.messaging.subscribeToTopic(token, topic);
  }

  async unsubscribeFromTopic(token: string, topic: string) {
    if (!token || !topic) throw new Error('Missing token or topic');
    return this.messaging.unsubscribeFromTopic(token, topic);
  }

  async validateTokens(tokens: string[]) {
    if (!tokens?.length) throw new Error('Empty token list');
    const results = await Promise.allSettled(
      tokens.map((t) => this.messaging.send({ token: t }, true)), // dryRun = true
    );
    return results.map((r, i) => ({
      token: tokens[i],
      valid: r.status === 'fulfilled',
      error: r.status === 'rejected' ? (r.reason as any)?.errorInfo?.message : undefined,
    }));
  }
}
