export type BrowserAIAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export type BrowserAISupportedFeatures = {
  languageDetector: boolean;
  summarizer: boolean;
  translator: boolean;
};

export type BrowserAIProgressPhase = 'downloading' | 'processing' | 'done';

export type BrowserAIProgress = {
  phase: BrowserAIProgressPhase;
  progress: number;
};

export type BrowserAIProgressHandler = (state: BrowserAIProgress) => void;

export type BrowserAILanguageFormat = {
  type: 'text' | 'image' | 'audio';
  languages: string[];
};

export type BrowserAICreateOptions = {
  expectedInputs?: BrowserAILanguageFormat[];
  expectedOutputs?: BrowserAILanguageFormat[];
  signal?: AbortSignal;
};

export type BrowserAIPromptOptions = {
  signal?: AbortSignal;
};

export type BrowserAISummarizerType = 'key-points' | 'tl;dr' | 'teaser' | 'headline';
export type BrowserAISummarizerFormat = 'plain-text' | 'markdown';
export type BrowserAISummarizerLength = 'short' | 'medium' | 'long';

export type BrowserAISummarizeOptions = {
  type?: BrowserAISummarizerType;
  format?: BrowserAISummarizerFormat;
  length?: BrowserAISummarizerLength;
  context?: string;
  signal?: AbortSignal;
  onProgress?: BrowserAIProgressHandler;
};

export type BrowserAITranslateOptions = {
  sourceLanguage: string;
  targetLanguage: string;
  signal?: AbortSignal;
  onProgress?: BrowserAIProgressHandler;
};

export type BrowserAIDetection = {
  detectedLanguage: string;
  confidence: number;
};

export type BrowserAISession = {
  prompt(prompt: string, options?: BrowserAIPromptOptions): Promise<string>;
  promptStreaming(prompt: string, options?: BrowserAIPromptOptions): ReadableStream<string>;
  destroy(): void;
};

export type BrowserAILanguageDetector = {
  availability(): Promise<BrowserAIAvailability>;
  create(options?: { signal?: AbortSignal; monitor?: BrowserAIDownloadMonitorHandler }): Promise<{
    detect(input: string): Promise<BrowserAIDetection[]>;
    destroy(): void;
  }>;
};

export type BrowserAISummarizer = {
  availability(options?: {
    type?: BrowserAISummarizerType;
    format?: BrowserAISummarizerFormat;
    length?: BrowserAISummarizerLength;
  }): Promise<BrowserAIAvailability>;
  create(options?: BrowserAISummarizeCreateOptions): Promise<{
    summarize(input: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
    destroy(): void;
  }>;
};

export type BrowserAITranslator = {
  availability(options?: {
    sourceLanguage?: string;
    targetLanguage?: string;
  }): Promise<BrowserAIAvailability>;
  create(options: BrowserAITranslateCreateOptions): Promise<{
    translate(input: string): Promise<string>;
    destroy(): void;
  }>;
};

export type BrowserAIDownloadProgressEvent = Event & {
  loaded: number;
};

export type BrowserAIDownloadMonitor = {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: BrowserAIDownloadProgressEvent) => void,
  ): void;
};

export type BrowserAISummarizeCreateOptions = Omit<BrowserAISummarizeOptions, 'onProgress'> & {
  monitor?: BrowserAIDownloadMonitorHandler;
};

export type BrowserAITranslateCreateOptions = Omit<BrowserAITranslateOptions, 'onProgress'> & {
  monitor?: BrowserAIDownloadMonitorHandler;
};

export type BrowserAIDownloadMonitorHandler = (monitor: BrowserAIDownloadMonitor) => void;

export type BrowserAIWindow = Window & {
  LanguageDetector?: BrowserAILanguageDetector;
  Summarizer?: BrowserAISummarizer;
  Translator?: BrowserAITranslator;
};
