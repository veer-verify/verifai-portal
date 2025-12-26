import { IncidentService } from './../../../utilities/services/incident.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { TableComponent } from '../../../utilities/components/table/table.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../../utilities/services/storage.service';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../utilities/services/config.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { CellClickedEvent, ColDef, GridApi, GridOptions, GridReadyEvent, IServerSideDatasource } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { gridOptions, handleResponse } from '../../../grid.config';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MediaDialogComponent } from '../../../utilities/components/media-dialog/media-dialog.component';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridAngular,
    MatDialogModule
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
    private dialog: MatDialog
  ) { }

  currentSite: any;
  incidentdata: any = [];
  isChecked: boolean = false;
  camerasList: any = [];
  actionTags: any = [];

  columnDefs: ColDef[] = [
    { field: 'name' },
    { field: 'eventDate' },
    { field: 'eventFromTime' },
    { field: 'eventToTime' },
    { field: 'duration' },
    { field: 'objectName' },
    { field: 'actionTag' },
    {
      field: 'clip',
      cellRenderer: (params: any) => {
        const isDisabled = params.data.files.length === 0;
        const disabledAttr = isDisabled ? 'disabled' : '';
        const style = isDisabled ? 'style="opacity: 0.5; pointer-events: none; filter: grayscale(1);"' : '';
        return `<img src="icons/play-circle-fill.svg" class="btn-open" ${disabledAttr} ${style} />`;
      },
      editable: false,
      sortable: false
    },
  ];
  gridApi!: GridApi;
  datasource!: IServerSideDatasource;
  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100
  };
  gridOptions: GridOptions = {
    rowModelType: 'serverSide',
    defaultColDef: this.defaultColDef,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50, 100],
    overlayNoRowsTemplate: '<div style="padding: 10px; border: 1px solid red;">No Data Found</div>',
    noRowsOverlayComponentParams: { message: 'Your custom message' }
  };
  ngOnInit() {
    this.getTypes();
    this.storage_service.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$)
      )
      .subscribe((site) => {
        this.currentSite = site;
        this.getcamerasForSiteId();
        this.datasource = this.createDatasource();
        // this.gridApi.refreshServerSide({ purge: true });
      });
  }

  onCellClicked(event: CellClickedEvent) {
    if (event.event?.target instanceof HTMLElement && event.event?.target.classList.contains('btn-open')) {
      this.dialog.open(MediaDialogComponent, { data: event.data });
    }
  }

  getcamerasForSiteId() {
    this.config_service.getCamerasForSiteId(this.currentSite).subscribe((res: any) => {
      this.camerasList = res;
    });
  }

  getTypes() {
    let res = this.storage_service.getType(36);
    this.actionTags = res[0]?.metadata;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    if (this.datasource) {
      this.gridApi.setGridOption('serverSideDatasource', this.datasource);
    }
  }

  filterObj = {
    cameraId: '',
    actionTag: '',
    fromDate: '',
    toDate: ''
  }
  createDatasource() {
    return {
      getRows: (params: any) => {
        const pageSize = params.request.endRow - params.request.startRow;
        const pageNumber = params.request.startRow / pageSize + 1;

        this.incident_service
          .incidentList({
            ...this.currentSite,
            ...this.filterObj,
            page: pageNumber,
            pageSize: pageSize
          })
          .subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                const isLastPage = res.IncidentList.length < pageSize;
                params.success({
                  rowData: res.IncidentList,
                  rowCount: isLastPage
                    ? params.request.startRow + res.IncidentList.length
                    : res.totalPages * pageSize
                });
                params.api.hideOverlay();
              } else {
                params.fail();
                params.api.showNoRowsOverlay();
              }
            }
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
