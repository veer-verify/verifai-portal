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
  ) { }

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
  fromDate: Date = new Date();
  toDate: Date = new Date();
  gridOptions!: GridOptions;
  analyticsData: any = [];
  charts: any[] = [];
  selectedOption: string = 'monitoring';

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
    this.storage_service.info$.next('');
    this.analyticsData = [];
    this.charts = [];
    this.insight_service
      .getNonWorkingDays({ siteId: this.currentSite?.siteId })
      .subscribe({
        next: (res) => {
          if (res.status === 'Success') {
            this.fromDate = new Date(res.LastWorkingDay);
            this.biAnalyticsReport();
          } else {
            this.storage_service.info$.next(res.message);
          }
        },
      });
  }

  biAnalyticsReport() {
    this.storage_service.info$.next('');
    this.insight_service
      .biAnalyticsReport({
        siteId: this.currentSite?.siteId,
        cameraId: this.cameraId,
        fromDate: this.fromDate,
        toDate: this.toDate,
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

  getColor(label: string) {
    const colors = [
      '#8B6FE8',
      '#49B882',
      '#E74C3C',
      '#F4B400',
      '#3498DB',
      '#E67E22',
      '#1ABC9C'
    ];
    return colors[Math.abs(label.length) % colors.length];
  }

  generateCharts() {
    this.charts = this.analyticsData.map((section: any) => {
      const chartData = section.data.map((d: any) => ({
        label: `${d.type} (${d.total})`,
        value: Number(d.total),
      }));

      return {
        title: section.name,
        options: {
          data: chartData,
          legend: { enabled: false },
          series: [
            {
              type: 'donut',
              angleKey: 'value',
              calloutLabelKey: 'label',
              innerRadiusRatio: 0.5,
              outerRadiusRatio: 0.8,
              calloutLabel: {
                enabled: false,
              },
            },
          ],
          // legend: {
          //   position: 'right',
          //   maxWidth: 350,
          //   item: {
          //     label: {
          //       fontFamily: 'Neometric Medium',
          //       fontSize: 14,
          //     },
          //   },
          // },
        },
      };
    });
  }
}
