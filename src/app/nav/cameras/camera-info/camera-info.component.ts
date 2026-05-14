import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-camera-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './camera-info.component.html',
  styleUrl: './camera-info.component.css'
})
export class CameraInfoComponent implements OnInit {
  @Input() cameraData: any;
  @Input() viewType: 'details' | 'event' | 'analytics' = 'details';
  @Output() closePanel = new EventEmitter<boolean>();

  activeTab: string = 'general';

  // Form for Event & Analytics
  form: any = {
    motionDetection: true,
    objectDetection: true,
    analyticType: '',
    motionArea: '',
    modelFps: '',
    skipFrames: '',
    maskIn: '',
    maskOut: '',
    dummyEventTime: '',
    eventDelayTime: '',
    objectNames: '',
    eventsPolygonPoints: '',
    modelName: '',
    modelPath: '',
    modelWidth: '',
    modelHeight: '',
    objectThreshold: '',
    remarks: ''
  };

  ngOnInit() {
    if (this.viewType === 'event') {
      this.activeTab = 'event';
    } else if (this.viewType === 'analytics') {
      this.activeTab = 'analytics';
    }
  }

  close() {
    this.closePanel.emit(false);
  }

  submit() {
    this.closePanel.emit(true);
  }
}
