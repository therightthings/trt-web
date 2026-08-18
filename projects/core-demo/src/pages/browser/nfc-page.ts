import { BrowserNfc } from '@trt-web/core';

export const createNfcPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/nfc</p><h1>BrowserNfc</h1><p>Start an NFC scan or write a text message on supported devices.</p></section><section class="card"><label>Message <input id="nfc-message" value="Hello from core-demo" /></label><div class="demo-actions"><button id="nfc-scan">Start scan</button><button id="nfc-stop">Stop scan</button><button id="nfc-write">Write message</button></div><pre id="nfc-result" class="demo-result">No action run yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#nfc-result')!;
  page.querySelector('#nfc-scan')?.addEventListener('click', async () => {
    const started = await BrowserNfc.startScan({
      onReading: (event) => {
        result.textContent = JSON.stringify(
          { serialNumber: event.serialNumber, records: event.message.records },
          null,
          2,
        );
      },
      onReadingError: () => {
        result.textContent = 'NFC reading error.';
      },
    });
    result.textContent = started ? 'NFC scan started.' : 'Could not start NFC scan.';
  });
  page.querySelector('#nfc-stop')?.addEventListener('click', async () => {
    await BrowserNfc.stopScan();
    result.textContent = 'NFC scan stopped.';
  });
  page.querySelector('#nfc-write')?.addEventListener('click', async () => {
    result.textContent = (await BrowserNfc.write(
      page.querySelector<HTMLInputElement>('#nfc-message')!.value,
    ))
      ? 'NFC message written.'
      : 'Could not write NFC message.';
  });
  return page;
};
