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
import { GridApi, IServerSideDatasource } from 'ag-grid-community';
import { handleResponse } from '../../../utilities/components/table/tableconfig';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    TableComponent,
    CommonModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css',
})
export class AlertsComponent {
  currentSite: any;
  incidentdata: any = [];
  isChecked: boolean = false;
  gridDatasource!: IServerSideDatasource;
  camerasList: any = [];
  actionTags: any = [];
  cameraId: any = '';
  fields = [
    { label: 'Camera', id: 'name', sort: true },
    { label: 'Date', id: 'eventDate', sort: true },
    { label: 'Start Time', id: 'eventFromTime', sort: false },
    { label: 'End Time', id: 'eventToTime', sort: false },
    { label: 'Duration', id: 'duration', sort: false },
    { label: 'Object Identified', id: 'objectName', sort: false },
    { label: 'Action Tag', id: 'actionTag', sort: false },
    { label: 'Type', id: 'actionTag', sort: false },
  ];

  private destroy$ = new Subject<void>();
  gridApi!: GridApi;

  constructor(
    private storage: StorageService,
    private config: ConfigService,
    private incident: IncidentService
  ) {}

  ngOnInit() {
    this.getTypes();
    this.storage.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$)
      )
      .subscribe((site) => {
        this.currentSite = site;
        this.getcamerasForSiteId();
        this.gridDatasource = this.createDatasource();
        this.gridApi.refreshServerSide({ purge: true });
      });
  }

  onGridReady(api: GridApi) {
    this.gridApi = api;
  }

  getcamerasForSiteId() {
    this.config.getCamerasForSiteId(this.currentSite).subscribe((res: any) => {
      this.camerasList = res;
    });
  }

  getTypes() {
    let res = this.storage.getType(36);
    this.actionTags = res[0]?.metadata;
  }

  /** Create AG Grid datasource */
  createDatasource() {
    return {
      getRows: (params: any) => {
        const pageSize = params.request.endRow - params.request.startRow;
        const pageNumber = params.request.startRow / pageSize + 1;

        this.incident
          .incidentList({
            ...this.currentSite,
            page: pageNumber,
            pageSize: pageSize,
            cameraId: this.cameraId,
          })
          .subscribe((res: any) => {
            if (res.statusCode == 200) {
               handleResponse(params, res, pageSize,res?.IncidentList);
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
