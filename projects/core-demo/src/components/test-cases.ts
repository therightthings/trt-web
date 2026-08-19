export type DemoTestCase = {
  input: string;
  run: () => unknown | Promise<unknown>;
};

const formatOutput = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2);

export const createTestCases = (cases: DemoTestCase[]): HTMLElement => {
  const section = document.createElement('section');
  section.className = 'card';
  section.innerHTML = `<div class="test-cases-heading"><h2>Some test cases</h2><button id="refresh-test-cases" type="button">Refresh</button></div>${cases.map(({ input }) => `<div class="test-case"><strong>Input</strong><pre class="test-code"><code>${input}</code></pre><strong>Output</strong><pre class="test-code"><code>Running…</code></pre></div>`).join('')}`;
  const runCases = async () => {
    const refreshButton = section.querySelector<HTMLButtonElement>('#refresh-test-cases');
    if (refreshButton) refreshButton.disabled = true;
    const testCases = section.querySelectorAll<HTMLElement>('.test-case');
    await Promise.all(
      Array.from(testCases).map(async (testCase, index) => {
        const output = testCase.querySelector<HTMLElement>('.test-code:last-child code');
        if (!output) return;
        output.textContent = 'Running…';
        try {
          output.textContent = formatOutput(await cases[index].run());
        } catch (error) {
          output.textContent =
            error instanceof Error ? `Error: ${error.message}` : `Error: ${String(error)}`;
        }
      }),
    );
    if (refreshButton) refreshButton.disabled = false;
  };
  section.querySelector('#refresh-test-cases')?.addEventListener('click', () => void runCases());
  void runCases();
  return section;
};
