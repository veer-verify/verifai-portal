import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StorageService } from '../../utilities/services/storage.service';
import { ConfigService } from '../../utilities/services/config.service';
import { ErrInfoComponent } from "../../utilities/components/err-info/err-info.component";
import { AsyncPipe, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from "../../utilities/pipes/search.pipe";
import { delay, finalize, Observable } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    imports: [RouterOutlet, HeaderComponent, ErrInfoComponent, AsyncPipe, FormsModule, SearchPipe, JsonPipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    standalone: true,
})
export class DashboardComponent implements OnInit {

    public storage_service = inject(StorageService);
    private config_service = inject(ConfigService);
    private router = inject(Router);
    _sideNav!: Observable<any>;


    sites: any = [];
    camList: any = [];
    tempCamList = [];
    searchSite!: string;
    camLoader = false;

    ngOnInit(): void {
        this._sideNav = this.storage_service.showSideNav$.pipe(delay(100))
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
                        this.updateSite(first);
                        this.getCamerasForSiteId(first);
                        this.storage_service.siteData$.next(res.sites);
                        this.storage_service.currentSite$.next(first);
                    }
                },
                error: (err) => {
                    console.log(err);
                }
            })
    }

    getCamerasForSiteId(data: any) {
        this.camLoader = true;
        this.config_service.getCamerasForSiteId(data)
            .pipe(
                finalize(() => {
                    this.camLoader = false;
                })
            )
            .subscribe({
                next: (res: any) => {
                    this.storage_service.camData$.next(res);
                    this.camList = res;
                }
            });
    }


    currentSite: any;
    prevSite: any;
    updateSite(site: any) {
        this.prevSite = this.currentSite;
        this.currentSite = site;
        this.currentSite = this.prevSite?.siteId === this.currentSite?.siteId ? undefined : site;

        if (this.currentSite) {
            this.getCamerasForSiteId(site);
        }

        this.storage_service.currentSite$.next(site);
    }

    close() {
        this.storage_service.showSideNav$.next(false);
    }

}
