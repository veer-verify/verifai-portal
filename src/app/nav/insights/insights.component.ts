import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AgChartOptions } from 'ag-charts-community';

import { GridOptions } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { gridOptions } from '../../../grid.config';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { InsightService } from '../../../utilities/services/insight.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { SiteMapComponent } from './site-map/site-map.component';
import { CameraInsightsComponent } from './camera-insights/camera-insights.component';
import { ErrInfoComponent } from '../../../utilities/components/err-info/err-info.component';
import { SiteReportComponent } from './site-report/site-report.component';
import { filter, Subject, takeUntil } from 'rxjs';
import { AgCharts } from 'ag-charts-angular';
import { ConfigService } from '../../../utilities/services/config.service';
import { LiveAiService } from '../../../utilities/services/live-ai.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-insights',
  imports: [
    CommonModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatMenuModule,
    MatDatepickerModule,
    SiteMapComponent,
    ErrInfoComponent,
    SiteReportComponent,
    AgGridAngular,
    AgCharts,
  ],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.css',
})
export class InsightsComponent implements OnInit, OnDestroy {
  constructor(
    private insight_service: InsightService,
    public storage_service: StorageService,
    public configSrvc: ConfigService,
    private liveAiService: LiveAiService,
    private router: Router,
  ) {}

  columnDefs = [
    {
      field: 'type',
      flex: 2,
      cellRenderer: (params: any) => {
        return `<span class="type-cell">${params.value}</span>`;
      },
    },
    {
      field: 'total',
      flex: 1,
      cellClass: 'count-cell',
    },
  ];

  @ViewChild(SiteReportComponent) child!: SiteReportComponent;
  destroy$ = new Subject<void>();
  currentSite: any;
  cameraId: any = '';
  today = new Date();
  fromDate: any;
  toDate: any;
  fromTime: any;
  toTime: any;
  gridOptions!: GridOptions;
  analyticsData: any = [];
  charts: any[] = [];
  selectedOption: string = 'business';

  ngOnInit(): void {
    this.gridOptions = gridOptions;

    this.storage_service.currentSite$
      .pipe(
        filter((site) => !!site),
        takeUntil(this.destroy$),
      )
      .subscribe((site) => {
        this.currentSite = site;
        this.getCamerasForSiteId(site);
        if (this.selectedOption === 'monitoring') {
          this.getAlertCounts();
        } else {
          this.getNonWorkingDays();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  page: string = 'list';
  setPage(page: string) {
    this.page = page;

    if (page === 'map') return;
    this.onRadioChange();
  }
  goToAlerts(item: any) {
    this.router.navigate(['/dashboard/alerts'], {
      queryParams: {
        label: item.label,
      },
    });
  }
  getDates(data: any) {
    this.fromDate = data.fromDate;
  }
  onRadioChange() {
    this.analyticsData = [];
    if (this.selectedOption === 'monitoring') {
      this.getAlertCounts();
    } else {
      this.getNonWorkingDays();
    }
  }
  alertCounts: any = {};
  getAlertCounts(): void {
    if (!this.currentSite?.siteId) return;

    const date = new Date().toISOString().split('T')[0];

    this.storage_service.info$.next('');
    this.liveAiService.getAlertCounts(this.currentSite.siteId, date).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.storage_service.info$.next('');
          const formatted: any = {};
          res.aiTagCounts?.forEach((item: any) => {
            formatted[item.subAlertTag] = item.subAlertTagCount;
          });
          this.alertCounts = formatted;
        } else {
          this.storage_service.info$.next('no data!');
          this.alertCounts = {};
        }
      },
      error: () => {
        this.storage_service.info$.next('no data!');
        this.alertCounts = {};
      },
    });
  }
  //! downloadReportPDF
  downloadBiReport() {
    if (!this.currentSite?.siteId) {
      this.storage_service.info$.next('site not found!');
      return;
    }

    this.storage_service.info$.next('downloading...');

    this.insight_service
      .downloadBiVerifaiPdf({
        siteId: this.currentSite?.siteId,
        cameraId: this.cameraId,
        fromDate: this.fromDate,
        toDate: this.toDate,
        fromTime: this.fromTime,
        toTime: this.toTime,
      })
      .subscribe({
        next: (blob: Blob) => {
          const fileURL = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = fileURL;

          const from = this.fromDate ? this.fromDate : 'from';
          const to = this.toDate ? this.toDate : 'to';

          a.download = `bi_analytics_report_${this.currentSite?.siteId}_${from}_${to}.pdf`;
          a.click();

          window.URL.revokeObjectURL(fileURL);
          this.storage_service.info$.next('');
        },
        error: () => {
          this.storage_service.info$.next('failed to download report!');
        },
      });
  }

  camList: any = [];
  getCamerasForSiteId(data: any) {
    this.camList = [];
    this.configSrvc.getCamerasForSiteId(data).subscribe({
      next: (res: any) => {
        this.camList = res;
      },
    });
  }

  getNonWorkingDays() {
    this.storage_service.info$.next('loading...');
    this.analyticsData = [];
    this.charts = [];
    this.insight_service
      .getNonWorkingDays({ siteId: this.currentSite?.siteId })
      .subscribe({
        next: (res) => {
          if (res.status === 'Success') {
            this.fromDate = new Date(res.LastWorkingDay)
              .toISOString()
              .split('T')[0];
            this.biAnalyticsReport();
          } else {
            this.storage_service.info$.next(res.message);
          }
        },
      });
  }

  biAnalyticsReport() {
    this.storage_service.info$.next('loading');
    this.insight_service
      .bi_verifai({
        siteId: this.currentSite?.siteId,
        cameraId: this.cameraId,
        fromDate: this.fromDate,
        toDate: this.toDate,
        fromTime: this.fromTime,
        toTime: this.toTime,
      })
      .subscribe({
        next: (res) => {
          if (res.Status === 'Success') {
            this.analyticsData = res.AnalyticsReportList;
            this.generateCharts();
            if (this.analyticsData.length === 0) {
              this.storage_service.info$.next('no data!');
            }
          } else {
            this.storage_service.info$.next('no data!');
          }
        },
      });
  }

  COLORS = [
    '#8B6FE8',
    '#49B882',
    '#E74C3C',
    '#F4B400',
    '#3498DB',
    '#E67E22',
    '#1ABC9C',
  ];
  getColor(index: number, chart: any) {
    return chart.hasData ? this.COLORS[index % this.COLORS.length] : '#E0E0E0';
  }

  generateCharts() {
    this.charts = this.analyticsData.map((section: any) => {
      const originalData = section.data.map((d: any) => ({
        label: d.type,
        value: Number(d.total),
      }));
      const hasData = originalData.some((d: any) => d.value > 0);
      const chartData = hasData
        ? originalData
        : originalData.map((d: any) => ({
            ...d,
            value: 1,
          }));

      return {
        title: section.name,
        hasData,
        originalData,
        options: {
          data: chartData,
          series: [
            {
              type: 'donut',
              angleKey: 'value',
              innerRadiusRatio: 0.65,

              fills: hasData ? this.COLORS : ['#E0E0E0'],

              calloutLabel: {
                enabled: hasData,
              },
            },
          ],
          legend: { enabled: false },
        },
      };
    });
  }
}
