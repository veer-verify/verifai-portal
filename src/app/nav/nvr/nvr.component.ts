import { StorageService } from './../../../utilities/services/storage.service';
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ConfigService } from '../../../utilities/services/config.service';
import { ColDef } from 'ag-grid-community';
import { Observable, Subject, takeUntil } from 'rxjs';

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
  ){}

  rowData: any;
  siteData: any;

  columnDefs = [
    { field: 'siteId' },
    { field: 'siteName' },
    { field: 'nvrSno' },
    { field: 'userId' },
    { field: 'password' },
    { field: 'status' },
  ];

  ngOnInit(){
    this.storage_service.currentSite$.pipe(takeUntil(this.destroy$)).subscribe((res: any)=>{
      this.siteData = res;
      this.config_service.nvrList(this.siteData).subscribe((res:any)=>{
        this.rowData = res.nvrDetails;
      })
    })

  }

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1
  };

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

}
