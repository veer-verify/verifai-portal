import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-timelapse',
  imports: [
    NgClass,
    MatDatepickerModule,
    MatFormField,
    MatLabel,
    MatInputModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './timelapse.component.html',
  styleUrl: './timelapse.component.css',
})
export class TimelapseComponent {
  drop = false;

  toggleDrop() {
    this.drop = !this.drop;
  }

  openPicker(input: HTMLInputElement) {
    setTimeout(() => {
      if (input.showPicker) input.showPicker();
    });
  }
}
