import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { GlobalClickDirective } from '../../utilities/directives/global-click.directive';
import { StorageService } from '../../utilities/services/storage.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-header',
    imports: [
        RouterModule,
        MatMenuModule,
        GlobalClickDirective,
        FormsModule
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    standalone: true,
})
export class HeaderComponent {

    private destroy$ = new Subject<void>();

    constructor(
        private router: Router,
        private storage_service: StorageService
    ) { }

    sitesList!: Array<any>;
    ngOnInit() {
        this.storage_service.siteData$
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    if(res.length === 0) return;
                    this.sitesList = res.sites;
                    this.currentSite = this.sitesList[0]
                }
            })
    }

    currentSite: any;
    showSite: boolean = false
    set(site: any) {
        this.showSite = !this.showSite;
        this.currentSite = site;
        this.storage_service.currentSite$.next(this.currentSite);
        // console.log(this.storage_service.currentSite$.getValue());
    }

    logout() {
        this.router.navigate(['/login'])
    }
}
