import { DestroyRef, inject } from '@angular/core';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';

export const injectDestroy = () => {
  const destroyRef = inject(DestroyRef);
  const subject = new ReplaySubject<void>(1);

  destroyRef.onDestroy(() => {
    subject.next();
    subject.complete();
  });

  return subject;
};
