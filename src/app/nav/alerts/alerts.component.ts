import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { CellClickedEvent, ColDef, GridOptions } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { gridOptions } from '../../../grid.config';
import { StorageService } from '../../../utilities/services/storage.service';
import { AlertService } from '../../../utilities/services/alert.service';
import { IncidentService } from '../../../utilities/services/incident.service';
import { MediaDialogComponent } from '../../../utilities/components/media-dialog/media-dialog.component';
import { PaginationComponent } from '../../../utilities/components/pagination/pagination.component';
import {
  CalendarComponent,
  DateRangePayload,
} from '../../../utilities/components/calendar/calendar.component';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    AgGridAngular,
    MatDialogModule,
    PaginationComponent,
    CalendarComponent,
  ],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css',
})
export class AlertsComponent {
  constructor(
    public storage_service: StorageService,
    private alertService: AlertService,
    private incident_service: IncidentService,
    private dialog: MatDialog,
  ) { }

  private destroy$ = new Subject<void>();
  gridOptions!: GridOptions;
  currentSite: any;
  camerasList: any[] = [];
  pageSize = 25;
  pageNumber = 1;
  rowData: any[] = [];
  totalPages = 0;
  spinexcel = false;
  siteAlerts!: Observable<any>;

  today = new Date().toISOString().split('T')[0];
  fromDate = this.today;
  toDate = this.today;
  fromTime = '00:00';
  toTime = this.getCurrentTime();
  cameraId = '';
  actionTag = '';

  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Camera',
      filter: false,
      width: 180,
      minWidth: 150,
      flex: 0,
      tooltipField: 'name',
    },
    {
      field: 'eventDate',
      headerName: 'Date',
      filter: false,
      width: 150,
      minWidth: 140,
      flex: 0,
    },
    {
      field: 'eventFromTime',
      headerName: 'Start Time',
      filter: false,
      width: 160,
      minWidth: 135,
      flex: 0,
    },
    {
      field: 'eventToTime',
      headerName: 'End Time',
      filter: false,
      width: 145,
      minWidth: 135,
      flex: 0,
    },
    {
      field: 'duration',
      headerName: 'Duration',
      filter: false,
      width: 150,
      minWidth: 140,
      flex: 0,
    },
    {
      field: 'objectName',
      headerName: 'Object Identified',
      filter: false,
      minWidth: 250,
      flex: 0,
      wrapHeaderText: true,
      autoHeaderHeight: true,
      tooltipField: 'objectName',
    },
    {
      field: 'subAlertTag',
      headerName: 'Alert Tag',
      filter: false,
      minWidth: 150,
      flex: 1,
      tooltipField: 'subAlertTag',
    },
    {
      field: 'clip',
      headerName: 'Clip',
      filter: false,
      width: 80,
      minWidth: 140,
      flex: 0,
      cellRenderer: (params: any) => {
        const isDisabled = params.data.files.length === 0;
        const disabledAttr = isDisabled ? 'disabled' : '';
        const style = isDisabled
          ? 'style="opacity: 0.5; pointer-events: none; filter: grayscale(1);"'
          : '';
        return `<img src="icons/play-circle-fill.svg" class="btn-open" ${disabledAttr} ${style} />`;
      },
      editable: false,
      sortable: false,
    },
  ];

  ngOnInit() {
    this.gridOptions = gridOptions;

    this.storage_service.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$),
      )
      .subscribe((site) => {
        this.currentSite = site;
        this.clearData(false);
        this.siteAlerts = this.incident_service
          .getSiteAlerts(site)
          .pipe(map((response) => response.data));
        this.incidentList();
      });

    this.storage_service.camData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.camerasList = res ?? [];
      });
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  buildDateTime(date: string, time: string): string {
    if (!date) return '';
    return `${date}T${time || '00:00'}:00`;
  }

  formatDateTimeSeconds(date: string, time: string): string {
    const value = this.buildDateTime(date, time);
    return value ? value.replace('T', ' ') : '';
  }

  formatDateTimeForFile(date: string, time: string): string {
    if (!date) return '';

    const currentDate = new Date(date);
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = currentDate.toLocaleString('en-US', { month: 'short' });
    const year = currentDate.getFullYear();
    const [hours = '00', mins = '00'] = (time || '00:00').split(':');

    return `${day}-${month}-${year}-${hours}-${mins}`;
  }

  clearData(shouldReload = true) {
    this.cameraId = '';
    this.actionTag = '';
    this.fromDate = this.today;
    this.toDate = this.today;
    this.fromTime = '00:00';
    this.toTime = this.getCurrentTime();
    this.pageNumber = 1;

    if (shouldReload) {
      this.incidentList();
    }
  }

  onRangeApply(range: DateRangePayload) {
    this.fromDate = range.startDate;
    this.fromTime = range.startTime;
    this.toDate = range.endDate;
    this.toTime = range.endTime;
    this.onFilterChange();
  }

  downloadExcelReport() {
    const siteId = this.currentSite?.siteId;

    if (!this.fromDate || !this.toDate || !siteId) {
      this.alertService.error('From Date, To Date and Site Id are mandatory');
      return;
    }

    const user = this.storage_service.getData('user');
    const token = user?.AccessToken;

    if (!token) {
      this.alertService.error('Access token expired. Please login again.');
      return;
    }

    this.spinexcel = true;

    const payload: any = {
      fromDate: this.formatDateTimeSeconds(this.fromDate, this.fromTime),
      toDate: this.formatDateTimeSeconds(this.toDate, this.toTime),
      siteId,
    };

    if (this.cameraId) {
      payload.cameraId = this.cameraId;
    }

    if (this.actionTag) {
      payload.actionTag = this.actionTag;
    }

    this.alertService.downloadExcelReport(payload, token).subscribe({
      next: (blob: Blob) => {
        const from = this.formatDateTimeForFile(this.fromDate, this.fromTime);
        const to = this.formatDateTimeForFile(this.toDate, this.toTime);
        const tagSuffix = this.actionTag ? `_${this.actionTag}` : '';
        const fileName = `Alerts-Report_${from}_to_${to}${tagSuffix}.xlsx`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.spinexcel = false;
      },
      error: () => {
        this.alertService.error('Download failed');
        this.spinexcel = false;
      },
    });
  }

  onCellClicked(event: CellClickedEvent) {
    if (
      event.event?.target instanceof HTMLElement &&
      event.event?.target.classList.contains('btn-open')
    ) {
      this.dialog.open(MediaDialogComponent, {
        data: event.data,
        disableClose: true,
      });
    }
  }

  incidentList() {
    this.incident_service
      .incidentList({
        ...this.currentSite,
        cameraId: this.cameraId,
        actionTag: this.actionTag,
        fromDate: this.buildDateTime(this.fromDate, this.fromTime),
        toDate: this.buildDateTime(this.toDate, this.toTime),
        page: this.pageNumber,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.rowData = res.IncidentList;
            this.totalPages = res.totalPages;
          } else {
            this.rowData = [];
            this.totalPages = 0;
          }
        },
      });
  }

  changePageSize(pSize: any) {
    this.pageSize = Number(pSize);
    this.incidentList();
  }

  changePage(pageNo: any) {
    this.pageNumber = Number(pageNo);
    this.incidentList();
  }

  onFilterChange() {
    this.pageNumber = 1;
    this.incidentList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
