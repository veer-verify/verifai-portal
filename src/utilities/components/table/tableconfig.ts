
import {
  themeQuartz,
  ColDef
} from "ag-grid-community";



export const myTheme = themeQuartz.withParams({

headerTextColor: "#FFFFFF",
headerBackgroundColor: "rgba(0,0,0,0.5)",
headerColumnResizeHandleColor: "#ffffff"
});



  export const columnDefs: ColDef[] = [
    { field: "make" },
    { field: "model" },
    { field: "price" },
     
  ];

 export const defaultColDef: ColDef = {
    editable: false,
    flex: 1,
    minWidth: 100,
    filter: false,
   resizable:false,

  };
