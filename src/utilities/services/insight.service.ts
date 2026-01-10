import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpParams, HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class InsightService {

  constructor(
    private http: HttpClient,
    private fordate: DatePipe
  ) { }

  getNonWorkingDays(siteId: any, year?: any) {
    let url = `${environment.insightsUrl}/notWorkingDays_1_0`;
    let params = new HttpParams();
    params = params.set('siteId', siteId)
    if (year) {
      params = params.set('year', year)
    }
    return this.http.get(url, { params: params });
  }

  getBiAnalyticsResearch(siteId: any, startDate: any) {
    let url = environment.insightsUrl + '/getAnalyticsListforSite_1_0';
    let params = new HttpParams();
    params = params.set('SiteId', siteId);
    if(startDate) {
      params = params.set('date', this.fordate.transform(startDate,'yyyy-MM-dd')!)
    }
    return this.http.get(url, {params: params});
  }

  getBiTrends(siteId: any, date: any, typeid: any) {
    // let url1 = `${environment.insightsUrl}/analyticTrends_1_0?SiteId=${siteId}&date=${date}&analyticTypeId=${typeid}`;
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
