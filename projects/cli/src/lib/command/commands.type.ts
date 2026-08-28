export type BrowserCliUtility = {
  name: string;
  description: string;
  methods: BrowserCliMethod[];
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
