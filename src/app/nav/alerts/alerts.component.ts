import { IncidentService } from './../../../utilities/services/incident.service';
import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { TableComponent } from '../../../utilities/components/table/table.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../../utilities/services/storage.service';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../utilities/services/config.service';
import { filter, Subject, takeUntil } from 'rxjs';
import {
  CellClickedEvent,
  ColDef,
  GridOptions,
  GridReadyEvent,
  IServerSideDatasource,
  themeQuartz,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { gridOptions } from '../../../grid.config';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MediaDialogComponent } from '../../../utilities/components/media-dialog/media-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { PaginationComponent } from '../../../utilities/components/pagination/pagination.component';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridAngular,
    MatDialogModule,
    MatMenuModule,
    PaginationComponent
  ],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css',
})
export class AlertsComponent {

  constructor(
    private storage_service: StorageService,
    private config_service: ConfigService,
    private incident_service: IncidentService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) { }

  private destroy$ = new Subject<void>();
  gridOptions!: GridOptions
  currentSite: any;
  incidentdata: any = [];
  isChecked: boolean = false;
  camerasList: any = [];
  actionTags: any = [];
  pageSize: any = 10;
  pageNumber: any = 1;
  rowData: any;
  totalPages = 0;

  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Camera' },
    { field: 'eventDate' },
    { field: 'eventFromTime', headerName: 'Start Time' },
    { field: 'eventToTime', headerName: 'End Time' },
    { field: 'duration' },
    { field: 'objectName', headerName: 'Object Identified' },
    { field: 'actionTag' },
    {
      field: 'clip',
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


  resetForm() {
    this.filterForm.reset();
  }

  filterForm!: FormGroup;
  ngOnInit() {
    this.gridOptions = gridOptions;
    this.initilizeFilterForm();
    this.getTypes();
    this.storage_service.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$)
      )
      .subscribe((site) => {
        this.currentSite = site;
        this.getcamerasForSiteId();
        this.incidentList();
      });
  }

  initilizeFilterForm(): void {
    this.filterForm = this.fb.group({
      cameraId: [''],
      actionTag: [''],
      fromDate: [''],
      toDate: [''],
      fromTime: ["16:52:01"],
      toTime: ['00:00:00'],
      durationStart: [1],
      durationEnd: [60],
    });

    // const formattedTime = formatDate(new Date(), 'HH:mm', 'en-US');
    // this.filterForm.patchValue({ fromTime: formattedTime });
    console.log(this.filterForm.value)
  }

  get() {
    console.log(this.filterForm.value)

  }


  formatTime(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  }

  syncDuration() {
    const start = this.filterForm.value.durationStart;
    const end = this.filterForm.value.durationEnd;

    if (start > end) {
      this.filterForm.patchValue({ durationStart: end });
    }
  }

  onCellClicked(event: CellClickedEvent) {
    if (
      event.event?.target instanceof HTMLElement &&
      event.event?.target.classList.contains('btn-open')
    ) {
      this.dialog.open(MediaDialogComponent, { data: event.data, disableClose: true });
    }
  }

  getcamerasForSiteId() {
    this.config_service
      .getCamerasForSiteId(this.currentSite)
      .subscribe((res: any) => {
        this.camerasList = res;
      });
  }

  getTypes() {
    let res = this.storage_service.getType(36);
    this.actionTags = res[0]?.metadata;
  }

  incidentList() {
    this.incident_service
      .incidentList({
        ...this.currentSite,
        ...this.filterForm.value,
        page: this.pageNumber,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.rowData = res.IncidentList;
            this.totalPages = res.totalPages;
          }
        },
      });
  }


  changePageSize(pSize: any) {
    this.pageSize = pSize;
    this.incidentList();
  }

  changePage(pNum: any) {
    this.pageNumber = pNum;
    this.incidentList();
  }

  onFilterChange() {
    this.incidentList();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
