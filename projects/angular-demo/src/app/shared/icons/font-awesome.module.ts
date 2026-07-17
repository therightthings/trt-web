import { NgModule } from '@angular/core';
import { FaConfig, FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faChevronDown,
  faChevronRight,
  faChevronUp,
  faCircle,
  faFile,
  faMinus,
  faMoon,
  faPlus,
  faSun,
  faXmark,
  faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons';

@NgModule({
  imports: [FontAwesomeModule],
  exports: [FontAwesomeModule],
})
export class IconModule {
  constructor(library: FaIconLibrary, faConfig: FaConfig) {
    library.addIcons(
      faXmark,
      faXmarkCircle,
      faCheck,
      faChevronDown,
      faChevronUp,
      faChevronRight,
      faMoon,
      faSun,
      faPlus,
      faMinus,
      faCircle,
      faFile,
    );
    faConfig.fallbackIcon = faCircle;
  }
}
