import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { catchError, filter, firstValueFrom, map, of } from 'rxjs';

@Pipe({
  name: 'media'
})
export class MediaPipe implements PipeTransform {

  http = inject(HttpClient);
  storage_service = inject(StorageService);
  async transform(src: string): Promise<any> {
    const user = this.storage_service.getData('user');
    const headers = new HttpHeaders({ Authorization: `Bearer ${user?.AccessToken}` })
    const blob = await firstValueFrom(this.http.get(src, { headers, responseType: 'blob' }));
    return new Promise((reslove, reject) => {
      const fileReader = new FileReader();
      if (blob) {
        fileReader.onloadend = () => reslove(fileReader.result as string);
        fileReader.readAsDataURL(blob);
      } else {
        reject(new Error('failed to load image'));
      }
    });
  }

}
