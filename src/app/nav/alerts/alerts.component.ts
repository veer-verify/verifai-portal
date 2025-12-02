import { Component } from '@angular/core';
import { CommonModule,  } from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import { TableComponent } from '../../../utilities/components/table/table.component';
import { FormBuilder, FormGroup,ReactiveFormsModule  } from '@angular/forms';

@Component({
    selector: 'app-alerts',
    imports: [
        TableComponent,
        CommonModule,
        MatSelectModule,

      ReactiveFormsModule

    ],
    templateUrl: './alerts.component.html',
    styleUrl: './alerts.component.css',
    standalone: true
})
export class AlertsComponent {

  rangeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    const start = new Date(2025, 6, 31, 0, 14, 0); // 31 Jul 2025 00:14:00
    const end = new Date(2025, 6, 31, 0, 14, 0);

    this.rangeForm = this.fb.group({
      startDate: [start],
      startTime: ['00:14:00'],
      endDate: [end],
      endTime: ['00:14:00'],
    });
  }

  onRangeChange(event: { startDate: Date; endDate: Date }) {
    this.rangeForm.patchValue({
      startDate: event.startDate,
      endDate: event.endDate,
    });
  }

  get start() {
    const v = this.rangeForm.value;
    return `${v.startDate?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} ${v.startTime}`;
  }

  get end() {
    const v = this.rangeForm.value;
    return `${v.endDate?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} ${v.endTime}`;
  }


}
