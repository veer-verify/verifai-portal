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
import { barChartOptions } from '../../../grid.config';

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
    private fb: FormBuilder
  ) {}

  services: any[] = [];
  today = new Date();
  disabledDates: string[] = [];
  selectedDate: any = null;
  selectedId: any = '';

  ngOnInit() {
    this.chartOptions = {
      ...barChartOptions,
      title: {
        ...barChartOptions.title,
        text: 'Daily Users',
      },
      data: [
        { day: 'MON', users: 30 },
        { day: 'TUE', users: 50 },
        { day: 'WED', users: 40 },
        { day: 'THU', users: 32 },
        { day: 'FRI', users: 29 },
        { day: 'SAT', users: 37 },
      ],
    };
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

  dateFilter = (date: Date | null): boolean => {
    if (!date) return true;

    return !this.disabledDates.some((d: string) => {
      const [y, m, day] = d.split('-').map(Number);
      return (
        y === date.getFullYear() &&
        m === date.getMonth() + 1 &&
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
