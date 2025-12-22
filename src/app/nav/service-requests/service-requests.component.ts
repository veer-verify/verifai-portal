import { HeaderComponent } from './../../header/header.component';
import { Component, Input, forwardRef } from '@angular/core';
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
import { AddRequestComponent } from './add-request/add-request.component';
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
import { MatDialog, MatDialogClose } from '@angular/material/dialog';

@Component({
  selector: 'app-service-requests',
  imports: [
    AddRequestComponent,
    AgGridAngular,
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
    forwardRef(() => AssignRequestComponent)
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
    private fb: FormBuilder,
    private dialog: MatDialog
  ) { }

  currentSite: any;
  incidentdata: any = [];
  isChecked: boolean = false;
  camerasList: any = [];
  actionTags: any = [];
  // dialog: any;

  gridApi!: GridApi;
  datasource!: IServerSideDatasource;
  gridOptions: any;
  categoryList: any = [];
  subcategoryList: any = [];
  showAssignDialog: boolean = false;

  ngOnInit() {
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

      this.storage_service.siteData$.subscribe((sites:any)=>{
        // console.log('Sites Data:', sites);
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
        cellRenderer: () => '<button class="btn-open">Open</button>'
      },
      {
        field: 'edit',
        cellRenderer: () => '<button class="btn-edit">Edit</button>',
        editable: false,
        sort: false,
        disabled: true
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

  editRequest(){
    this.showNewRequestModal = true;
  }

  loadCategories(){
    this.request_service.getHelpDeskCategories().subscribe({
      next: (res: any) => {
        this.categoryList = res.categoryList;
        // console.log('Categories:', this.categoryList);
      }
    });
  }

  filterSubs(){
    const selectCatId = Number(this.filterForm.get('serviceCategory')?.value);
    this.subcategoryList = this.categoryList.find((cat: any)=> cat.catId === selectCatId)?.subCategoryList || [];
    this.filterForm.patchValue({ subAlert: '' });
    // console.log('Subcategories:', this.subcategoryList);
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
    // console.log(this.gridApi);
  }

  showNewRequestModal: boolean = false;

  openNewRequestModal() {
    this.showNewRequestModal = true;
  }

  closeNewRequestModal() {
    this.showNewRequestModal = false;
    this.refreshGrid();
  }

  currentRequest :any;
  onCellClicked(event: CellClickedEvent) {
    if (
      event.event?.target instanceof HTMLElement &&
      event.event?.target.classList.contains('btn-open')
    ) {
      // this.dialog.open(MediaDialogComponent, { data: event.data });
    }

    if(event.event?.target instanceof HTMLElement && event.event?.target.classList.contains('btn-edit')){
      this.showNewRequestModal = true;
      this.currentRequest = event.data;
    }

    if(event.event?.target instanceof HTMLElement && event.event?.target.classList.contains('btn-open')){
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

  // filterObj = {
  //   cameraId: '',
  //   actionTag: '',
  //   fromDate: '',
  //   toDate: '',
  // };
  createDatasource() {
    console.log('Filter Values:', this.filterForm.value);
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

@Component({
  imports: [FormsModule, ReactiveFormsModule, MatDialogClose],
  selector: 'app-assign-request',
  template: `<div class="assign-dialog">
    <div class="dialog-header">
  <h4>Assign Service Request</h4>
</div>
  <form [formGroup]="assignForm">
    <label for="assignee">Assign To:</label>
    <select id="assignee" formControlName="assignee">
      <option *ngFor="let user of usersList" [value]="user.userId">{{ user.userName }}</option>
    </select>
    <input type="text" formControlName="comments" placeholder="Comments" />
    <div class="buttons">
      <button type="button" (click)="assign()">Assign</button>
      <button type="button" mat-dialog-close>Cancel</button>
    </div>
    </form>
  </div>`,
  styles: [`
    .dialog-header h4{ font-weight: bold; text-align: center; }
    .dialog-header, form { padding: 10px;}
    .buttons { margin-top: 15px; }
    .buttons button { margin-right: 10px; }
  `]
})
export class AssignRequestComponent {
  @Input() requestData: any;
  // @Input() closeAssignDialog: () => void;
  assignForm: FormGroup;
  usersList = [
    { userId: 1, userName: 'John Doe' },
    { userId: 2, userName: 'Jane Smith' }
  ];
  constructor(private fb: FormBuilder, private request_service: RequestService) {
    this.assignForm = this.fb.group({
      assignee: [''],
      comments: ['']
    });
  }
  assign() {
    const formData = this.assignForm.value;
    console.log('Assigning request', this.requestData.serviceReqId, 'to user', formData.assignee);
    // Call service to assign request
    // this.close();
  }
  // close() {
  //   if (this.closeDialog) {
  //     this.closeDialog();
  //   }
  // }
}