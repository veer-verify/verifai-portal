import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Output, signal, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCard } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { CountPipe } from '../../utilities/pipes/count.pipe';
import { SearchPipe } from '../../utilities/pipes/search.pipe copy';
import { ConfigService } from '../../utilities/services/config.service';
import { StorageService } from '../../utilities/services/storage.service';

@Component({
    selector: 'app-sub-header',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        SearchPipe,
        MatSelectModule,
        MatOptionModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        AsyncPipe,
        MatIconModule,
        CommonModule,
        CountPipe,
        MatPaginatorModule,
        MatExpansionModule,
        MatCard,
        MatMenuModule
    ],
    templateUrl: './sub-header.component.html',
    styleUrl: './sub-header.component.css',
        standalone: true,
})
export class SubHeaderComponent {

  searchText: any;

  show: boolean = false
  readonly panelOpenState = signal(this.show);

  gridTypes = [
    {
      label: '1*1',
      noOfItems: 1,
      path: 'icons/dot-1.svg'
    },
    {
      label: '2*2',
      noOfItems: 4,
      path: 'icons/dot-2.svg'
    },
    {
      label: '3*3',
      noOfItems: 9,
      path: 'icons/grid.svg'
    },
    {
      label: '4*4',
      noOfItems: 16,
      path: 'icons/dot4.svg'
    }
  ];

  filteredOptions: any;
  constructor(
    public configSrvc: ConfigService,
    private http: HttpClient,
    private router: Router,
    private storageSer: StorageService,
  ) { }

  filterData: boolean = false;
  openFilter() {
    this.filterData = !this.filterData
  }
  ngOnInit() {
    // this.genericAdsInfo()
    // this.getSites();
    // this.list_categories()
  }

  currentUrl: any
  ngDoCheck() {
    this.currentUrl = this.router.url.split('/')[2];
  }


  genericAdsInfoData: any
  genericAdsInfo() {
    // this.configSrvc.genericAdsInfo().subscribe({
    //   next: (res: any) => {
    //     // console.log(res);
    //     this.genericAdsInfoData = res;
    //     this.configSrvc.dataFromSubheader.next(res.genericAds);
    //   }
    // })
  }

  ngAfterViewInit() {

  }

  /* searches */
  siteSearch: any;
  searchSites(event: any) {
    this.siteSearch = (event.target as HTMLInputElement).value;
  }

  getUrl(data: any, camData: any) {
    this.http.get(data).subscribe(res => {
    }, (err) => {
      if (err.status === 200) {
        camData.videoUrl = err.url;
      } else {
        camData.videoUrl = null;
      }
    });
  }

  opensiteDialog: boolean = false;
  openSites() {
    this.opensiteDialog = !this.opensiteDialog;
  }

  sitesList!: Array<any>;
  getSites() {
    this.configSrvc.getSitesListForUserName().subscribe({
      next: (res: any) => {
        this.sitesList = res.sites;
        this.getCamerasForSite(this.sitesList[0]);
      }
    })
  }

  camerasList: any = [];
  currentSite: any;
  devicesData: any = [];
  getCamerasForSite(data: any) {
    this.camerasList = [];

    this.configSrvc.devices_sub.subscribe((res) => {
      this.devicesData = res;
    });

    this.currentSite = data;
    this.configSrvc.current_site_sub.next(data);
    this.configSrvc.getCamerasForSiteId(data).subscribe({
      next: (res: any) => {
        this.camerasList = res;
        this.currentCam = this.camerasList[0];
        this.configSrvc.dataFromSubheader.next(res);
        // this.configSrvc.paginated_cam_sub.next(this.getCurrentItems())

        this.changePage(1);
        this.changeGrid({
          label: this.gridTypes[2].label,
          noOfItems: this.gridTypes[2].noOfItems,
          path: this.gridTypes[2].path
        });

        this.configSrvc.numberFromSub.subscribe({
          next: (res: any) => {
            this.selectedGrid = res.noOfItems;
          }
        });
      }
    })
  }

  currentgridIcon: any;
  selectedGrid!: number;
  noOfPages!: number;
  pagesList: Array<any> = new Array();
  currentPage!: number;
  changeGrid(item: any) {
    this.currentPage = 1;
    this.currentgridIcon = item.path;
    this.configSrvc.numberFromSub.next(item);
    this.noOfPages = Math.round(this.camerasList.length / item.noOfItems);
    this.pagesList = new Array(Math.round(this.camerasList.length / item.noOfItems)).fill(0).map((item, index) => index + 1);
  }

  changePage(page: number) {
    this.currentPage = Number(page);
  }

  prevPage(): void {
    // if (this.currentPage > 1) {
    //   this.currentPage--;
    // }
    this.currentPage--;
  }

  nextPage(): void {
    // const maxPages = Math.ceil(this.noOfPages / this.camerasList.length);
    // if (this.currentPage < maxPages) {
    //   this.currentPage++;
    // }
    this.currentPage++;
  }

  getCurrentItems(): any {
    let startIndex = (this.currentPage - 1) * this.selectedGrid;
    let endIndex = startIndex + this.selectedGrid;
    return this.camerasList.slice(startIndex, endIndex);
  }

  currentCam: any;
  playCurrentCam(item: any) {
    this.currentCam = item;
  }

  loadPrevCam() {
    let index: number = this.camerasList.indexOf(this.currentCam);
    this.currentCam = this.camerasList[index - 1];
  }

  loadNextCam() {
    let index: number = this.camerasList.indexOf(this.currentCam);
    this.currentCam = this.camerasList[index + 1];
  }


  listCategoriesData: any;
  list_categories() {
    // this.configSrvc.list_categories().subscribe({
    //   next: (res: any) => {
    //     // console.log(res)
    //     this.listCategoriesData = res.rules;
    //   }

    // })
  }

  getType(type: any) {
    return this.storageSer.getType(type)[0].metadata;
  }


}
