import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GlobalClickDirective } from '../../../utilities/directives/global-click.directive';
import { ConfigService } from '../../../utilities/services/config.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { delay, filter, Subject, take, takeUntil } from 'rxjs';
import { StreamComponent } from '../../../utilities/components/stream/stream.component';
import { AlertService } from '../../../utilities/services/alert.service';
import { MatSelectModule } from '@angular/material/select';
import { gridTypes } from './grid-list';
@Component({
  selector: 'app-live-view',
  standalone: true,
  imports: [
    MatGridListModule,
    MatMenuModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    GlobalClickDirective,
    StreamComponent,
    MatSelectModule,
    DragDropModule,
  ],
  templateUrl: './live-view.component.html',
  styleUrl: './live-view.component.css',
})
export class LiveViewComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    public configSrvc: ConfigService,
    public storage_service: StorageService,
    private alert_service: AlertService
  ) { }

  @ViewChild('gridContainer') gridContainer!: ElementRef;
  @ViewChildren('gridItem') gridItem!: QueryList<ElementRef>;
  private destroy$ = new Subject<void>();

  gridTypes: any = [];
  // showSites = false;
  searchSite!: string;
  sitesList: any = [];
  isChecked: boolean = true;
  paginatedCameraList: any = [];
  searchText: any;
  camList: any[] = [];
  tempCamList: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 0;
  paginatedList: any[] = [];
  isDragEnabled = false;
  isDotEnabled = false;
  maximizedCamera: any | null = null;

  ngOnInit(): void {
    this.gridTypes = gridTypes;
    // this._sideNav = this.storage_service.showSideNav$.pipe(delay(100));
    this.storage_service.siteData$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.sitesList = res.sites;
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateGridLayout(this.itemsPerPage);

    this.storage_service.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.storage_service.camData$.pipe(delay(0)).subscribe((res) => {
          this.camList = res ?? [];
          this.maximizedCamera = null;
          this.refreshLiveList();
        })
      });
  }

  /**
   * pagination to split the cameras into multiple pages
   */
  pagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedList = this.tempCamList.slice(start, end);
  }

  get visibleStreams(): any[] {
    return this.maximizedCamera ? [this.maximizedCamera] : this.paginatedList;
  }

  private updateGridLayout(count: number): void {
    if (!this.gridContainer) {
      return;
    }

    const selectedGrid =
      this.gridTypes.find((item: any) => item.noOfItems === count) ?? null;
    const columns = selectedGrid?.columns ?? Math.ceil(Math.sqrt(count));
    const rows =
      selectedGrid?.rows ?? Math.ceil(count / Math.max(columns, 1));
    const el = this.gridContainer.nativeElement as HTMLElement;

    el.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    el.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
  }

  /**
   * @param count it may be event or number beacuse same function used for different use cases
   * to change layout of cameras in live view
   */
  adjustGrid(count: number | Event): void {
    if (typeof count === 'number') {
      this.currentPage = 1;
      this.itemsPerPage = count;
      this.totalPages = this.getTotalPages();
      this.updateGridLayout(count);
    } else {
      this.adjustGrid(1);
      const target = count.target as HTMLSelectElement;
      const index = this.camList.findIndex((el: any) => el.cameraId === target.value);
      this.currentPage = index + 1;
    }

    this.pagination();
  }

  /**
   * @param type will return type of action eg: next or preveous
   * to navigate betweeen pages
   */
  navigate(type: string) {
    type === 'next' ? this.currentPage += 1 : this.currentPage -= 1;
    this.pagination()
  }

  toggleMaximize(camera: any): void {
    if (this.maximizedCamera?.cameraId === camera?.cameraId) {
      this.maximizedCamera = null;
      return;
    }

    this.maximizedCamera = camera;
  }

  toggleDragDrop(): void {
    this.setDragDrop(!this.isDragEnabled);
  }

  setDragDrop(isEnabled: boolean): void {
    this.isDragEnabled = isEnabled;
    if (isEnabled) {
      this.isDotEnabled = false;
    }
  }

  toggleDotPlacement(): void {
    this.setDotPlacement(!this.isDotEnabled);
  }

  setDotPlacement(isEnabled: boolean): void {
    this.isDotEnabled = isEnabled;
    if (isEnabled) {
      this.isDragEnabled = false;
    }
  }

  dropStream(event: CdkDragDrop<any[]>): void {
    if (this.maximizedCamera) {
      return;
    }

    if (event.previousContainer !== event.container) {
      this.addDroppedItemToLive(event.item.data, event.currentIndex);
      return;
    }

    if (event.previousIndex === event.currentIndex) {
      return;
    }

    moveItemInArray(this.paginatedList, event.previousIndex, event.currentIndex);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.tempCamList.splice(
      start,
      this.paginatedList.length,
      ...this.paginatedList,
    );
    this.paginatedList = [...this.paginatedList];
  }

  removeCameraFromLive(camera: any, event: MouseEvent): void {
    event.stopPropagation();

    this.tempCamList = this.tempCamList.filter(
      (item: any) => item?.cameraId !== camera?.cameraId,
    );

    if (this.maximizedCamera?.cameraId === camera?.cameraId) {
      this.maximizedCamera = null;
    }

    this.refreshLiveList();
  }

  clearLiveView(): void {
    this.tempCamList = [];
    this.paginatedList = [];
    this.maximizedCamera = null;
    this.currentPage = 1;
    this.refreshLiveList(1);
  }

  private addDroppedItemToLive(item: any, dropIndex: number): void {
    if (item?.dragType === 'site') {
      this.addSiteToLive(item, dropIndex);
      return;
    }

    this.addCameraToLive(item, dropIndex);
  }

  private addSiteToLive(payload: any, dropIndex: number): void {
    const cameras = this.normalizeCameraList(payload?.cameras);

    if (cameras.length) {
      this.addCamerasToLive(cameras, dropIndex);
      return;
    }

    if (!payload?.site) {
      return;
    }

    this.configSrvc
      .getCamerasForSiteId(payload.site)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.addCamerasToLive(this.normalizeCameraList(res), dropIndex);
        },
        error: () => {
          this.alert_service.error('Failed to load site cameras');
        },
      });
  }

  private normalizeCameraList(value: any): any[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (Array.isArray(value?.cameras)) {
      return value.cameras;
    }

    if (Array.isArray(value?.data)) {
      return value.data;
    }

    return [];
  }

  private addCamerasToLive(cameras: any[], dropIndex: number): void {
    const uniqueCameras = cameras.filter(
      (camera: any) =>
        camera?.cameraId &&
        !this.tempCamList.some(
          (item: any) => item?.cameraId === camera.cameraId,
        ),
    );

    if (!uniqueCameras.length) {
      const firstCamera = cameras.find((camera: any) => camera?.cameraId);
      const existingIndex = this.tempCamList.findIndex(
        (item: any) => item?.cameraId === firstCamera?.cameraId,
      );

      if (existingIndex >= 0) {
        this.currentPage = Math.floor(existingIndex / this.itemsPerPage) + 1;
        this.pagination();
      }

      return;
    }

    const insertIndex = this.getLiveInsertIndex(dropIndex);
    this.tempCamList.splice(insertIndex, 0, ...uniqueCameras);
    this.refreshLiveList(this.currentPage);
  }

  private addCameraToLive(camera: any, dropIndex: number): void {
    if (!camera?.cameraId) {
      return;
    }

    const existingIndex = this.tempCamList.findIndex(
      (item: any) => item?.cameraId === camera.cameraId,
    );

    if (existingIndex >= 0) {
      this.currentPage = Math.floor(existingIndex / this.itemsPerPage) + 1;
      this.pagination();
      return;
    }

    const insertIndex = this.getLiveInsertIndex(dropIndex);

    this.tempCamList.splice(insertIndex, 0, camera);
    this.refreshLiveList(this.currentPage);
  }

  private getLiveInsertIndex(dropIndex: number): number {
    const pageStart = (this.currentPage - 1) * this.itemsPerPage;
    const pageItemCount = this.paginatedList.length;
    const maxDropIndex =
      pageItemCount >= this.itemsPerPage
        ? this.itemsPerPage - 1
        : pageItemCount;
    const pageDropIndex = Math.min(Math.max(dropIndex, 0), maxDropIndex);
    const insertIndex = Math.min(
      pageStart + pageDropIndex,
      this.tempCamList.length,
    );

    return insertIndex;
  }

  private refreshLiveList(preferredPage = this.currentPage): void {
    this.totalPages = this.getTotalPages();
    this.currentPage = Math.min(Math.max(preferredPage, 1), this.totalPages);
    this.pagination();
    this.publishLiveCameraIds();
  }

  private getTotalPages(): number {
    return Math.max(Math.ceil(this.tempCamList.length / this.itemsPerPage), 1);
  }

  private publishLiveCameraIds(): void {
    this.storage_service.liveCameraIds$.next(
      this.tempCamList.map((camera: any) => camera?.cameraId),
    );
  }

  onDotPlaced(payload: any) {
    this.alert_service.checkLiveDummy(payload).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          console.log('Dummy live check payload:', res.data);
          payload.removeDot?.();
          this.alert_service.success(`${payload.cameraName} checked at ${payload.clickedAt}`);
        } else {
          this.alert_service.error(res.message || 'Dummy live check failed');
        }
      },
      error: () => {
        this.alert_service.error('Dummy live check failed');
      }
    });
  }

  ngOnDestroy(): void {
    this.storage_service.liveCameraIds$.next([]);
    this.destroy$.next();
    this.destroy$.complete();
  }

}
