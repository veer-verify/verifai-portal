import { IncidentService } from './../../../utilities/services/incident.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  GridApi,
  GridOptions,
  GridReadyEvent,
  IServerSideDatasource,
  themeQuartz,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { gridOptions, handleResponse } from '../../../grid.config';
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
  private destroy$ = new Subject<void>();

  constructor(
    private storage_service: StorageService,
    private config_service: ConfigService,
    private incident_service: IncidentService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) { }

  currentSite: any;
  incidentdata: any = [];
  isChecked: boolean = false;
  camerasList: any = [];
  actionTags: any = [];
  pageSize: any = 10;
  pageNumber: any = 1;
  rowData: any;
  totalPages = 0;

  myTheme = themeQuartz.withParams({
    headerTextColor: '#FFFFFF',
    headerBackgroundColor: 'rgba(0,0,0,0.5)',
    headerColumnResizeHandleColor: '#ffffff',
    rowBorder: true,
  });

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
  gridApi!: GridApi;
  // datasource!: IServerSideDatasource;
  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
  };
  gridOptions: GridOptions = {
    theme: this.myTheme,
    rowModelType: 'clientSide',
    defaultColDef: this.defaultColDef,
    pagination: false,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50, 100],
    overlayNoRowsTemplate:
      '<div style="padding: 10px; border: 1px solid red;">No Data Found</div>',
    noRowsOverlayComponentParams: { message: 'Your custom message' },
  };

  resetForm() {
    this.filterForm.reset();
  }

  filterForm!: FormGroup;
  ngOnInit() {
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
        this.getAlerts();
        // this.datasource = this.createDatasource();
        // this.gridApi.refreshServerSide({ purge: true });
      });
  }

  initilizeFilterForm(): void {
    this.filterForm = this.fb.group({
      cameraId: [''],
      actionTag: [''],
      fromDate: [''],
      toDate: [''],
      durationStart: [0],
      durationEnd: [55],
    });
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

  // onGridReady(params: GridReadyEvent) {
  //   this.gridApi = params.api;
  //   if (this.datasource) {
  //     this.gridApi.setGridOption('serverSideDatasource', this.datasource);
  //   }
  // }

  getAlerts() {
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
    // console.log(pSize);
    this.pageSize = pSize;
    this.getAlerts();
  }

  changePage(pNum: any) {
    this.pageNumber = pNum;
    this.getAlerts();
  }

  createDatasource() {
    return {
      getRows: (params: any) => {
        const pageSize = params.request.endRow - params.request.startRow;
        const pageNumber = params.request.startRow / pageSize + 1;

        this.incident_service
          .incidentList({
            ...this.currentSite,
            ...this.filterForm.value,
            page: pageNumber,
            pageSize: pageSize,
          })
          .subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                const isLastPage = res.IncidentList.length < pageSize;
                params.success({
                  rowData: res.IncidentList,
                  rowCount: isLastPage
                    ? params.request.startRow + res.IncidentList.length
                    : res.totalPages * pageSize,
                });
                params.api.hideOverlay();
              } else {
                params.fail();
                params.api.showNoRowsOverlay();
              }
            },
          });
      },
    };
  }

  onFilterChange() {
    if (!this.gridApi) return;
    const ds = this.createDatasource();
    this.gridApi.setGridOption('serverSideDatasource', ds);
    this.gridApi.refreshServerSide({ purge: true });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
