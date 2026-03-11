import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from '../../../../utilities/services/config.service';
import { StorageService } from '../../../../utilities/services/storage.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MediaPipe } from '../../../../utilities/pipes/media.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { StreamComponent } from "../../../../utilities/components/stream/stream.component";

@Component({
  selector: 'app-site-map',
  imports: [CommonModule, MediaPipe, MatMenuModule, StreamComponent],
  templateUrl: './site-map.component.html',
  styleUrl: './site-map.component.css'
})
export class SiteMapComponent implements OnInit, OnDestroy {

  constructor(
    private config_service: ConfigService,
    public storage_service: StorageService
  ) { }

  destroy$ = new Subject<void>();
  siteDetails: any;

  ngOnInit(): void {
    this.storage_service.currentSite$
      .pipe(filter((site) => !!site), takeUntil(this.destroy$))
      .subscribe((res) => {
        this.getSiteFloorMapDetails(res)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getSiteFloorMapDetails(data: any) {
    this.siteDetails = null;
    this.storage_service.info$.next('');
    this.config_service.getSiteFloorMapDetails(data).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.siteDetails = res.siteDetails;
          if (!this.siteDetails.siteImage) {
            this.storage_service.info$.next('no floor map for selected site!');
          }
        } else {
          this.storage_service.info$.next('no floor map for selected site!');
        }
      }
    })
  }

  currentCam: any;
  onCameraClick(cam: string) {
    this.currentCam = null;
    setTimeout(() => {
      this.currentCam = cam;
    }, 100)
  }

  originalWidth = 9000;
  originalHeight = 7000;

  findx(x: number) {
    return (x / this.originalWidth) * 100;
  }

  findy(y: number) {
    return (y / this.originalHeight) * 100;
  }

}
