import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  imports: [FormsModule, CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {

  @Input() pageSize: any = 25;
  pageNumber: any = 1;

  @Input() totalPages!: number;
  @Output() changePageNumber = new EventEmitter<void>();
  @Output() changePSize = new EventEmitter<void>();

  ngOnInit() {
  }

  changePageSize(pSize: any) {
    this.pageSize = pSize.target?.value;
    this.changePSize.emit(this.pageSize)
  }

  changePage(pNum: any) {
    this.pageNumber = pNum;
    this.changePageNumber.emit(this.pageNumber)
  }

}
