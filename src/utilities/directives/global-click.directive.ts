import { Directive, HostListener } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Directive({
  selector: '[appGlobalClick]',
  standalone: true
})
export class GlobalClickDirective {

  constructor(
    public configSrvc: ConfigService,
  ) { }

  @HostListener('click') onClick() {
    this.configSrvc.showSiteMenu.next(false);
  }

}
