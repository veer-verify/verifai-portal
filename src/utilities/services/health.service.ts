import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class HealthService {
  constructor(private http: HttpClient) {}

  getDevices(payload: any): Observable<any> {
    let url = `${environment.healthUrl}/generateDeviceHealthstats_2_0`;

    let params = new HttpParams();

    if (payload?.user_name) {
      params = params.set('user_name', payload.user_name);
    }

    if (
      payload?.site_id !== undefined &&
      payload?.site_id !== null &&
      payload?.site_id !== ''
    ) {
      params = params.set('site_id', String(payload.site_id));
    }

    if (
      payload?.status !== undefined &&
      payload?.status !== null &&
      payload?.status !== ''
    ) {
      params = params.set('status', String(payload.status));
    }

    params = params
      .set('pageno', String(payload?.pageno ?? 1))
      .set('pagesize', String(payload?.pagesize ?? 10));

    return this.http.get(url, { params });
  }
  getDeviceInfo(deviceId: string): Observable<any> {
    const url = `${environment.healthUrl}/deviceInfo_1_0`;

    const params = new HttpParams().set('device_id', deviceId);

    return this.http.get(url, { params });
  }

  getCameras(payload: any): Observable<any> {
    const url = `${environment.healthUrl}/generateCameraHealthstats_1_0`;

    let params = new HttpParams();

    if (payload?.user_name) {
      params = params.set('user_name', payload.user_name);
    }

    if (
      payload?.site_id !== undefined &&
      payload?.site_id !== null &&
      payload?.site_id !== ''
    ) {
      params = params.set('site_id', String(payload.site_id));
    }

    if (
      payload?.status !== undefined &&
      payload?.status !== null &&
      payload?.status !== ''
    ) {
      params = params.set('status', String(payload.status));
    }

    params = params
      .set('pageno', String(payload?.pageno ?? 1))
      .set('pagesize', String(payload?.pagesize ?? 10));

    return this.http.get(url, { params });
  }

  getCameraInfo(cameraId: string, fromTime: string, toTime: string): Observable<any> {
    const url = `${environment.healthUrl}/cameraInfo_1_0`;

    const params = new HttpParams()
      .set('camera_id', cameraId)
      .set('from_time', fromTime)
      .set('to_time', toTime);

    return this.http.get(url, { params });
  }


}
