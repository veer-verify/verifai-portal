import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(
    private http: HttpClient,
    private storageSrvc: StorageService
  ) { }

  public dataFromSubheader: BehaviorSubject<any> = new BehaviorSubject([]);
  public site_add_sub: BehaviorSubject<any> = new BehaviorSubject({});

  public getSitesListForUserName(): Observable<any> {
    const url = `${environment.sitesUrl}/getSitesListForUserName_2_0/`;
    const user = this.storageSrvc.getData('user');
    const params = new HttpParams().set('userName', user?.UserName);
    return this.http.get(url, { params });
  }

  public getCamerasForSiteId(payload: any): Observable<any> {
    const url = `${environment.sitesUrl}/getCamerasForSiteIdForPortal_1_0/${payload?.siteId}`;
    const user = this.storageSrvc.getData('user');
    return this.http.get(url);
  }

}
