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
  @Input() pageNumber: any = 1;

  @Input() totalPages!: number;
  @Output() changePageNumber = new EventEmitter<number>();
  @Output() changePSize = new EventEmitter<number>();

  ngOnInit() {
  }

  changePageSize(pSize: any) {
    this.pageSize = Number(pSize.target?.value);
    this.changePSize.emit(this.pageSize)
  }

  changePage(pNum: any) {
    if (pNum < 1 || pNum > this.totalPages) return;

    this.pageNumber = pNum;
    this.changePageNumber.emit(this.pageNumber)
  }

}
