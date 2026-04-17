import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, filter, finalize } from 'rxjs';

import { LiveAiService } from '../../../utilities/services/live-ai.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { ViewChild, ElementRef } from '@angular/core';
import { StreamComponent } from '../../../utilities/components/stream/stream.component';
import { MatDialog } from '@angular/material/dialog';
import { MediaDialogComponent } from '../../../utilities/components/media-dialog/media-dialog.component';
import { MediaPipe } from "../../../utilities/pipes/media.pipe";
@Component({
  selector: 'app-live-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StreamComponent, MediaPipe],
  providers: [LiveAiService],
  templateUrl: './live-ai.component.html',
  styleUrl: './live-ai.component.css',
})
export class LiveAiComponent implements OnInit, OnDestroy {
  //  Events Data
  alerts: any[] = [];
  totalCount = 0;
  siteName!: string;
  //  Cameras
  camerasList: any[] = [];
  selectedCamera: any = null;
  subtitles: any[] = [];
  monitoringStatus: boolean = false;
  aiStatus: boolean = false;
  //  Image
  selectedCameraImage: string = '';

  //  Site
  selectedSiteId!: number;

  //  Refresh
  refreshInterval: number = 30000;
  intervalId: any;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private liveAiService: LiveAiService,
    private storageService: StorageService,
    private dialog: MatDialog,
    public storage_service: StorageService
  ) { }

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  selectCamera(cam: any) {
    this.selectedCamera = cam;
    this.onCameraChange();
  }

  //  Scroll Left
  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({
      left: -200,
      behavior: 'smooth',
    });
  }

  //  Scroll Right
  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({
      left: 200,
      behavior: 'smooth',
    });
  }
  //! =========================================
  //! INIT
  //! =========================================
  // ngOnInit(): void {
  //   this.storageService.currentSite$
  //     .pipe(filter(site => !!site), takeUntil(this.destroy$))
  //     .subscribe((site: any) => {
  //       this.selectedSiteId = site.siteId;

  //       this.loadCameras();
  //       this.loadEvents();
  //     });

  //   this.startAutoRefresh();
  // }
  ngOnInit(): void {
    this.storageService.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$),
      )
      .subscribe((site: any) => {
        this.imageLoader = true;
        this.tableLoader = true;

        this.selectedSiteId = site.siteId;
        this.siteName = site.siteName;

        //  RESET EVERYTHING (VERY IMPORTANT)
        this.selectedCamera = '';
        this.selectedCameraImage = '';
        this.alerts = [];

        //  Load fresh data
        this.loadCameras();
      });

    this.startAutoRefresh();
  }
  //! =========================================
  //! LOAD CAMERAS
  //! =========================================
  // loadCameras(): void {
  //   if (!this.selectedSiteId) return;

  //   this.liveAiService.getCamerasForAI(this.selectedSiteId).subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode === 200) {
  //         this.camerasList = res.data.map((cam: any) => ({
  //           ...cam,
  //           cameraName: cam.cameraName?.trim()
  //         }));
  //       }
  //     },
  //     error: (err) => console.error('❌ Camera API Error:', err),
  //   });
  // }
  // loadCameras(): void {
  //   if (!this.selectedSiteId) return;

  //   this.liveAiService.getCamerasForAI(this.selectedSiteId).subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode === 200) {

  //         this.camerasList = res.data.map((cam: any) => ({
  //           ...cam,
  //           cameraName: cam.cameraName?.trim()
  //         }));

  //         //* ---------  AUTO SELECT FIRST CAMERA  ---------
  //         if (this.camerasList.length > 0 && !this.selectedCamera) {
  //           this.selectedCamera = this.camerasList[0].cameraId;

  //           console.log('🎥 Default Camera Selected:', this.selectedCamera);

  //           //  Load image + events immediately
  //           this.loadCameraImage();
  //           this.loadEvents();
  //         }
  //       }
  //     },
  //     error: (err) => console.error('❌ Camera API Error:', err),
  //   });
  // }
  loadCameras(): void {
    if (!this.selectedSiteId) return;

    this.liveAiService.getCamerasForAI(this.selectedSiteId).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.camerasList = res.data.map((cam: any) => ({
            ...cam,
            cameraName: cam.cameraName?.trim(),
          }));

          //*  ALWAYS SELECT FIRST CAMERA
          if (this.camerasList.length > 0) {
            // this.selectedCamera = this.camerasList[0].cameraId;
            this.selectedCamera = this.camerasList[0];

            console.log('🎥 New Site → Default Camera:', this.selectedCamera);

            this.loadAlertCounts();
            this.loadCameraImage();
            this.loadEvents();
          }
        }
      },
      error: (err) => console.error('❌ Camera API Error:', err),
    });
  }

  openClip(alert: any) {
    if (!alert.files || alert.files.length === 0) return;

    const fileName = alert.files[0];
    const fileUrl = `https://usstaging.ivisecurity.com/common/downloadFile_1_0?requestName=staging-events&assetName=${fileName}`;
    this.dialog.open(MediaDialogComponent, {
      data: {
        ...alert,
        fileUrl: fileUrl,
      },
      disableClose: true,
    });
  }

  //! =========================================
  //! CAMERA CHANGE
  //! =========================================
  onCameraChange(): void {
    if (!this.selectedCamera) {
      this.selectedCameraImage = '';
    } else {
      this.loadCameraImage();
    }

    this.loadEvents();
    this.loadAlertCounts();
  }
  //! =========================================
  //! ALert count
  //! =========================================
  alertCounts: any = {};

  loadAlertCounts(): void {
    if (!this.selectedSiteId) return;

    const today = new Date().toISOString().split('T')[0];

    this.liveAiService
      .getAlertCounts(
        this.selectedSiteId,
        today,
        this.selectedCamera?.cameraId || undefined,
      )
      .subscribe({
        next: (res: any) => {
          if (res.statusCode === 200) {
            console.log('📊 Alert Counts:', res.aiTagCounts);
            this.alertCounts = res.aiTagCounts;
          } else {
            this.alertCounts = {};
          }
        },
        error: (err) => {
          console.error('❌ Alert Count API Error:', err);
          this.alertCounts = {};
        },
      });
  }

  //! =========================================
  //! LOAD IMAGE
  //! =========================================
  imageLoader = false;
  loadCameraImage(): void {
    if (!this.selectedCamera?.cameraId) return;

    this.imageLoader = true;
    this.liveAiService
      .getLatestCameraImage(this.selectedCamera?.cameraId)
      .subscribe({
        next: (res: any) => {
          this.imageLoader = false;
          if (res.statusCode === 200) {
            // 1. Set the image
            this.selectedCameraImage = res.latestImage
              ? `${res.latestImage}?t=${new Date().getTime()}`
              : 'icons/eyedisabled.svg';

            // 2. Map the Status (Convert 'T'/'F' to boolean)
            this.monitoringStatus = res.monitoring === 'T';
            this.aiStatus = res.AI === 'T';

            // 3. Store the Subtitles array for the legend overlay
            this.subtitles = res.subtitles || [];

          } else {
            this.resetCameraData();
          }
        },
        error: (err) => {
          this.imageLoader = false;
          console.error('❌ Image API Error:', err);
        },
      });
  }

  // Helper to clear data if API fails
  private resetCameraData() {
    this.selectedCameraImage = 'icons/eyedisabled.svg';
    this.subtitles = [];
    this.monitoringStatus = false;
    this.aiStatus = false;
  }

  //! =========================================
  //! LOAD EVENTS (MAIN API )
  //! =========================================
  // loadEvents(): void {
  //   if (!this.selectedSiteId) return;

  //   const today = new Date().toISOString().split('T')[0];
  //   const cameraIds = this.selectedCamera ? [this.selectedCamera] : [];

  //   this.liveAiService
  //     .getEventsByCameras(this.selectedSiteId, today, cameraIds)
  //     .subscribe({
  //       next: (res: any) => {

  //         if (res.statusCode === 200 && res.events) {

  //           this.alerts = res.events.slice(0, 5).map((event: any) => ({
  //             ...event,
  //             objectName: this.parseObjectName(event.objectName)
  //           }));

  //           this.totalCount = res.events.length;
  //         } else {
  //           this.alerts = [];
  //           this.totalCount = 0;
  //         }
  //       },
  //       error: (err) => console.error('❌ Events API Error:', err),
  //     });
  // }
  tableLoader = true;
  loadEvents(): void {
    if (!this.selectedSiteId) return;

    const today = new Date().toISOString().split('T')[0];
    const cameraIds = this.selectedCamera ? [this.selectedCamera.cameraId] : [];

    this.tableLoader = true;
    this.liveAiService
      .getEventsByCameras(this.selectedSiteId, today, cameraIds)
      .pipe(finalize(() => (this.tableLoader = false)))
      .subscribe({
        next: (res: any) => {
          if (res.statusCode === 200 && res.events) {
            //  REMOVE slice(0,5)
            this.alerts = res.events.map((event: any) => ({
              ...event,
              objectName: this.parseObjectName(event.objectName),
            }));

            this.totalCount = res.events.length;
          } else {
            this.alerts = [];
            this.totalCount = 0;
          }
        },
        error: (err) => console.error('❌ Events API Error:', err),
      });
  }

  //! =========================================
  //! FIX OBJECT NAME
  //! =========================================
  parseObjectName(value: string): string {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.join(', ') : value;
    } catch {
      return value;
    }
  }

  //! =========================================
  //! AUTO REFRESH
  //! =========================================
  startAutoRefresh(): void {
    this.clearTimer();

    this.intervalId = setInterval(() => {
      this.loadEvents();
      this.loadAlertCounts();

      if (this.selectedCamera?.cameraId) {
        this.loadCameraImage();
      }
    }, this.refreshInterval);
  }

  updateRefresh(): void {
    this.startAutoRefresh();
  }

  clearTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  //! =========================================
  //! NAVIGATION
  //! =========================================
  goToAlerts(alert?: any): void {
    this.router.navigate(['/dashboard/insights'], {
      queryParams: alert ? { tag: alert.actionTag } : {},
    });
  }

  // onImageLoad(event: Event) {
  //   console.log('g');
  //   const img = event.target as HTMLImageElement;
  //   // img.width = 200;
  //   img.classList.add('camera-feed');
  // }


  // onImageError(event: Event) {
  //   const img = event.target as HTMLImageElement;
  //   img.width = 200;
  //   // img.classList.remove('camera-feed');
  //   this.storage_service.imageError = false;
  //   img.src = '/icons/eyedisabled.svg';
  // }

  //! =========================================
  //! CLEANUP
  //! =========================================
  ngOnDestroy(): void {
    this.clearTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
