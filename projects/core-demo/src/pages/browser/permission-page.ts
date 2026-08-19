import type { BrowserPermissionName } from '@trt-web/core';
import { BrowserPermission } from '@trt-web/core';

export const createPermissionPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">browser/permission</p><h1>BrowserPermission</h1><p>Inspect or request a browser permission after an explicit user action.</p></section><section class="card"><select id="permission-name"></select><div class="demo-actions"><button id="permission-supported">Supported permissions</button><button id="permission-state">Get state</button><button id="permission-request">Request</button></div><pre id="permission-result" class="demo-result">No action run yet.</pre></section>`;
  const select = page.querySelector<HTMLSelectElement>('#permission-name')!;
  const result = page.querySelector<HTMLElement>('#permission-result')!;
  const permissions = BrowserPermission.supportedPermissions();
  select.innerHTML = permissions.map((name) => `<option value="${name}">${name}</option>`).join('');
  const selected = () => select.value as BrowserPermissionName;
  page.querySelector('#permission-supported')?.addEventListener('click', () => {
    result.textContent = permissions.join('\n');
  });
  page.querySelector('#permission-state')?.addEventListener('click', async () => {
    result.textContent = await BrowserPermission.getState(selected());
  });
  page.querySelector('#permission-request')?.addEventListener('click', async () => {
    result.textContent = await BrowserPermission.request(selected());
  });
  return page;
};
