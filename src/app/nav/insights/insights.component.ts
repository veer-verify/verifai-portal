import { Component } from '@angular/core';
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
  imports: [AgCharts, AgGridAngular],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.css',
})
export class InsightsComponent {
  public chartOptions!: AgChartOptions;

  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Col 1', filter: false },
    { field: 'Col 2', filter: false },
    { field: 'eventFromTime', headerName: 'Col 3', filter: false },
    { field: 'eventToTime', headerName: 'Col 4', filter: false },
    { field: 'Col 5', filter: false },
    { field: 'objectName', headerName: 'Col 6', filter: false },
    { field: 'Col 7', filter: false },
    {
      field: 'Col 8',
      filter: false,
      cellRenderer: (params: any) => {
        const isDisabled = params.data.files.length === 0;
        const disabledAttr = isDisabled ? 'disabled' : '';
        const style = isDisabled
          ? 'style="opacity: 0.5; pointer-events: none; filter: grayscale(1);"'
          : '';
        return `<img src="icons/play-circle-fill.svg" class="btn-open" ${disabledAttr} ${style} />`;
      },
      editable: false,
      sortable: false,
    },
  ];

  rowData = [
    {
      name: 'Camera 01',
      eventDate: '2026-01-09',
      eventFromTime: '10:15 AM',
      eventToTime: '10:18 AM',
      duration: '00:03:00',
      objectName: 'Person',
      actionTag: 'Intrusion',
      files: ['clip_01.mp4'],
    },
    {
      name: 'Camera 02',
      eventDate: '2026-01-09',
      eventFromTime: '11:02 AM',
      eventToTime: '11:04 AM',
      duration: '00:02:00',
      objectName: 'Vehicle',
      actionTag: 'Loitering',
      files: [], // ❌ play icon disabled
    },
    {
      name: 'Camera 03',
      eventDate: '2026-01-09',
      eventFromTime: '12:45 PM',
      eventToTime: '12:50 PM',
      duration: '00:05:00',
      objectName: 'Person',
      actionTag: 'Trespassing',
      files: ['clip_03.mp4'],
    },
    {
      name: 'Camera 04',
      eventDate: '2026-01-09',
      eventFromTime: '02:10 PM',
      eventToTime: '02:12 PM',
      duration: '00:02:00',
      objectName: 'Animal',
      actionTag: 'Motion Detected',
      files: [], // ❌ play icon disabled
    },
    {
      name: 'Camera 05',
      eventDate: '2026-01-09',
      eventFromTime: '03:30 PM',
      eventToTime: '03:35 PM',
      duration: '00:05:00',
      objectName: 'Person',
      actionTag: 'Running',
      files: ['clip_05.mp4'],
    },
  ];

  gridOptions!: GridOptions;

  ngOnInit() {
    this.gridOptions = gridOptions;
  }

  constructor() {
    this.chartOptions = {
      data: [
        { day: 'Mon', users: 30 },
        { day: 'Tue', users: 50 },
        { day: 'Wed', users: 40 },
        { day: 'thu', users: 32 },
        { day: 'fri', users: 29 },
        { day: 'sat', users: 37 },
      ],
      series: [
        {
          type: 'donut',
          calloutLabelKey: 'day',
          angleKey: 'users',
          // innerRadiusRatio: 0.75, // thin ring
          // cornerRadius: 20, // rounded ends
          // sectorSpacing: 3
          // padAngle: 3,
        },
      ],
    };
  }
}
