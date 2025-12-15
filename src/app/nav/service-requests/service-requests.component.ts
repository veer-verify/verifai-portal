import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, IServerSideDatasource } from 'ag-grid-community';
import { IncidentService } from '../../../utilities/services/incident.service';
import { TableComponent } from '../../../utilities/components/table/table.component';
import { filter, Subject, takeUntil } from 'rxjs';
import { handleResponse } from '../../../utilities/components/table/tableconfig';
import { StorageService } from '../../../utilities/services/storage.service';
import { ConfigService } from '../../../utilities/services/config.service';
import { RequestService } from '../../../utilities/services/request.service';

@Component({
    selector: 'app-service-requests',
    imports: [AgGridAngular, TableComponent],
    templateUrl: './service-requests.component.html',
    styleUrl: './service-requests.component.css'
})
export class ServiceRequestsComponent {

    private destroy$ = new Subject<void>();

  constructor(
    private storage_service: StorageService,
    private config_service: ConfigService,
    private incident_service: IncidentService,
    private request_service: RequestService
  ) {}

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

  currentSite: any;
  ngOnInit() {
    this.storage_service.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$)
      )
      .subscribe((site) => {
        this.currentSite = site;
        this.gridDatasource = this.createDatasource();
        // this.gridApi.refreshServerSide({ purge: true });
      });
  }

    gridDatasource!: IServerSideDatasource;

    colDefs: ColDef[] = [
        { field: "eventId" },
        { field: "cameraId" },
    ];

    defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
    };

  onGridReady(api: GridApi) {
    this.gridApi = api;
  }

      createDatasource() {
        return {
          getRows: (params: any) => {
            const pageSize = params.request.endRow - params.request.startRow;
            const pageNumber = params.request.startRow / pageSize + 1;
    
            this.incident_service
              .incidentList({
                ...this.currentSite,
                page: pageNumber,
                pageSize: pageSize,
              })
              .subscribe((res: any) => {
                if (res.statusCode == 200) {
                   handleResponse(params, res, pageSize,res?.IncidentList);
                }
              });
          },
        };
      }
      
      gridApi!: GridApi;
      onFilterChange() {
        if (!this.gridApi) return;
        const ds = this.createDatasource();
        this.gridApi.setGridOption('serverSideDatasource', ds);
        this.gridApi.refreshServerSide({ purge: true });
      }

}
