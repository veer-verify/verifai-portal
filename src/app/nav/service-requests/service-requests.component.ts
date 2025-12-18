import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  IServerSideDatasource,
} from 'ag-grid-community';
import { IncidentService } from '../../../utilities/services/incident.service';
import { TableComponent } from '../../../utilities/components/table/table.component';
import { filter, Subject, takeUntil } from 'rxjs';
import { StorageService } from '../../../utilities/services/storage.service';
import { ConfigService } from '../../../utilities/services/config.service';
import { RequestService } from '../../../utilities/services/request.service';
import { gridOptions, handleResponse } from '../../../grid.config';
import { NewRequestComponent } from './new-request/new-request.component';
import { MatFormField } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLabel } from '@angular/material/select';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-service-requests',
  imports: [
    TableComponent,
    AgGridAngular,
    NewRequestComponent,
    MatMenuModule,
    MatFormField,
    FormsModule,
    ReactiveFormsModule,
    MatLabel,
    MatOption,
    MatSelect,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
  ],
  templateUrl: './service-requests.component.html',
  styleUrl: './service-requests.component.css',
})
export class ServiceRequestsComponent {
  private destroy$ = new Subject<void>();

  constructor(
    private storage_service: StorageService,
    private config_service: ConfigService,
    private incident_service: IncidentService,
    private request_service: RequestService,
    private fb: FormBuilder
  ) {}

  currentSite: any;
  incidentdata: any = [];
  isChecked: boolean = false;
  camerasList: any = [];
  actionTags: any = [];
  dialog: any;

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
      { headerName: '#ID', field: 'serviceReqId', sort: true },
      { headerName: 'SITE', field: 'siteName', sort: false },
      { headerName: 'CATEGORY', field: 'service_cat_name', sort: true },
      { headerName: 'SUB CATEGORY', field: 'service_subcat_name', sort: false },
      { headerName: 'CREATED TIME', field: 'createdTime', sort: false },
      { headerName: 'CREATED BY', field: 'createdByName', sort: false },
      {
        field: 'action',
        cellRenderer: () => '<button class="btn-open">Open</button>',
      },
    ];

    this.filterForm = this.fb.group({
      camera: [''],
      type: [''],
      actionTag: [''],
      startDate: [null],
      startTime: ['00:00'],
      endDate: [null],
      endTime: ['00:00'],
    });
  }

  durationStart = 0; // minutes
  durationEnd = 55; // minutes

  onStartChange(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.durationStart = Math.min(value, this.durationEnd - 1);
  }

  onEndChange(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.durationEnd = Math.max(value, this.durationStart + 1);
  }

  formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  maxDuration = 120;
get startPercent(): string {
  return `${(this.durationStart / this.maxDuration) * 100}%`;
}

get endPercent(): string {
  return `${(this.durationEnd / this.maxDuration) * 100}%`;
}

  onStatusFilterChange() {}

  onPriorityFilterChange() {}

  filterForm!: FormGroup;

  refreshGrid() {
    if (!this.gridApi) return;
    this.gridApi.refreshServerSide({ purge: true });
  }

  showNewRequestModal: boolean = false;

  openNewRequestModal() {
    this.showNewRequestModal = true;
  }

  closeNewRequestModal() {
    this.showNewRequestModal = false;
    this.refreshGrid();
  }

  onCellClicked(event: CellClickedEvent) {
    if (
      event.event?.target instanceof HTMLElement &&
      event.event?.target.classList.contains('btn-open')
    ) {
      // this.dialog.open(MediaDialogComponent, { data: event.data });
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
    toDate: '',
  };
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
            pageSize: pageSize,
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
