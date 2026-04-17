import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StorageService } from '../../utilities/services/storage.service';
import { ConfigService } from '../../utilities/services/config.service';
import { ErrInfoComponent } from "../../utilities/components/err-info/err-info.component";
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from "../../utilities/pipes/search.pipe";

@Component({
    selector: 'app-dashboard',
    imports: [RouterOutlet, HeaderComponent, ErrInfoComponent, AsyncPipe, FormsModule, SearchPipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    standalone: true,
})
export class DashboardComponent implements OnInit {

    public storage_service = inject(StorageService);
    private config_service = inject(ConfigService);
    sites: any = [];
    searchSite!: string;

    ngOnInit(): void {
        this.getSitesListForUserName();
    }

    check(): boolean {
        const session = this.storage_service.getData('session');
        return session ? true : false;
    }

    /**
     * single time sites loading throuh this method
     */
    getSitesListForUserName() {
        this.config_service.getSitesListForUserName()
            .subscribe({
                next: (res) => {
                    if (res.Status === 'Success') {
                        this.sites = res.sites;
                        const [first] = res.sites;
                        this.storage_service.siteData$.next(res.sites);
                        this.storage_service.currentSite$.next(first);
                    }
                },
                error: (err) => {
                    console.log(err);
                }
            })
    }

    updateSite(site: any) {
        // this.storage_service.showSideNav$.next(false);
        this.storage_service.currentSite$.next(site);
    }

    close() {
        this.storage_service.showSideNav$.next(false);
    }

}
