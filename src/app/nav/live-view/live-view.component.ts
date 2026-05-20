import {
  CdkDragDrop,
  CdkDragMove,
  DragDropModule,
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
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GlobalClickDirective } from '../../../utilities/directives/global-click.directive';
import { ConfigService } from '../../../utilities/services/config.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { catchError, delay, filter, firstValueFrom, forkJoin, map, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { StreamComponent } from '../../../utilities/components/stream/stream.component';
import { AlertService } from '../../../utilities/services/alert.service';
import { MatSelectModule } from '@angular/material/select';
import { gridTypes } from './grid-list';
import { environment } from '../../../environments/environment';
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
    private alert_service: AlertService,
    private http: HttpClient,
  ) { }

  @ViewChild('gridContainer') gridContainer!: ElementRef;
  @ViewChildren('gridItem') gridItem!: QueryList<ElementRef>;
  private destroy$ = new Subject<void>();

  gridTypes: any = [];
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
  isLiveDragActive = false;
  activeDropSlotIndex: number | null = null;

  ngOnInit(): void {
    this.gridTypes = gridTypes;
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
        this.maximizedCamera = null;
      });

    this.storage_service.camData$
      .pipe(delay(0), takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.camList = res ?? [];
        this.appendCamerasToLive(this.camList);
        this.maximizedCamera = null;
        this.refreshLiveList(this.currentPage);
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

  get visibleSlots(): Array<{ camera: any | null; slotIndex: number }> {
    if (this.maximizedCamera) {
      return [{ camera: this.maximizedCamera, slotIndex: 0 }];
    }

    const pageStart = (this.currentPage - 1) * this.itemsPerPage;

    return Array.from({ length: this.itemsPerPage }, (_, index) => ({
      camera: this.paginatedList[index] ?? null,
      slotIndex: pageStart + index,
    }));
  }

  trackLiveSlot(index: number, slot: { camera: any | null; slotIndex: number }): string {
    return slot.camera?.cameraId ?? `empty-${slot.slotIndex}`;
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
    this.isLiveDragActive = false;
    this.activeDropSlotIndex = null;

    if (this.maximizedCamera) {
      return;
    }

    if (event.previousContainer !== event.container) {
      this.addDroppedItemToLive(
        event.item.data,
        this.getDropSlotIndex(event),
      );
      return;
    }

    const previousSlotIndex = event.item.data?.slotIndex;
    const currentSlotIndex = this.getDropSlotIndex(event);

    if (previousSlotIndex === currentSlotIndex) {
      return;
    }

    this.moveCameraSlot(previousSlotIndex, currentSlotIndex);
  }

  onGridDragStarted(): void {
    this.isLiveDragActive = true;
  }

  onGridDragMoved(event: CdkDragMove<any>): void {
    this.activeDropSlotIndex = this.getDropSlotIndexFromPoint(
      event.pointerPosition,
    );
  }

  onGridDragEnded(): void {
    this.isLiveDragActive = false;
    this.activeDropSlotIndex = null;
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

    let insertIndex = this.getLiveInsertIndex(dropIndex);

    for (const camera of uniqueCameras) {
      if (this.tempCamList[insertIndex]?.cameraId) {
        this.tempCamList.splice(insertIndex, 0, camera);
      } else {
        this.ensureSlotExists(insertIndex);
        this.tempCamList[insertIndex] = camera;
      }

      insertIndex += 1;
    }

    this.trimTrailingEmptySlots();
    this.refreshLiveList(this.currentPage);
  }

  private appendCamerasToLive(cameras: any[]): void {
    const uniqueCameras = cameras.filter(
      (camera: any) =>
        camera?.cameraId &&
        !this.tempCamList.some(
          (item: any) => item?.cameraId === camera.cameraId,
        ),
    );

    if (!uniqueCameras.length) {
      return;
    }

    forkJoin(uniqueCameras.map((camera) => this.resolveCameraForLive(camera)))
      .pipe(take(1))
      .subscribe((resolvedCameras) => {
        const playableCameras = resolvedCameras.filter(
          (camera: any) => camera?.cameraId,
        );

        if (!playableCameras.length) {
          return;
        }

        this.tempCamList.push(...playableCameras);
        this.trimTrailingEmptySlots();
        this.refreshLiveList(this.currentPage);
      });
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

    this.resolveCameraForLive(camera)
      .pipe(take(1))
      .subscribe((resolvedCamera) => {
        if (!resolvedCamera?.cameraId) {
          this.alert_service.error('Failed to load camera stream');
          return;
        }

        if (this.tempCamList[insertIndex]?.cameraId) {
          this.tempCamList.splice(insertIndex, 0, resolvedCamera);
        } else {
          this.ensureSlotExists(insertIndex);
          this.tempCamList[insertIndex] = resolvedCamera;
        }

        this.trimTrailingEmptySlots();
        this.refreshLiveList(this.currentPage);
      });
  }

  private resolveCameraForLive(camera: any) {
    if (!camera?.cameraId) {
      return of(null);
    }

    const cameraWithUrl = this.withPlayableUrl(camera);

    if (cameraWithUrl.httpUrl || !cameraWithUrl.siteId) {
      return of(cameraWithUrl);
    }

    return this.configSrvc.getCamerasForSiteId({ siteId: cameraWithUrl.siteId }).pipe(
      take(1),
      map((res: any) => {
        const siteCamera = this.normalizeCameraList(res).find(
          (item: any) => String(item?.cameraId) === String(cameraWithUrl.cameraId),
        );

        return this.withPlayableUrl({
          ...(siteCamera || {}),
          ...cameraWithUrl,
          httpUrl: cameraWithUrl.httpUrl || siteCamera?.httpUrl,
          audioUrl: cameraWithUrl.audioUrl || siteCamera?.audioUrl,
          name: cameraWithUrl.name || siteCamera?.name || siteCamera?.cameraName,
        });
      }),
      catchError(() => of(cameraWithUrl)),
    );
  }

  private withPlayableUrl(camera: any): any {
    if (!camera) {
      return camera;
    }

    return {
      ...camera,
      httpUrl:
        camera.httpUrl ||
        camera.httpURL ||
        camera.hlsTunnel ||
        camera.hlsUrl ||
        camera.liveUrl ||
        camera.rtspUrl,
    };
  }

  private getLiveInsertIndex(dropIndex: number): number {
    const pageStart = (this.currentPage - 1) * this.itemsPerPage;
    const pageDropIndex = Math.min(
      Math.max(dropIndex, 0),
      this.itemsPerPage - 1,
    );

    return pageStart + pageDropIndex;
  }

  private getDropSlotIndex(event: CdkDragDrop<any[]>): number {
    return this.getDropSlotIndexFromPoint(event.dropPoint, event.currentIndex);
  }

  private getDropSlotIndexFromPoint(
    point: { x: number; y: number } | null | undefined,
    fallbackIndex = 0,
  ): number {
    if (!this.gridContainer || this.maximizedCamera) {
      return 0;
    }

    const selectedGrid =
      this.gridTypes.find((item: any) => item.noOfItems === this.itemsPerPage) ??
      null;
    const columns = selectedGrid?.columns ?? Math.ceil(Math.sqrt(this.itemsPerPage));
    const rows =
      selectedGrid?.rows ?? Math.ceil(this.itemsPerPage / Math.max(columns, 1));
    const rect = (this.gridContainer.nativeElement as HTMLElement).getBoundingClientRect();

    if (!point || !rect.width || !rect.height) {
      return Math.min(Math.max(fallbackIndex, 0), this.itemsPerPage - 1);
    }

    const x = Math.min(Math.max(point.x - rect.left, 0), rect.width - 1);
    const y = Math.min(Math.max(point.y - rect.top, 0), rect.height - 1);
    const column = Math.min(Math.floor(x / (rect.width / columns)), columns - 1);
    const row = Math.min(Math.floor(y / (rect.height / rows)), rows - 1);

    return Math.min(row * columns + column, this.itemsPerPage - 1);
  }

  private moveCameraSlot(previousSlotIndex: number, currentSlotIndex: number): void {
    if (
      previousSlotIndex === undefined ||
      previousSlotIndex < 0 ||
      currentSlotIndex < 0
    ) {
      return;
    }

    this.ensureSlotExists(Math.max(previousSlotIndex, currentSlotIndex));
    const camera = this.tempCamList[previousSlotIndex];
    if (!camera?.cameraId) {
      return;
    }

    if (this.tempCamList[currentSlotIndex]?.cameraId) {
      this.tempCamList.splice(previousSlotIndex, 1);
      this.tempCamList.splice(currentSlotIndex, 0, camera);
    } else {
      this.tempCamList[previousSlotIndex] = null;
      this.tempCamList[currentSlotIndex] = camera;
    }

    this.trimTrailingEmptySlots();
    this.refreshLiveList(this.currentPage);
  }

  private ensureSlotExists(slotIndex: number): void {
    while (this.tempCamList.length <= slotIndex) {
      this.tempCamList.push(null);
    }
  }

  private trimTrailingEmptySlots(): void {
    while (
      this.tempCamList.length &&
      !this.tempCamList[this.tempCamList.length - 1]?.cameraId
    ) {
      this.tempCamList.pop();
    }
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
      this.tempCamList
        .filter((camera: any) => camera?.cameraId)
        .map((camera: any) => camera.cameraId),
    );
  }

  onDotPlaced(payload: any) {
    const camera = {
      ...(payload?.camera ?? {}),
      cameraId: payload?.cameraId,
      name: payload?.cameraName,
      color: 'green',
      id: payload?.markerId,
      time: this.getTimeWithTimezone(payload?.camera?.timezone),
      eventTag: 'LIVE-VMS',
      eventType: 'Manual_Wall',
    };

    if (!payload?.screenshotFile) {
      this.alert_service.error('Screenshot capture failed');
      return;
    }

    this.postScreenshot(camera, payload.screenshotFile).subscribe({
      next: async (res: any) => {
        if (res?.statusCode !== 200) {
          this.alert_service.error(res?.message || 'Screenshot upload failed');
          return;
        }

        await this.playSirenAndWriteDispatch(camera);
        payload.removeDot?.();
      },
      error: () => this.alert_service.error('Event generated failed!')
    });
  }

  private postScreenshot(camera: any, file: File) {
    const formData = new FormData();
    formData.append('screenshot', file);
    formData.append('color', camera?.color);
    formData.append('id', camera?.id);
    formData.append('cameraId', camera?.cameraId);
    formData.append('timeStamp', camera?.time);

    return this.http.post(`${environment.incidentsUrl}/screenshots_1_0`, formData);
  }

  private async playSirenAndWriteDispatch(camera: any): Promise<void> {
    const user = this.storage_service.getData('user');
    const disabledHours = this.parseAudioHours(camera?.audioHours);
    const disabledDays = this.parseAudioDays(camera?.audioDays);
    const currentHour = this.getHour(camera?.timezone);
    const currentDay = this.getDay(camera?.timezone);
    const shouldPlaySiren =
      !!camera?.audioUrl &&
      !disabledDays.includes(currentDay) &&
      !disabledHours.includes(currentHour);
    let audioData: any;

    if (shouldPlaySiren) {
      audioData = await firstValueFrom(
        this.http.get(`${environment.sitesUrl}/play_1_0/${camera.cameraId}`),
      );
    }

    const actionsTaken = [
      {
        name: 'Deterrent',
        selected: !!camera?.audioUrl,
        status: shouldPlaySiren && audioData?.statusCode === 200,
        time: shouldPlaySiren ? this.getTimeWithTimezone(camera?.timezone) : null,
      },
    ];

    const alarm = !camera?.audioUrl
      ? 'N'
      : shouldPlaySiren
        ? audioData?.statusCode === 200
          ? 'P'
          : 'R'
        : 'F';

    this.alert_service.success(
      !camera?.audioUrl
        ? 'No Deterant Available'
        : shouldPlaySiren
          ? audioData?.statusCode === 200
            ? 'Activated On-site Deterant'
            : 'Deterant Activated No Response'
          : 'Remote Deterant Disabled As Per Your Request',
    );

    this.write2Dispatch({
      ...camera,
      actionTag: 'suspicious',
      userLevelAlarmInfo: [
        {
          level: 1,
          user: user?.UserId || user?.userId,
          actionTag: 2,
          subActionTag: 23,
          activityDetTime: shouldPlaySiren ? camera?.time : '',
          alarm,
          landingTime: camera?.time,
          reviewStart: camera?.time,
          reviewEnd: camera?.time,
          notes: '',
          userName: user?.UserName || user?.userName,
          actionsTakenInfo: actionsTaken,
        },
      ],
    });
  }

  private write2Dispatch(camera: any): void {
    const params = new HttpParams()
      .set('cameraId', camera?.cameraId)
      .set('level', 1)
      .set('callingSystemDetail', 'vms');

    this.http
      .get(`${environment.eventDataUrl}/getEventFlowForCamera_1_0`, { params })
      .pipe(
        map((res: any) => res?.data?.queueName ?? res?.data?.queue_name ?? ''),
        switchMap((queueName: string) =>
          this.http.post(
            `${environment.queueManagementUrl}/writeVms_To_Console_1_0`,
            this.buildDispatchPayload({ ...camera, queue_name: queueName }),
          ),
        ),
        take(1),
      )
      .subscribe({
        next: () => this.alert_service.success('Event generated successfully!'),
        error: () => this.alert_service.error('Failed to generate event!'),
      });
  }

  private buildDispatchPayload(payload: any): any {
    const user = this.storage_service.getData('user');

    return {
      cameraId: payload?.cameraId,
      color: payload?.color,
      id: payload?.id,
      timestamp: payload?.time,
      eventType: payload?.eventType ?? 'Manual_Wall',
      queue_name: payload?.queue_name,
      timezone: payload?.timezone,
      httpUrl: payload?.httpUrl,
      siteId: payload?.siteId,
      siteName: payload?.siteName,
      userName: user?.UserName || user?.userName,
      actionTag: payload?.actionTag ?? '',
      nativeApp: payload?.nativeApp,
      actionTime: this.getTimeWithTimezone(payload?.timezone),
      eventTag: payload?.eventTag ?? '',
      userLevelAlarmInfo: payload?.userLevelAlarmInfo,
      userLevels: 0,
    };
  }

  private parseAudioHours(audioHours: any): number[] {
    if (Array.isArray(audioHours)) {
      return audioHours.map((hour) => Number(hour));
    }

    try {
      return JSON.parse(audioHours || '[]').map((hour: any) => Number(hour));
    } catch {
      return [];
    }
  }

  private parseAudioDays(audioDays: any): string[] {
    if (Array.isArray(audioDays)) {
      return audioDays.map((day) => String(day).toLowerCase());
    }

    try {
      return JSON.parse(audioDays || '[]').map((day: any) =>
        String(day).toLowerCase(),
      );
    } catch {
      return [];
    }
  }

  private getHour(timezone?: string): number {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: '2-digit',
      hour12: false,
      hourCycle: 'h23',
    });

    const hour = Number(formatter.format(new Date()));
    return hour === 24 ? 0 : hour;
  }

  private getDay(timezone?: string): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekday: 'long',
    })
      .format(new Date())
      .toLowerCase();
  }

  private getTimeWithTimezone(timezone?: string): string {
    const date = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .reduce((acc: any, part) => {
        acc[part.type] = part.value;
        return acc;
      }, {});

    const hour = parts.hour === '24' ? '00' : parts.hour;
    return `${parts.year}-${parts.month}-${parts.day} ${hour}:${parts.minute}:${parts.second}`;
  }

  ngOnDestroy(): void {
    this.storage_service.liveCameraIds$.next([]);
    this.destroy$.next();
    this.destroy$.complete();
  }

}
