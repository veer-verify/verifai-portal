import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
} from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';
import { gridOptions } from '../../../grid.config';
import { PaginationComponent } from '../../../utilities/components/pagination/pagination.component';
import { StorageService } from '../../../utilities/services/storage.service';
import { CreateSiteComponent } from './create-site/create-site.component';
import { CreateDeviceComponent } from '../devices/create-device/create-device.component';

type SiteStatus = 'Online' | 'Offline' | 'Partial' | 'Inprogress';

interface SiteRow {
  id: string;
  site: string;
  client: string;
  vertical: string;
  device: string;
  camera: string;
  inventory: string;
  health: SiteStatus;
  audio: SiteStatus;
  services: number | string;
  status: SiteStatus;
  raw: any;
}

@Component({
  selector: 'app-sites',
  imports: [CommonModule, FormsModule, AgGridAngular, PaginationComponent, CreateSiteComponent, CreateDeviceComponent],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.css'
})
export class SitesComponent implements OnInit, OnDestroy {
  constructor(
    public storage_service: StorageService,
  ) { }

  private destroy$ = new Subject<void>();

  gridApi!: GridApi;
  gridOptions!: GridOptions;
  searchText = '';
  statusFilter = '';
  pageNumber = 1;
  pageSize = 25;
  totalPages = 0;
  allRows: SiteRow[] = [];
  filteredRows: SiteRow[] = [];
  rowData: SiteRow[] = [];
  showCreateSitePanel = false;
  selectedSiteInfo: SiteRow | null = null;
  showCreateDevice = false;
  selectedSiteForDevice: any = null;

  summaryCards = [
    { key: 'total', label: 'Total', count: 0, sub: 0, tone: 'red' },
    { key: 'online', label: 'Online', count: 0, sub: 0, tone: 'red' },
    { key: 'offline', label: 'Offline', count: 0, sub: 0, tone: 'red' },
    { key: 'unsubscribed', label: 'Unsubscribed', count: 0, sub: 0, tone: 'white' },
    { key: 'upcoming', label: 'Upcoming', count: 0, sub: 0, tone: 'white' },
  ];

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', filter: false, minWidth: 90, maxWidth: 105 },
    {
      field: 'site',
      headerName: 'SITE',
      filter: false,
      minWidth: 210,
      flex: 1.4,
      tooltipField: 'site',
    },
    {
      field: 'client',
      headerName: 'CLIENT',
      filter: false,
      minWidth: 130,
      flex: 1,
      tooltipField: 'client',
    },
    {
      field: 'vertical',
      headerName: 'VERTICAL',
      filter: false,
      minWidth: 145,
      flex: 1,
    },
    {
      field: 'device',
      headerName: 'DEVICE',
      filter: false,
      minWidth: 90,
      maxWidth: 100,
      cellRenderer: (params: any) => this.countBadge(params.value),
    },
    {
      field: 'camera',
      headerName: 'CAMERA',
      filter: false,
      minWidth: 95,
      maxWidth: 105,
      cellRenderer: (params: any) => this.countBadge(params.value),
    },
    {
      field: 'inventory',
      headerName: 'INVENTORY',
      filter: false,
      minWidth: 105,
      maxWidth: 115,
      cellRenderer: (params: any) =>
        params.value
          ? `<button type="button" class="inventory-btn">${params.value}</button>`
          : '-',
    },
    {
      field: 'health',
      headerName: 'HEALTH',
      filter: false,
      minWidth: 90,
      maxWidth: 100,
      cellRenderer: (params: any) => this.statusIcon('ecg_heart', params.value),
    },
    {
      field: 'audio',
      headerName: 'AUDIO',
      filter: false,
      minWidth: 85,
      maxWidth: 95,
      cellRenderer: (params: any) => this.statusIcon('notifications_active', params.value),
    },
    {
      field: 'services',
      headerName: 'SERVICES',
      filter: false,
      minWidth: 95,
      maxWidth: 105,
    },
    {
      field: 'status',
      headerName: 'STATUS',
      filter: false,
      minWidth: 100,
      maxWidth: 115,
      cellRenderer: (params: any) =>
        `<span class="status-text ${this.statusClass(params.value)}">${params.value || '-'}</span>`,
    },
    {
      headerName: 'MORE',
      filter: false,
      sortable: false,
      editable: false,
      minWidth: 90,
      maxWidth: 95,
      cellRenderer: () =>
        '<span class="material-symbols-outlined more-info">info</span>',
    },
  ];

  ngOnInit(): void {
    this.gridOptions = {
      ...gridOptions,
      rowHeight: 27,
      headerHeight: 29,
      suppressCellFocus: true,
      defaultColDef: {
        ...gridOptions.defaultColDef,
        editable: false,
        minWidth: 80,
        resizable: true,
      },
      onFirstDataRendered: () => this.fitColumns(),
      onGridSizeChanged: () => this.fitColumns(),
    };

    this.storage_service.siteData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((sites: any[]) => {
        this.allRows = (sites || []).map((site, index) => this.toSiteRow(site, index));
        this.applyFilters();
      });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.fitColumns();
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredRows = this.allRows.filter((row) => {
      const matchesSearch =
        !search ||
        [row.id, row.site, row.client, row.vertical, row.status]
          .some((value) => String(value || '').toLowerCase().includes(search));

      const matchesStatus = !this.statusFilter || row.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });

    this.totalPages = Math.ceil(this.filteredRows.length / this.pageSize);

    if (this.pageNumber > this.totalPages) {
      this.pageNumber = this.totalPages || 1;
    }

    this.updateRows();
    this.updateSummary();
  }

  onSearchChange(): void {
    this.pageNumber = 1;
    this.applyFilters();
  }

  toggleStatusFilter(status: SiteStatus | ''): void {
    this.statusFilter = this.statusFilter === status ? '' : status;
    this.pageNumber = 1;
    this.applyFilters();
  }

  changePageSize(size: number): void {
    this.pageSize = Number(size);
    this.pageNumber = 1;
    this.applyFilters();
  }

  changePage(page: number): void {
    this.pageNumber = Number(page);
    this.updateRows();
  }

  createSite(): void {
    this.showCreateSitePanel = true;
  }

  closeCreateSite(): void {
    this.showCreateSitePanel = false;
  }

  onCellClicked(event: CellClickedEvent): void {
    const target = event.event?.target as HTMLElement;
    if (!target) return;

    if (target.classList.contains('more-info')) {
      this.selectedSiteInfo = event.data;
    } else if (target.classList.contains('add-circle')) {
      if (event.colDef.field === 'device') {
        this.selectedSiteForDevice = event.data;
        this.showCreateDevice = true;
      }
    }
  }

  closeSiteInfo(): void {
    this.selectedSiteInfo = null;
  }

  closeCreateDevice(refresh: boolean = false): void {
    this.showCreateDevice = false;
    this.selectedSiteForDevice = null;
    if (refresh) {
      // Assuming a method to refresh the sites list or similar
    }
  }

  getSitesList(): any[] {
    return this.allRows.map(row => ({
      siteId: row.id,
      siteName: row.site
    }));
  }

  private updateRows(): void {
    const start = (this.pageNumber - 1) * this.pageSize;
    this.rowData = this.filteredRows.slice(start, start + this.pageSize);
    this.fitColumns();
  }

  private updateSummary(): void {
    const total = this.allRows.length;
    const online = this.allRows.filter((row) => row.status === 'Online').length;
    const offline = this.allRows.filter((row) => row.status === 'Offline').length;
    const partial = this.allRows.filter((row) => row.status === 'Partial').length;
    const upcoming = this.allRows.filter((row) => row.status === 'Inprogress').length;

    this.summaryCards = this.summaryCards.map((card) => {
      const values: Record<string, number> = {
        total,
        online,
        offline,
        unsubscribed: partial,
        upcoming,
      };

      return {
        ...card,
        count: values[card.key] || 0,
        sub: card.key === 'total' ? this.sumNumber('cameraTotal') : values[card.key] || 0,
      };
    });
  }

  private toSiteRow(site: any, index: number): SiteRow {
    const cameraOnline = this.getFirst(site, ['onlineCameras', 'cameraOnline', 'activeCameras']);
    const cameraTotal = this.getFirst(site, ['totalCameras', 'cameraCount', 'camerasCount', 'cameras']);
    const deviceOnline = this.getFirst(site, ['onlineDevices', 'deviceOnline', 'activeDevices']);
    const deviceTotal = this.getFirst(site, ['totalDevices', 'deviceCount', 'devicesCount', 'devices']);
    const status = this.normalizeStatus(this.getFirst(site, ['status', 'currentStatus', 'siteStatus']));

    return {
      id: String(this.getFirst(site, ['id', 'siteId', 'site_id']) || index + 1),
      site: this.getFirst(site, ['siteName', 'name', 'site']) || '-',
      client: this.getFirst(site, ['clientName', 'client', 'customerName', 'customer']) || '-',
      vertical: this.getFirst(site, ['verticalName', 'vertical', 'category']) || '-',
      device: this.formatRatio(deviceOnline, deviceTotal),
      camera: this.formatRatio(cameraOnline, cameraTotal),
      inventory: this.getFirst(site, ['inventoryAction', 'inventory']) || 'VIEW',
      health: this.normalizeStatus(this.getFirst(site, ['healthStatus', 'health']) || status),
      audio: this.normalizeStatus(this.getFirst(site, ['audioStatus', 'audio']) || status),
      services: this.getFirst(site, ['services', 'serviceCount', 'serviceRequests']) || 0,
      status,
      raw: {
        ...site,
        cameraTotal: Number(cameraTotal) || 0,
      },
    };
  }

  private getFirst(source: any, keys: string[]): any {
    for (const key of keys) {
      const value = source?.[key];

      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) return value.length;
        return value;
      }
    }

    return '';
  }

  private formatRatio(current: any, total: any): string {
    if (current !== '' && total !== '') return `${current}/${total}`;
    if (total !== '') return String(total);
    if (current !== '') return String(current);
    return '';
  }

  private normalizeStatus(value: any): SiteStatus {
    const status = String(value || '').trim().toLowerCase();

    if (status.includes('progress') || status.includes('upcoming')) return 'Inprogress';
    if (status.includes('partial') || status.includes('unsubscribe')) return 'Partial';
    if (status.includes('offline') || status === '0' || status === 'false') return 'Offline';
    return 'Online';
  }

  private countBadge(value: any): string {
    if (!value) return '<span class="add-circle material-symbols-outlined">add_circle</span>';

    const text = String(value);
    const status =
      text.includes('/') && Number(text.split('/')[0]) < Number(text.split('/')[1])
        ? 'warn'
        : 'good';

    return `<span class="count-badge ${status}">${text}</span>`;
  }

  private statusIcon(icon: string, status: SiteStatus): string {
    return `<span class="material-symbols-outlined signal-icon ${this.statusClass(status)}">${icon}</span>`;
  }

  private statusClass(status: any): string {
    const value = String(status || '').toLowerCase();

    if (value.includes('offline')) return 'offline';
    if (value.includes('partial') || value.includes('progress')) return 'partial';
    return 'online';
  }

  private sumNumber(key: string): number {
    return this.allRows.reduce((sum, row) => sum + (Number(row.raw?.[key]) || 0), 0);
  }

  private fitColumns(): void {
    setTimeout(() => {
      this.gridApi?.sizeColumnsToFit();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
