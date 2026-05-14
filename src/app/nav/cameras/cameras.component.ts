import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from '../../../utilities/services/config.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { PaginationComponent } from '../../../utilities/components/pagination/pagination.component';
import { CreateCameraComponent } from './create-camera/create-camera.component';
import { CameraInfoComponent } from './camera-info/camera-info.component';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';
import { gridOptions } from '../../../grid.config';
import { LinkRenderer, MoreInfoRenderer } from '../devices/devices.component';

@Component({
  selector: 'app-cameras',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent,
    CreateCameraComponent,
    CameraInfoComponent,
    AgGridAngular
  ],
  templateUrl: './cameras.component.html',
  styleUrl: './cameras.component.css'
})
export class CamerasComponent implements OnInit, OnDestroy {
  loading = false;
  showCreateCamera = false;
  showCameraInfo = false;
  cameraInfoViewType: 'details' | 'event' | 'analytics' = 'details';
  selectedCameraData: any = null;

  pageNumber = 1;
  pageSize = 25;
  totalPages = 0;
  searchText = '';

  allCameras: any[] = [];
  filteredCameras: any[] = [];
  paginatedCameras: any[] = [];

  totalCount = 0;
  activeCount = 0;
  inactiveCount = 0;

  selectedSiteId: any = null;
  private destroy$ = new Subject<void>();

  gridOptions!: GridOptions;

  columnDefs: ColDef[] = [
    { headerName: 'CAMERA ID', field: 'cameraId', cellClass: 'muted', width: 120 },
    { headerName: 'CAMERA NAME', field: 'name', cellClass: 'device-name', width: 150 },
    { headerName: 'CAMERA TYPE', valueGetter: (p) => p.data?.ptz === 'T' ? 'PTZ' : 'Bullet', width: 120 },
    { headerName: 'DEVICE ID', field: 'unitId', cellClass: 'muted', width: 120 },
    {
      headerName: 'RTSP URL',
      cellRenderer: LinkRenderer,
      cellRendererParams: { type: 'rtspUrl' },
      width: 100,
      cellClass: 'link-cell',
      cellStyle: { textAlign: 'center', overflow: 'visible' }
    },
    { 
      headerName: 'SERVICES', 
      cellRenderer: (p: any) => this.actionButton('VIEW'), 
      width: 100, 
      cellStyle: { textAlign: 'center' } 
    },
    { 
      headerName: 'EVENT CONFIG', 
      cellRenderer: (p: any) => p.data?.events === 'T' ? this.actionButton('VIEW', 'view-event') : this.addCircleBtn('add-event'), 
      width: 120, 
      cellStyle: { textAlign: 'center' } 
    },
    { 
      headerName: 'ANALYTICS', 
      cellRenderer: (p: any) => p.data?.analytics === 'T' ? this.actionButton('VIEW', 'view-analytic') : this.addCircleBtn('add-analytic'), 
      width: 120, 
      cellStyle: { textAlign: 'center' } 
    },
    {
      headerName: 'STATUS',
      cellRenderer: (p: any) => this.statusText(p.data?.status),
      width: 100,
      cellStyle: { textAlign: 'center' }
    },
    { headerName: 'MORE INFO', cellRenderer: MoreInfoRenderer, width: 120, cellStyle: { textAlign: 'center' } }
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

    this.storageService.currentSite$
      .pipe(takeUntil(this.destroy$))
      .subscribe((site: any) => {
        if (site && site.siteId) {
          this.selectedSiteId = site.siteId;
          this.getCameras();
        } else {
          this.allCameras = [];
          this.applySearch();
        }
      });
  }

  getCameras() {
    if (!this.selectedSiteId) return;
    this.loading = true;
    this.configService.getCamerasForSiteId_1_0(this.selectedSiteId).subscribe({
      next: (res: any) => {
        this.allCameras = res || [];
        this.calculateCounts();
        this.applySearch();
        this.loading = false;
      },
      error: () => {
        this.allCameras = [];
        this.calculateCounts();
        this.applySearch();
        this.loading = false;
      }
    });
  }

  calculateCounts() {
    this.totalCount = this.allCameras.length;
    this.activeCount = this.allCameras.filter(c => c.status === 'Y').length;
    this.inactiveCount = this.totalCount - this.activeCount;
  }

  applySearch() {
    let list = this.allCameras;
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase().trim();
      list = list.filter((c: any) =>
        (c.cameraId || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.unitId || '').toLowerCase().includes(q) ||
        (c.rtspUrl || '').toLowerCase().includes(q)
      );
    }
    this.filteredCameras = list;
    this.totalPages = Math.ceil(this.filteredCameras.length / this.pageSize) || 1;
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.pageNumber - 1) * this.pageSize;
    this.paginatedCameras = this.filteredCameras.slice(start, start + this.pageSize);
  }

  changePageNumber(pn: number) {
    this.pageNumber = pn;
    this.updatePagination();
  }

  changePageSize(ps: number) {
    this.pageSize = ps;
    this.pageNumber = 1;
    this.totalPages = Math.ceil(this.filteredCameras.length / this.pageSize) || 1;
    this.updatePagination();
  }

  openCreateCamera() {
    this.selectedCameraData = null;
    this.showCreateCamera = true;
  }

  closeCreateCamera(refresh: boolean = false) {
    this.showCreateCamera = false;
    this.selectedCameraData = null;
    if (refresh) {
      this.getCameras();
    }
  }

  onCellClicked(event: any): void {
    const target = event.event?.target as HTMLElement;
    if (!target) return;

    if (target.classList.contains('add-event') || target.classList.contains('view-event')) {
      this.selectedCameraData = event.data;
      this.cameraInfoViewType = 'event';
      this.showCameraInfo = true;
    } else if (target.classList.contains('add-analytic') || target.classList.contains('view-analytic')) {
      this.selectedCameraData = event.data;
      this.cameraInfoViewType = 'analytics';
      this.showCameraInfo = true;
    } else if (target.classList.contains('more-info') || event.column.getColId() === 'name') {
      this.selectedCameraData = event.data;
      this.cameraInfoViewType = 'details';
      this.showCameraInfo = true;
    }
  }

  statusText(status: string): string {
    const isActive = status === 'Y';
    const text = isActive ? 'Active' : 'InActive';
    const cssClass = isActive ? 'online' : 'offline';
    return `<span class="status-text ${cssClass}">${text}</span>`;
  }

  actionButton(label: string, customClass: string = ''): string {
    return `<button class="create-btn ${customClass}" style="height:22px; font-size:10px; padding:0 8px;">${label}</button>`;
  }

  addCircleBtn(customClass: string = ''): string {
    return `<span class="add-circle material-symbols-outlined ${customClass}" style="cursor: pointer;">add_circle</span>`;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
