import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  incidentList(payload?: any): Observable<any> {
    let url = `${environment.incidentsUrl}/incidentList_1_0`;
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
      params = params.set('actionTag', payload?.actionTag);
    }
    if (payload?.fromDate) {
      params = params.set('fromDate', payload?.fromDate);
    }
    if (payload?.toDate) {
      params = params.set('toDate', payload?.toDate);
    }

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
}
