export type BrowserCliUtility = {
  name: string;
  description: string;
  methods: BrowserCliMethod[];
  examples: Array<{ title?: string; code: string; language?: string }>;
  example?: string;
  language?: string;
};

export type BrowserCliGroup = {
  name: string;
  description: string;
  utilities: BrowserCliUtility[];
};

export type BrowserCliMethod = {
  name: string;
  signature: string;
  description: string;
};
