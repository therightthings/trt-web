import { Injectable, signal } from '@angular/core';

export interface HttpCacheQuote {
  id: number;
  topic: string;
  quote: string;
  generatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class MockHttpCacheService {
  readonly backendHitCount = signal(0);

  createQuote(topic: string): HttpCacheQuote {
    this.backendHitCount.update((count) => count + 1);

    const count = this.backendHitCount();
    const quotes: Record<string, string[]> = {
      utils: [
        'Small utilities compose into reliable Angular experiences.',
        'The best demo is the one that uses the real API.',
        'Cache once, render twice, and keep the UI calm.',
      ],
      forms: [
        'Validation becomes easier when helpers stay tiny and focused.',
        'A form helper should remove friction, not add ceremony.',
      ],
      data: [
        'State that persists across reloads makes a demo feel real.',
        'Signals are most useful when updates stay obvious.',
      ],
    };

    const pool = quotes[topic] ?? quotes['utils'];
    const quote = pool[(count - 1) % pool.length] ?? pool[0];

    return {
      id: count,
      topic,
      quote,
      generatedAt: new Date().toISOString(),
    };
  }

  reset(): void {
    this.backendHitCount.set(0);
  }
}
