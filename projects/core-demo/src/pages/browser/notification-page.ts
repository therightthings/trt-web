import { BrowserNotification } from '@trt-web/browser';

export const createNotificationPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /* html */ `
    <section class="hero">
      <p class="eyebrow">browser/notification</p>
      <h1>BrowserNotification</h1>
      <p>Request permission, display a notification and handle its lifecycle events.</p>
    </section>
    <section class="grid">
      <article class="card">
        <h2>Support and permission</h2>
        <div class="demo-actions">
          <button id="notification-support" type="button">Check support</button>
          <button id="notification-permission" type="button">Read permission</button>
          <button id="notification-request" type="button">Request permission</button>
        </div>
        <pre id="notification-permission-result" class="demo-result">No permission checked yet.</pre>
      </article>
      <article class="card">
        <h2>Create notification</h2>
        <label>Title <input id="notification-title" value="New message" /></label>
        <label>Body <textarea id="notification-body">You have a new message.</textarea></label>
        <label>Icon URL <input id="notification-icon" value="/favicon.svg" /></label>
        <label>Image URL <input id="notification-image" value="/favicon.svg" /></label>
        <button id="notification-show" type="button">Show notification</button>
        <pre id="notification-info" class="demo-result">No notification created yet.</pre>
      </article>
      <article class="card">
        <h2>Events</h2>
        <button id="notification-close" type="button">Close notification</button>
        <pre id="notification-events" class="demo-result">No events received yet.</pre>
      </article>
      <article class="card">
        <h2>Download progress</h2>
        <p>Reuse the same tag to replace the previous progress notification.</p>
        <div class="demo-actions">
          <button id="notification-download-start" type="button">Start download</button>
          <button id="notification-download-stop" type="button">Stop download</button>
        </div>
        <pre id="notification-download-result" class="demo-result">No download started yet.</pre>
      </article>
      <article class="card">
        <h2>Incoming call</h2>
        <p>Keep the notification visible until the user dismisses or ends the call.</p>
        <div class="demo-actions">
          <button id="notification-call-start" type="button">Simulate incoming call</button>
          <button id="notification-call-stop" type="button">End call</button>
        </div>
        <pre id="notification-call-result" class="demo-result">No incoming call.</pre>
      </article>
    </section>
  `;

  const permissionResult = page.querySelector<HTMLElement>('#notification-permission-result')!;
  const infoResult = page.querySelector<HTMLElement>('#notification-info')!;
  const eventsResult = page.querySelector<HTMLElement>('#notification-events')!;
  const downloadResult = page.querySelector<HTMLElement>('#notification-download-result')!;
  const callResult = page.querySelector<HTMLElement>('#notification-call-result')!;
  let session: ReturnType<typeof BrowserNotification.show>;
  let downloadSession: ReturnType<typeof BrowserNotification.show>;
  let callSession: ReturnType<typeof BrowserNotification.show>;
  let downloadTimer: number | undefined;
  const downloadTag = 'core-demo-download-progress';

  const setPermission = async (action: () => Promise<unknown>): Promise<void> => {
    try {
      permissionResult.textContent = String(await action());
    } catch (error) {
      permissionResult.textContent = error instanceof Error ? error.message : String(error);
    }
  };

  page.querySelector('#notification-support')?.addEventListener('click', () => {
    permissionResult.textContent = String(BrowserNotification.isSupported());
  });

  page.querySelector('#notification-permission')?.addEventListener('click', () => {
    void setPermission(() => BrowserNotification.getPermission());
  });

  page.querySelector('#notification-request')?.addEventListener('click', () => {
    void setPermission(() => BrowserNotification.requestPermission());
  });

  page.querySelector('#notification-show')?.addEventListener('click', () => {
    session?.close();

    const title = page.querySelector<HTMLInputElement>('#notification-title')!.value;
    const body = page.querySelector<HTMLTextAreaElement>('#notification-body')!.value;
    const icon = page.querySelector<HTMLInputElement>('#notification-icon')!.value;
    const image = page.querySelector<HTMLInputElement>('#notification-image')!.value;
    session = BrowserNotification.show(title, {
      body,
      icon,
      image,
      data: { url: window.location.href },
    });

    if (!session) {
      infoResult.textContent = 'Notification was not created. Check support and permission first.';
      return;
    }

    infoResult.textContent = JSON.stringify(session.getInfo(), null, 2);
    session.addEventListener('show', () => {
      eventsResult.textContent = 'Notification shown.';
    });
    session.addEventListener('click', () => {
      window.focus();
      eventsResult.textContent = 'Notification clicked.';
    });
    session.addEventListener('close', () => {
      eventsResult.textContent = 'Notification closed.';
    });
    session.addEventListener('error', () => {
      eventsResult.textContent = 'Notification error.';
    });
  });

  page.querySelector('#notification-close')?.addEventListener('click', () => {
    session?.close();
    eventsResult.textContent = session ? 'Close requested.' : 'No notification to close.';
  });

  page.querySelector('#notification-download-start')?.addEventListener('click', () => {
    if (downloadTimer !== undefined) {
      window.clearInterval(downloadTimer);
    }

    downloadSession?.close();
    let progress = 0;
    downloadSession = BrowserNotification.show('Downloading file', {
      body: '0% completed',
      tag: downloadTag,
      renotify: true,
      silent: false,
      icon: '/favicon.svg',
    });
    downloadResult.textContent = 'Download started.';
    downloadTimer = window.setInterval(() => {
      progress += 10;
      downloadSession = BrowserNotification.show('Downloading file', {
        body: `${progress}% completed`,
        tag: downloadTag,
        renotify: true,
        silent: false,
        icon: '/favicon.svg',
      });
      downloadResult.textContent = `${progress}% completed`;

      if (progress >= 100) {
        window.clearInterval(downloadTimer);
        downloadTimer = undefined;
        downloadSession?.close();
        downloadResult.textContent = 'Download completed.';
      }
    }, 2000);
  });

  page.querySelector('#notification-download-stop')?.addEventListener('click', () => {
    if (downloadTimer !== undefined) {
      window.clearInterval(downloadTimer);
      downloadTimer = undefined;
    }
    downloadSession?.close();
    downloadSession = undefined;
    downloadResult.textContent = 'Download stopped.';
  });

  page.querySelector('#notification-call-start')?.addEventListener('click', () => {
    callSession?.close();
    callSession = BrowserNotification.show('Incoming call', {
      body: 'You have an incoming call.',
      requireInteraction: true,
      icon: '/favicon.svg',
    });
    callResult.textContent = callSession
      ? 'Incoming call notification is active.'
      : 'Could not create the incoming call notification.';
  });

  page.querySelector('#notification-call-stop')?.addEventListener('click', () => {
    callSession?.close();
    callSession = undefined;
    callResult.textContent = 'Call ended.';
  });

  return page;
};
