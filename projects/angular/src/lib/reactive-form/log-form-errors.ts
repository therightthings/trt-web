import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';

export function logFormErrors(control: AbstractControl, parentKey = '') {
  switch (true) {
    case control instanceof FormGroup: {
      Object.entries(control.controls).forEach(([name, child]) => {
        const key = parentKey ? `${parentKey}.${name}` : name;
        logFormErrors(child, key);
      });
      break;
    }

    case control instanceof FormArray: {
      control.controls.forEach((child, index) => {
        const key = `${parentKey}[${index}]`;
        logFormErrors(child, key);
      });
      break;
    }

    case control instanceof FormControl: {
      control.markAsTouched({ onlySelf: true });
      control.markAsDirty({ onlySelf: true });
      control.updateValueAndValidity({ onlySelf: true });
      if (control.invalid) {
        console.error(`${parentKey} control has error:`, control.errors);
      }
      break;
    }
  }
}
