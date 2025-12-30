import { Component, Inject, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from 'ag-grid-community';
import { filter, Subject, takeUntil } from 'rxjs';
import { StorageService } from '../../../utilities/services/storage.service';
import { ConfigService } from '../../../utilities/services/config.service';
import { RequestService } from '../../../utilities/services/request.service';
import { gridOptions, handleResponse } from '../../../grid.config';
import { AddRequestComponent } from './add-request/add-request.component';
import { MatMenuModule } from '@angular/material/menu';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../utilities/services/alert.service';

@Component({
  selector: 'app-service-requests',
  imports: [
    AddRequestComponent,
    AgGridAngular,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
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
    private request_service: RequestService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  gridApi!: GridApi;
  datasource!: IServerSideDatasource;
  columnDefs: ColDef[] = [
    { field: 'serviceReqId' },
    { field: 'siteName' },
    { field: 'service_cat_name' },
    { field: 'service_subcat_name' },
    { field: 'createdTime' },
    { field: 'createdByName' },
    {
      field: 'action',
      cellRenderer: (col: any) => {
        if (col.data.assignedToName) {
          return `<button class="btn-open text-primary">${col.data.assignedToName}</button>`;
        } else {
          return `<button class="btn-open text-primary">Assign</button>`;
        }
      },
      editable: false,
      sortable: false,
    },
    {
      field: 'edit',
      cellRenderer: () =>
        '<span class="material-symbols-outlined btn-edit" style="vertical-align: middle; opacity: 0.7;">edit</span>',
      editable: false,
      sortable: false,
    },
  ];
  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    filter: false,
  };
  gridOptions: GridOptions = {
    rowModelType: 'serverSide',
    defaultColDef: this.defaultColDef,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50, 100],
    overlayNoRowsTemplate:
      '<div style="padding: 10px; border: 1px solid red;">No Data Found</div>',
    noRowsOverlayComponentParams: { message: 'Your custom message' },
  };

  currentSite: any;
  incidentdata: any = [];
  isChecked: boolean = false;
  camerasList: any = [];
  actionTags: any = [];
  categoryList: any = [];
  subcategoryList: any = [];
  showAssignDialog: boolean = false;
  requestData: any;
  ngOnInit() {
    this.initilizeFilterForm();
    this.getTypes();
    this.loadCategories();
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
  }

  initilizeFilterForm(): void {
    this.filterForm = this.fb.group({
      camera: [''],
      type: [''],
      serviceCategory: [''],
      serviceSubCategory: [''],
      fromDate: [null],
      startTime: ['00:00'],
      toDate: [null],
      endTime: ['00:00'],
    });
  }

  editRequest() {
    this.showNewRequestModal = true;
  }

  loadCategories() {
    this.request_service.getHelpDeskCategories().subscribe({
      next: (res: any) => {
        this.categoryList = res.categoryList;
      },
    });
  }

  filterSubs() {
    this.filterForm.get('serviceSubCategory')?.setValue('');
    // this.filterForm.patchValue({ serviceSubCategory: '' });
    const selectCatId = Number(this.filterForm.get('serviceCategory')?.value);
    this.subcategoryList =
      this.categoryList.find((cat: any) => cat.catId === selectCatId)
        ?.subCategoryList || [];
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
    this.currentRequest = null;
    this.showNewRequestModal = true;
  }

  closeNewRequestModal(val: boolean) {
    this.showNewRequestModal = val;
    this.refreshGrid();
  }

  currentRequest: any;
  onCellClicked(event: CellClickedEvent) {
    if (
      event.event?.target instanceof HTMLElement &&
      event.event?.target.classList.contains('btn-edit')
    ) {
      this.showNewRequestModal = true;
      this.currentRequest = event.data;
    }

    if (
      event.event?.target instanceof HTMLElement &&
      event.event?.target.classList.contains('btn-open')
    ) {
      this.showAssignDialog = true;
      this.dialog.open(AssignRequestComponent, {
        data: event.data,
      });
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

  createDatasource() {
    return {
      getRows: (params: IServerSideGetRowsParams) => {
        const end = params.request.endRow || 0;
        const start = params.request.startRow || 0;
        const pageSize = end - start;
        const pageNumber = start / pageSize + 1;

        this.request_service
          .getHelpDeskRequests({
            ...this.currentSite,
            ...this.filterForm.value,
            page: pageNumber,
            pageSize: pageSize,
          })
          .subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                const isLastPage = res.serviceRequestList.length < pageSize;
                params.success({
                  rowData: res.serviceRequestList,
                  rowCount: isLastPage
                    ? params.request.startRow + res.serviceRequestList.length
                    : res?.totalPages * pageSize,
                });
                params.api.hideOverlay();
                this.requestData = res;
                console.log(this.requestData);
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

@Component({
  selector: 'app-assign-request',
  imports: [FormsModule, ReactiveFormsModule, MatDialogClose, CommonModule],
  standalone: true,
  template: `
    <section>
      <header class="dialog-header">
        <a>Assign Service Request</a>
        <a mat-dialog-close
          ><span class="material-symbols-outlined">cancel</span></a
        >
      </header>

      <main class="dialog">
        <form [formGroup]="assignForm">
          <div class="mb-3">
            <label for="assignee">Assign To</label>
            <select id="assignee" formControlName="assignee">
              @for(user of usersList; track user) {
              <option [value]="user.userId">{{ user.userName }}</option>
              }
            </select>
          </div>

          <div class="mb-3">
            <label>Comments</label>
            <input
              type="text"
              formControlName="comments"
              placeholder="Comments"
            />
          </div>

          <div class="btn-sec">
            <button type="button" class="btn-primary" (click)="assign()">
              Assign
            </button>
          </div>
        </form>
      </main>
    </section>
  `,
})
export class AssignRequestComponent {
  // @Input() requestData: any;
  assignForm: FormGroup;

  usersList: any = [];

  constructor(
    private fb: FormBuilder,
    private request_service: RequestService,
    private storage_service: StorageService,
    @Inject(MAT_DIALOG_DATA) public currentRow: any,
    private alert_service: AlertService
  ) {
    this.assignForm = this.fb.group({
      assignee: [''],
      comments: [''],
    });
  }

  ngOnInit() {
    this.request_service
      .listSupportUsers(this.storage_service.getData('user'))
      .subscribe((res: any) => {
        console.log(res);
        if (res.statusCode === 200) {
          if (res?.assignedTo) {
            this.usersList = res.roleDetails
              .filter((obj: any) => obj.category !== 'Admin')
              .flatMap((item: any) => item.users);
          } else {
            this.usersList = res.roleDetails
              .filter((obj: any) => obj.category === 'Admin')
              .flatMap((item: any) => item.users);
          }
        } else {
          this.usersList = [];
        }
      });
  }

  assign() {
    const formData = this.assignForm.value;
    // console.log(this.currentRow)
    this.request_service
      .assignServiceRequest({
        assignedBy: this.storage_service.getData('user').userId,
        assignedTo: formData.assignee,
        assignedType: '',
        comments: formData.comments,
        serviceReqId: this.currentRow.serviceReqId,
        status: this.currentRow.status,
      })
      .subscribe((res: any) => {
        // console.log(res);
        if (res.statusCode === 200) {
          this.alert_service.success(res.message);
        } else this.alert_service.error(res.message);
      });
  }
}
