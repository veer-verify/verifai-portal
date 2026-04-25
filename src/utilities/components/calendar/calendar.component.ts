import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';

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
    MatDatepickerModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  constructor(private elementRef: ElementRef<HTMLElement>) { }

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
  draftStartHour = '00';
  draftStartMinute = '00';
  draftEndHour = '23';
  draftEndMinute = '59';
  isOpen = false;
  activeField: 'start' | 'end' = 'start';

  readonly hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  readonly minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen) return;

    const target = event.target as Node | null;
    if (target && this.elementRef.nativeElement.contains(target)) {
      return;
    }

    this.isOpen = false;
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
      this.activeField = 'start';
      this.syncDraftFromInputs();
    }
  }

  navigateDays(offset: number) {
    if (!this.startDate || !this.endDate) return;
    if (offset > 0 && !this.canNavigateNext) return;

    this.startDate = this.shiftDate(this.startDate, offset);
    this.endDate = this.shiftDate(this.endDate, offset);
    this.endTime = this.getEndTimeForDate(this.endDate);
    this.syncDraftFromInputs();

    this.rangeApply.emit({
      startDate: this.startDate,
      startTime: this.startTime || '00:00',
      endDate: this.endDate,
      endTime: this.endTime,
      origin: 'navigation',
    });
  }

  apply() {
    if (!this.draftStartDate || !this.draftEndDate) return;

    this.startDate = this.draftStartDate;
    this.startTime = this.buildTime(this.draftStartHour, this.draftStartMinute);
    this.endDate = this.draftEndDate;
    this.endTime = this.buildTime(this.draftEndHour, this.draftEndMinute);

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
    this.activeField = 'start';
  }

  setActiveField(field: 'start' | 'end') {
    this.activeField = field;
  }

  onCalendarSelect(date: Date | null) {
    if (!date) return;

    const value = this.formatDateForInput(date);
    if (this.activeField === 'start') {
      this.draftStartDate = value;
      return;
    }

    this.draftEndDate = value;
    const [hour, minute] = this.splitTime(this.getEndTimeForDate(value));
    this.draftEndHour = hour;
    this.draftEndMinute = minute;
  }


  get selectedCalendarDate(): Date | null {
    const current =
      this.activeField === 'start' ? this.draftStartDate : this.draftEndDate;
    return current ? new Date(`${current}T00:00:00`) : null;
  }

  get maxCalendarDate(): Date | null {
    return this.maxDate ? new Date(`${this.maxDate}T00:00:00`) : null;
  }

  get draftFormattedStart(): string {
    if (!this.draftStartDate) return 'Select start date';
    return `${this.formatDisplayDate(this.draftStartDate)}, ${this.buildTime(this.draftStartHour, this.draftStartMinute)}`;
  }

  get draftFormattedEnd(): string {
    if (!this.draftEndDate) return 'Select end date';
    return `${this.formatDisplayDate(this.draftEndDate)}, ${this.buildTime(this.draftEndHour, this.draftEndMinute)}`;
  }

  private syncDraftFromInputs() {
    this.draftStartDate = this.startDate || '';
    this.draftStartTime = this.startTime || '00:00';
    this.draftEndDate = this.endDate || '';
    this.draftEndTime = this.endTime || '23:59';
    [this.draftStartHour, this.draftStartMinute] =
      this.splitTime(this.draftStartTime);
    [this.draftEndHour, this.draftEndMinute] = this.splitTime(this.draftEndTime);
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

  private splitTime(time: string): [string, string] {
    const [hour = '00', minute = '00'] = (time || '00:00').split(':');
    return [hour.padStart(2, '0'), minute.padStart(2, '0')];
  }

  private buildTime(hour: string, minute: string): string {
    return `${hour}:${minute}`;
  }

  private getEndTimeForDate(dateString: string): string {
    return dateString === this.getTodayDate() ? this.getCurrentTime() : '23:59';
  }

  private getTodayDate(): string {
    return this.formatDateForInput(new Date());
  }

  private getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
