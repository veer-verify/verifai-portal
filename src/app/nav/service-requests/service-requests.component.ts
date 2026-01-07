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
    private storage_service: StorageService,
    private config_service: ConfigService,
    private request_service: RequestService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) {}

  gridApi!: GridApi;
  // datasource!: IServerSideDatasource;
  myTheme = themeQuartz.withParams({
    headerTextColor: '#FFFFFF',
    headerBackgroundColor: 'rgba(0,0,0,0.5)',
    headerColumnResizeHandleColor: '#ffffff',
    rowBorder: true,
  });
  columnDefs: ColDef[] = [
    { field: 'serviceReqId', headerName: 'Id' },
    { field: 'siteName', headerName: 'Site' },
    {
      field: 'createdTime',
      headerName: 'Date',
      cellRenderer: (col: any) =>
        this.datePipe.transform(col.data?.createdTime, 'short'),
    },
    { field: 'service_cat_name', headerName: 'Category' },
    { field: 'service_subcat_name', headerName: 'Sub Category' },
    { field: 'priority' },
    { field: 'createdByName', headerName: 'Assigned By' },
    // { field: 'assignedToName', headerName: 'Assigned To' },
    {
      field: 'assignedToName',
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
      cellRenderer: (rowData: any) =>
        `<span class="material-symbols-outlined btn-view me-1" style="vertical-align: middle; opacity: 0.7;">info</span>
      <span class="material-symbols-outlined btn-edit" style="vertical-align: middle; opacity: 0.7;">edit</span>`,
      editable: false,
      sortable: false,
    },
  ];
  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    filter: false,
  };
  // gridOptions: GridOptions = {
  //   theme: this.myTheme,
  //   rowModelType: 'serverSide',
  //   defaultColDef: this.defaultColDef,
  //   pagination: true,
  //   paginationPageSize: 10,
  //   paginationPageSizeSelector: [10, 20, 50, 100],
  //   overlayNoRowsTemplate:
  //     '<div style="padding: 10px; border: 1px solid red;">No Data Found</div>',
  //   noRowsOverlayComponentParams: { message: 'Your custom message' },
  // };

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
        // this.datasource = this.createDatasource();
      });
      this.request_service.getHelpDeskRequests().subscribe((res: any)=>{
      if(res.statusCode === 200){
        this.rowData = res.serviceRequestList
        console.log(res.totalPages);
        this.totalPages = res.totalPages;
      }
    })
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
      fromTime: ['00:00:00'],
      toDate: [''],
      toTime: ['00:00:00'],
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

  onStatusFilterChange() {}

  onPriorityFilterChange() {}

  filterForm!: FormGroup;

  // refreshGrid() {
  //   if (!this.gridApi) return;
  //   this.gridApi.refreshServerSide({ purge: true });
  // }

  showNewRequestModal: boolean = false;
  openNewRequestModal() {
    this.currentRequest = null;
    this.showNewRequestModal = true;
  }

  closeNewRequestModal(val: boolean) {
    this.showNewRequestModal = val;
    // this.refreshGrid();
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
      console.log(this.rowRequestData);
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

  // onGridReady(params: GridReadyEvent) {
  //   this.gridApi = params.api;
  //   if (this.datasource) {
  //     this.gridApi.setGridOption('serverSideDatasource', this.datasource);
  //   }
  // }

  // getRequestData(){
  //   this.request_service.getHelpDeskRequests({
  //     ...this.currentSite,
  //     ...this.filterForm.value,
  //     page: this.pageNumber,
  //     pageSize: this.pageSize
  //   }).subscribe({
  //     next: (res: any)=>{
  //       if(res.statusCode === 200){
  //         this.totalPages = res.totalPages
  //       }
  //     }
  //   })
  // }

  createDatasource() {
    return {
      getRows: (params: any) => {
        const pageSize = this.pageSize;
        const pageNumber = this.pageNumber;

        this.request_service
          .getHelpDeskRequests({
            ...this.currentSite,
            ...this.filterForm.value,
            page: pageNumber,
            pageSize: pageSize,
          })
          .subscribe({
            next: (res: any) => {
              if (res.statusCode === 200) {
                const rows = res.serviceRequestList;

                const lastRow =
                  rows.length < pageSize
                    ? (pageNumber - 1) * pageSize + rows.length
                    : -1;

                params.successCallback(rows, lastRow);
                this.totalPages = res.totalPages;
                this.cdr.detectChanges();
              } else {
                params.failCallback();
              }
            },
            error: () => params.failCallback(),
          });
      },
    };
  }

  changePageNumber(pNum: any) {
    this.pageNumber = pNum;

    this.gridApi?.purgeInfiniteCache();
  }

  changePSize(pSize: any) {
    this.pageSize = pSize;
  this.gridApi?.setGridOption('cacheBlockSize', pSize);
  this.gridApi?.purgeInfiniteCache();
  }

  

  // createDatasource() {
  //   return {
  //     getRows: (params: IServerSideGetRowsParams) => {
  //       const end = params.request.endRow || 0;
  //       const start = params.request.startRow || 0;
  //       const pageSize = end - start;
  //       const pageNumber = start / pageSize + 1;

  //       this.request_service
  //         .getHelpDeskRequests({
  //           ...this.currentSite,
  //           ...this.filterForm.value,
  //           page: pageNumber,
  //           pageSize: pageSize,
  //         })
  //         .subscribe({
  //           next: (res) => {
  //             if (res.statusCode === 200) {
  //               const isLastPage = res.serviceRequestList.length < pageSize;
  //               params.success({
  //                 rowData: res.serviceRequestList,
  //                 rowCount: isLastPage
  //                   ? params.request.startRow + res.serviceRequestList.length
  //                   : res?.totalPages * pageSize,
  //               });
  //               params.api.hideOverlay();
  //               this.requestData = res;
  //             } else {
  //               params.fail();
  //               params.api.showNoRowsOverlay();
  //             }
  //           },
  //         });
  //     },
  //   };
  // }

  onFilterChange() {
    // if (!this.gridApi) return;
    // const ds = this.createDatasource();
    // this.gridApi.setGridOption('serverSideDatasource', ds);
    // this.gridApi.refreshServerSide({ purge: true });
  }

  changePage(page: number) {
    if (page < 1) return;
    this.pageNumber = page;
    this.gridApi?.purgeInfiniteCache();
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
