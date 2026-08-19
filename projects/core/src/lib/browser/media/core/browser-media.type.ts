export type BrowserMediaStreamConstraints = MediaStreamConstraints;
export type BrowserDisplayMediaConstraints = DisplayMediaStreamOptions;
export type BrowserMediaDevice = MediaDeviceInfo;
export type BrowserMediaRecorderState = 'inactive' | 'recording' | 'paused';
export type BrowserMediaRecorderOptions = MediaRecorderOptions & {
  handlers?: BrowserMediaRecordingHandlers;
  timeslice?: number;
};
export type BrowserMediaRecordingResult = {
  blob: Blob;
  chunks: Blob[];
  mimeType: string;
};
export type BrowserMediaRecordingHandlers = {
  onDataAvailable?: (event: BlobEvent) => void;
  onError?: (event: Event) => void;
  onStart?: (event: Event) => void;
  onStop?: (event: Event) => void;
  onPause?: (event: Event) => void;
  onResume?: (event: Event) => void;
};
