import { StorageService } from './../../../utilities/services/storage.service';
import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ConfigService } from '../../../utilities/services/config.service';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-nvr',
  imports: [AgGridAngular],
  templateUrl: './nvr.component.html',
  styleUrl: './nvr.component.css'
})
export class NvrComponent {

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

    this.storage_service.currentSite$.subscribe((res: any)=>{
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

}
