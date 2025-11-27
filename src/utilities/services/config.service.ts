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

  public showSiteMenu: BehaviorSubject<boolean> = new BehaviorSubject(false);


  public dataFromSubheader: BehaviorSubject<any> = new BehaviorSubject([]);
  public numberFromSub: BehaviorSubject<any> = new BehaviorSubject(null);
  public current_site_sub: BehaviorSubject<any> = new BehaviorSubject(null);

  public site_add_sub: BehaviorSubject<any> = new BehaviorSubject({});

  public devices_sub: BehaviorSubject<any> = new BehaviorSubject(null);
  public filter_sub: BehaviorSubject<any> = new BehaviorSubject({});

  // public currentpage_sub: BehaviorSubject<any> = new BehaviorSubject(1);
  public paginated_cam_sub: BehaviorSubject<any> = new BehaviorSubject([]);


  public getSitesListForUserName(): Observable<any> {
    const url = `${environment.sitesUrl}/getSitesListForUserName_1_0/`;
    const user = this.storageSrvc.getData('user');
    const params = new HttpParams().set('userName', user?.UserName);
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${user.AccessToken}`
    })
    return this.http.get(url, { params, headers});
  }

  public getCamerasForSiteId(payload: any): Observable<any> {
    const url = `${environment.sitesUrl}/getCamerasForSiteId_1_0/${payload?.siteId}`;
        const user = this.storageSrvc.getData('user');
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${user.AccessToken}`
    })
    return this.http.get(url, {headers});
  }


  incidentList(payload: any) {
    let url = `${environment.incidentUrl}/incidents/incidentList_1_0`;
    let params = new HttpParams();
    // if(payload?.siteId) {
    params = params.set('siteId', 36337)
    // }
    // if(payload?.fromDate) {
    params = params.set('fromDate', '2024-9-10')
    // }

    return this.http.get(url, { params: params })
  }



}
