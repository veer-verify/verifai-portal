import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-playback',
  imports: [CommonModule, FormsModule],
  templateUrl: './playback.component.html',
  styleUrl: './playback.component.css'
})
export class PlaybackComponent {

  timeMarks!: number[];
  ticks!: number[];
  constructor() {
    this.timeMarks = Array.from({ length: 25 }, (_, i) => i); // 0–24

    this.ticks = Array.from({ length: 24 * this.ticksPerHour });
    // 240 ticks = dense scale (like seconds/minutes feel)
  }

  // 24-hour labels (00–24)
  hours = Array.from({ length: 25 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  // ticks per hour (adjust density here)
  ticksPerHour = 10;

  // total ticks

  cameras = [
    {
      name: 'Camera 01 (Dispensing Counter)',
      image: 'https://images.unsplash.com/photo-1581091215367-59ab6b2e3c3c'
    },
    {
      name: 'Camera 02 (Storage)',
      image: 'https://images.unsplash.com/photo-1588776814546-ec7e65b3fbb9'
    },
    {
      name: 'Camera 03 (Pharmacy Floor)',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88'
    },
    {
      name: 'Camera 04 (Medicines Close-up)',
      image: 'https://images.unsplash.com/photo-1580281657521-6f0c3f5c6b89'
    }
  ];

  selectedCamera = this.cameras[0];

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
