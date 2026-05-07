import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  StorageService,
  Site,
} from '../../../utilities/services/storage.service';
import { HealthService } from '../../../utilities/services/health.service';
import { PaginationComponent } from '../../../utilities/components/pagination/pagination.component';
import { CamerasHealthComponent } from './cameras-health/cameras-health.component';

type HealthTab =
  | 'Dashboard'
  | 'Devices'
  | "NVR"
  | 'Cameras'
  | 'IOT'
  | 'Sensors'
  | 'POS';

type TimelineRange = 'week' | 'month' | 'year';
type ReportTab = 'online' | 'offline';

interface DashboardCard {
  title: string;
  total: number;
  online: number;
  offline: number;
}

type HealthSegment = {
  color: 'green' | 'red';
  width: string;
  tooltip: string;
  label: 'ONLINE' | 'OFFLINE';
  durationText: string;
};

interface DeviceRow {
  deviceId: string;
  name: string;
  installationDateTime: string;
  currentStatus: 'ONLINE' | 'OFFLINE';
  healthSegments: HealthSegment[];
}

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, CamerasHealthComponent],
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.css'],
})
export class HealthComponent implements OnInit, OnDestroy {
  selectedTab: HealthTab = 'Dashboard';
  selectedSite: Site | null = null;

  constructor(
    public storage_service: StorageService,
    private healthService: HealthService,
  ) { }

  tabs: HealthTab[] = [
    'Dashboard',
    'Devices',
    "NVR",
    'Cameras',
    'IOT',
    'Sensors',
    'POS',
  ];

  pageNo = 1;
  pageSize = 10;
  totalPages = 1;

  selectedStatus: '' | 'offline' | 'online' = '';

  statusMap: Record<string, number> = {
    offline: 1,
    online: 2,
  };

  dashboardCards: DashboardCard[] = [
    { title: 'DEVICES', total: 0, online: 0, offline: 0 },
    { title: "NVR'S", total: 0, online: 0, offline: 0 },
    { title: 'CAMERAS', total: 0, online: 0, offline: 0 },
    { title: 'IOT', total: 0, online: 0, offline: 0 },
    { title: 'SENSORS', total: 0, online: 0, offline: 0 },
    { title: 'POS', total: 0, online: 0, offline: 0 },
  ];

  devicesList: DeviceRow[] = [];

  selectedDeviceId = '';
  selectedDeviceInfo: any = null;
  loadingDeviceInfo = false;

  timelineRange: TimelineRange = 'week';
  timelineOffset = 0;
  reportTab: ReportTab = 'online';

  _sideNav!: Observable<any>;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.storage_service.currentSite$
      .pipe(takeUntil(this.destroy$))
      .subscribe((site: Site | null) => {
        this.selectedSite = site;

        this.resetDeviceSelection();

        if (this.selectedTab === 'Devices' && this.selectedSite?.siteId) {
          this.pageNo = 1;
          this.getDevices();
        }
      });
  }

  selectTab(tab: HealthTab): void {
    this.selectedTab = tab;

    if (tab === 'Devices') {
      this.pageNo = 1;
      this.resetDeviceSelection();
      this.getDevices();
    }
  }

  changeStatus(status: '' | 'online' | 'offline'): void {
    this.selectedStatus = status;
    this.pageNo = 1;
    this.resetDeviceSelection();
    this.getDevices();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageNo = 1;
    this.resetDeviceSelection();
    this.getDevices();
  }

  onPageNumberChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.pageNo = page;
    this.resetDeviceSelection();
    this.getDevices();
  }

  resetDeviceSelection(): void {
    this.selectedDeviceId = '';
    this.selectedDeviceInfo = null;
    this.loadingDeviceInfo = false;
    this.timelineRange = 'week';
    this.timelineOffset = 0;
    this.reportTab = 'online';
  }

  getDevices(): void {
    if (!this.selectedSite?.siteId) {
      this.devicesList = [];
      this.totalPages = 1;
      this.resetDeviceSelection();
      this.updateDevicesDashboardCard();
      return;
    }

    const userData = this.storage_service.getData('user');

    const userName =
      userData?.UserName || userData?.userName || userData?.user_name || '';

    const payload: any = {
      user_name: userName,
      site_id: this.selectedSite.siteId,
      pageno: this.pageNo,
      pagesize: this.pageSize,
    };

    if (this.selectedStatus) {
      payload.status = this.statusMap[this.selectedStatus];
    }

    this.healthService
      .getDevices(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res?.statusCode === 200 && Array.isArray(res?.data)) {
            this.devicesList = this.mapDevices(res.data);
            this.totalPages = Number(res?.totalPages || res?.pages || 1);
          } else {
            this.devicesList = [];
            this.totalPages = 1;
          }

          this.updateDevicesDashboardCard();

          this.resetDeviceSelection();
        },
        error: (err) => {
          console.error('get devices error => ', err);
          this.devicesList = [];
          this.totalPages = 1;
          this.resetDeviceSelection();
          this.updateDevicesDashboardCard();
        },
      });
  }

  mapDevices(data: any[]): DeviceRow[] {
    const result: DeviceRow[] = [];

    data.forEach((site: any) => {
      if (Array.isArray(site?.devicesData)) {
        site.devicesData.forEach((device: any) => {
          const currentStatus =
            String(device?.currentStatus || '').toLowerCase() === 'online'
              ? 'ONLINE'
              : 'OFFLINE';

          result.push({
            deviceId: device?.deviceId || '-',
            name: device?.deviceName || '-',
            installationDateTime: this.formatDate(device?.installationDate),
            currentStatus,
            healthSegments: this.generateHealthSegments(device),
          });
        });
      }
    });

    return result;
  }

  generateHealthSegments(device: any): HealthSegment[] {
    const offlineRecords = Array.isArray(device?.offlineDataRecord)
      ? [...device.offlineDataRecord]
      : [];

    const installationDate = this.parseDate(device?.installationDate);
    const installationTime = installationDate?.getTime() || NaN;
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    if (isNaN(installationTime) || installationTime >= now) {
      return [
        {
          color: 'green',
          width: '100%',
          tooltip: '-',
          label: 'ONLINE',
          durationText: '-',
        },
      ];
    }

    const windowStart = Math.max(installationTime, oneWeekAgo);
    const totalDuration = now - windowStart;

    if (totalDuration <= 0) {
      return [
        {
          color: 'green',
          width: '100%',
          tooltip: '-',
          label: 'ONLINE',
          durationText: '-',
        },
      ];
    }

    const parsedOffline = offlineRecords
      .map((item: any) => {
        const startDate = this.parseDate(item.startTime || item.offline_time);
        const endDate = this.parseDate(item.endTime || item.online_time);

        return {
          start: startDate?.getTime() || NaN,
          end: endDate?.getTime() || now,
        };
      })
      .filter((item: any) => !isNaN(item.start) && item.end > item.start)
      .sort((a: any, b: any) => a.start - b.start);

    const segments: HealthSegment[] = [];
    let cursor = windowStart;

    parsedOffline.forEach((offline: any) => {
      const start = Math.max(offline.start, windowStart);
      const end = Math.min(offline.end, now);

      if (end <= start) return;

      if (start > cursor) {
        const onlineDuration = start - cursor;

        segments.push({
          color: 'green',
          width: `${(onlineDuration / totalDuration) * 100}%`,
          tooltip: `ONLINE\n${this.formatDateTimeFromMs(
            cursor,
          )} → ${this.formatDateTimeFromMs(start)}\n${this.formatDuration(
            onlineDuration,
          )}`,
          label: 'ONLINE',
          durationText: this.formatDuration(onlineDuration),
        });
      }

      const offlineDuration = end - start;

      segments.push({
        color: 'red',
        width: `${(offlineDuration / totalDuration) * 100}%`,
        tooltip: `OFFLINE\n${this.formatDateTimeFromMs(
          start,
        )} → ${this.formatDateTimeFromMs(end)}\n${this.formatDuration(
          offlineDuration,
        )}`,
        label: 'OFFLINE',
        durationText: this.formatDuration(offlineDuration),
      });

      cursor = end;
    });

    if (cursor < now) {
      const onlineDuration = now - cursor;

      segments.push({
        color: 'green',
        width: `${(onlineDuration / totalDuration) * 100}%`,
        tooltip: `ONLINE\n${this.formatDateTimeFromMs(
          cursor,
        )} → ${this.formatDateTimeFromMs(now)}\n${this.formatDuration(
          onlineDuration,
        )}`,
        label: 'ONLINE',
        durationText: this.formatDuration(onlineDuration),
      });
    }

    if (!segments.length) {
      return [
        {
          color: 'green',
          width: '100%',
          tooltip: `ONLINE\n${this.formatDateTimeFromMs(
            windowStart,
          )} â†’ ${this.formatDateTimeFromMs(now)}\n${this.formatDuration(
            totalDuration,
          )}`,
          label: 'ONLINE',
          durationText: this.formatDuration(totalDuration),
        },
      ];
    }

    return segments.map((segment) => {
      const widthValue = parseFloat(segment.width);

      return {
        ...segment,
        width: `${Math.max(widthValue, 0.8)}%`,
      };
    });
  }

  openDeviceInfo(deviceId: string): void {
    if (!deviceId || deviceId === '-') return;

    this.selectedDeviceId = deviceId;
    this.selectedDeviceInfo = null;
    this.loadingDeviceInfo = true;
    this.timelineRange = 'week';
    this.timelineOffset = 0;
    this.reportTab = 'online';

    this.healthService
      .getDeviceInfo(deviceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loadingDeviceInfo = false;

          if (res?.statusCode === 200) {
            this.selectedDeviceInfo = res.data;
          } else {
            this.selectedDeviceInfo = null;
          }
        },
        error: (err) => {
          console.error('device info error => ', err);
          this.loadingDeviceInfo = false;
          this.selectedDeviceInfo = null;
        },
      });
  }

  setTimelineRange(range: TimelineRange): void {
    this.timelineRange = range;
    this.timelineOffset = 0;
  }

  get canGoPreviousTimeline(): boolean {
    if (this.timelineRange === 'week' && this.timelineOffset >= 2) return false;
    if (this.timelineRange === 'month' && this.timelineOffset >= 2) return false;
    if (this.timelineRange === 'year') return false;

    const installationDate = this.parseDate(
      this.selectedDeviceInfo?.device_info?.installation_date,
    );
    const installTime = installationDate?.getTime() || 0;

    if (installTime > 0) {
      const period = this.getTimelinePeriod();
      if (period.start.getTime() <= installTime) {
        return false;
      }
    }

    return true;
  }

  get canGoNextTimeline(): boolean {
    return this.timelineOffset > 0;
  }

  goPreviousTimeline(): void {
    if (this.canGoPreviousTimeline) {
      this.timelineOffset++;
    }
  }

  goNextTimeline(): void {
    if (this.canGoNextTimeline) {
      this.timelineOffset--;
    }
  }

  get timelinePeriodLabel(): string {
    const period = this.getTimelinePeriod();

    if (this.timelineRange === 'year') {
      return `${period.start.getFullYear()}`;
    }

    return `${this.formatOnlyDate(period.start)} - ${this.formatOnlyDate(
      this.addDays(period.end, -1),
    )}`;
  }

  get timelineBars(): any[] {
    if (!this.selectedDeviceInfo) return [];

    const period = this.getTimelinePeriod();
    const bars: any[] = [];

    if (this.timelineRange === 'week') {
      for (let i = 0; i < 7; i++) {
        const start = this.startOfDay(this.addDays(period.start, i));
        const end = this.addDays(start, 1);
        bars.push(this.buildTimeRangeBar(start, end, this.getDayLabel(start), String(start.getDate())));
      }
    }

    if (this.timelineRange === 'month') {
      const days = new Date(
        period.start.getFullYear(),
        period.start.getMonth() + 1,
        0,
      ).getDate();

      for (let i = 1; i <= days; i++) {
        const start = new Date(
          period.start.getFullYear(),
          period.start.getMonth(),
          i,
        );
        const end = this.addDays(start, 1);
        bars.push(this.buildTimeRangeBar(start, end, String(i)));
      }
    }

    if (this.timelineRange === 'year') {
      for (let i = 0; i < 12; i++) {
        const start = new Date(period.start.getFullYear(), i, 1);
        const end = new Date(period.start.getFullYear(), i + 1, 1);
        bars.push(
          this.buildTimeRangeBar(start, end, this.getMonthLabel(start)),
        );
      }
    }

    return bars;
  }


  buildTimeRangeBar(start: Date, end: Date, label: string, subLabel?: string): any {
    const installationDate = this.parseDate(
      this.selectedDeviceInfo?.device_info?.installation_date,
    );

    const installTime = installationDate?.getTime() || 0;
    const now = Date.now();

    const bucketStart = start.getTime();
    const bucketEnd = end.getTime();
    const totalMs = bucketEnd - bucketStart;

    const offlineRanges = this.normalizeOfflineRanges(
      this.getOfflineRanges(start, end),
    );

    const points: any[] = [];

    // Before installation = grey
    if (installTime > bucketStart) {
      points.push({
        status: 'not_installed',
        start: bucketStart,
        end: Math.min(installTime, bucketEnd),
      });
    }

    // Future time = grey
    if (now < bucketEnd) {
      points.push({
        status: 'not_installed',
        start: Math.max(now, bucketStart),
        end: bucketEnd,
      });
    }

    // Offline ranges = red
    offlineRanges.forEach((r) => {
      points.push({
        status: 'offline',
        start: r.start,
        end: r.end,
      });
    });

    points.sort((a, b) => a.start - b.start);

    const segments: any[] = [];
    let cursor = bucketStart;

    points.forEach((p) => {
      const pointStart = Math.max(p.start, bucketStart);
      const pointEnd = Math.min(p.end, bucketEnd);

      if (pointEnd <= pointStart) return;

      if (pointStart > cursor) {
        segments.push({
          status: cursor < installTime || cursor >= now ? 'not_installed' : 'online',
          start: cursor,
          end: pointStart,
        });
      }

      segments.push({
        status: p.status,
        start: pointStart,
        end: pointEnd,
      });

      cursor = Math.max(cursor, pointEnd);
    });

    if (cursor < bucketEnd) {
      segments.push({
        status: cursor < installTime || cursor >= now ? 'not_installed' : 'online',
        start: cursor,
        end: bucketEnd,
      });
    }

    const onlineMs = segments
      .filter((s) => s.status === 'online')
      .reduce((sum, s) => sum + (s.end - s.start), 0);

    const offlineMs = segments
      .filter((s) => s.status === 'offline')
      .reduce((sum, s) => sum + (s.end - s.start), 0);

    const notInstalledMs = segments
      .filter((s) => s.status === 'not_installed')
      .reduce((sum, s) => sum + (s.end - s.start), 0);

    return {
      label,
      subLabel,
      segments: segments.map((s) => {
        const topPct = ((bucketEnd - s.end) / totalMs) * 100;
        const heightPct = ((s.end - s.start) / totalMs) * 100;

        return {
          ...s,
          topPct,
          heightPct,
          tooltip: this.getSegmentTooltip(s, label, subLabel)
        };
      }),
      tooltip:
        `${label}` +
        `\nOnline Time: ${this.formatDuration(onlineMs)}` +
        `\nOffline Time: ${this.formatDuration(offlineMs)}` +
        (notInstalledMs > 0
          ? `\nNot Installed: ${this.formatDuration(notInstalledMs)}`
          : '') +
        this.getOfflineRangeTooltip(offlineRanges),
    };
  }

  getSegmentTooltip(segment: any, label: string, subLabel?: string): string {
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
    const logs = Array.isArray(this.selectedDeviceInfo?.offline_logs)
      ? this.selectedDeviceInfo.offline_logs
      : [];

    const ranges: any[] = [];

    logs.forEach((log: any) => {
      const start = this.parseDate(
        log.offline_time || log.startTime || log.start_time,
      );

      const end =
        this.parseDate(log.online_time || log.endTime || log.end_time) ||
        new Date();

      if (!start || !end) return;

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
      return `\nOffline: ${this.formatOnlyTime(r.start)} - ${this.formatOnlyTime(
        r.end,
      )}`;
    });

    return lines.join('');
  }

  getTimelinePeriod(): { start: Date; end: Date } {
    const now = new Date();

    if (this.timelineRange === 'week') {
      const current = this.addDays(now, -(this.timelineOffset * 7));
      const day = current.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const start = this.startOfDay(this.addDays(current, diff));
      const end = this.addDays(start, 7);

      return { start, end };
    }

    if (this.timelineRange === 'month') {
      const current = new Date(
        now.getFullYear(),
        now.getMonth() - this.timelineOffset,
        1,
      );

      return {
        start: new Date(current.getFullYear(), current.getMonth(), 1),
        end: new Date(current.getFullYear(), current.getMonth() + 1, 1),
      };
    }

    const year = now.getFullYear() - this.timelineOffset;

    return {
      start: new Date(year, 0, 1),
      end: new Date(year + 1, 0, 1),
    };
  }

  get reportEntries(): { key: string; value: any }[] {
    const report =
      this.reportTab === 'online'
        ? this.selectedDeviceInfo?.online_report
        : this.selectedDeviceInfo?.offline_report;

    if (!report || typeof report !== 'object') return [];

    return Object.entries(report).map(([key, value]) => ({
      key,
      value,
    }));
  }

  updateDevicesDashboardCard(): void {
    const total = this.devicesList.length;

    const online = this.devicesList.filter(
      (item) => item.currentStatus === 'ONLINE',
    ).length;

    const offline = this.devicesList.filter(
      (item) => item.currentStatus === 'OFFLINE',
    ).length;

    this.dashboardCards = this.dashboardCards.map((card) => {
      if (card.title === 'DEVICES') {
        return {
          ...card,
          total,
          online,
          offline,
        };
      }

      return card;
    });
  }

  parseDate(value: any): Date | null {
    if (!value) return null;

    const safeValue = String(value)
      .trim()
      .replace(' ', 'T')
      .replace(/(\.\d{3})\d+/, '$1');

    const date = new Date(safeValue);

    return isNaN(date.getTime()) ? null : date;
  }

  startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  formatOnlyDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getDayLabel(date: Date): string {
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  }

  getMonthLabel(date: Date): string {
    return date.toLocaleDateString('en-IN', { month: 'short' });
  }

  formatOnlyTime(value: any): string {
    const date =
      typeof value === 'number' ? new Date(value) : this.parseDate(value);

    if (!date || isNaN(date.getTime())) return '-';

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  formatInfoDate(value: any): string {
    const date = this.parseDate(value);
    return date ? date.toLocaleString('en-IN') : '-';
  }

  formatDateTimeFromMs(value: number): string {
    const date = new Date(value);
    return isNaN(date.getTime()) ? '-' : date.toLocaleString('en-IN');
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

  formatDuration(durationMs: number): string {
    if (!durationMs || durationMs < 0) return '0m';

    const totalSeconds = Math.floor(durationMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts: string[] = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(' ');
  }

  shortDuration(value: any): string {
    if (!value) return '-';

    return String(value)
      .replace(/days/g, 'd')
      .replace(/day/g, 'd')
      .replace(/hours/g, 'h')
      .replace(/hour/g, 'h')
      .replace(/minutes/g, 'm')
      .replace(/minute/g, 'm')
      .replace(/seconds/g, 's')
      .replace(/second/g, 's');
  }

  formatDate(date: string): string {
    if (!date) return '-';

    const parsedDate = this.parseDate(date);
    return parsedDate ? parsedDate.toLocaleString('en-IN') : date;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
