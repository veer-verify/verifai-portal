import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
import { Subject, filter, takeUntil } from 'rxjs';
import { gridOptions } from '../../../../grid.config';
import { InsightService } from '../../../../utilities/services/insight.service';
import { StorageService } from '../../../../utilities/services/storage.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { AgGridAngular } from 'ag-grid-angular';
import { GridOptions } from 'ag-grid-community';

ModuleRegistry.registerModules([
  BarSeriesModule,
  CategoryAxisModule,
  LegendModule,
  LineSeriesModule,
  NumberAxisModule,
  DonutSeriesModule,
]);


@Component({
  selector: 'app-site-report',
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
  templateUrl: './site-report.component.html',
  styleUrl: './site-report.component.css'
})
export class SiteReportComponent {

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

  destroy$ = new Subject<void>();
  currentSite: any;
  // today: Date = new Date();

  @Input() fromDate: any;
  @Input() toDate: any;
  @Output() dates = new EventEmitter();
  gridOptions!: GridOptions;
  analyticsData: any = [];
  charts: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fromDate']['firstChange']) return;

    this.storage_service.info$.next('');
    this.analyticsData = [];
    this.charts = [];
    this.insight_service.getNonWorkingDays({ siteId: this.currentSite?.siteId }).subscribe({
      next: (res) => {
        if (res.status === "Success") {
          this.biAnalyticsReport()
        } else {
          this.storage_service.info$.next(res.message);
        }
      }
    })
  }

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
    this.destroy$.next();
    this.destroy$.complete();
  }

  page: string = 'list';
  setPage(page: string) {
    this.page = page;
  }

  getNonWorkingDays() {
    this.storage_service.info$.next('');
    this.analyticsData = [];
    this.charts = [];
    this.insight_service.getNonWorkingDays({ siteId: this.currentSite?.siteId }).subscribe({
      next: (res) => {
        if (res.status === "Success") {
          this.fromDate = new Date(res.LastWorkingDay);
          this.dates.emit({ fromDate: this.fromDate })
          this.biAnalyticsReport();
        } else {
          this.storage_service.info$.next(res.message);
        }
      }
    })
  }

  biAnalyticsReport() {
    this.storage_service.info$.next('');
    this.insight_service.biAnalyticsReport({ siteId: this.currentSite?.siteId, fromDate: this.fromDate, toDate: this.toDate }).subscribe({
      next: (res) => {
        if (res.Status === "Success") {
          this.analyticsData = res.AnalyticsReportList;
          this.generateCharts()
          if (this.analyticsData.length === 0) {
            this.storage_service.info$.next('no data!');
          }
        } else {
          this.storage_service.info$.next('no data!');
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
