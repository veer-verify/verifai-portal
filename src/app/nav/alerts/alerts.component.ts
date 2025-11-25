import { Component, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatError } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatInput, MatInputModule } from '@angular/material/input';
import { CommonModule,  } from '@angular/common';
import { ConfigService } from '../../../utilities/services/config.service';
import { StorageService } from '../../../utilities/services/storage.service';
@Component({
    selector: 'app-alerts',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatOption,
        MatSelectModule,
        MatDatepickerModule,
        MatInputModule,
        CommonModule
    ],
    templateUrl: './alerts.component.html',
    styleUrl: './alerts.component.css',
    standalone: true
})
export class AlertsComponent {
[x: string]: any;

  constructor(
    private config: ConfigService,
    private storageSrvc: StorageService,
    private configSrvc:ConfigService
  ) {}


  ngOnInit() {
    this.incidentList()
    // console.log(this.storageSrvc.getType(2))
    this.getSites()
  }


  camerasList: any = [];
  currentSite: any;
  getCamerasForSite(data: any) {
    // console.log(data)
    this.configSrvc.getCamerasForSiteId(data).subscribe({
      next: (res: any) => {
        // console.log(res)
        this.camerasList = res;
      }
    })
  }

  sitesList!: Array<any>;
  getSites() {
    this.config.getSitesListForUserName().subscribe({
      next: (res: any) => {
        // console.log(res);
        this.sitesList = res.sites;
        this.getCamerasForSite(this.sitesList[0])
        // this.sitesList.forEach((item: any) => {
        //   item.isOpen = false;
        // })
      }
    })
  }


  getType(type: any) {
    return this.storageSrvc.getType(type)[0].metadata
  }

  newIncidentListData: any;
  incidentListData:any 
  incidentList(item?:any) {
    this.config.incidentList(item).subscribe({
      next:(res:any)=> {
        // console.log(res);
        if(res.statusCode == 200) {
          this.incidentListData = res.IncidentList;
          this.newIncidentListData = this.incidentListData

        }
      } 
    })
  }


 commonsUrl: string = 'http://usstaging.ivisecurity.com:8080/common/downloadFile_1_0?requestName=incidents&assetName='
  currentItem:any
  openVideoData(item:any) {
    // console.log(item)
    this.currentItem = item
    this.currentItem.fullFileUrls = this.currentItem.files.map((file: string) => `${this.commonsUrl}${file}`);

    // Display the dialog
    var x = <HTMLElement>document.getElementById('playModel');
    x.style.display = "block";
  }

  closeDialog() {
    const dialogElement = document.getElementById('playModel') as HTMLElement;
    dialogElement.style.display = 'none';
  }

  




    sorted = false;
    sort(label: any) {
      this.sorted = !this.sorted;
      var x = this.newIncidentListData;
      if (this.sorted == false) {
        x.sort((a: string, b: string) => a[label] > b[label] ? 1 : a[label] < b[label] ? -1 : 0);
      } else {
        x.sort((a: string, b: string) => b[label] > a[label] ? 1 : b[label] < a[label] ? -1 : 0);
      }
    }


}
