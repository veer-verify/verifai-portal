import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MediaPipe } from '../../pipes/media.pipe';
import { AsyncPipe, CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-media-dialog',
  imports: [
    MediaPipe,
    AsyncPipe,
    MatDialogClose,
    CommonModule
  ],
  templateUrl: './media-dialog.component.html',
  styleUrl: './media-dialog.component.css'
})
export class MediaDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public storage_service: StorageService
  ) { }

  isVideo(file: string): boolean {
    const types = ['mp4', '3gp', 'avi'];
    const ext = file.split('.')[file.split('.').length - 1];
    return types.includes(ext)
  }


}
