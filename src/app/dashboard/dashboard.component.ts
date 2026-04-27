import { Component, ElementRef, QueryList, ViewChildren, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StorageService } from '../../utilities/services/storage.service';
import { ConfigService } from '../../utilities/services/config.service';
import { ErrInfoComponent } from "../../utilities/components/err-info/err-info.component";
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from "../../utilities/pipes/search.pipe";
import { finalize, Subject, takeUntil } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AlertService } from '../../utilities/services/alert.service';

@Component({
    selector: 'app-dashboard',
    imports: [RouterOutlet, HeaderComponent, ErrInfoComponent, AsyncPipe, FormsModule, SearchPipe, JsonPipe, NgIf, DragDropModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    standalone: true,
})
export class DashboardComponent implements OnInit, OnDestroy {

    @ViewChildren('siteItem') siteItems!: QueryList<ElementRef<HTMLElement>>;

    public storage_service = inject(StorageService);
    private config_service = inject(ConfigService);
    private router = inject(Router);
    private http = inject(HttpClient);
    private alert_service = inject(AlertService);
    // _sideNav!: Observable<any>;


    sitesList: any = [];
    camList: any = [];
    tempCamList = [];
    searchSite!: string;
    camLoader = false;
    liveCameraIds: any[] = [];
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        // this._sideNav = this.storage_service.showSideNav$.pipe(delay(100))
        this.getSitesListForUserName();
        this.storage_service.liveCameraIds$
            .pipe(takeUntil(this.destroy$))
            .subscribe((ids) => {
                this.liveCameraIds = ids ?? [];
            });
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
                        this.sitesList = res.sites;
                        const [first] = res.sites;
                        this.storage_service.siteData$.next(res.sites);

                        // this.currentSite = first;
                        this.getCamerasForSiteId(first);
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

    // currentSite: any;
    prevSite: any;
    updateSite(site: any) {
        this.prevSite = this.storage_service.currentSite$.getValue();
        // this.currentSite = this.prevSite?.siteId === site?.siteId ? undefined : site;

        // toggle logic
        if (this.prevSite?.siteId === site?.siteId) {
            this.storage_service.currentSite$.next(null);
        } else {
            this.storage_service.currentSite$.next(site);
            this.getCamerasForSiteId(site);
            setTimeout(() => this.scrollSiteIntoView(site?.siteId), 0);
        }
        // this.storage_service.currentSite$.next(this.currentSite);
    }

    private scrollSiteIntoView(siteId: any) {
        const siteElement = this.siteItems?.find((item) =>
            item.nativeElement.dataset['siteId'] === String(siteId)
        );

        siteElement?.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }

    close() {
        this.storage_service.showSideNav$.next(false);
    }

    getSiteDragData(site: any) {
        const currentSite = this.storage_service.currentSite$.getValue();
        const cameras = currentSite?.siteId === site?.siteId ? this.camList : null;

        return {
            dragType: 'site',
            site,
            cameras,
        };
    }

    isCameraInLive(cameraId: any): boolean {
        return this.liveCameraIds.includes(cameraId);
    }

    playSiren1(camera: any, event: MouseEvent) {
        event.stopPropagation();

        if (!camera?.audioUrl) {
            return;
        }

        this.http
            .get(`${environment.sitesUrl}/play_1_0/${camera.cameraId}`)
            .subscribe(
                (res: any) => {
                    if (res.statusCode === 200) {
                        this.alert_service.success(res.message);
                    } else {
                        this.alert_service.error(res.message);
                    }
                },
                (err: HttpErrorResponse) => {
                    this.alert_service.error('Failed');
                }
            );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}
