import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../utilities/services/config.service';

@Component({
  selector: 'app-playback',
  imports: [CommonModule, FormsModule],
  templateUrl: './playback.component.html',
  styleUrl: './playback.component.css',
})
export class PlaybackComponent {
  timeMarks!: number[];
  ticks!: number[];

  constructor(
    private config_service: ConfigService
  ) {
    this.timeMarks = Array.from({ length: 25 }, (_, i) => i);
    this.ticks = Array.from({ length: 24 * this.ticksPerHour + 1 });
  }

  ngOnInit(): void {
    this.getPlayback();
  }

  playbackList: any = [];
  getPlayback() {
    this.config_service.getPlayback().subscribe({
      next: (res: any) => {
        this.playbackList = res.videos
      }
    })
  }

  hours = Array.from({ length: 25 }, (_, i) => i.toString().padStart(2, '0'));
  ticksPerHour = 10;

  selectedCamera: any;
  selectCamera(cam: any) {
    this.selectedCamera = cam;
  }

  open = false;
  startTime = '14:00';
  endTime = '15:00';

  applyRange() {
    console.log('Selected range:', this.startTime, this.endTime);
  }
}
