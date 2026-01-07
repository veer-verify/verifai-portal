import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgClass } from '@angular/common';
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
import { filter } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AlertService } from '../../../utilities/services/alert.service';

@Component({
  selector: 'app-timelapse',
  imports: [
    NgClass,
    MatDatepickerModule,
    MatFormField,
    MatLabel,
    MatInputModule,
    MediaPipe,
    AsyncPipe,
    ReactiveFormsModule,
  ],
  providers: [provideNativeDateAdapter(), MediaPipe],
  templateUrl: './timelapse.component.html',
  styleUrl: './timelapse.component.css',
})
export class TimelapseComponent {
  constructor(
    private config_service: ConfigService,
    private auth_service: AuthService,
    private storage_service: StorageService,
    private fb: FormBuilder,
    private alert_service: AlertService
  ) { }
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
    this.initForm()
    this.storage_service.currentSite$.pipe(filter((res) => !!res)).subscribe({
      next: (res: any) => {
        this.siteData = res;
        this.siteName = res.siteName;
        this.config_service.listTimeLapseVideos(res).subscribe((tlres: any) => {
          if (tlres.statusCode === 200) {
            this.tldata = tlres.timeLapseList;
          }
          this.config_service
            .getCamerasForSiteId(res)
            .subscribe((camRes: any) => {
              this.camList = camRes;
            });
        });
      },
    });
  }

  initForm() {
    this.tlFilterForm = this.fb.group({
      cam: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  openPicker(input: HTMLInputElement) {
    setTimeout(() => {
      if (input.showPicker) input.showPicker();
    });
  }

  tlview(id: number) {
    this.currentTl = this.tldata[id];
    console.log(this.currentTl);
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
    // console.log(this.tlFilterForm.value);
    const today = new Date()
    if(this.tlFilterForm.get('endDate')?.value > today){
      this.alert_service.error("Please Select a Valid Date");
      return;
    }

    if(this.tlFilterForm.get('startDate')?.value > this.tlFilterForm.get('endDate')?.value){
      this.alert_service.error("Please Select a Valid Date-Range");
      return;
    }
    let {
      cam: cameraId,
      startDate: fromDate,
      endDate: toDate
    } = this.tlFilterForm.value;

    console.log({ cameraId, fromDate, toDate })
    if (cameraId === 'ALL') {
      cameraId = null;
      // console.log(this.tlFilterForm.value);
      this.config_service.listTimeLapseVideos({
        siteId: this.siteData.siteId,
        cameraId,
        fromDate,
        toDate
      }).subscribe((res: any) => {
        this.tldata = res.timeLapseList;
      })
    }
    else {
      this.config_service.listTimeLapseVideos({
        siteId: this.siteData.siteId,
        cameraId,
        fromDate,
        toDate
      }).subscribe((res: any) => {
        this.tldata = res.timeLapseList;
      })
    }
  }
}
