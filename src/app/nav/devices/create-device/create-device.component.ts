import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../../utilities/services/config.service';
import { StorageService } from '../../../../utilities/services/storage.service';
import { AlertService } from '../../../../utilities/services/alert.service';

@Component({
  selector: 'app-create-device',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-device.component.html',
  styleUrl: './create-device.component.css'
})
export class CreateDeviceComponent {
  @Input() sitesList: any[] = [];
  @Input() selectedSiteId: any;
  @Output() closePanel = new EventEmitter<boolean>();

  saving = false;

  deviceForm: any = {
    clientName: '',
    siteId: '',
    unitId: '',
    unitName: '',
    deviceType: 'Defender',
    status: 'Installed',
    centeralBoxUrl: null,
    remoteAgent: '',
    description: null,
    remarks: null,
    noOfActiveCameras: null,
    password: null
  };

  urls: any[] = [
    {
      url: '',
      type: 'Audio URL'
    }
  ];

  uploadedFiles: any[] = [];

  constructor(
    private configService: ConfigService,
    private storageService: StorageService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.deviceForm.siteId = this.selectedSiteId || '';
  }

  addUrlRow() {
    this.urls.push({
      url: '',
      type: ''
    });
  }

  removeUrlRow(index: number) {
    if (this.urls.length === 1) {
      this.urls[0] = {
        url: '',
        type: ''
      };
      return;
    }
    this.urls.splice(index, 1);
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files || []);
    files.forEach((file: any) => {
      this.uploadedFiles.push({
        file,
        name: file.name,
        progress: 100,
        type: ''
      });
    });
    event.target.value = '';
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  saveDevice() {
    if (this.saving) return;

    if (!this.deviceForm.siteId) {
      this.alertService.warn('Please select site');
      return;
    }
    if (!this.deviceForm.unitName?.trim()) {
      this.alertService.warn('Please enter device name');
      return;
    }
    if (!this.deviceForm.unitId?.trim()) {
      this.alertService.warn('Please enter device ID');
      return;
    }

    const user = this.storageService.getData('user');
    const firstUrl = this.urls.find((x: any) => x.url?.trim());

    const payload = {
      unitName: this.deviceForm.unitName?.trim(),
      siteId: Number(this.deviceForm.siteId),
      unitId: this.deviceForm.unitId?.trim(),
      createdBy: user?.UserId || user?.userId || user?.id,
      description: this.deviceForm.description || null,
      centeralBoxUrl: firstUrl?.url || null,
      noOfActiveCameras: this.deviceForm.noOfActiveCameras || null,
      password: this.deviceForm.password || null,
      remarks: this.deviceForm.remarks || null
    };

    this.saving = true;
    this.configService.addCentralBox(payload).subscribe({
      next: () => {
        this.saving = false;
        this.alertService.success('Device created successfully');
        this.closePanel.emit(true);
      },
      error: (err) => {
        console.error('Create device failed:', err);
        this.saving = false;
        this.alertService.error(err?.error?.message || 'Failed to create device');
      }
    });
  }

  close() {
    this.closePanel.emit(false);
  }
}
