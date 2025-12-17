import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, GridApi, GridReadyEvent, IServerSideDatasource } from 'ag-grid-community';
import { IncidentService } from '../../../utilities/services/incident.service';
import { TableComponent } from '../../../utilities/components/table/table.component';
import { filter, Subject, takeUntil } from 'rxjs';
import { StorageService } from '../../../utilities/services/storage.service';
import { ConfigService } from '../../../utilities/services/config.service';
import { RequestService } from '../../../utilities/services/request.service';
import { gridOptions, handleResponse } from '../../../grid.config';

@Component({
  selector: 'app-service-requests',
  imports: [
    TableComponent,
    AgGridAngular
  ],
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
      });

    this.gridOptions = gridOptions;
    this.gridOptions.columnDefs = [
      { field: 'serviceReqId', sort: true },
      { field: 'siteName', sort: false },
      { field: 'service_cat_name', sort: true },
      { field: 'service_subcat_name', sort: false },
      { field: 'createdTime', sort: false },
      { field: 'createdByName', sort: false },
      {
        field: 'action',
        cellRenderer: () => '<button class="btn-open">Open</button>',
      }
    ]
  }

  onCellClicked(event: CellClickedEvent) {
    if (event.event?.target instanceof HTMLElement && event.event?.target.classList.contains('btn-open')) {
      // this.dialog.open(MediaDialogComponent, { data: event.data });
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

        this.request_service
          .getHelpDeskRequests({
            ...this.currentSite,
            ...this.filterObj,
            page: pageNumber,
            pageSize: pageSize
          })
          .subscribe((res: any) => {
            if (res.statusCode == 200) {
              handleResponse(params, res, pageSize, res?.serviceRequestList);
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
