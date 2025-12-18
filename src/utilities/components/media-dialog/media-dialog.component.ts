import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MediaPipe } from '../../pipes/media.pipe';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-media-dialog',
  imports: [
    MediaPipe,
    AsyncPipe,
    MatDialogClose
  ],
  templateUrl: './media-dialog.component.html',
  styleUrl: './media-dialog.component.css'
})
export class MediaDialogComponent {

  constructor(
    // @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  data = {
    files: [
      'https://usstaging.ivisecurity.com/common/downloadFile_1_0?requestName=incidents&assetName=/var/www/html/dotimages/GISUS7017C4_9dfea67a-0b97-4609-9d1d-e7f27a81a00d_2025-11-24_06-07-16_green.png.png',
      'https://usstaging.ivisecurity.com/common/downloadFile_1_0?requestName=incidents&assetName=/var/www/html/dotimages/GISUS7017C4_9dfea67a-0b97-4609-9d1d-e7f27a81a00d_2025-11-24_06-07-16_green.png.png',
      'https://usstaging.ivisecurity.com/common/downloadFile_1_0?requestName=incidents&assetName=/var/www/html/dotimages/GISUS7017C4_9dfea67a-0b97-4609-9d1d-e7f27a81a00d_2025-11-24_06-07-16_green.png.png',
    ]
  }
  isVideo(file: string): boolean {
    const types = ['mp4', '3gp', 'avi'];
    const ext = file.split('.')[file.split('.').length - 1];
    return types.includes(ext)
  }


}
