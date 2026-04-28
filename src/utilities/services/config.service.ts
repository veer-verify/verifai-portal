import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(
    private http: HttpClient,
    private storageSrvc: StorageService,
    private date: DatePipe,
  ) { }

  public dataFromSubheader = new BehaviorSubject<any>([]);
  public site_add_sub = new BehaviorSubject<any>({});

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

  listTimeLapseVideos(payload: any) {
    let url = `${environment.timelapseUrl}/listTimeLapseVideos_1_0`;
    let params = new HttpParams();
    params = params.set('siteId', payload?.siteId);
    if (payload?.active) {
      params = params.set('active', payload?.active);
    }
    if (payload?.cameraId) {
      params = params.set('cameraId', payload?.cameraId);
    }
    if (payload?.fromDate) {
      let x: any = this.date.transform(payload?.fromDate, 'yyyy-MM-dd');
      params = params.set('fromDate', x);
    }
    if (payload?.toDate) {
      let x: any = this.date.transform(payload?.toDate, 'yyyy-MM-dd');
      params = params.set('toDate', x);
    }
    return this.http.get(url, { params });
  }

  nvrList(payload: any) {
    let url = `${environment.incidentsUrl}/NVRList_1_0`;
    let params = new HttpParams();
    if (payload?.siteId) {
      params = params.set('siteId', payload?.siteId);
    }
    return this.http.get(url, { params });
  }

  listSiteServices(payload: any): Observable<any> {
    let url = `${environment.sitesUrl}/listSiteServices_1_0`;
    let params = new HttpParams().set('siteId', payload?.siteId);
    return this.http.get(url, { params });
  }

  getSiteFloorMapDetails(payload: any): Observable<any> {
    let url = `${environment.sitesUrl}/getSiteFloorMapDetails_1_0`;
    let params = new HttpParams().set('siteId', payload?.siteId);
    return this.http.get(url, { params });
  }

  getPlayback(payload: any) {
    const url = `${environment.playbackUrl}/get-video-links`;
    let params = new HttpParams()
      .set('requestName', payload?.requestName)
      .set('fromDatetime', payload?.fromDatetime)
      .set('toDatetime', payload?.toDatetime)
      .set('level', payload?.level)
      .set('expires', payload?.expires ?? 3600);

    return this.http.get(url, { params });
  }

  getUserFavorites(userId: any): Observable<any> {
    let url = `${environment.authUrl}/getUserFavorites_1_0`;

    const params = new HttpParams().set('userId', String(userId));

    return this.http.get(url, { params });
  }

  addUserFavorite(payload: any): Observable<any> {
    const url = `${environment.authUrl}/addUserFavorites_1_0`;

    const params = new HttpParams()
      .set('siteId', String(payload.siteId))
      .set('cameraId', String(payload.cameraId))
      .set('userId', String(payload.userId))
      // .set('httpUrl', String(payload.httpUrl))
      .set('createdBy', String(payload.createdBy))
      .set('folderName', String(payload.folderName));

    return this.http.post(url, null, { params });
  }
  deleteFavoriteCamera(id: any, modifiedBy: any): Observable<any> {
    const url = `${environment.authUrl}/deleteFavoriteCamera_1_0`;

    const params = new HttpParams()
      .set('id', String(id))
      .set('modifiedBy', String(modifiedBy));

    return this.http.delete(url, { params });
  }

  deleteFavoriteFolder(folderId: any, modifiedBy: any): Observable<any> {
    const url = `${environment.authUrl}/deleteFavoriteFolder_1_0`;

    const params = new HttpParams()
      .set('folderId', String(folderId))
      .set('modifiedBy', String(modifiedBy));

    return this.http.delete(url, { params });
  }

}
