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
import { AgCharts } from 'ag-charts-angular';
import {
  AgBarSeriesOptions,
  AgCategoryAxisOptions,
  AgChartCaptionOptions,
  AgChartLegendOptions,
  AgChartOptions,
  AgChartSubtitleOptions,
  AgLineSeriesOptions,
  AgNumberAxisOptions,
  BarSeriesModule,
  CategoryAxisModule,
  LegendModule,
  LineSeriesModule,
  ModuleRegistry,
  NumberAxisModule,
} from 'ag-charts-community';
import { filter } from 'rxjs';
import { gridOptions } from '../../../grid.config';
import { TitleCasePipe } from '@angular/common';

ModuleRegistry.registerModules([
  BarSeriesModule,
  CategoryAxisModule,
  LegendModule,
  LineSeriesModule,
  NumberAxisModule,
]);

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
    AgCharts,
  ],
  templateUrl: './trends.component.html',
  styleUrl: './trends.component.css',
})
export class TrendsComponent {
  public chartOptions!: AgChartOptions;
  public chartOptions2!: AgChartOptions;

  analyticsList: any = [];
  customView = false;

  constructor(
    private storage_service: StorageService,
    private insight_service: InsightService,
    private fb: FormBuilder,
  ) {
    this.chartOptions = {
      title: {
        text: 'Daily Users',
        fontSize: 18,
        textAlign: 'left',
        fontWeight: 800,
        fontFamily: 'Neometric Regular',
        color: '#33333396',
      },
      data: [
        { day: 'MON', users: 30 },
        { day: 'TUE', users: 50 },
        { day: 'WED', users: 40 },
        { day: 'THU', users: 32 },
        { day: 'FRI', users: 29 },
        { day: 'SAT', users: 37 },
      ],
      series: [
        {
          type: 'line',
          xKey: 'day',
          yKey: 'users',
          stroke: '#ed3237',
          strokeWidth: 3,
          marker: {
            enabled: true,
            fill: '#ed3237', // dot border
            size: 8,
          },
          interpolation: {
            type: 'smooth',
          },
        },
      ],
    };
    this.chartOptions2 = {
      title: {
        text: 'Daily Users',
        fontSize: 18,
        textAlign: 'left',
        fontWeight: 800,
        fontFamily: 'Neometric Regular',
        color: '#33333396',
      },
      data : [
        { day: 'MON 08', users: 28 },
        { day: 'MON 10', users: 30 },
        { day: 'MON 12', users: 33 },
        { day: 'MON 14', users: 36 },
        { day: 'MON 16', users: 34 },
        { day: 'MON 18', users: 32 },

        { day: 'TUE 08', users: 45 },
        { day: 'TUE 10', users: 48 },
        { day: 'TUE 12', users: 50 },
        { day: 'TUE 14', users: 53 },
        { day: 'TUE 16', users: 51 },
        { day: 'TUE 18', users: 49 },

        { day: 'WED 08', users: 38 },
        { day: 'WED 10', users: 40 },
        { day: 'WED 12', users: 42 },
        { day: 'WED 14', users: 44 },
        { day: 'WED 16', users: 43 },
        { day: 'WED 18', users: 41 },

        { day: 'THU 08', users: 30 },
        { day: 'THU 10', users: 32 },
        { day: 'THU 12', users: 34 },
        { day: 'THU 14', users: 33 },
        { day: 'THU 16', users: 31 },
        { day: 'THU 18', users: 30 },

        { day: 'FRI 08', users: 27 },
        { day: 'FRI 10', users: 29 },
        { day: 'FRI 12', users: 31 },
        { day: 'FRI 14', users: 33 },
        { day: 'FRI 16', users: 32 },
        { day: 'FRI 18', users: 30 },

        { day: 'SAT 08', users: 35 },
        { day: 'SAT 10', users: 37 },
        { day: 'SAT 12', users: 39 },
        { day: 'SAT 14', users: 41 },
        { day: 'SAT 16', users: 40 },
        { day: 'SAT 18', users: 38 },
      ],

      series: [
        {
          type: 'line',
          xKey: 'day',
          yKey: 'users',
          stroke: '#ed3237',
          strokeWidth: 3,
          marker: {
            enabled: true,
            fill: '#ed3237', // dot border
            size: 8,
          },
          interpolation: {
            type: 'smooth',
          },
        },
      ],
    };
  }

  /* 🔥 REQUIRED FOR HIGHCHARTS */

  services: any[] = [];
  today = new Date();
  disabledDates: string[] = [];
  selectedDate: any = null;
  selectedId: any = '';

  ngOnInit() {
    this.storage_service.currentSite$
      .pipe(filter((site) => !!site))
      .subscribe((res: any) => {
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
          this.analyticsList = ser.AnalyticsList.filter((serv: any) => {
            return serv.serviceId === this.selectedId;
          })[0].analytics;
          console.log(this.analyticsList);
          console.log(this.selectedId);
        });
    });
  }

  changeView() {
    this.customView = !this.customView;
  }
}
