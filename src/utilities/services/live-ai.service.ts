import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LiveAiService {
  constructor(private http: HttpClient) { }

  //!! ======================= Get Cameras  =======================
  getCamerasForAI(siteId: number) {
    const url = `${environment.sitesUrl}/getCamerasForService_1_0`;

    const params = {
      siteId: siteId,
      AI: 'T',
    };

    return this.http.get<any>(url, { params });
  }

  //!! =======================  Get Alert Counts  =======================
  getAlertCounts(siteId: number, date: string, cameraId?: string) {
    const url = `${environment.eventDataUrl}/getAITagCounts_1_0`;

    const params: any = {
      siteId,
      date,
    };

    if (cameraId) {
      params.cameraId = cameraId;
    }

    return this.http.get<any>(url, { params });
  }

  //!!  ======================= Get Camera Image  =======================
  //  Get latest camera image (JSON → URL)
  getLatestCameraImage(cameraId: string) {
    const url = `${environment.eventDataUrl}/getLatestCameraImage_1_0`;

    return this.http.get<any>(url, {
      params: { cameraId },
    });
  }

  //!!  =======================  NEW EVENTS API  =======================
  getEventsByCameras(siteId: number, date: string, cameraIds: string[]) {
    const url = `${environment.eventDataUrl}/getEventsByCameras_1_0`;

    const params: any = {
      siteId,
      date,
      cameraIds,
      callingSystemDetail: 'portal'
    };

    return this.http.get<any>(url, { params });
  }
}
