import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../../utilities/services/config.service';

@Component({
  selector: 'app-create-camera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-camera.component.html',
  styleUrl: './create-camera.component.css'
})
export class CreateCameraComponent implements OnInit {
  @Input() deviceData: any;
  @Output() closePanel = new EventEmitter<boolean>();

  cameraForm: any = {
    clientName: '',
    siteName: '',
    unitId: '',
    copyTo: '',
    
    name: '',
    clientCameraName: '',
    cameraType: '',
    make: '',
    model: '',
    serialNumber: '',
    macId: '',
    registrationCode: '',
    cameraDirection: '',
    
    userName: '',
    password: '',
    cameraIp: '',
    portNo: '',
    rtspUrl: '',
    width: '',
    height: '',
    fps: '',
    resolution: '',
    bitrate: '',
    recoveryEmail: '',
    securityQuestions: '',
    firmwareVersion: '',
    priority: '',
    nativeAppName: '',
    onivif: '',
    
    ftpServer: false,
    ftpServerType: '',
    ftpServerValue: '',
    
    monitoring: true,
    events: false,
    analytics: false,
    eventsWhereToRun: 'AWS',
    eventsServerIp: '',
    eventAwsPort: '',
    audioSpeakerType: '',
    storagePath: '',
    status: '',
    remarks: ''
  };

  saving = false;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    if (this.deviceData) {
      this.cameraForm.clientName = this.deviceData.clientName || this.deviceData.customerName || 'Default Client';
      this.cameraForm.siteName = this.deviceData.siteName || this.deviceData.SiteName || '';
      this.cameraForm.unitId = this.deviceData.unitId || '';
    }
  }

  close() {
    this.closePanel.emit(false);
  }

  saveCamera() {
    this.saving = true;
    
    const payload = {
      centralBoxId: this.deviceData?.centralBoxId,
      unitId: this.deviceData?.unitId,
      name: this.cameraForm.name,
      userName: this.cameraForm.userName,
      password: this.cameraForm.password,
      rtspUrl: this.cameraForm.rtspUrl,
      portNo: this.cameraForm.portNo,
      audioSpeakerType: this.cameraForm.audioSpeakerType,
      fps: this.cameraForm.fps,
      width: this.cameraForm.width,
      height: this.cameraForm.height,
      monitoring: this.cameraForm.monitoring ? 'T' : 'F',
      events: this.cameraForm.events ? 'T' : 'F',
      priority: this.cameraForm.priority,
      status: this.cameraForm.status,
      audioUrl: this.cameraForm.storagePath
    };

    this.configService.addCamera_1_0(payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.closePanel.emit(true);
      },
      error: (err) => {
        console.error('Failed to create camera', err);
        this.saving = false;
      }
    });
  }
}
