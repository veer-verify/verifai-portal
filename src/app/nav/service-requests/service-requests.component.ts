import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  // IServerSideDatasource,
  // IServerSideGetRowsParams,
  themeQuartz,
} from 'ag-grid-community';
import { filter, Subject, takeUntil } from 'rxjs';
import { StorageService } from '../../../utilities/services/storage.service';
import { ConfigService } from '../../../utilities/services/config.service';
import { RequestService } from '../../../utilities/services/request.service';
import { gridOptions } from '../../../grid.config';
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
import { CommonModule, DatePipe } from '@angular/common';
import { AlertService } from '../../../utilities/services/alert.service';
import { PaginationComponent } from '../../../utilities/components/pagination/pagination.component';

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
    DatePipe,
    CommonModule,
    PaginationComponent,
  ],
  providers: [DatePipe],
  templateUrl: './service-requests.component.html',
  styleUrl: './service-requests.component.css',
})
export class ServiceRequestsComponent {
  private destroy$ = new Subject<void>();

  constructor(
    public storage_service: StorageService,
    private config_service: ConfigService,
    private request_service: RequestService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) { }

  columnDefs: ColDef[] = [
    { field: 'serviceReqId', headerName: 'Id', filter: false },
    { field: 'siteName', headerName: 'Site', filter: false },
    {
      field: 'createdTime',
      filter: false,
      headerName: 'Date',
      cellRenderer: (col: any) =>
        this.datePipe.transform(col.data?.createdTime, 'short'),
    },
    { field: 'service_cat_name', headerName: 'Category', filter: false },
    { field: 'service_subcat_name', headerName: 'Sub Category', filter: false },
    { field: 'priority', filter: false },
    { field: 'createdByName', headerName: 'Assigned By', filter: false },
    // { field: 'assignedToName', headerName: 'Assigned To' },
    {
      field: 'assignedToName',
      filter: false,
      headerName: 'Assigned To',
      cellRenderer: (col: any) => {
        if (col.data?.assignedToName) {
          return `<button class="btn-open text-primary">${col.data.assignedToName}</button>`;
        } else {
          return `<button class="btn-open text-primary">Assign</button>`;
        }
      },
      editable: false,
      sortable: false,
    },
    // {
    //   field: '',
    //   cellRenderer: () =>
    //     '<span class="material-symbols-outlined btn-view" style="vertical-align: middle; opacity: 0.7;">info</span>',
    //   editable: false,
    //   sortable: false,
    // },
    {
      field: 'Action',
      filter: false,
      cellRenderer: () =>
        `<span class="material-symbols-outlined btn-view me-1" style="vertical-align: middle; opacity: 0.7;">info</span>
      <span class="material-symbols-outlined btn-edit" style="vertical-align: middle; opacity: 0.7;">edit</span>`,
      editable: false,
      sortable: false,
    },
  ];

  gridOptions!: GridOptions;
  currentSite: any;
  incidentdata: any = [];
  isChecked: boolean = false;
  camerasList: any = [];
  actionTags: any = [];
  categoryList: any = [];
  subcategoryList: any = [];
  showAssignDialog: boolean = false;
  requestData: any;
  viewRequestInfo = false;
  rowRequestData: any;
  closeRequestInfo = false;
  rowData: any = [];
  pageNumber = 1;
  pageSize = 10;
  totalPages: any = 0;

  ngOnInit() {
    this.gridOptions = gridOptions;

    this.initilizeFilterForm();
    this.filterForm.patchValue({
      fromTime: '00:00:00',
      toTime: '00:00:00',
    });
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
        this.getHelpDeskRequests();
      });
  }

  gridApi!: GridApi;
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.showLoadingOverlay();
  }

  getHelpDeskRequests() {
    this.request_service
      .getHelpDeskRequests({
        ...this.currentSite,
        ...this.filterForm.value,
        page: this.pageNumber,
        pageSize: this.pageSize,
      })
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.rowData = res.serviceRequestList;
          this.totalPages = res.totalPages;
        } else {
          this.rowData = [];
        }
      });
  }

  showInfo(requestData: any) {
    console.log(requestData);
  }

  initilizeFilterForm(): void {
    this.filterForm = this.fb.group({
      camera: [''],
      serviceCategory: [''],
      serviceSubCategory: [''],
      fromDate: [''],
      fromTime: [''],
      toDate: [''],
      toTime: [''],
    });
  }

  resetForm() {
    this.filterForm.reset();
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

  filterForm!: FormGroup;
  showNewRequestModal: boolean = false;
  openNewRequestModal() {
    this.currentRequest = null;
    this.showNewRequestModal = true;
  }

  closeNewRequestModal(val: boolean) {
    this.showNewRequestModal = val;
  }

  close() {
    this.closeRequestInfo = true;
    setTimeout(() => {
      this.viewRequestInfo = false;
      this.closeRequestInfo = false;
    }, 500);
  }

  currentRequest: any;
  onCellClicked(event: CellClickedEvent) {
    if (
      event.event?.target instanceof HTMLElement &&
      event.event?.target.classList.contains('btn-view')
    ) {
      this.viewRequestInfo = true;
      this.rowRequestData = event.data;
    }
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
      const assignDialog = this.dialog.open(AssignRequestComponent, {
        data: event.data,
        disableClose: true,
      });

      assignDialog.afterClosed().subscribe((result) => {
        console.log(result);
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

  changePageNumber(pNum: any) {
    this.pageNumber = pNum;
    this.request_service
      .getHelpDeskRequests({
        ...this.currentSite,
        ...this.filterForm.value,
        page: pNum,
        pageSize: this.pageSize,
      })
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.rowData = res.serviceRequestList;
          this.totalPages = res.totalPages;
        }
      });
  }

  changePSize(pSize: any) {
    this.pageSize = pSize;
  }

  onFilterChange() {
    // console.log(this.filterForm.value)
    this.getHelpDeskRequests();
  }

  changePage(page: number) {
    if (page < 1) return;
    this.pageNumber = page;
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
          ><span class="material-symbols-outlined text-danger">cancel</span></a
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
            <button
              type="button"
              class="btn-primary"
              (click)="assign()"
              mat-dialog-close
            >
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
    private alert_service: AlertService,
    private cdr: ChangeDetectorRef
  ) {
    this.assignForm = this.fb.group({
      assignee: [''],
      comments: [''],
    });
  }

  ngOnInit() {
    this.assignForm.patchValue({ assignee: this.currentRow?.assignedTo });
    this.listSupportUsers();
  }

  listSupportUsers() {
    this.request_service
      .listSupportUsers(this.storage_service.getData('user'))
      .subscribe((res: any) => {
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
    if (this.assignForm.invalid)
      return this.alert_service.error('Please fill valid details!');
    const formData = this.assignForm.value;
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
        if (res.statusCode === 200) {
          this.alert_service.success(res.message);
        } else {
          this.alert_service.error(res.message);
        }
      });
  }
}
