import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {

  pageSize: any = 10;
  pageNumber: any = 1;
  // totalPages = 0;

  @Output() changePageNumber = new EventEmitter<void>();
  @Output() changePSize = new EventEmitter<void>();
  @Input() totalPages: any;

  ngOnInit(){
    if(this.totalPages===0) this.totalPages = 1;
  }

  changePageSize(pSize: any) {
    // console.log(pSize.target.value);
    this.pageSize = pSize.target?.value;
    this.changePSize.emit(this.pageSize)
  }

  changePage(pNum: any) {
    this.pageNumber = pNum;
    this.changePageNumber.emit(this.pageNumber)
  }

}
