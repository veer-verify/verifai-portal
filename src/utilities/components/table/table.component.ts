import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { gridOptions } from './tableconfig';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import {
  GridApi,
  GridReadyEvent,
  IServerSideDatasource,
} from 'ag-grid-community';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [AgGridAngular, FormsModule, CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  @Input() fields: any[] = [];
  @Input() datasource!: IServerSideDatasource;
  @Output() gridReady = new EventEmitter<GridApi>();

  private gridApi!: GridApi;
  gridOptions = gridOptions;
  mapFieldsToColumnDefs() {
    this.gridOptions.columnDefs = this.fields.map((f: any) => ({
      headerName: f.label,
      field: f.id,
      sortable: !!f.sort,
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.datasource)
    this.mapFieldsToColumnDefs();

    if (this.gridApi && this.datasource) {

      this.gridApi.setGridOption('serverSideDatasource', this.datasource);
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;

    this.gridReady.emit(this.gridApi);




    if (this.datasource) {
      this.gridApi.setGridOption('serverSideDatasource', this.datasource);
    }
  }



}
