import { themeQuartz, ColDef, GridOptions } from 'ag-grid-community';

export const myTheme = themeQuartz.withParams({
  headerTextColor: '#FFFFFF',
  headerBackgroundColor: 'rgba(0,0,0,0.5)',
  headerColumnResizeHandleColor: '#ffffff',
  rowBorder: false
});

export const defaultColDef: ColDef = {
  editable: false,
  flex: 1,
  minWidth: 100,
  filter: false,
  resizable: false,

};
const paginationPageSize = 10;
const paginationPageSizeSelector = [10, 20, 50, 100];

export const gridOptions: GridOptions = {
  columnDefs: [],
  theme: myTheme,
  defaultColDef: defaultColDef,
  rowModelType: 'serverSide',
  pagination: true,
  paginationPageSize: paginationPageSize,
  cacheBlockSize: paginationPageSize,
  paginationPageSizeSelector: paginationPageSizeSelector,
  animateRows: true,
  serverSideEnableClientSideSort:true,
  overlayNoRowsTemplate: `
  <div style="padding: 20px; text-align:center; color:#ed3237;font-size:16px;font-weight:bold">
    No data available
  </div>
`

};



export function handleResponse(params: any, res: any, pageSize: number,data:any) {

  if (res.statusCode === 200) {
    const isLastPage = data?.length < pageSize;

    params.success({
      rowData: data,
      rowCount: isLastPage
        ? params.request.startRow + data?.length
        : res?.totalPages * pageSize
    });

  } else {
    params.fail();
  }
}
