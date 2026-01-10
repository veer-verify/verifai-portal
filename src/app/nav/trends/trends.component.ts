import { Component } from '@angular/core';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { StorageService } from '../../../utilities/services/storage.service';
import { InsightService } from '../../../utilities/services/insight.service';
import { FormBuilder, FormGroup, FormsModule, NgControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
// import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-trends',
  imports: [
    MatDatepicker,
    MatDatepickerModule,
    FormsModule,
    MatFormFieldModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './trends.component.html',
  styleUrl: './trends.component.css',
})
export class TrendsComponent {
  constructor(
    private storage_service: StorageService,
    private insight_service: InsightService,
    private fb: FormBuilder
  ) {}


  /* 🔥 REQUIRED FOR HIGHCHARTS */

  services: any[] = [];
  today = new Date();
  disabledDates: string[] = [];
  selectedDate: any = null;
  selectedId: any;


  ngOnInit() {
    this.storage_service.currentSite$.subscribe((res: any) => {
      this.insight_service
        .getNonWorkingDays(res.siteId)
        .subscribe((dateRes: any) => {
          if (dateRes.status === 'Success') {
            this.disabledDates = dateRes.NotWorkingDaysList;
            this.selectedDate = dateRes.LastWorkingDay;

            this.getServices();
          }
        });
    });
  }

  /* ✅ FIXED DATE FILTER */
  dateFilter = (date: Date | null): boolean => {
    if (!date) return true;

    return !this.disabledDates.some((d: string) => {
      const [y, m, day] = d.split('-').map(Number);
      return (
        y === date.getFullYear() &&
        m === date.getMonth() + 1 && // 🔥 FIX
        day === date.getDate()
      );
    });
  };

  getServices() {
    this.storage_service.currentSite$.subscribe((res: any) => {
      this.insight_service
        .getBiAnalyticsResearch(res.siteId, this.selectedDate)
        .subscribe((ser: any) => {
          this.services = ser.AnalyticsList;
          this.selectedId = this.services?.[0]?.serviceId;
        });
    });
  }
}
