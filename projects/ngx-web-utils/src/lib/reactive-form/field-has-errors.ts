import { FormGroup } from '@angular/forms';

export function fieldHasErrors(group: FormGroup, name: string) {
  const control = group.get(name);

  if (control) {
    const { invalid, dirty, touched } = control;
    return invalid && (dirty || touched);
  }

  return false;
}
