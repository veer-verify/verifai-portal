import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  constructor(
    private http: HttpClient
  ) { }

  getMetadata() {
    let url = `${environment.metadataUrl}/common/getValuesListByType_1_0`;
    return this.http.get(url);
  }

  getMetadataByType(payload: any) {
    let url = `${environment.metadataUrl}/common/getValuesListByType_1_0`;
    let params = new HttpParams().set('type', payload);
    return this.http.get(url, {params: params});
  }
 
}
