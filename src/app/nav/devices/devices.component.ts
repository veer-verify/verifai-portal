import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ConfigService } from '../../../utilities/services/config.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { AlertService } from '../../../utilities/services/alert.service';
import { CreateDeviceComponent } from './create-device/create-device.component';
import { CreateCameraComponent } from '../cameras/create-camera/create-camera.component';
import { PaginationComponent } from '../../../utilities/components/pagination/pagination.component';
import { DeviceInfoComponent } from './device-info/device-info.component';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';
import { gridOptions } from '../../../grid.config';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreateDeviceComponent,
    CreateCameraComponent,
    PaginationComponent,
    AgGridAngular,
    DeviceInfoComponent
  ],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css'
})
export class DevicesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  sitesList: any[] = [];
  devicesList: any[] = [];
  filteredDevices: any[] = [];
  paginatedDevices: any[] = [];

  selectedSiteId: any = '';
  searchText: string = '';

  loading = false;
  showCreateDevice = false;
  showDeviceInfo = false;
  showCreateCamera = false;
  selectedDeviceForCamera: any = null;
  selectedDeviceData: any = null;
  activePopover: string | null = null;

  pageNumber = 1;
  pageSize = 25;
  totalPages = 0;
  totalCount = 0;
  activeCount = 0;
  inactiveCount = 0;

  gridOptions!: GridOptions;

  columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'unitId', cellClass: 'muted', width: 82 },
    { headerName: 'DEVICE NAME', field: 'unitName', cellClass: 'device-name', width: 175 },
    { headerName: 'TYPE', valueGetter: () => 'Defender', width: 90 },
    { headerName: 'SITE NAME', valueGetter: (p) => p.data?.siteName || p.data?.SiteName || 'Selected Site', width: 150 },
    { headerName: 'CAMERAS', cellRenderer: (params: any) => this.countBadge(params.data?.noOfActiveCameras, params.data?.noOfCameras ?? params.data?.totalCameras), width: 90, cellStyle: { textAlign: 'center' } },
    { headerName: 'WEB/HTTP', cellRenderer: LinkRenderer, cellRendererParams: { type: 'web', field: 'centralBoxUrl' }, width: 92, cellClass: 'link-cell', cellStyle: { textAlign: 'center' } },
    { headerName: 'AUDIO', cellRenderer: LinkRenderer, cellRendererParams: { type: 'audio', field: 'audioUrl' }, width: 92, cellClass: 'link-cell', cellStyle: { textAlign: 'center' } },
    { headerName: 'CONFIG', cellRenderer: LinkRenderer, cellRendererParams: { type: 'config', field: 'configUrl' }, width: 92, cellClass: 'link-cell', cellStyle: { textAlign: 'center' } },
    { headerName: 'LIVE RESTART', cellRenderer: LinkRenderer, cellRendererParams: { type: 'restart', field: 'liveRestartUrl' }, width: 120, cellClass: 'link-cell', cellStyle: { textAlign: 'center' } },
    { headerName: 'REMOTE AGENT EMAIL', valueGetter: (p) => p.data?.remoteAgentEmail || 'name@email.com', width: 165 },
    { headerName: 'STATUS', cellRenderer: (params: any) => this.statusText(params.value), width: 90, cellStyle: { textAlign: 'center' } },
    { headerName: 'MORE INFO', cellRenderer: MoreInfoRenderer, width: 125, cellStyle: { textAlign: 'center' } }
  ];

  constructor(
    private configService: ConfigService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.gridOptions = {
      ...gridOptions,
      rowHeight: 27,
      headerHeight: 29,
      suppressCellFocus: true,
      defaultColDef: {
        ...gridOptions?.defaultColDef,
        editable: false,
        resizable: true,
      },
    };
    this.getSites();

    this.storageService.currentSite$
      .pipe(
        takeUntil(this.destroy$),
        filter((item) => !!item)
      )
      .subscribe((res: any) => {
        this.selectedSiteId = res?.siteId || res?.SiteId || res?.id;
        this.pageNumber = 1;
        this.getDevices();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getSites() {
    this.configService.getSitesListForUserName().subscribe({
      next: (res: any) => {
        this.sitesList =
          res?.sites ||
          res?.siteList ||
          res?.data ||
          [];
      },
      error: (err) => {
        console.error('Sites loading failed:', err);
      }
    });
  }

  // onSiteChange() {
  //   this.pageNumber = 1;
  //   this.getDevices();
  // }

  getDevices() {
    if (!this.selectedSiteId) return;

    this.loading = true;
    this.configService.getCentralBoxes(this.selectedSiteId).subscribe({
      next: (res: any) => {
        this.devicesList = res?.centralBox || [];
        this.applySearch();
        this.loading = false;
      },
      error: (err) => {
        console.error('Devices loading failed:', err);
        this.devicesList = [];
        this.applySearch();
        this.loading = false;
      }
    });
  }

  applySearch() {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      this.filteredDevices = [...this.devicesList];
    } else {
      this.filteredDevices = this.devicesList.filter((device: any) => {
        return (
          String(device?.unitId || '').toLowerCase().includes(search) ||
          String(device?.unitName || '').toLowerCase().includes(search) ||
          String(device?.status || '').toLowerCase().includes(search) ||
          String(device?.centralBoxUrl || '').toLowerCase().includes(search) ||
          String(device?.remarks || '').toLowerCase().includes(search)
        );
      });
    }

    this.calculateCounts();
    this.updatePagination();
  }

  calculateCounts() {
    this.totalCount = this.filteredDevices.length;
    this.activeCount = this.filteredDevices.filter((d: any) => {
      return String(d?.status || '').toLowerCase() === 'installed';
    }).length;
    this.inactiveCount = this.totalCount - this.activeCount;
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredDevices.length / this.pageSize);
    if (this.totalPages === 0) {
      this.pageNumber = 1;
      this.paginatedDevices = [];
      return;
    }

    if (this.pageNumber > this.totalPages) {
      this.pageNumber = this.totalPages;
    }

    const start = (this.pageNumber - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedDevices = this.filteredDevices.slice(start, end);
  }

  changePageNumber(page: number) {
    this.pageNumber = page;
    this.updatePagination();
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.pageNumber = 1;
    this.updatePagination();
  }

  openCreateDevice() {
    this.showCreateDevice = true;
  }

  closeCreateDevice(refresh: boolean = false) {
    this.showCreateDevice = false;
    if (refresh) {
      this.getDevices();
    }
  }

  closeCreateCamera(refresh: boolean = false) {
    this.showCreateCamera = false;
    this.selectedDeviceForCamera = null;
    if (refresh) {
      this.getDevices();
    }
  }

  onCellClicked(event: any): void {
    const target = event.event?.target as HTMLElement;
    if (!target) return;

    if (target.classList.contains('add-circle')) {
      this.selectedDeviceForCamera = event.data;
      this.showCreateCamera = true;
    } else if (target.classList.contains('more-info')) {
      this.selectedDeviceData = event.data;
      this.showDeviceInfo = true;
    }
  }

  countBadge(active: any, total: any): string {
    const act = Number(active || 0);
    const tot = Number(total || 0);
    
    if (tot === 0 && act === 0) return '<span class="add-circle material-symbols-outlined">add_circle</span>';
    
    const text = tot ? `${act}/${tot}` : `${act}`;
    
    let status = 'good';
    if (tot > 0) {
       const ratio = act / tot;
       if (ratio <= 0.35) status = 'danger';
       else if (ratio <= 0.5) status = 'warn';
    } else {
       if (act === 0) status = 'grey';
       else if (act <= 2) status = 'warn';
       else if (act <= 4) status = 'danger';
    }

    return `<span class="count-badge ${status}">${text}</span>`;
  }

  statusText(status: any): string {
    const value = String(status || '').toLowerCase();
    const text = value === 'installed' ? 'Active' : 'InActive';
    const statusClass = value === 'installed' ? 'online' : 'offline';
    return `<span class="status-text ${statusClass}">${text}</span>`;
  }

  @HostListener('document:click')
  closePopover() {
    globalPopoverSubject.next(null);
  }
}

export const globalPopoverSubject = new Subject<string | null>();

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';



@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="link-container" (mouseenter)="onEnter()" (mouseleave)="onLeave()">
      <button class="icon-btn" (click)="copy($event)" [disabled]="!url">
        <span class="material-symbols-outlined">link</span>
      </button>
      <div class="link-popover" *ngIf="isOpen && url" (click)="copy($event)">
        <span class="material-symbols-outlined copy-icon" title="Copy">file_copy</span>
        <span class="url-text">{{ url }}</span>
      </div>
    </div>
  `,
  styles: [`
    .link-container { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    .icon-btn { border: none; outline: none; background: transparent; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; }
    .icon-btn:disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
    .icon-btn span { font-size: 18px; color: #111; transform: rotate(-35deg); }
    .link-popover { position: absolute; top: calc(100% + 5px); left: 50%; transform: translateX(-50%); background: linear-gradient(to bottom, #ffffff, #f7f7f7); border: 1px solid #e1e1e1; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12); border-radius: 6px; padding: 8px 12px; display: flex; align-items: center; gap: 10px; z-index: 9999; width: max-content; max-width: 250px; cursor: pointer; }
    .link-popover::after { content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%); border-width: 0 6px 6px; border-style: solid; border-color: transparent transparent #ffffff transparent; }
    .link-popover::before { content: ''; position: absolute; top: -7px; left: 50%; transform: translateX(-50%); border-width: 0 7px 7px; border-style: solid; border-color: transparent transparent #e1e1e1 transparent; z-index: -1; }
    .copy-icon { color: #ed3237; font-size: 20px; font-variation-settings: 'FILL' 1; }
    .copy-icon:hover { opacity: 0.8; }
    .url-text { font-size: 11px; color: #111; white-space: normal; word-break: break-all; font-weight: 500; line-height: 1.3; text-align: left; }
  `]
})
export class LinkRenderer implements ICellRendererAngularComp {
  url: string = '';
  isOpen = false;

  agInit(params: any): void {
    this.url = params.value || params.data?.[params.type || params.field];
  }

  onEnter() {
    if (this.url) this.isOpen = true;
  }

  onLeave() {
    this.isOpen = false;
  }

  copy(event: Event) {
    event.stopPropagation();
    if (!this.url) return;
    navigator.clipboard.writeText(String(this.url));
  }

  refresh() { return false; }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="actions-cell">
      <span class="material-symbols-outlined more-info" [title]="remarks">info</span>
      <span style="margin-left: 10px;" class="material-symbols-outlined dots">more_vert</span>
    </div>
  `,
  styles: [`
    .actions-cell { display: flex; align-items: center; justify-content: center; height: 100%; }
    .more-info, .dots { color: #8d8d8d; font-size: 18px; cursor: pointer; }
    .more-info:hover, .dots:hover { opacity: 0.8; }
  `]
})
export class MoreInfoRenderer implements ICellRendererAngularComp {
  remarks: string = '';
  agInit(params: ICellRendererParams): void {
    this.remarks = params.data?.remarks || 'No remarks';
  }
  refresh() { return false; }
}
