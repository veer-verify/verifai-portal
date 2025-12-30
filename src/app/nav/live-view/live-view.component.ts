import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SanitizePipe } from '../../../utilities/pipes/sanitize.pipe';
import { GlobalClickDirective } from '../../../utilities/directives/global-click.directive';
import { ConfigService } from '../../../utilities/services/config.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { StreamComponent } from '../../../utilities/components/stream/stream.component';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../../utilities/services/alert.service';
@Component({
  selector: 'app-live-view',
  imports: [
    MatGridListModule,
    MatMenuModule,
    MatInputModule,
    SanitizePipe,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    GlobalClickDirective,
    StreamComponent,
  ],
  templateUrl: './live-view.component.html',
  styleUrl: './live-view.component.css',
})
export class LiveViewComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  // @HostListener('click', ['$event'])
  // onClick() {
  //   this.opensiteDialog == true ? this.opensiteDialog = false : null;
  // }

  showSites = false;
  searchSite!: string;
  sitesList = []
  siteList: any = []
  showSideSites(){
    this.showSites = true;
    this.siteList = this.storage_service.siteData$.value;
    console.log(this.siteList)
  }

  close(){
    this.showSites= false;
  }

  updateSite(site: any){
    this.showSites = false;
    this.storage_service.currentSite$.next(site);
  }

  gridTypes = [
    {
      label: '1X1',
      noOfItems: 1,
      path: 'icons/grid-1.svg',
    },
    {
      label: '2X2',
      noOfItems: 4,
      path: 'icons/grid-2.svg',
    },
    {
      label: '3X3',
      noOfItems: 9,
      path: 'icons/grid-3.svg',
    },
    {
      label: '4X4',
      noOfItems: 16,
      path: 'icons/grid-4.svg',
    },
    // {
    //   label: '4X5',
    //   noOfItems: 20,
    //   path: 'icons/dot4.svg',
    // },
  ];

  constructor(
    public configSrvc: ConfigService,
    private storage_service: StorageService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private alert_service: AlertService
  ) { }

  private destroy$ = new Subject<void>();

  isChecked: boolean = false;
  paginatedCameraList: any = [];
  searchText: any;
  @ViewChild('gridContainer') gridContainer!: ElementRef;
  ngOnInit(): void {
    this.storage_service.siteData$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.sitesList = res.sites;
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void { }

  camList: any = [];
  tempCamList = [];
  ngAfterViewInit(): void {
    this.storage_service.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {
        this.getCamerasForSiteId(res);
      });
  }

  getCamerasForSiteId(data: any) {
    this.tempCamList = [];
    this.configSrvc.getCamerasForSiteId(data).subscribe({
      next: (res: any) => {
        this.camList = res;
        this.tempCamList = this.camList;
        this.adjustGrid(this.itemsPerPage);
      },
    });
  }

  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalPages: number = 0;
  getPaginatedList(): Array<any> {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.tempCamList.slice(start, end);
  }

  adjustGrid(count: number): void {
    const el = this.gridContainer.nativeElement;

    this.currentPage = 1;
    this.itemsPerPage = count;
    this.totalPages = Math.ceil(this.tempCamList.length / this.itemsPerPage);
    el.style.gridTemplateColumns = `repeat(${Math.ceil(
      Math.sqrt(count)
    )}, 1fr)`;
  }

  btnIndex!: number;

  playSiren1(data: any) {
    this.http
      .get(`${environment.sitesUrl}/play_1_0/${data.cameraId}`)
      .subscribe(
        (res: any) => {
          this.btnIndex = -1;
          if (res.statusCode === 200) {
            this.alert_service.success(res.message);
          } else {
            this.alert_service.error(res.message);
          }
        },
        (err: HttpErrorResponse) => {
          this.btnIndex = -1;
          this.alert_service.error('Failed');
        }
      );
  }

  change = true;
  navigate(type: string) {
    this.selectedCam = '';
    this.change = false;
    setTimeout(() => {
      this.change = true;
      type === 'next' ? this.currentPage++ : this.currentPage--;
    }, 1000);
  }

  selectedCam: any = '';
  call() {
    this.adjustGrid(1);
    const index = this.camList.findIndex((el: any) => el.cameraId === this.selectedCam);
    this.change = false;
    setTimeout(() => {
      this.change = true;
      this.currentPage = index + 1
    }, 1000)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
