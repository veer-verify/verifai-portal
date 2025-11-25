import { Component, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchPipe } from '../../utilities/pipes/search.pipe';
import { ConfigService } from '../../utilities/services/config.service';
import { StorageService } from '../../utilities/services/storage.service';

@Component({
    selector: 'app-sb-hdr',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        SearchPipe,
        CommonModule
    ],
    templateUrl: './sb-hdr.component.html',
    styleUrl: './sb-hdr.component.css',
        standalone: true,
})
export class SbHdrComponent {

  constructor(
    public configSrvc: ConfigService,
    private http: HttpClient,
    private router: Router,
    private storageSer: StorageService,
  ) { }

  ngOnInit() {
    // this.getSites();
    // this.list_categories()
  }

  showSiteMenu: boolean = false;
  ngAfterViewInit() {
    this.configSrvc.showSiteMenu.subscribe((res) => this.showSiteMenu = res);
  }

  openSitesMenu() {
    this.configSrvc.showSiteMenu.next(true);
  }
  
  searchText!: string;
  sitesList!: Array<any>;
  getSites() {
    this.configSrvc.getSitesListForUserName().subscribe({
      next: (res: any) => {
        this.sitesList = res.sites;
        this.getCamerasForSite(this.sitesList[0]);
      }
    })
  }

  camerasList: Array<any> = new Array();
  currentSite: any;
  devicesData: Array<any> = new Array();
  getCamerasForSite(data: any) {
    // this.camerasList = [];

    this.configSrvc.devices_sub.subscribe((res) => {
      this.devicesData = res;
    });

    this.currentSite = data;
    this.configSrvc.current_site_sub.next(data);
    this.configSrvc.getCamerasForSiteId(data).subscribe({
      next: (res: any) => {
        this.camerasList = res;
      }
    })
  }

}
