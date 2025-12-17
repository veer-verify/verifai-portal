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
import { CellClickedEvent, GridApi, GridReadyEvent, IServerSideDatasource } from 'ag-grid-community';
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

  gridApi!: GridApi;
  datasource!: IServerSideDatasource;
  gridOptions: any;
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

    this.gridOptions = gridOptions;
    this.gridOptions.columnDefs = [
      { field: 'name', sort: true },
      { field: 'eventDate', sort: true },
      { field: 'eventFromTime', sort: false },
      { field: 'eventToTime', sort: false },
      { field: 'duration', sort: false },
      { field: 'objectName', sort: false },
      { field: 'actionTag', sort: false },
      // {
      //   field: 'clip',
      //   sort: false,
      //   cellRenderer: () => {
      //     return '<img src="icons/play-circle-fill.svg" />';
      //   },
      //   minWidth: 50,
      //   maxWidth: 80
      // },
      {
        field: 'clip',
        cellRenderer: () => '<img src="icons/play-circle-fill.svg" class="btn-open" />',
        editable: false,
        sort: false,
        disabled: true
      },
      // {
      //   field: 'action',
      //   cellRenderer: () => '<button class="btn-open">Open</button>',
      // }
    ]
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
          .subscribe((res: any) => {
            if (res.statusCode == 200) {
              handleResponse(params, res, pageSize, res?.IncidentList);
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
