import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private datePipe: DatePipe,
  ) { }

  incidentList(payload?: any): Observable<any> {
    let url = `${environment.eventDataUrl}/getEventList_1_0`;
    let params = new HttpParams();

    var user = this.storageService.getData('user');
    if (user) {
      params = params.set('userId', user.UserId);
    }
    if (payload?.siteId) {
      params = params.set('siteId', payload?.siteId);
    }
    if (payload?.objectName) {
      params = params.set('objectName', payload?.objectName);
    }
    if (payload?.cameraId) {
      params = params.set('cameraId', payload?.cameraId);
    }
    if (payload?.actionTag) {
      params = params.set('subAlertTag', payload?.actionTag);
    }
    if (payload?.fromDate) {
      params = params.set(
        'fromDate',
        this.datePipe.transform(payload?.fromDate, 'yyyy-MM-dd HH:mm:ss')!,
      );
    }
    if (payload?.toDate) {
      params = params.set(
        'toDate',
        this.datePipe.transform(payload?.toDate, 'yyyy-MM-dd HH:mm:ss')!,
      );
    }

    params = params.set('callingSystemDetail', 'portal');

    if (payload?.pageSize) {
      params = params.set('pageSize', payload.pageSize);
    } else {
      params = params.set('pageSize', 10);
    }
    if (payload?.page) {
      params = params.set('page', payload.page);
    } else {
      params = params.set('page', 1);
    }
    return this.http.get(url, { params: params });
  }

  getSiteAlerts(payload: any): Observable<any> {
    let url = `${environment.incidentsUrl}/getSiteAlerts_1_0`;
    let params = new HttpParams();
    if (payload?.siteId) {
      params = params.set('siteId', payload?.siteId);
    }
    return this.http.get(url, { params: params });
  }
}
