import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GlobalClickDirective } from '../../../utilities/directives/global-click.directive';
import { ConfigService } from '../../../utilities/services/config.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { delay, filter, Observable, Subject, takeUntil } from 'rxjs';
import { StreamComponent } from '../../../utilities/components/stream/stream.component';
import { AlertService } from '../../../utilities/services/alert.service';
import { MatSelectModule } from '@angular/material/select';
import { gridTypes } from './grid-list';
@Component({
  selector: 'app-live-view',
  imports: [
    MatGridListModule,
    MatMenuModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    GlobalClickDirective,
    StreamComponent,
    MatSelectModule,
  ],
  templateUrl: './live-view.component.html',
  styleUrl: './live-view.component.css',
})
export class LiveViewComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    public configSrvc: ConfigService,
    public storage_service: StorageService,
    private alert_service: AlertService
  ) { }

  @ViewChild('gridContainer') gridContainer!: ElementRef;
  @ViewChildren('gridItem') gridItem!: QueryList<ElementRef>;
  private destroy$ = new Subject<void>();
  _sideNav!: Observable<any>;

  gridTypes: any = [];
  // showSites = false;
  searchSite!: string;
  sitesList: any = [];
  isChecked: boolean = true;
  paginatedCameraList: any = [];
  searchText: any;
  camList: any = [];
  tempCamList = [];
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 0;
  paginatedList: any = [];

  ngOnInit(): void {
    this.gridTypes = gridTypes;
    this._sideNav = this.storage_service.showSideNav$.pipe(delay(100))
    this.storage_service.siteData$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.sitesList = res.sites;
      }
    });
  }

  ngAfterViewInit(): void {
    this.storage_service.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {
        // this.getCamerasForSiteId(res);
        this.tempCamList = [];
        this.storage_service.camData$.subscribe((res) => {
          this.camList = res;
          this.tempCamList = this.camList;
          this.adjustGrid(this.itemsPerPage);
        })
      });
  }

  // getCamerasForSiteId(data: any) {
  //   this.tempCamList = [];
  //   this.configSrvc.getCamerasForSiteId(data).subscribe({
  //     next: (res: any) => {
  //       this.camList = res;
  //       this.tempCamList = this.camList;
  //       this.adjustGrid(this.itemsPerPage);
  //     }
  //   });
  // }

  /**
   * pagination to split the cameras into multiple pages
   */
  pagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedList = this.tempCamList.slice(start, end);
  }

  /**
   * @param count it may be event or number beacuse same function used for different use cases
   * to change layout of cameras in live view
   */
  adjustGrid(count: number | Event): void {
    if (typeof count === 'number') {
      this.currentPage = 1;
      this.itemsPerPage = count;
      this.totalPages = Math.ceil(this.tempCamList.length / this.itemsPerPage);
      const el = this.gridContainer.nativeElement;
      el.style.gridTemplateColumns = `repeat(${Math.ceil(
        Math.sqrt(count)
      )}, 1fr)`;
    } else {
      this.adjustGrid(1);
      const target = count.target as HTMLSelectElement;
      const index = this.camList.findIndex((el: any) => el.cameraId === target.value);
      this.currentPage = index + 1;
    }

    this.pagination();
  }

  /**
   * @param type will return type of action eg: next or preveous
   * to navigate betweeen pages
   */
  navigate(type: string) {
    type === 'next' ? this.currentPage += 1 : this.currentPage -= 1;
    this.pagination()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
