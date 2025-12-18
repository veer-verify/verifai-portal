import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StorageService } from '../../utilities/services/storage.service';
import { ConfigService } from '../../utilities/services/config.service';

@Component({
    selector: 'app-dashboard',
    imports: [RouterOutlet, HeaderComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    standalone: true,
})
export class DashboardComponent implements OnInit {

    storage_service = inject(StorageService);
    config_service = inject(ConfigService);

    ngOnInit(): void {
        this.getSitesListForUserName();
    }

    getSitesListForUserName() {
        this.config_service.getSitesListForUserName()
            .subscribe({
                next: (res) => {
                    if (res.Status === 'Success') {
                        const [first] = res.sites;
                        this.storage_service.siteData$.next(res.sites);
                        this.storage_service.currentSite$.next(first);
                    }
                }
            })
    }


}
