
import { Component, Input, SimpleChanges } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
  Theme
} from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { myTheme, defaultColDef } from '../table/tableconfig';

@Component({
  selector: 'app-infinitetable',
  imports: [AgGridAngular, CommonModule],
  templateUrl: './infinitetable.component.html',
  styleUrl: './infinitetable.component.css'
})
export class InfinitetableComponent {
 @Input() fields: any[] = [];
  @Input() datasource!: IDatasource;

  columnDefs: ColDef[] = [];
  gridApi!: GridApi;


  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 50, 100];
  theme: Theme = myTheme;
defaultColDef = defaultColDef;
  cacheBlockSize = 10;   // number of rows requested each time
   // optional

  ngOnChanges(changes: SimpleChanges) {
    this.columnDefs = this.fields.map((f: any) => ({
      headerName: f.label,
      field: f.id,
      sortable: !!f.sort,
    }));

    if (this.gridApi && this.datasource) {
      this.gridApi.setGridOption('datasource',this.datasource);
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;

    if (this.datasource) {
      params.api.setGridOption('datasource',this.datasource);
    }
  }
}
