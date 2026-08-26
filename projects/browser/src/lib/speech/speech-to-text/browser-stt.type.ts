export type BrowserSpeechToTextOptions = {
  lang?: string;
  interimResults?: boolean;
  maxAlternatives?: number;
  timeout?: number;
};
export type BrowserSpeechRecognitionAlternative = { transcript: string; confidence: number };
export type BrowserSpeechRecognitionResult = {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): BrowserSpeechRecognitionAlternative;
  [index: number]: BrowserSpeechRecognitionAlternative;
};
export type BrowserSpeechRecognitionResultList = {
  readonly length: number;
  item(index: number): BrowserSpeechRecognitionResult;
  [index: number]: BrowserSpeechRecognitionResult;
};
export type BrowserSpeechRecognitionEvent = {
  readonly resultIndex: number;
  readonly results: BrowserSpeechRecognitionResultList;
} & Event;
export type BrowserSpeechRecognitionErrorEvent = {
  readonly error: string;
  readonly message: string;
} & Event;
export type BrowserSpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: ((event: Event) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  abort(): void;
  start(): void;
  stop(): void;
} & EventTarget;
export type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognitionInstance;
export type BrowserSpeechWindow = Window & {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
};
