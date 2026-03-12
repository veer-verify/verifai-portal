import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AgChartOptions,
} from 'ag-charts-community';

import {
  GridOptions,
} from 'ag-grid-community';
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
import { SiteMapComponent } from "./site-map/site-map.component";
import { CameraInsightsComponent } from "./camera-insights/camera-insights.component";
import { ErrInfoComponent } from "../../../utilities/components/err-info/err-info.component";
import { SiteReportComponent } from "./site-report/site-report.component";
import { filter, Subject, takeUntil } from 'rxjs';
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
    SiteReportComponent
  ],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.css',
})
export class InsightsComponent implements OnInit, OnDestroy {

  constructor(
    private insight_service: InsightService,
    public storage_service: StorageService
  ) { }

  @ViewChild(SiteReportComponent) child!: SiteReportComponent;
  destroy$ = new Subject<void>();
  currentSite: any;
  today = new Date();
  fromDate: Date = new Date();
  toDate: Date = new Date();
  gridOptions!: GridOptions;
  analyticsData: any = [];
  charts: any[] = [];

  ngOnInit(): void {
    // this.gridOptions = gridOptions;

    // this.storage_service.currentSite$
    //   .pipe(
    //     filter((site) => !!site),
    //     takeUntil(this.destroy$)
    //   )
    //   .subscribe((site) => {
    //     this.currentSite = site;
    //     this.getNonWorkingDays();
    //   });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  page: string = 'list';
  setPage(page: string) {
    this.page = page;
  }

  getDates(data: any) {
    this.fromDate = data.fromDate;
  }

  // getNonWorkingDays() {
  //   this.storage_service.info$.next('');
  //   this.analyticsData = [];
  //   this.charts = [];
  //   this.insight_service.getNonWorkingDays({ siteId: this.currentSite?.siteId }).subscribe({
  //     next: (res) => {
  //       if (res.status === "Success") {
  //         this.fromDate = new Date(res.LastWorkingDay);
  //         this.biAnalyticsReport()
  //       } else {
  //         this.storage_service.info$.next(res.message);
  //       }
  //     }
  //   })
  // }

  // biAnalyticsReport() {
  //   this.storage_service.info$.next('');
  //   this.insight_service.biAnalyticsReport({ siteId: this.currentSite?.siteId, fromDate: this.fromDate, toDate: this.toDate }).subscribe({
  //     next: (res) => {
  //       if (res.Status === "Success") {
  //         this.analyticsData = res.AnalyticsReportList;
  //         this.generateCharts()
  //         if (this.analyticsData.length === 0) {
  //           this.storage_service.info$.next('no data!');
  //         }
  //       } else {
  //         this.storage_service.info$.next('no data!');
  //       }
  //     }
  //   })
  // }

  // generateCharts() {
  //   this.charts = this.analyticsData.map((section: any) => {
  //     const chartData = section.data.map((d: any) => ({
  //       label: d.type,
  //       value: Number(d.total)
  //     }));

  //     return {
  //       title: section.name,
  //       options: {
  //         data: chartData,
  //         series: [
  //           {
  //             type: 'donut',
  //             angleKey: 'value',
  //             calloutLabelKey: 'label',
  //             innerRadiusRatio: 0.6
  //           }
  //         ],
  //         legend: {
  //           position: 'right'
  //         }
  //       }
  //     };
  //   });
  // }

}
