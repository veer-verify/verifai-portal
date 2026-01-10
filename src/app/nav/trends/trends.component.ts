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
import { AgCharts } from "ag-charts-angular";
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
} from "ag-charts-community";
import { filter } from 'rxjs';

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
    AgCharts
  ],
  templateUrl: './trends.component.html',
  styleUrl: './trends.component.css',
})
export class TrendsComponent {
  public chartOptions!: AgChartOptions;


  constructor(
    private storage_service: StorageService,
    private insight_service: InsightService,
    private fb: FormBuilder
  ) {
    this.chartOptions = {
      // Chart Title
      title: { text: "Ice Cream Sales and Avg Temp" } as AgChartCaptionOptions,
      // Chart Subtitle
      subtitle: { text: "Data from 2022" } as AgChartSubtitleOptions,
      // Data: Data to be displayed within the chart
      data: [
        { month: "Jan", avgTemp: 2.3, iceCreamSales: 162000 },
        { month: "Mar", avgTemp: 6.3, iceCreamSales: 302000 },
        { month: "May", avgTemp: 16.2, iceCreamSales: 800000 },
        { month: "Jul", avgTemp: 22.8, iceCreamSales: 1254000 },
        { month: "Sep", avgTemp: 14.5, iceCreamSales: 950000 },
        { month: "Nov", avgTemp: 8.9, iceCreamSales: 200000 },
      ],
      // Series: Defines which chart type and data to use
      series: [
        {
          type: "bar",
          xKey: "month",
          yKey: "iceCreamSales",
          yName: "Ice Cream Sales",
          // Optional Y Axis Key, to link series to an axis, with better code readability
          yKeyAxis: "priceAxis",
        } as AgBarSeriesOptions,
        {
          type: "line",
          xKey: "month",
          yKey: "avgTemp",
          yName: "Average Temperature (°C)",
          // Optional Y Axis Key, to link series to an axis, with better code readability
          yKeyAxis: "temperatureAxis",
        } as AgLineSeriesOptions,
      ],
      // Axes: Configure the axes for the chart
      axes: {
        // Use left axis for 'iceCreamSales' series, referencing the yKeyAxis value
        priceAxis: {
          type: "number",
          position: "left",
          // Format the label applied to this axis
          label: {
            formatter: (params) => {
              return parseFloat(params.value).toLocaleString();
            },
          },
        } as AgNumberAxisOptions,
        // Use right axis for 'avgTemp' series, referencing the yKeyAxis value
        temperatureAxis: {
          type: "number",
          position: "right",
          // Format the label applied to this axis (append ' °C')
          label: {
            formatter: (params) => {
              return params.value + " °C";
            },
          },
        } as AgNumberAxisOptions,
      },
      // Legend: Matches visual elements to their corresponding series or data categories.
      legend: {
        position: "right",
      } as AgChartLegendOptions,
    };
  }


  /* 🔥 REQUIRED FOR HIGHCHARTS */

  services: any[] = [];
  today = new Date();
  disabledDates: string[] = [];
  selectedDate: any = null;
  selectedId: any;


  ngOnInit() {
    this.storage_service.currentSite$.pipe(filter((site) => !!site)).subscribe((res: any) => {
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
