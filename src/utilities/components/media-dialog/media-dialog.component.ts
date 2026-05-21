import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { HttpClient } from '@angular/common/http';

type MediaItem = {
  source: string;
  displaySrc: string | null;
  isVideo: boolean;
  status: 'loading' | 'loaded' | 'error';
  errorMessage: string;
};

@Component({
  selector: 'app-media-dialog',
  imports: [
    MatDialogClose,
    CommonModule
  ],
  templateUrl: './media-dialog.component.html',
  styleUrl: './media-dialog.component.css'
})
export class MediaDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public storage_service: StorageService,
    private http: HttpClient
  ) { }

  mediaItems: MediaItem[] = [];

  ngOnInit(): void {
    this.mediaItems = (this.data?.files ?? [])
      .filter(Boolean)
      .map((file: string) => ({
        source: file,
        displaySrc: null,
        isVideo: this.isVideo(file),
        status: 'loading',
        errorMessage: ''
      }));

    this.mediaItems.forEach((item) => this.loadMedia(item));
  }

  isVideo(file: string): boolean {
    const types = ['mp4', '3gp', 'avi'];
    const cleanFileName = file.split('?')[0];
    const ext = cleanFileName.split('.').pop()?.toLowerCase() ?? '';
    return types.includes(ext);
  }

  private loadMedia(item: MediaItem): void {
    if (item.source.startsWith('data:') || item.source.startsWith('blob:')) {
      item.displaySrc = item.source;
      item.status = 'loaded';
      return;
    }

    this.http.get(item.source, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        if (this.isApiErrorBlob(blob, item)) {
          this.setMediaError(item, blob);
          return;
        }

        const fileReader = new FileReader();

        fileReader.onloadend = () => {
          item.displaySrc = fileReader.result as string;
          item.status = 'loaded';
        };

        fileReader.onerror = () => {
          item.status = 'error';
          item.errorMessage = 'Unable to load media file.';
        };

        fileReader.readAsDataURL(blob);
      },
      error: async (err) => {
        item.status = 'error';
        item.errorMessage = await this.getMediaErrorMessage(err);
      },
    });
  }

  onMediaRenderError(item: MediaItem): void {
    item.displaySrc = null;
    item.status = 'error';
    item.errorMessage = 'Media file is not available or cannot be displayed.';
  }

  private isApiErrorBlob(blob: Blob, item: MediaItem): boolean {
    const contentType = blob.type.toLowerCase();

    if (!contentType || contentType === 'application/octet-stream') {
      return false;
    }

    if (item.isVideo) {
      return !contentType.startsWith('video/');
    }

    return !contentType.startsWith('image/');
  }

  private async setMediaError(item: MediaItem, blob: Blob): Promise<void> {
    item.status = 'error';
    item.errorMessage = await this.getBlobErrorMessage(blob);
  }

  private async getMediaErrorMessage(err: any): Promise<string> {
    const fallback = 'Unable to load media file.';

    if (err?.error instanceof Blob) {
      return this.getBlobErrorMessage(err.error, err?.message || fallback);
    }

    return err?.error?.message || err?.error?.error || err?.message || fallback;
  }

  private async getBlobErrorMessage(blob: Blob, fallback = 'Unable to load media file.'): Promise<string> {
    const text = await blob.text();

    if (!text) {
      return fallback;
    }

    try {
      const body = JSON.parse(text);
      return body?.message || body?.error || body?.detail || text;
    } catch {
      return text;
    }
  }

}
