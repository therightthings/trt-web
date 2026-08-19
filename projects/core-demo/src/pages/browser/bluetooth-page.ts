import { BrowserBluetooth } from '@trt-web/core';

export const createBluetoothPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `
    <section class="hero">
      <p class="eyebrow">browser/bluetooth</p>
      <h1>BrowserBluetooth</h1>
      <p>Request a Bluetooth device and inspect a GATT service.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Device</h2>
        <label>Service UUID <input id="bluetooth-service" placeholder="heart_rate or UUID" /></label>
        <div class="demo-actions">
          <button id="bluetooth-available" type="button">Check availability</button>
          <button id="bluetooth-paired" type="button">Paired devices</button>
          <button id="bluetooth-request" type="button">Request device</button>
          <button id="bluetooth-connect" type="button">Connect</button>
          <button id="bluetooth-disconnect" type="button">Disconnect</button>
        </div>
      </article>
      <article class="card">
        <h2>GATT</h2>
        <label>Characteristic UUID <input id="bluetooth-characteristic" placeholder="UUID" /></label>
        <label>Write text <input id="bluetooth-write" value="hello" /></label>
        <div class="demo-actions">
          <button id="bluetooth-service-read" type="button">Get service</button>
          <button id="bluetooth-characteristics" type="button">List characteristics</button>
          <button id="bluetooth-read" type="button">Read value</button>
          <button id="bluetooth-write-button" type="button">Write value</button>
        </div>
        <p id="bluetooth-result" class="demo-result">No action run yet.</p>
      </article>
    </section>
  `;

  const result = page.querySelector<HTMLElement>('#bluetooth-result')!;
  const service = () => page.querySelector<HTMLInputElement>('#bluetooth-service')!.value.trim();
  const characteristic = () =>
    page.querySelector<HTMLInputElement>('#bluetooth-characteristic')!.value.trim();
  const show = (value: unknown) => {
    result.textContent = typeof value === 'string' ? value : JSON.stringify(value);
  };

  page
    .querySelector('#bluetooth-available')
    ?.addEventListener('click', async () => show(await BrowserBluetooth.isAvailable()));
  page
    .querySelector('#bluetooth-paired')
    ?.addEventListener('click', async () =>
      show((await BrowserBluetooth.getPairedDevices()).map((device) => device.id)),
    );
  page.querySelector('#bluetooth-request')?.addEventListener('click', async () => {
    const device = await BrowserBluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: service() ? [service()] : [],
    });
    show(device ? `Device selected: ${device.id}` : 'No device selected.');
  });
  page
    .querySelector('#bluetooth-connect')
    ?.addEventListener('click', async () => show(Boolean(await BrowserBluetooth.connect())));
  page.querySelector('#bluetooth-disconnect')?.addEventListener('click', async () => {
    await BrowserBluetooth.disconnect();
    show('Disconnected.');
  });
  page
    .querySelector('#bluetooth-service-read')
    ?.addEventListener('click', async () =>
      show(Boolean(await BrowserBluetooth.getPrimaryService(service()))),
    );
  page.querySelector('#bluetooth-characteristics')?.addEventListener('click', async () => {
    const characteristics = await BrowserBluetooth.getCharacteristics(service());
    show(
      characteristics.map((item) => ({
        uuid: item.uuid,
        properties: item.properties,
      })),
    );
  });
  page.querySelector('#bluetooth-read')?.addEventListener('click', async () => {
    const value = await BrowserBluetooth.readValue({
      service: service(),
      characteristic: characteristic(),
    });
    show(value ? [...new Uint8Array(value.buffer)] : 'Could not read value.');
  });
  page.querySelector('#bluetooth-write-button')?.addEventListener('click', async () => {
    const text = page.querySelector<HTMLInputElement>('#bluetooth-write')!.value;
    show(
      await BrowserBluetooth.writeValue({
        service: service(),
        characteristic: characteristic(),
        value: new TextEncoder().encode(text),
      }),
    );
  });

  return page;
};
