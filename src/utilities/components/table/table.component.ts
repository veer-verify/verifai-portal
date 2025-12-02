import { Component } from '@angular/core';
import {myTheme,columnDefs,defaultColDef} from './tableconfig'
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { AgGridAngular } from 'ag-grid-angular';
import {
  Theme,
} from "ag-grid-community";
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [AgGridAngular,FormsModule,CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {

 paginationPageSize = 20;
 paginationPageSizeSelector = [10, 20, 50, 100];
 theme:Theme = myTheme;
 cacheBlockSize = 10;
columnDefs=columnDefs;
defaultColDef=defaultColDef;

  rowData: any[] = (() => {
    const rowData: any[] = [];
    for (let i = 0; i < 10; i++) {
      rowData.push({
        make: "Toyota",
        model: "Celica",
        price: 35000 + i * 1000,
      });
      rowData.push({ make: "Ford", model: "Mondeo", price: 32000 + i * 1000 });
      rowData.push({
        make: "Porsche",
        model: "Boxster",
        price: 72000 + i * 1000,
      });
    }
    return rowData;
  })();


}



