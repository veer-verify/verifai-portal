import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MediaPipe } from '../../pipes/media.pipe';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-media-dialog',
  imports: [
    MediaPipe,
    AsyncPipe
  ],
  templateUrl: './media-dialog.component.html',
  styleUrl: './media-dialog.component.css'
})
export class MediaDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  isVideo(file: string): boolean {
    const types = ['mp4', '3gp', 'avi'];
    const ext = file.split('.')[file.split('.').length - 1];
    return types.includes(ext)
  }


}
