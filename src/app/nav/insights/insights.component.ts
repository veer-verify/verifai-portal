import { Component, OnDestroy, OnInit } from '@angular/core';
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
  DonutSeriesModule,
} from 'ag-charts-community';

import {
  CellClickedEvent,
  ColDef,
  GridOptions,
  GridReadyEvent,
  IServerSideDatasource,
  themeQuartz,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { gridOptions } from '../../../grid.config';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { PaginationComponent } from '../../../utilities/components/pagination/pagination.component';
import { InsightService } from '../../../utilities/services/insight.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { filter, Subject, takeUntil } from 'rxjs';

ModuleRegistry.registerModules([
  BarSeriesModule,
  CategoryAxisModule,
  LegendModule,
  LineSeriesModule,
  NumberAxisModule,
  DonutSeriesModule,
]);

@Component({
  selector: 'app-insights',
  imports: [
    AgCharts,
    AgGridAngular,
    CommonModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridAngular,
    MatDialogModule,
    MatMenuModule,
    MatDatepickerModule,
  ],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.css',
})
export class InsightsComponent implements OnInit, OnDestroy {
  public chartOptions!: AgChartOptions;

  constructor(
    private insight_service: InsightService,
    public storage_service: StorageService
  ) { }

  columnDefs = [
    {
      field: 'type',
      flex: 2,
      cellRenderer: (params: any) => {
        return `<span class="type-cell">${params.value}</span>`
      }
    },
    {
      field: 'total',
      flex: 1,
      cellClass: 'count-cell'
    }
  ];

  private destroy$ = new Subject<void>();
  currentSite: any;
  fromDate: Date = new Date();
  toDate: Date = new Date();
  gridOptions!: GridOptions;
  analyticsData: any = [];
  charts: any[] = [];

  ngOnInit(): void {
    this.gridOptions = gridOptions;

    this.storage_service.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$)
      )
      .subscribe((site) => {
        this.currentSite = site;
        this.getNonWorkingDays();
      });
  }

  ngOnDestroy(): void {

  }

  getNonWorkingDays() {
    this.insight_service.getNonWorkingDays({ siteId: this.currentSite?.siteId }).subscribe({
      next: (res) => {
        if (res.status === "Success") {
          this.fromDate = new Date(res.LastWorkingDay)
          this.biAnalyticsReport()
        }
      }
    })
  }

  biAnalyticsReport() {
    this.insight_service.biAnalyticsReport({ siteId: this.currentSite?.siteId, fromDate: this.fromDate, toDate: this.toDate }).subscribe({
      next: (res) => {
        if (res.Status === "Success") {
          this.analyticsData = res.AnalyticsReportList;
          this.generateCharts()
        }
      }
    })
  }

  generateCharts() {
    this.charts = this.analyticsData.map((section: any) => {

      const chartData = section.data.map((d: any) => ({
        label: d.type,
        value: Number(d.total)
      }));

      return {
        title: section.name,
        options: {
          data: chartData,
          series: [
            {
              type: 'donut',
              angleKey: 'value',
              calloutLabelKey: 'label',
              innerRadiusRatio: 0.6
            }
          ],
          legend: {
            position: 'right'
          }
        }
      };
    });
  }

}
