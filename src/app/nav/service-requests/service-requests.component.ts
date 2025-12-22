import { Component, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IServerSideDatasource,
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
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

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
  ) { }

  currentSite: any;
  incidentdata: any = [];
  isChecked: boolean = false;
  camerasList: any = [];
  actionTags: any = [];

  gridApi!: GridApi;
  datasource!: IServerSideDatasource;
  gridOptions!: GridOptions;
  categoryList: any = [];
  subcategoryList: any = [];
  showAssignDialog: boolean = false;


  ngOnInit() {
    this.gridOptions = gridOptions;
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

    this.gridOptions.columnDefs = [
      { field: 'serviceReqId' },
      { field: 'siteName' },
      { field: 'service_cat_name' },
      { field: 'service_subcat_name' },
      { field: 'createdTime' },
      { field: 'createdByName' },
      {
        field: 'action',
        cellRenderer: () => '<button class="btn-open">Open</button>'
      },
      {
        field: 'edit',
        cellRenderer: () => '<button class="btn-edit" (click)="editRequest()">Edit</button>',
        editable: false,
      }
    ];

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
      }
    });
  }

  filterSubs() {
    const selectCatId = Number(this.filterForm.get('serviceCategory')?.value);
    this.subcategoryList = this.categoryList.find((cat: any) => cat.catId === selectCatId)?.subCategoryList || [];
    this.filterForm.patchValue({ subAlert: '' });
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

  onStatusFilterChange() { }

  onPriorityFilterChange() { }

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
    if (event.event?.target instanceof HTMLElement && event.event?.target.classList.contains('btn-edit')) {
      this.showNewRequestModal = true;
      this.currentRequest = event.data;
    }

    if (event.event?.target instanceof HTMLElement && event.event?.target.classList.contains('btn-open')) {
      this.showAssignDialog = true;
      this.dialog.open(AssignRequestComponent, {
        data: event.data
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
      getRows: (params: any) => {
        const pageSize = params.request.endRow - params.request.startRow;
        const pageNumber = params.request.startRow / pageSize + 1;

        this.request_service
          .getHelpDeskRequests({
            ...this.currentSite,
            ...this.filterForm.value,
            page: pageNumber,
            pageSize: pageSize,
          })
          .subscribe((res: any) => {
            handleResponse(params, res, pageSize, res?.serviceRequestList);

          });
      }
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
  template: `
  <section>
    <header class="dialog-header">
      <a>Assign Service Request</a>
      <a mat-dialog-close>Close</a>
    </header>
    
    <main>
      <form [formGroup]="assignForm">
        <div class="mb-3">
          <label for="assignee">Assign To:</label>
          <select id="assignee" formControlName="assignee">
            @for(user of usersList; track user) {
              <option [value]="user.userId">{{ user.userName }}</option>
            }
          </select>
        </div>
        
        <div class="mb-3">
          <input type="text" formControlName="comments" placeholder="Comments" />
        </div>
        
        <div class="buttons">
          <button type="button" (click)="assign()">Assign</button>
        </div>
      </form>
    </main>
    
  </section>`,
  styles: [`
    .dialog-header h4{ font-weight: bold; text-align: center; };
    .dialog-header, form { padding: 10px;};
    .buttons { margin-top: 15px; text-align: "center" };
    .buttons button { margin-right: 10px; };
    main {
      width: 500px;
      height: 500px;
      overflow-y: auto;
    }
    `],
  imports: [FormsModule, ReactiveFormsModule, MatDialogClose, CommonModule],
})

export class AssignRequestComponent {
  @Input() requestData: any;
  assignForm: FormGroup;

  usersList = [
    { userId: 1, userName: 'John Doe' },
    { userId: 2, userName: 'Jane Smith' }
  ];

  constructor(
    private fb: FormBuilder,
    private request_service: RequestService
  ) {
    this.assignForm = this.fb.group({
      assignee: [''],
      comments: ['']
    });
  }

  assign() {
    const formData = this.assignForm.value;
  }

}