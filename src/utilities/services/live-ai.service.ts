import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LiveAiService {
  constructor(private http: HttpClient, private datePipe: DatePipe) { }

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
  getAlertCounts(payload: any) {
    const url = `${environment.eventDataUrl}/getAITagCounts_1_0`;
    let params = new HttpParams().set('siteId', payload?.siteId);

    // FROM DATE
    if (payload?.fromDate) {
      const fromDateTime = payload.fromTime
        ? new Date(`${payload.fromDate}T${payload.fromTime}`)
        : new Date(payload.fromDate);

      params = params.set(
        'fromDate',
        this.datePipe.transform(
          fromDateTime,
          payload.fromTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd',
        )!,
      );
    }

    // TO DATE
    if (payload?.toDate) {
      const toDateTime = payload.toTime
        ? new Date(`${payload.toDate}T${payload.toTime}`)
        : new Date(payload.toDate);

      params = params.set(
        'toDate',
        this.datePipe.transform(
          toDateTime,
          payload.toTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd',
        )!,
      );
    }

    if (payload?.cameraId) {
      params = params.set('cameraId', payload.cameraId);
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
      // date,
      cameraIds,
      callingSystemDetail: 'portal'
    };

    return this.http.get<any>(url, { params });
  }
}
