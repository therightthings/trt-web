export type BrowserCliUtility = {
  name: string;
  description: string;
  methods: BrowserCliMethod[];
  example?: string;
  language?: string;
};

export type BrowserCliMethod = {
  name: string;
  signature: string;
  description: string;
};
