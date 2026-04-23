import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type DateRangePayload = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  origin?: 'picker' | 'navigation';
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  @Input() startDate = '';
  @Input() startTime = '';
  @Input() endDate = '';
  @Input() endTime = '';
  @Input() maxDate = '';

  @Output() rangeApply = new EventEmitter<DateRangePayload>();

  draftStartDate = '';
  draftStartTime = '';
  draftEndDate = '';
  draftEndTime = '';
  isOpen = false;

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['startDate'] ||
      changes['startTime'] ||
      changes['endDate'] ||
      changes['endTime']
    ) {
      this.syncDraftFromInputs();
    }
  }

  get displayRange(): string {
    if (!this.startDate || !this.endDate) {
      return 'Select date and time range';
    }

    return `${this.startDate} ${this.startTime || '00:00'} - ${this.endDate} ${this.endTime || '23:59'}`;
  }

  get formattedStart(): string {
    if (!this.startDate) return 'From';
    return `${this.formatDisplayDate(this.startDate)}, ${this.startTime || '00:00'}`;
  }

  get formattedEnd(): string {
    if (!this.endDate) return 'To';
    return `${this.formatDisplayDate(this.endDate)}, ${this.endTime || '23:59'}`;
  }

  get canNavigatePrevious(): boolean {
    return !!this.startDate && !!this.endDate;
  }

  get canNavigateNext(): boolean {
    if (!this.startDate || !this.endDate) {
      return false;
    }

    if (!this.maxDate) {
      return true;
    }

    return this.shiftDate(this.endDate, 1) <= this.maxDate;
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.syncDraftFromInputs();
    }
  }

  navigateDays(offset: number) {
    if (!this.startDate || !this.endDate) return;
    if (offset > 0 && !this.canNavigateNext) return;

    this.startDate = this.shiftDate(this.startDate, offset);
    this.endDate = this.shiftDate(this.endDate, offset);
    this.syncDraftFromInputs();

    this.rangeApply.emit({
      startDate: this.startDate,
      startTime: this.startTime || '00:00',
      endDate: this.endDate,
      endTime: this.endTime || '23:59',
      origin: 'navigation',
    });
  }

  apply() {
    if (!this.draftStartDate || !this.draftEndDate) return;

    this.startDate = this.draftStartDate;
    this.startTime = this.draftStartTime || '00:00';
    this.endDate = this.draftEndDate;
    this.endTime = this.draftEndTime || '23:59';

    this.rangeApply.emit({
      startDate: this.startDate,
      startTime: this.startTime,
      endDate: this.endDate,
      endTime: this.endTime,
      origin: 'picker',
    });

    this.isOpen = false;
  }

  reset() {
    this.syncDraftFromInputs();
  }

  private syncDraftFromInputs() {
    this.draftStartDate = this.startDate || '';
    this.draftStartTime = this.startTime || '00:00';
    this.draftEndDate = this.endDate || '';
    this.draftEndTime = this.endTime || '23:59';
  }

  private shiftDate(dateString: string, days: number): string {
    const date = new Date(`${dateString}T00:00:00`);
    date.setDate(date.getDate() + days);
    return this.formatDateForInput(date);
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDisplayDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${day}-${month}-${year}`;
  }
}
