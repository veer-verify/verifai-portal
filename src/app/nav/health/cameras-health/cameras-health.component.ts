import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StorageService, Site } from '../../../../utilities/services/storage.service';
import { HealthService } from '../../../../utilities/services/health.service';
import { PaginationComponent } from '../../../../utilities/components/pagination/pagination.component';

type CameraFilter = 'all' | 'online' | 'offline';
type CameraRange = 'week' | 'month' | 'year';
type SegmentStatus = 'online' | 'offline' | 'not_installed';

interface OfflineRecord {
  startTime: string;
  endTime: string;
}

interface CameraItem {
  cameraId: string;
  cameraName: string;
  cameraStatus: 'online' | 'offline';
  monitoring: 'T' | 'F';
  host: string;
  port: number;
  remarks: string;
  reason: string;
  offlineDataRecord: OfflineRecord[];
  siteId: number;
  siteName: string;
  deviceId: string;
  deviceName: string;
  cameraHealthStartDate?: string;
}

interface HealthSegment {
  type: SegmentStatus;
  width: number;
}

interface ChartBarSegment {
  status: SegmentStatus;
  leftPct?: number;
  widthPct: number;
  tooltip: string;
}

interface CameraChartBar {
  label: string;
  subLabel: string;
  uptime: number;
  segments: ChartBarSegment[];
  tooltip: string;
  summary: string;
}

@Component({
  selector: 'app-cameras-health',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './cameras-health.component.html',
  styleUrl: './cameras-health.component.css',
})
export class CamerasHealthComponent implements OnInit, OnDestroy {
  readonly now = new Date();

  activeFilter: CameraFilter = 'all';
  searchText = '';
  selectedCamera: CameraItem | null = null;
  selectedRange: CameraRange = 'week';
  rangeOffset = 0;
  
  pageNo = 1;
  pageSize = 10;
  totalPages = 1;
  
  loadingCameras = false;
  loadingDeviceInfo = false;
  camerasList: CameraItem[] = [];
  selectedCameraInfo: any = null;
  loadingCameraInfo = false;
  chartInfoLogs: any[] = [];
  loadingChartData = false;
  selectedSite: Site | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private healthService: HealthService,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.storageService.currentSite$
      .pipe(takeUntil(this.destroy$))
      .subscribe((site: Site | null) => {
        this.selectedSite = site;
        this.getCameras();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

getCameras() {
  if (!this.selectedSite?.siteId) {
    this.loadingCameras = false;
    this.camerasList = [];
    this.selectedCamera = null;
    return;
  }

  this.loadingCameras = true;

  const userData = this.storageService.getData('user');
  const userName =
    userData?.UserName ||
    userData?.userName ||
    userData?.user_name ||
    '';

  const payload: any = {
    user_name: userName,
    site_id: this.selectedSite.siteId,
    pageno: this.pageNo,
    pagesize: this.pageSize,
  };

  if (this.activeFilter !== 'all') {
    payload.status = this.activeFilter === 'online' ? 2 : 1;
  }

  this.healthService
    .getCameras(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.loadingCameras = false;

        if (res?.statusCode === 200 && Array.isArray(res?.data)) {
          this.camerasList = this.mapCameras(res.data);
          this.totalPages = res?.totalPages || res?.page?.totalPages || 1;
        } else {
          this.camerasList = [];
        }

        this.ensureSelectedCamera();
      },
      error: (err) => {
        console.error('getCameras error:', err);
        this.loadingCameras = false;
        this.camerasList = [];
        this.selectedCamera = null;
        this.selectedCameraInfo = null;
        this.chartInfoLogs = [];
      },
    });
}
get cameraEmptyTitle(): string {
  if (!this.selectedSite?.siteId) {
    return 'Select a site to view camera health';
  }

  if (this.searchText.trim()) {
    return 'No cameras found for your search';
  }

  if (this.activeFilter === 'online') {
    return 'No online cameras available';
  }

  if (this.activeFilter === 'offline') {
    return 'No offline cameras available';
  }

  return 'Camera health data is not available';
}

  get cameraEmptyMessage(): string {
    if (!this.selectedSite?.siteId) {
      return 'Please select a site from the left panel to load camera health details.';
    }

    if (this.searchText.trim()) {
      return 'Try changing the search text or clear the filter.';
    }

    return 'No camera health records are available for this site right now.';
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageNo = 1;
    this.getCameras();
  }

  onPageNumberChange(page: number) {
    this.pageNo = page;
    this.getCameras();
  }

  mapCameras(data: any[]): CameraItem[] {
    const list: CameraItem[] = [];
    data.forEach(site => {
      if (Array.isArray(site.devicesData)) {
        site.devicesData.forEach((cam: any) => {
          list.push({
            cameraId: cam.cameraId || '-',
            cameraName: cam.cameraName || '-',
            cameraStatus: String(cam.status || '').toLowerCase() === 'online' ? 'online' : 'offline',
            monitoring: 'T',
            host: '-',
            port: 0,
            remarks: cam.remarks || '-',
            reason: cam.reason || '-',
            offlineDataRecord: (cam.offlineDataRecord || []).map((r: any) => ({
              startTime: r.startTime || r.offline_time,
              endTime: r.endTime || r.online_time
            })),
            siteId: site.siteId || site.site_id || 0,
            siteName: site.siteName || site.site_name || '',
            deviceId: cam.deviceId || '-',
            deviceName: cam.deviceName || '-',
            cameraHealthStartDate: cam.cameraHealthStartDate || cam.camera_health_start_date || undefined
          });
        });
      }
    });
    return list;
  }

  get allCameras(): CameraItem[] {
    return this.camerasList;
  }

  get filteredCameras(): CameraItem[] {
    const query = this.searchText.trim().toLowerCase();

    return this.allCameras.filter((camera) => {
      const matchesFilter =
        this.activeFilter === 'all' || camera.cameraStatus === this.activeFilter;

      const matchesSearch =
        !query ||
        [
          camera.cameraId,
          camera.cameraName,
          camera.siteName,
          camera.deviceName,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }

  get groupedCameras(): { siteName: string; cameras: CameraItem[] }[] {
    return this.filteredCameras.reduce(
      (acc, camera) => {
        const existing = acc.find((item) => item.siteName === camera.siteName);
        if (existing) {
          existing.cameras.push(camera);
        } else {
          acc.push({ siteName: camera.siteName, cameras: [camera] });
        }
        return acc;
      },
      [] as { siteName: string; cameras: CameraItem[] }[],
    );
  }

  get totalCount(): number {
    return this.allCameras.length;
  }

  get onlineCount(): number {
    return this.allCameras.filter((camera) => camera.cameraStatus === 'online').length;
  }

  get offlineCount(): number {
    return this.allCameras.filter((camera) => camera.cameraStatus === 'offline').length;
  }

  get chartPeriodLabel(): string {
    if (this.selectedRange === 'year') {
      const endMonth = this.shiftMonths(this.startOfMonth(this.now), -(this.rangeOffset * 12));
      const startMonth = this.shiftMonths(endMonth, -11);
      return `${this.formatMonthYear(startMonth)} - ${this.formatMonthYear(endMonth)}`;
    }

    const endDate = this.startOfDay(
      this.addDays(this.now, -(this.selectedRange === 'week' ? this.rangeOffset * 7 : this.rangeOffset * 30)),
    );
    const startDate = this.addDays(endDate, this.selectedRange === 'week' ? -6 : -29);
    return `${this.formatDateOnly(startDate)} - ${this.formatDateOnly(endDate)}`;
  }

  get chartBars(): CameraChartBar[] {
    if (!this.selectedCameraInfo) return [];

    if (this.selectedRange === 'year') {
      return this.buildYearBars();
    }

    if (this.selectedRange === 'month') {
      return this.buildDayBars(30, this.rangeOffset * 30);
    }

    return this.buildDayBars(7, this.rangeOffset * 7);
  }

  get timeAxisLabels(): string[] {
    if (this.selectedRange === 'year') {
      return ['01', '05', '10', '15', '20', '25', '31'];
    }

    return ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00'];
  }

  get useFixedTimeGrid(): boolean {
    return this.selectedRange !== 'year';
  }

  get canGoPreviousPeriod(): boolean {
    if (this.selectedRange === 'week' && this.rangeOffset >= 2) return false;
    if (this.selectedRange === 'month' && this.rangeOffset >= 2) return false;
    if (this.selectedRange === 'year') return false;

    const installDateStr = this.selectedCameraInfo?.cam_info?.cameraHealthStartDate
      || this.selectedCameraInfo?.cam_info?.camera_health_start_date
      || this.selectedCamera?.cameraHealthStartDate;

    if (installDateStr) {
      const installDateMs = new Date(String(installDateStr).replace(' ', 'T')).getTime();
      if (!isNaN(installDateMs)) {
        const endDate = this.startOfDay(
          this.addDays(this.now, -(this.selectedRange === 'week' ? this.rangeOffset * 7 : this.rangeOffset * 30))
        );
        const startDate = this.addDays(endDate, this.selectedRange === 'week' ? -6 : -29);

        if (startDate.getTime() <= installDateMs) {
          return false;
        }
      }
    }

    return true;
  }

  get canGoNextPeriod(): boolean {
    return this.rangeOffset > 0;
  }

  setFilter(filter: CameraFilter): void {
    this.activeFilter = filter;
    this.getCameras();
  }

  openDrawer(camera: CameraItem): void {
    if (!camera || camera.cameraId === '-') return;
    this.selectedCamera = camera;
    this.selectedRange = 'week';
    this.rangeOffset = 0;
    this.selectedCameraInfo = null;
    this.chartInfoLogs = [];
    this.loadingDeviceInfo = true;

    const endDate = this.startOfDay(this.addDays(this.now, 1));
    const start = this.addDays(endDate, -30);
    const fromTime = this.formatApiDate(start);
    const toTime = this.formatApiDate(endDate);

    this.healthService.getCameraInfo(this.selectedCamera.cameraId, fromTime, toTime)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loadingDeviceInfo = false;
          if (res?.statusCode === 200 && res?.data) {
            this.selectedCameraInfo = res.data;
            this.chartInfoLogs = res.data.offline_logs || [];
          } else {
            this.selectedCameraInfo = null;
            this.chartInfoLogs = [];
          }
        },
        error: (err) => {
          console.error('fetchCameraInfo error:', err);
          this.loadingDeviceInfo = false;
          this.selectedCameraInfo = null;
          this.chartInfoLogs = [];
        }
      });
  }

  switchRange(range: CameraRange): void {
    this.selectedRange = range;
    this.rangeOffset = 0;
    this.fetchChartData();
  }

  goPreviousPeriod(): void {
    this.rangeOffset++;
    this.fetchChartData();
  }

  goNextPeriod(): void {
    if (this.rangeOffset > 0) {
      this.rangeOffset--;
      this.fetchChartData();
    }
  }

  ensureSelectedCamera(): void {
    if (!this.filteredCameras.length) {
      this.selectedCamera = null;
      return;
    }

    if (
      this.selectedCamera &&
      !this.filteredCameras.some((camera) => camera.cameraId === this.selectedCamera?.cameraId)
    ) {
      this.selectedCamera = null;
      this.selectedCameraInfo = null;
      this.chartInfoLogs = [];
    }
  }

  fetchChartData(): void {
    if (!this.selectedCamera) return;

    let start: Date;
    let end: Date;

    if (this.selectedRange === 'year') {
      const endMonth = this.shiftMonths(this.startOfMonth(this.now), -(this.rangeOffset * 12));
      start = this.shiftMonths(endMonth, -11);
      end = this.shiftMonths(endMonth, 1);
    } else {
      const endDate = this.startOfDay(
        this.addDays(this.now, -(this.selectedRange === 'week' ? this.rangeOffset * 7 : this.rangeOffset * 30))
      );
      end = this.addDays(endDate, 1);
      start = this.addDays(endDate, this.selectedRange === 'week' ? -6 : -29);
    }

    const fromTime = this.formatApiDate(start);
    const toTime = this.formatApiDate(end);

    this.loadingChartData = true;
    this.healthService.getCameraInfo(this.selectedCamera.cameraId, fromTime, toTime)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loadingChartData = false;
          if (res?.statusCode === 200 && res?.data) {
            this.chartInfoLogs = res.data.offline_logs || [];
          } else {
            this.chartInfoLogs = [];
          }
        },
        error: (err) => {
          console.error('fetchChartData error:', err);
          this.loadingChartData = false;
          this.chartInfoLogs = [];
        }
      });
  }

  formatApiDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.000000`;
  }

  dateValue(value: string): number {
    if (!value) return 0;
    return new Date(String(value).replace(' ', 'T')).getTime();
  }

  durationMs(start: string, end: string): number {
    return Math.max(0, this.dateValue(end) - this.dateValue(start));
  }

  formatDuration(ms: number): string {
    const totalMinutes = Math.floor(ms / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  formatDateShort(value: string): string {
    if (!value) return '-';
    return new Date(String(value).replace(' ', 'T')).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  formatDateOnly(value: Date): string {
    return value.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatInfoDate(value: any): string {
    if (!value) return '-';
    const date = new Date(String(value).replace(' ', 'T'));
    return isNaN(date.getTime()) ? '-' : date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  formatMonthYear(value: Date): string {
    return value.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  }

  formatTime(value: number, isRangeEnd: boolean = false): string {
  const date = new Date(value);

  // When a full-day bucket ends at next day 00:00,
  // show it as 23:59 for client readability.
  if (
    isRangeEnd &&
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0
  ) {
    return '23:59';
  }

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

  getTotalOfflineMs(camera: CameraItem): number {
    return camera.offlineDataRecord.reduce(
      (sum, item) => sum + this.durationMs(item.startTime, item.endTime),
      0,
    );
  }

  getUptimePercentage(camera: CameraItem, days = 7): number {
    const end = this.now.getTime();
    const start = end - days * 86400000;
    const total = end - start;

    const offline = camera.offlineDataRecord.reduce((sum, item) => {
      const offlineStart = Math.max(this.dateValue(item.startTime), start);
      const offlineEnd = Math.min(this.dateValue(item.endTime), end);
      return sum + (offlineEnd > offlineStart ? offlineEnd - offlineStart : 0);
    }, 0);

    return Math.max(0, Math.round(((total - offline) / total) * 100));
  }

  buildHealthSegments(camera: CameraItem): HealthSegment[] {
    const start = this.now.getTime() - 7 * 86400000;
    const end = this.now.getTime();
    const total = end - start;
    const ranges = [...camera.offlineDataRecord].sort(
      (a, b) => this.dateValue(a.startTime) - this.dateValue(b.startTime),
    );
    const segments: HealthSegment[] = [];
    let cursor = start;

    ranges.forEach((range) => {
      const offlineStart = Math.max(this.dateValue(range.startTime), start);
      const offlineEnd = Math.min(this.dateValue(range.endTime), end);

      if (offlineEnd <= start || offlineStart >= end) return;

      if (offlineStart > cursor) {
        segments.push({
          type: 'online',
          width: ((offlineStart - cursor) / total) * 100,
        });
      }

      segments.push({
        type: 'offline',
        width: ((offlineEnd - offlineStart) / total) * 100,
      });

      cursor = Math.max(cursor, offlineEnd);
    });

    if (cursor < end) {
      segments.push({
        type: 'online',
        width: ((end - cursor) / total) * 100,
      });
    }

    return segments.filter((segment) => segment.width > 0);
  }

buildDayBars(count: number, offsetDays: number): CameraChartBar[] {
  const endDate = this.startOfDay(this.addDays(this.now, -offsetDays));
  const startDate = this.addDays(endDate, -(count - 1));
  const bars: CameraChartBar[] = [];

  // latest date should come first/top
  for (let i = count - 1; i >= 0; i--) {
    const day = this.addDays(startDate, i);
    const bucketStart = this.startOfDay(day);
    const bucketEnd = this.addDays(bucketStart, 1);

    bars.push(
      this.buildTimeRangeBar(
        bucketStart,
        bucketEnd,
        count === 7
          ? day.toLocaleDateString('en-IN', { weekday: 'short' })
          : String(day.getDate()),
        count === 7
          ? String(day.getDate())
          : ''
      ),
    );
  }

  return bars;
}

  buildYearBars(): CameraChartBar[] {
    const endMonth = this.shiftMonths(this.startOfMonth(this.now), -(this.rangeOffset * 12));
    const startMonth = this.shiftMonths(endMonth, -11);
    const bars: CameraChartBar[] = [];

    for (let i = 0; i < 12; i++) {
      const monthStart = this.shiftMonths(startMonth, i);
      const monthEnd = this.shiftMonths(monthStart, 1);

      bars.push(
        this.buildTimeRangeBar(
          monthStart,
          monthEnd,
          monthStart.toLocaleDateString('en-IN', { month: 'short' }),
          monthStart.toLocaleDateString('en-IN', { year: 'numeric' })
        ),
      );
    }

    return bars;
  }

  buildTimeRangeBar(start: Date, end: Date, label: string, subLabel: string): CameraChartBar {
    const bucketStart = start.getTime();
    const bucketEnd = end.getTime();
    const totalMs = bucketEnd - bucketStart;

    const offlineRanges = this.normalizeOfflineRanges(
      this.getOfflineRanges(start, end),
    );

    const installDateStr = this.selectedCameraInfo?.cam_info?.cameraHealthStartDate
      || this.selectedCameraInfo?.cam_info?.camera_health_start_date
      || this.selectedCamera?.cameraHealthStartDate;

    let installDateMs = 0;
    if (installDateStr) {
      const parsed = new Date(String(installDateStr).replace(' ', 'T')).getTime();
      if (!isNaN(parsed)) {
        installDateMs = parsed;
      }
    }

    const points: any[] = [];
    const now = this.now.getTime();

    offlineRanges.forEach((r) => {
      const pStart = installDateMs ? Math.max(r.start, installDateMs) : r.start;
      const pEnd = Math.min(r.end, now);
      if (pEnd > pStart) {
        points.push({
          status: 'offline',
          start: pStart,
          end: pEnd,
        });
      }
    });

    points.sort((a, b) => a.start - b.start);

    const segments: any[] = [];
    let cursor = bucketStart;

    const fillGap = (gapStart: number, gapEnd: number) => {
      if (gapStart >= gapEnd) return;

      if (installDateMs && gapStart < installDateMs) {
        const notInstalledEnd = Math.min(gapEnd, installDateMs);
        segments.push({ status: 'not_installed', start: gapStart, end: notInstalledEnd });
        if (notInstalledEnd < gapEnd) {
          fillGap(notInstalledEnd, gapEnd);
        }
      } else if (gapStart >= now) {
        segments.push({ status: 'not_installed', start: gapStart, end: gapEnd });
      } else if (gapEnd > now) {
        segments.push({ status: 'online', start: gapStart, end: now });
        segments.push({ status: 'not_installed', start: now, end: gapEnd });
      } else {
        segments.push({ status: 'online', start: gapStart, end: gapEnd });
      }
    };

    points.forEach((p) => {
      const pointStart = Math.max(p.start, bucketStart);
      const pointEnd = Math.min(p.end, bucketEnd);

      if (pointEnd <= pointStart) return;

      if (pointStart > cursor) {
        fillGap(cursor, pointStart);
      }

      segments.push({
        status: p.status,
        start: pointStart,
        end: pointEnd,
      });

      cursor = Math.max(cursor, pointEnd);
    });

    if (cursor < bucketEnd) {
      fillGap(cursor, bucketEnd);
    }

    const onlineMs = segments
      .filter((s) => s.status === 'online')
      .reduce((sum, s) => sum + (s.end - s.start), 0);

    const offlineMs = segments
      .filter((s) => s.status === 'offline')
      .reduce((sum, s) => sum + (s.end - s.start), 0);

    const uptime = totalMs > 0 ? Math.max(0, Math.round(((totalMs - offlineMs) / totalMs) * 100)) : 100;

    const summary = offlineRanges.length
      ? offlineRanges
        .slice(0, 2)
        .map((item) => this.formatOverlap(item.start, item.end, true))
        .join(', ') + (offlineRanges.length > 2 ? ` +${offlineRanges.length - 2} more` : '')
      : 'No offline event';

    return {
      label,
      subLabel,
      uptime,
      segments: segments.map((s) => {
        const leftPct = ((s.start - bucketStart) / totalMs) * 100;
        let widthPct = ((s.end - s.start) / totalMs) * 100;

        if (s.status === 'offline' && widthPct > 0 && widthPct < 0.5) {
          widthPct = 0.5;
        }

        return {
          status: s.status,
          leftPct,
          widthPct,
          tooltip: this.getSegmentTooltip(s, label, subLabel),
        };
      }),
      tooltip:
        `${label} ${subLabel}` +
        `\nUptime: ${uptime}%` +
        `\nOnline Time: ${this.formatDuration(onlineMs)}` +
        `\nOffline Time: ${this.formatDuration(offlineMs)}` +
        this.getOfflineRangeTooltip(offlineRanges),
      summary
    };
  }

 getSegmentTooltip(segment: any, label: string, subLabel: string): string {
  const dateLabel = `${label}${subLabel ? ' ' + subLabel : ''}`;
  const duration = this.formatDuration(segment.end - segment.start);

  const timeRange =
    `${this.formatTime(segment.start)} - ${this.formatTime(segment.end, true)}`;

  if (segment.status === 'offline') {
    return `${dateLabel}\nOffline: ${timeRange}\nDuration: ${duration}`;
  }

  if (segment.status === 'online') {
    return `${dateLabel}\nOnline: ${timeRange}\nDuration: ${duration}`;
  }

  return `${dateLabel}\nNo health data: ${timeRange}`;
}

  normalizeOfflineRanges(ranges: any[]): any[] {
    if (!Array.isArray(ranges) || !ranges.length) return [];

    const sorted = [...ranges]
      .filter((r) => r?.end > r?.start)
      .sort((a, b) => a.start - b.start);

    const merged: any[] = [];

    sorted.forEach((range) => {
      const last = merged[merged.length - 1];

      if (!last || range.start > last.end) {
        merged.push({ ...range });
      } else {
        last.end = Math.max(last.end, range.end);
      }
    });

    return merged;
  }

  getOfflineRanges(bucketStart: Date, bucketEnd: Date): any[] {
    const logs = Array.isArray(this.chartInfoLogs)
      ? this.chartInfoLogs
      : [];

    const ranges: any[] = [];

    logs.forEach((log: any) => {
      const start = new Date(String(log.offline_time || log.startTime || log.start_time).replace(' ', 'T'));
      const end = new Date(String(log.online_time || log.endTime || log.end_time || new Date().toISOString()).replace(' ', 'T'));

      if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) return;

      const overlapStart = Math.max(start.getTime(), bucketStart.getTime());
      const overlapEnd = Math.min(end.getTime(), bucketEnd.getTime());

      if (overlapEnd > overlapStart) {
        ranges.push({
          start: overlapStart,
          end: overlapEnd,
        });
      }
    });

    return ranges;
  }

  getOfflineRangeTooltip(ranges: any[]): string {
    if (!ranges.length) return '';

    const lines = ranges.map((r) => {
      return `\nOffline: ${this.formatTime(r.start)} - ${this.formatTime(r.end)}`;
    });

    return lines.join('');
  }

  formatOverlap(startMs: number, endMs: number, showTime: boolean): string {
    if (showTime) {
      return `${this.formatTime(startMs)} - ${this.formatTime(endMs)}`;
    }

    return `${new Date(startMs).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    })} - ${new Date(endMs).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    })}`;
  }

  addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  shiftMonths(date: Date, months: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
  }

  startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  getGridLineClass(index: number): string {
    const classes = [
      'time-00',
      'time-03',
      'time-06',
      'time-09',
      'time-12',
      'time-15',
      'time-18',
      'time-21',
      'time-24',
    ];

    return classes[index] || '';
  }
}
