import { isType, requireBrowserEnv } from '../../utils';
import { AbstractBrowserUtils } from '../abstract-browser';
import type {
  BrowserPeerConnectionDataChannelOptions,
  BrowserPeerConnectionHandlers,
  BrowserPeerConnectionIceCandidateInit,
  BrowserPeerConnectionOfferOptions,
  BrowserPeerConnectionOptions,
  BrowserPeerConnectionSessionDescriptionInit,
} from './browser-peer-connection.type';

/**
 * RTCPeerConnection lifecycle and signaling helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
 */
export class BrowserPeerConnection extends AbstractBrowserUtils {
  private static peerConnection?: RTCPeerConnection;
  private static cleanupListeners?: () => void;

  private static get connection(): RTCPeerConnection | undefined {
    return this.peerConnection;
  }

  static override isSupported(): boolean {
    requireBrowserEnv();
    return window.isSecureContext && isType('function', window, 'RTCPeerConnection');
  }

  static isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }

  static createPeerConnection(
    options?: BrowserPeerConnectionOptions,
  ): RTCPeerConnection | undefined {
    if (!this.isSupported()) {
      return undefined;
    }

    this.close();
    const { config = {}, handlers = {} } = options ?? {};
    const connection = new window.RTCPeerConnection(config);
    this.peerConnection = connection;
    const events: [keyof BrowserPeerConnectionHandlers, string][] = [
      ['onTrack', 'track'],
      ['onIceCandidate', 'icecandidate'],
      ['onIceConnectionStateChange', 'iceconnectionstatechange'],
      ['onConnectionStateChange', 'connectionstatechange'],
      ['onSignalingStateChange', 'signalingstatechange'],
      ['onDataChannel', 'datachannel'],
    ];
    for (const [key, event] of events) {
      const handler = handlers[key];
      if (handler) {
        connection.addEventListener(event, handler as EventListener);
      }
    }
    this.cleanupListeners = (): void => {
      for (const [key, event] of events) {
        const handler = handlers[key];
        if (handler) {
          connection.removeEventListener(event, handler as EventListener);
        }
      }
      this.cleanupListeners = undefined;
    };
    return connection;
  }

  static addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender | undefined {
    try {
      return this.peerConnection?.addTrack(track, ...streams);
    } catch {
      return undefined;
    }
  }

  static removeTrack(sender: RTCRtpSender): void {
    this.peerConnection?.removeTrack(sender);
  }

  static async configureVideoSender(options: {
    maxBitrate: number;
    maxFramerate: number;
  }): Promise<boolean> {
    const sender = this.peerConnection?.getSenders().find((item) => item.track?.kind === 'video');
    if (!sender) {
      return false;
    }
    try {
      const parameters = sender.getParameters();
      parameters.encodings ??= [{}];
      parameters.encodings[0].maxBitrate = options.maxBitrate;
      parameters.encodings[0].maxFramerate = options.maxFramerate;
      parameters.degradationPreference = 'maintain-framerate';
      await sender.setParameters(parameters);
      return true;
    } catch {
      return false;
    }
  }

  static createDataChannel(
    payload: BrowserPeerConnectionDataChannelOptions,
  ): RTCDataChannel | undefined {
    const { label, options = {} } = payload;
    const connection = this.connection;
    if (!connection) {
      return undefined;
    }

    try {
      return connection.createDataChannel(label, options);
    } catch {
      return undefined;
    }
  }

  static async createOffer(
    options?: RTCOfferOptions,
  ): Promise<RTCSessionDescriptionInit | undefined> {
    const connection = this.connection;
    if (!connection) {
      return undefined;
    }

    try {
      return await connection.createOffer(options);
    } catch {
      return undefined;
    }
  }

  static async createAnswer(
    options?: RTCAnswerOptions,
  ): Promise<RTCSessionDescriptionInit | undefined> {
    const connection = this.connection;
    if (!connection) {
      return undefined;
    }

    try {
      return await connection.createAnswer(options);
    } catch {
      return undefined;
    }
  }

  static async setLocalDescription(
    description?: BrowserPeerConnectionSessionDescriptionInit,
  ): Promise<boolean> {
    const connection = this.connection;
    if (!connection) {
      return false;
    }
    try {
      await connection.setLocalDescription(description);
      return true;
    } catch {
      return false;
    }
  }

  static async setRemoteDescription(
    description: BrowserPeerConnectionSessionDescriptionInit,
  ): Promise<boolean> {
    const connection = this.connection;
    if (!connection) {
      return false;
    }
    try {
      await connection.setRemoteDescription(description);
      return true;
    } catch {
      return false;
    }
  }

  static async addIceCandidate(
    candidate: BrowserPeerConnectionIceCandidateInit | null,
  ): Promise<boolean> {
    const connection = this.connection;
    if (!connection) {
      return false;
    }
    try {
      await connection.addIceCandidate(candidate);
      return true;
    } catch {
      return false;
    }
  }

  static async getStats(selector?: MediaStreamTrack | null): Promise<RTCStatsReport | undefined> {
    const connection = this.connection;
    if (!connection) {
      return undefined;
    }
    try {
      return await connection.getStats(selector ?? null);
    } catch {
      return undefined;
    }
  }

  static restartIce(): boolean {
    const connection = this.connection;
    if (!connection) {
      return false;
    }
    try {
      connection.restartIce();
      return true;
    } catch {
      return false;
    }
  }

  static async createConnectionFromOffer(
    payload: BrowserPeerConnectionOfferOptions,
  ): Promise<RTCPeerConnection | undefined> {
    const { offer, config, handlers } = payload;
    const connection = this.createPeerConnection({ config, handlers });
    if (!connection) {
      return undefined;
    }

    if (!(await this.setRemoteDescription(offer))) {
      this.close();
      return undefined;
    }
    return connection;
  }

  static close(): void {
    const connection = this.peerConnection;
    if (!connection) {
      return;
    }
    this.cleanupListeners?.();
    connection.close();
    this.peerConnection = undefined;
  }
}
