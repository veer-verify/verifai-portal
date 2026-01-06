import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(
    private http: HttpClient,
    private storageSrvc: StorageService,
    private date: DatePipe
  ) { }

  public dataFromSubheader: BehaviorSubject<any> = new BehaviorSubject([]);
  public site_add_sub: BehaviorSubject<any> = new BehaviorSubject({});

  public getSitesListForUserName(): Observable<any> {
    const url = `${environment.sitesUrl}/getSitesListForUserName_1_0/`;
    const user = this.storageSrvc.getData('user');
    const params = new HttpParams().set('userName', user?.UserName);
    return this.http.get(url, { params });
  }

  public getCamerasForSiteId(payload: any): Observable<any> {
    const url = `${environment.sitesUrl}/getCamerasForSiteIdForPortal_1_0/${payload?.siteId}`;
    const user = this.storageSrvc.getData('user');
    return this.http.get(url);
  }

  listTimeLapseVideos(payload: any) {
    // console.log(payload)
    let url = `${environment.timelapseUrl}/listTimeLapseVideos_1_0`;
    let params = new HttpParams();
    // console.log(payload);
    params = params.set('siteId', payload?.siteId)
    if(payload?.active) {
      params = params.set('active', payload?.active)
    }
    if(payload?.cameraId) {
      params = params.set('cameraId', payload?.cameraId)
    }
    if(payload?.fromDate) {
      let x: any = this.date.transform(payload?.fromDate,'yyyy-MM-dd');
      // console.log(x);
      params = params.set('fromDate', x);
    }
    if(payload?.toDate) {
      let x: any = this.date.transform(payload?.toDate, 'yyyy-MM-dd');
      params = params.set('toDate', x);
    }
    return this.http.get(url, {params: params});
  }

  nvrList(payload: any) {
    let url = `${environment.incidentsUrl}/NVRList_1_0`;
    let params = new HttpParams();
    if(payload?.siteId) {
      params = params.set('siteId', payload?.siteId)
    }
    return this.http.get(url, {params: params});
  }

}
