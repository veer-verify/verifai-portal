import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../../utilities/services/config.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-playback',
  imports: [CommonModule, FormsModule],
  templateUrl: './playback.component.html',
  styleUrl: './playback.component.css',
})
export class PlaybackComponent implements OnInit, OnDestroy {
  @ViewChild('playbackVideo') playbackVideo?: ElementRef<HTMLVideoElement>;

  timeMarks!: number[];
  ticks!: number[];
  ticksPerHour = 10;
  private destroy$ = new Subject<void>();

  constructor(
    private config_service: ConfigService,
    private storage_service: StorageService
  ) {
    this.timeMarks = Array.from({ length: 25 }, (_, i) => i);
    this.ticks = Array.from({ length: 24 * this.ticksPerHour + 1 });
  }

  ngOnInit(): void {
    this.selectedDate = this.formatDateInput(new Date());

    this.storage_service.currentSite$
      .pipe(takeUntil(this.destroy$))
      .subscribe((site: any) => {
        this.currentSite = site;
      });

    this.storage_service.camData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cameras: any) => {
        this.cameraList = Array.isArray(cameras) ? cameras : [];
        const hasSelectedCamera = this.cameraList.some(
          (camera: any) => camera?.cameraId === this.selectedCamera?.cameraId,
        );

        if (!hasSelectedCamera && this.cameraList.length) {
          this.selectCamera(this.cameraList[0]);
        } else if (!this.cameraList.length) {
          this.selectCamera(null);
        }
      });
  }

  currentSite: any;
  cameraList: any[] = [];
  playbackList: any[] = [];
  selectedVideo: any;
  playbackMeta: any;
  isLoading = false;
  errorMessage = '';
  selectedDate = '';
  startTime = '00:00';
  endTime = '23:59';
  hours = Array.from({ length: 25 }, (_, i) => i.toString().padStart(2, '0'));
  selectedCamera: any;
  open = false;
  isPlaying = false;
  volume = 80;
  progress = 0;
  playbackRate = 1;

  getPlayback() {
    if (!this.currentSite?.siteId || !this.selectedCamera?.cameraId) {
      this.errorMessage = 'Select a site and camera to view playback';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.playbackList = [];
    this.selectedVideo = null;

    const payload = {
      requestName: `streams/GISINORINTESTINGG`,
      fromDatetime: this.toPlaybackDateTime(this.selectedDate, this.startTime),
      toDatetime: this.toPlaybackDateTime(this.selectedDate, this.endTime),
      level: 'GISINORINTESTINGGC1',
      expires: 3600,
    };

    this.config_service.getPlayback(payload).subscribe({
      next: (res: any) => {
        this.playbackMeta = res;
        this.playbackList = Array.isArray(res?.videos) ? res.videos : [];
        this.selectedVideo = this.playbackList[0] ?? null;
        this.errorMessage = this.playbackList.length
          ? ''
          : 'No playback videos found for the selected range';
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load playback videos';
        this.isLoading = false;
      },
    });
  }

  selectCamera(cam: any) {
    this.selectedCamera = cam;
    this.playbackList = [];
    this.selectedVideo = null;
    this.playbackMeta = null;
    this.errorMessage = '';
  }

  selectVideo(video: any) {
    this.selectedVideo = video;
    this.isPlaying = false;
    this.progress = 0;
  }

  getClipPosition(video: any): number {
    const dateTime = video?.datetime;
    if (!dateTime) {
      return 0;
    }

    const [, time = ''] = dateTime.split(' ');
    const [hours = '0', minutes = '0', seconds = '0'] = time.split(':');
    const totalSeconds =
      Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);

    return Math.min(Math.max((totalSeconds / 86400) * 100, 0), 100);
  }

  applyRange() {
    this.getPlayback();
  }

  togglePlayback(): void {
    const video = this.playbackVideo?.nativeElement;
    if (!video) {
      return;
    }

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  stopPlayback(): void {
    const video = this.playbackVideo?.nativeElement;
    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
    this.isPlaying = false;
    this.progress = 0;
  }

  updateVolume(value: any): void {
    this.volume = Number(value);
    const video = this.playbackVideo?.nativeElement;
    if (video) {
      video.volume = this.volume / 100;
    }
  }

  changeVolume(delta: number): void {
    this.updateVolume(Math.min(Math.max(this.volume + delta, 0), 100));
  }

  seekVideo(value: any): void {
    this.progress = Number(value);
    const video = this.playbackVideo?.nativeElement;
    if (!video?.duration) {
      return;
    }

    video.currentTime = (this.progress / 100) * video.duration;
  }

  updateProgress(): void {
    const video = this.playbackVideo?.nativeElement;
    if (!video?.duration) {
      this.progress = 0;
      return;
    }

    this.progress = (video.currentTime / video.duration) * 100;
  }

  setPlaybackRate(): void {
    const rates = [1, 1.5, 2, 0.5];
    const nextIndex = (rates.indexOf(this.playbackRate) + 1) % rates.length;
    this.playbackRate = rates[nextIndex];

    const video = this.playbackVideo?.nativeElement;
    if (video) {
      video.playbackRate = this.playbackRate;
    }
  }

  onVideoLoaded(): void {
    const video = this.playbackVideo?.nativeElement;
    if (!video) {
      return;
    }

    video.volume = this.volume / 100;
    video.playbackRate = this.playbackRate;
    this.progress = 0;
  }

  private toPlaybackDateTime(date: string, time: string): string {
    return `${date}_${time.replace(':', '-')}-00`;
  }

  private formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
