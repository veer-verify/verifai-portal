import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-device-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './device-info.component.html',
  styleUrl: './device-info.component.css'
})
export class DeviceInfoComponent {
  @Input() deviceData: any;
  @Output() closePanel = new EventEmitter<boolean>();

  close() {
    this.closePanel.emit(false);
  }

  edit() {
    // Logic for editing
  }

  copyUrl(url: string) {
    if (url) {
      navigator.clipboard.writeText(url);
    }
  }
}
