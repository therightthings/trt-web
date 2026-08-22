import type {
  BrowserMediaRecorderOptions,
  BrowserMediaRecorderState,
  BrowserMediaRecordingResult,
} from './browser-media.type';

/**
 * Owns one MediaRecorder instance and its recording data.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
 */
export class BrowserMediaRecorderSession {
  private readonly recorder: MediaRecorder;
  private chunks: Blob[] = [];

  private constructor(recorder: MediaRecorder) {
    this.recorder = recorder;
  }

  static create(
    stream: MediaStream,
    Recorder: typeof MediaRecorder,
    options?: BrowserMediaRecorderOptions,
  ): BrowserMediaRecorderSession | undefined {
    const { handlers = {}, timeslice, ...recorderOptions } = options ?? {};

    try {
      const recorder = new Recorder(stream, recorderOptions);
      const session = new BrowserMediaRecorderSession(recorder);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          session.chunks.push(event.data);
        }
        handlers.onDataAvailable?.(event);
      };
      recorder.onerror = handlers.onError ?? null;
      recorder.onstart = handlers.onStart ?? null;
      recorder.onstop = handlers.onStop ?? null;
      recorder.onpause = handlers.onPause ?? null;
      recorder.onresume = handlers.onResume ?? null;

      recorder.start(timeslice);
      return session;
    } catch {
      return undefined;
    }
  }

  get recorderInstance(): MediaRecorder {
    return this.recorder;
  }

  get state(): BrowserMediaRecorderState {
    return this.recorder.state;
  }

  get mimeType(): string {
    return this.recorder.mimeType;
  }

  get isRecording(): boolean {
    return this.recorder.state === 'recording';
  }

  get isPaused(): boolean {
    return this.recorder.state === 'paused';
  }

  get isInactive(): boolean {
    return this.recorder.state === 'inactive';
  }

  pause(): boolean {
    if (!this.isRecording) {
      return false;
    }

    try {
      this.recorder.pause();
      return true;
    } catch {
      return false;
    }
  }

  resume(): boolean {
    if (!this.isPaused) {
      return false;
    }

    try {
      this.recorder.resume();
      return true;
    } catch {
      return false;
    }
  }

  requestData(): boolean {
    if (this.isInactive) {
      return false;
    }

    try {
      this.recorder.requestData();
      return true;
    } catch {
      return false;
    }
  }

  stop(): Promise<BrowserMediaRecordingResult | undefined> {
    if (this.isInactive) {
      return Promise.resolve(this.finalize());
    }

    return new Promise((resolve) => {
      const onStop = (): void => {
        resolve(this.finalize());
      };

      this.recorder.addEventListener('stop', onStop, { once: true });

      try {
        this.recorder.stop();
      } catch {
        this.recorder.removeEventListener('stop', onStop);
        resolve(undefined);
      }
    });
  }

  private finalize(): BrowserMediaRecordingResult {
    const mimeType = this.recorder.mimeType || 'application/octet-stream';
    const chunks = [...this.chunks];

    return {
      blob: new Blob(chunks, { type: mimeType }),
      chunks,
      mimeType,
    };
  }
}
