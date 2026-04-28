////!--------dashboard component.ts--------
import { Component, ElementRef, QueryList, ViewChildren, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { StorageService } from '../../utilities/services/storage.service';
import { ConfigService } from '../../utilities/services/config.service';
import { ErrInfoComponent } from "../../utilities/components/err-info/err-info.component";
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from "../../utilities/pipes/search.pipe";
import { finalize, Subject, takeUntil } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AlertService } from '../../utilities/services/alert.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, HeaderComponent, AsyncPipe, FormsModule, SearchPipe, DragDropModule],
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


  sitesList: any = [];
  camList: any = [];
  tempCamList = [];
  searchSite!: string;
  camLoader = false;
  liveCameraIds: any[] = [];
  profiles: any[] = [];
  expandedProfileId: any = null;
  selectedBookmarkCamera: any = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.getSitesListForUserName();
    // this.loadProfilesFromLocalStorage();
    this.storage_service.liveCameraIds$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ids) => {
        this.liveCameraIds = ids ?? [];
      });
    this.storage_service.profilesRefresh$.subscribe((refresh: boolean) => {
      if (refresh) {
        this.getUserFavorites();
        this.storage_service.profilesRefresh$.next(false);
      }
    });

  }
  getUserFavorites(): void {
    const user = this.storage_service.getData('user');
    const userId = user?.UserId || user?.userId;

    if (!userId) {
      this.profiles = [];
      this.storage_service.profilesData$.next([]);
      return;
    }

    this.config_service.getUserFavorites(userId).subscribe({
      next: (res: any) => {
        if (res?.statusCode === 200 && Array.isArray(res?.data)) {
          this.profiles = res.data.map((folder: any) => ({
            id: folder.folderId,
            name: folder.folderName,
            folderName: folder.folderName,

            cameras: (folder.favorites || []),
          }));

          this.storage_service.profilesData$.next(this.profiles);
        } else {
          this.profiles = [];
          this.storage_service.profilesData$.next([]);
        }
      },
      error: (err: any) => {
        console.error('get favorites failed', err);
        this.profiles = [];
        this.storage_service.profilesData$.next([]);
      },
    });
  }
  check(): boolean {
    const session = this.storage_service.getData('session');
    return session ? true : false;
  }

  loadProfilesFromLocalStorage() {
    const data = localStorage.getItem('cameraProfiles');
    const profiles = data ? JSON.parse(data) : [];

    this.profiles = [...profiles].sort((a: any, b: any) =>
      (a.name || '').localeCompare(b.name || '', undefined, {
        sensitivity: 'base',
      }),
    );

    if (this.profiles.length) {
      const expandedStillExists = this.profiles.some(
        (profile: any) => profile.id === this.expandedProfileId,
      );

      if (!expandedStillExists) {
        this.expandedProfileId = this.profiles[0].id;
      }
    } else {
      this.expandedProfileId = null;
    }
  }

  toggleProfile(profile: any): void {
    this.expandedProfileId =
      this.expandedProfileId === profile.id ? null : profile.id;

    if (this.expandedProfileId === profile.id) {
      const profileCameras = (profile.cameras || []);

      this.storage_service.camData$.next(profileCameras);
    }
  }

  deleteFavoriteFolder(profile: any, event: Event): void {
    event.stopPropagation();

    const user = this.storage_service.getData('user');
    const modifiedBy = user?.UserId || user?.userId;

    if (!profile?.id || !modifiedBy) return;

    this.config_service.deleteFavoriteFolder(profile.id, modifiedBy).subscribe({
      next: () => {
        this.profiles = this.profiles.filter((p: any) => p.id !== profile.id);
        this.storage_service.profilesData$.next(this.profiles);
        this.storage_service.profilesRefresh$.next(true);
      },
      error: (err: any) => {
        console.error('delete folder failed', err);
      },
    });
  }

  removeProfileCamera(profileId: any, cam: any): void {
    const user = this.storage_service.getData('user');
    const modifiedBy = user?.UserId || user?.userId;

    if (!cam?.id || !modifiedBy) {
      console.error('Missing favorite camera delete id', cam);
      return;
    }

    this.config_service.deleteFavoriteCamera(cam.id, modifiedBy).subscribe({
      next: () => {
        this.profiles = this.profiles.map((profile: any) => {
          if (profile.id === profileId) {
            return {
              ...profile,
              cameras: profile.cameras.filter((c: any) => c.id !== cam.id),
            };
          }
          return profile;
        });

        this.storage_service.profilesData$.next(this.profiles);
        this.storage_service.profilesRefresh$.next(true);
      },
      error: (err: any) => {
        console.error('delete camera failed', err);
      },
    });
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
            this.getUserFavorites();
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

  prevSite: any;
  updateSite(site: any) {
    this.prevSite = this.storage_service.currentSite$.getValue();

    // toggle logic
    if (this.prevSite?.siteId === site?.siteId) {
      this.storage_service.currentSite$.next(null);
    } else {
      this.storage_service.currentSite$.next(site);
      this.getCamerasForSiteId(site);
      setTimeout(() => this.scrollSiteIntoView(site?.siteId), 0);
    }
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
        {
          next: (res: any) => {
            if (res.statusCode === 200) {
              this.alert_service.success(res.message);
            } else {
              this.alert_service.error(res.message);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.alert_service.error('Failed');
          }
        }
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
