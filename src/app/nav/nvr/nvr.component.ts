import { StorageService } from './../../../utilities/services/storage.service';
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ConfigService } from '../../../utilities/services/config.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { gridOptions } from '../../../grid.config';

@Component({
  selector: 'app-nvr',
  imports: [AgGridAngular],
  templateUrl: './nvr.component.html',
  styleUrl: './nvr.component.css'
})
export class NvrComponent {

  private destroy$ = new Subject<void>();

  constructor(
    private config_service: ConfigService,
    private storage_service: StorageService
  ) { }

  rowData: any;
  siteData: any;
  gridOptions!: GridOptions;

  columnDefs = [
    { field: 'siteId' },
    { field: 'siteName' },
    { field: 'nvrSno' },
    { field: 'userId' },
    { field: 'password' },
    { field: 'status' },
  ];

  ngOnInit() {
    this.gridOptions = gridOptions;
    this.storage_service.currentSite$.pipe(takeUntil(this.destroy$), filter((item) => !!item)).subscribe((res: any) => {
      this.siteData = res;
      this.config_service.nvrList(this.siteData).subscribe((res: any) => {
        this.rowData = res.nvrDetails;
      })
    })

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
