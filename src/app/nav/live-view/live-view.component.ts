import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SanitizePipe } from '../../../utilities/pipes/sanitize.pipe';
import { DummyPlrComponent } from '../../../utilities/components/dummy-plr/dummy-plr.component';
import { VideoPlrComponent } from '../../../utilities/components/video-plr/video-plr.component';
import { GlobalClickDirective } from '../../../utilities/directives/global-click.directive';
import { ConfigService } from '../../../utilities/services/config.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-live-view',
  imports: [
    MatGridListModule,
    MatMenuModule,
    MatInputModule,
    SanitizePipe,
    FormsModule,
    ReactiveFormsModule,
    VideoPlrComponent,
    CommonModule,
    DummyPlrComponent,
    GlobalClickDirective
  ],
  templateUrl: './live-view.component.html',
  styleUrl: './live-view.component.css'
})
export class LiveViewComponent implements OnInit, OnDestroy {

  // @HostListener('click', ['$event'])
  // onClick() {
  //   this.opensiteDialog == true ? this.opensiteDialog = false : null;
  // }

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

  constructor(
    public configSrvc: ConfigService,
    private storage_service: StorageService
  ) { }

  private destroy$ = new Subject<void>();

  searchText: any;
  data: any;
  @ViewChild('gridContainer') gridContainer!: ElementRef;
  ngOnInit() {
    this.storage_service.siteData$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.sitesList = res.sites
        }
      })
  }

  selectedGrid!: number;
  camerasList: any = [];
  newCamerasList: any = [];
  ngAfterViewInit() {
    // this.configSrvc.numberFromSub.subscribe({
    //   next: (res) => {
    //     if (res) {
    //       this.selectedGrid = res.noOfItems;
    //       this.gridContainer.nativeElement.style.gridTemplateColumns = `repeat(${Math.sqrt(res.noOfItems)}, 1fr)`;
    //     }
    //   }
    // });

    this.storage_service.currentSite$.subscribe((res) => {
      this.getCamerasForSiteId(res)
    });
  }

  getCamerasForSiteId(data: any) {
    this.newCamerasList = [];
    this.configSrvc.getCamerasForSiteId(data).subscribe({
      next: (res: any) => {
        this.camerasList = res;
        this.newCamerasList = this.camerasList;
      }
    })
  }

  adjustGrid(count: number): void {
    this.selectedGrid = count;
    this.gridContainer.nativeElement.style.gridTemplateColumns = `repeat(${Math.sqrt(count)}, 1fr)`;
  }



  opensiteDialog: boolean = false;
  openSites() {
    this.opensiteDialog = !this.opensiteDialog
  }

  sitesList!: Array<any>;

  currentCam: any;
  playCurrentCam(item: any) {
    this.configSrvc.numberFromSub.next({ noOfItems: 1 });
    this.currentCam = item;
  }

  loadPrevCam() {
    let index: number = this.camerasList.indexOf(this.currentCam);
    this.currentCam = this.camerasList[index - 1]
  }

  loadNextCam() {
    let index: number = this.camerasList.indexOf(this.currentCam);
    this.currentCam = this.camerasList[index + 1]
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
