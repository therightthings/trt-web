import { FormGroup } from '@angular/forms';

export function fieldHasErrorType(group: FormGroup, name: string, errorKey: string) {
  const control = group.get(name);

  if (control) {
    return control.hasError(errorKey);
  }

  return false;
}
