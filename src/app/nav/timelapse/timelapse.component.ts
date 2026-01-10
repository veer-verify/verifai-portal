import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatePipe, NgClass, NgIf, UpperCasePipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ConfigService } from '../../../utilities/services/config.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { AuthService } from '../../auth/auth.service';
import { MediaPipe } from '../../../utilities/pipes/media.pipe';
import { AsyncPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { filter, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-timelapse',
  imports: [
    NgClass,
    MatDatepickerModule,
    MatInputModule,
    MediaPipe,
    AsyncPipe,
    ReactiveFormsModule,
    DatePipe,
    UpperCasePipe
  ],
  providers: [provideNativeDateAdapter(), MediaPipe],
  templateUrl: './timelapse.component.html',
  styleUrl: './timelapse.component.css',
})
export class TimelapseComponent {

  constructor(
    private config_service: ConfigService,
    private auth_service: AuthService,
    public storage_service: StorageService,
    private fb: FormBuilder
  ) { }

  destroy$ = new Subject();

  today = new Date();
  drop = false;
  tldata: any = [];
  currentTl: any = null;
  siteName: any = '';
  index: number = 0;
  camList: any = [];
  siteData: any;
  environment =
    environment.commonDownUrl +
    '/downloadFile_1_0?requestName=incidents&assetName=';

  tlFilterForm!: FormGroup;
  toggleDrop() {
    this.drop = !this.drop;
  }

  ngOnInit() {
    this.initFilterForm();
    this.storage_service.info$.next('');
    this.storage_service.currentSite$.pipe(filter((res) => !!res), takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.siteData = res;
        this.siteName = res.siteName;
        this.listTimeLapseVideos();
        this.config_service
          .getCamerasForSiteId(res)
          .subscribe((camRes: any) => {
            this.camList = camRes;
          });


      },
    });
  }

  initFilterForm() {
    this.tlFilterForm = this.fb.group({
      cam: [''],
      fromDate: [''],
      toDate: [''],
    });
  }
  listTimeLapseVideos() {
    this.config_service
      .listTimeLapseVideos({ ...this.siteData, ...this.tlFilterForm.value })
      .subscribe((tlres: any) => {
        if (tlres.statusCode === 200) {
          this.tldata = tlres.timeLapseList;
        } else {
          this.storage_service.info$.next('no data found!');
          this.tldata = []
        }
      });
  }


  openPicker(input: HTMLInputElement) {
    setTimeout(() => {
      if (input.showPicker) input.showPicker();
    });
  }

  tlview(id: number) {
    this.currentTl = this.tldata[id];
    this.index = id + 1;
  }

  gototl(pnum: number) {
    if (pnum > 0 && pnum < this.tldata.length) {
      this.currentTl = this.tldata[pnum - 1];
      this.index = pnum;
    }
  }

  close() {
    this.currentTl = null;
    this.index = 0;
  }

  filterTimeLapseList() {
    this.listTimeLapseVideos();
    // let {
    //   cam: cameraId,
    //   startDate: fromDate,
    //   endDate: toDate
    // } = this.tlFilterForm.value;

    // if (cameraId === 'ALL') {
    //   cameraId = null;
    //   this.config_service.listTimeLapseVideos({
    //     siteId: this.siteData.siteId,
    //     cameraId,
    //     fromDate,
    //     toDate
    //   }).subscribe((res: any) => {
    //     if (res.statusCode === 200) {
    //       this.tldata = res.timeLapseList;
    //     }
    //   })
    // }
    // else {
    //   this.config_service.listTimeLapseVideos({
    //     siteId: this.siteData.siteId,
    //     cameraId,
    //     fromDate,
    //     toDate
    //   }).subscribe((res: any) => {
    //     if (res.statusCode === 200) {
    //       this.tldata = res.timeLapseList;
    //     }
    //   })
    // }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

}
