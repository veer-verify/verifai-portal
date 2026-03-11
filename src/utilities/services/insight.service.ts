import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpParams, HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InsightService {

  constructor(
    private http: HttpClient,
    private fordate: DatePipe
  ) { }

  getNonWorkingDays(payload: any): Observable<any> {
    let url = `${environment.insightsUrl}/notWorkingDays_1_0`;
    let params = new HttpParams();
    params = params.set('siteId', 36347);
    if (payload?.year) {
      params = params.set('year', payload?.year)
    }
    return this.http.get(url, { params: params });
  }

  biAnalyticsReport(payload: any): Observable<any> {
    const url = environment.insightsUrl + '/biAnalyticsReport_1_0';
    let params = new HttpParams();
    params = params.set('SiteId', 36347);
    if (payload?.fromDate) {
      params = params.set('fromDate', this.fordate.transform(payload?.fromDate, 'yyyy-MM-dd')!)
    }
    if (payload?.toDate) {
      params = params.set('toDate', this.fordate.transform(payload?.toDate, 'yyyy-MM-dd')!)
    }
    return this.http.get(url, { params: params });
  }

  getBiAnalyticsResearch(siteId: any, startDate: any) {
    let url = environment.insightsUrl + '/getAnalyticsListforSite_1_0';
    let params = new HttpParams();
    params = params.set('SiteId', siteId ?? 0);
    if (startDate) {
      params = params.set('date', this.fordate.transform(startDate, 'yyyy-MM-dd')!)
    }
    return this.http.get(url, { params: params });
  }

  getBiTrends(siteId: any, date: any, typeid: any) {
    let url = `${environment.insightsUrl}/analyticTrends_2_0`;
    let params = new HttpParams();
    params = params.set('SiteId', siteId);
    if (date) {
      params = params.set('date', this.fordate.transform(date, 'yyyy-MM-dd')!);
    }
    if (typeid) {
      params = params.set('analyticTypeId', typeid);
    }
    return this.http.get(url, { params: params })
  }

}
