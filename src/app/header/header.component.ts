import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import { GlobalClickDirective } from '../../utilities/directives/global-click.directive';

@Component({
    selector: 'app-header',
    imports: [
        RouterModule,
        MatMenuModule,
        GlobalClickDirective
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
        standalone: true,
})
export class HeaderComponent {
 constructor(private router:Router) {}

 logout() {
  this.router.navigate(['/login'])
 }
}
