import { BrowserWebRtc } from '@trt-web/core';
export const createWebRtcPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/web-rtc</p><h1>BrowserWebRtc</h1><p>Create a peer connection, data channel and SDP offer.</p></section><section class="card"><label>Data channel label <input id="rtc-label" value="core-demo" /></label><div class="demo-actions"><button id="rtc-support">Check support</button><button id="rtc-create">Create connection</button><button id="rtc-channel">Create data channel</button><button id="rtc-offer">Create offer</button><button id="rtc-stats">Get stats</button><button id="rtc-close">Close</button></div><pre id="rtc-result" class="demo-result">No action run yet.</pre></section>`;
  const result = page.querySelector<HTMLElement>('#rtc-result')!;
  page.querySelector('#rtc-support')?.addEventListener('click', () => {
    result.textContent = `Supported: ${BrowserWebRtc.isSupported()}.`;
  });
  page.querySelector('#rtc-create')?.addEventListener('click', () => {
    result.textContent = BrowserWebRtc.createPeerConnection()
      ? 'Peer connection created.'
      : 'Unsupported.';
  });
  page.querySelector('#rtc-channel')?.addEventListener('click', () => {
    result.textContent = BrowserWebRtc.createDataChannel(
      page.querySelector<HTMLInputElement>('#rtc-label')!.value,
    )
      ? 'Data channel created.'
      : 'Create connection first.';
  });
  page.querySelector('#rtc-offer')?.addEventListener('click', async () => {
    result.textContent = JSON.stringify(await BrowserWebRtc.createOffer(), null, 2);
  });
  page.querySelector('#rtc-stats')?.addEventListener('click', async () => {
    const stats = await BrowserWebRtc.getStats();
    result.textContent = stats ? `Stats entries: ${[...stats].length}` : 'No peer connection.';
  });
  page.querySelector('#rtc-close')?.addEventListener('click', () => {
    BrowserWebRtc.close();
    result.textContent = 'Peer connection closed.';
  });
  return page;
};
