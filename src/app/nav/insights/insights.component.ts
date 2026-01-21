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
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { PaginationComponent } from '../../../utilities/components/pagination/pagination.component';

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
export class InsightsComponent {
  public chartOptions!: AgChartOptions;

  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Customer Analytics', filter: false },
    { field: 'count', headerName: 'Count', filter: false },
  ];

  rowData = [
    {
      name: 'Impression Rate_Aisle 1',
      count: '70',
    },
    {
      name: 'Impression Rate_Aisle 2',
      count: '85',
    },
    {
      name: 'Impression Rate_Aisle 3',
      count: '80',
    },
    {
      name: 'Impression Rate_Aisle 4',
      count: '90',
    },
    {
      name: 'Impression Rate_Aisle 5',
      count: '75',
    },
  ];

  gridOptions!: GridOptions;

  ngOnInit() {
    this.gridOptions = gridOptions;
  }

  constructor() {
    this.chartOptions = {
      data: [
        { name: 'Impression Rate_Aisle 1', count: 70 },
        { name: 'Impression Rate_Aisle 2', count: 85 },
        { name: 'Impression Rate_Aisle 3', count: 80 },
        { name: 'Impression Rate_Aisle 4', count: 90 },
        { name: 'Impression Rate_Aisle 5', count: 75 },
      ],
      series: [
        {
          type: 'donut',
          calloutLabelKey: 'name',
          angleKey: 'count',
          // innerRadiusRatio: 0.75, // thin ring
          // cornerRadius: 20, // rounded ends
          // sectorSpacing: 3
          // padAngle: 3,
          calloutLabel: {
            fontFamily: 'Neometric Regular',
            fontSize: 12,
            fontWeight: 600,
            color: '#333',
          },
        },
      ],
      title: {
        text: 'Customer Analytics',
        fontFamily: 'Neometric Regular',
      },
      legend: {
        item: {
          label: {
            fontFamily: 'Neometric Regular',
          },
        },
      },
    };
  }
}
