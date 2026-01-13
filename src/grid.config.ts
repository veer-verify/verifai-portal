import { themeQuartz, ColDef, GridOptions } from 'ag-grid-community';

export const theme = themeQuartz.withParams({
  headerTextColor: '#FFFFFF',
  headerBackgroundColor: 'rgba(0,0,0,0.5)',
  headerColumnResizeHandleColor: '#ffffff',
  rowBorder: true,
});

export const defaultColDef: ColDef = {
  editable: true,
  flex: 1,
  minWidth: 100,
  filter: true,
  resizable: true,
};

export const gridOptions: GridOptions = {
  // columnDefs: [],
  theme: theme,
  defaultColDef: defaultColDef,
  rowModelType: 'clientSide',
  rowHeight: 36,
  headerHeight: 36,
  pagination: false,
  paginationPageSize: 10,
  // cacheBlockSize: 10,
  paginationPageSizeSelector: [10, 20, 50, 100],
  animateRows: true,
  serverSideEnableClientSideSort: false,
  overlayNoRowsTemplate:
    '<div style="padding: 10px; border: 1px solid red;">No Data Found</div>',
  //   noRowsOverlayComponentParams: { message: 'Your custom message' },
};

// export function handleResponse(params: IServerSideGetRowsParams, res: any, pageSize: number, data: any) {
//     if (res.statusCode === 200) {
//         const isLastPage = data?.length < pageSize;
//         params.success({
//             rowData: data,
//             rowCount: isLastPage
//                 ? params.request.startRow + data?.length
//                 : res?.totalPages * pageSize
//         });

//     } else {
//         params.fail();
//     }
// }
