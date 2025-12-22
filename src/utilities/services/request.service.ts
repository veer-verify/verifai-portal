import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StorageService } from './storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(
    private http: HttpClient,
    private storage_service: StorageService
  ) { }

  getHelpDeskCategories() {
    let url = `${environment.helpdeskUrl}/categoryList_1_0`;
    return this.http.get(url);
  }

  addHelpDeskRequest(payload: any, file?: any): Observable<any> {
    let url = `${environment.helpdeskUrl}/addService_1_0`;
    var user = this.storage_service.getData('user');
    let formData = new FormData();

    formData.append('siteId', payload.siteId);
    formData.append('calling_system', 'portal');
    formData.append('service_cat_id', payload.service_cat_id);
    formData.append('service_subcat_id', payload.service_subcat_id);
    formData.append('createdBy', user?.UserId);
    formData.append('description', payload.description);
    // formData.append('PrefTimeToCall', payload.PrefTimeToCall);

    formData.append('priority', payload.priority);
    formData.append('remarks', payload.remarks);

    if (payload.prefTimeToCall) {
      formData.append('prefTimeToCall', payload.prefTimeToCall);
    }
    if (file) {
      formData.append('requestName', 'service-requests-test');
      formData.append('assetName', file?.name);
      formData.append('assetFile', file);
    }
    return this.http.post(url, formData);
  }

  updateHelpDeskRequest(payload: any): Observable<any> {
    let url = `${environment.helpdeskUrl}/updateService_1_0/${payload?.serviceReqId}`;
    var user = this.storage_service.getData('user');
    let formData = new FormData();

    // if (payload.PrefTimeToCall != null) { formData.append('preferredTimeToCall', payload.PrefTimeToCall); }
    formData.append('siteId', payload.siteId ? payload.siteId : payload.siteId);
    formData.append('calling_system', 'portal');
    formData.append('service_cat_id', payload.service_cat_id);
    formData.append('service_subcat_id', payload.service_subcat_id);
    formData.append('editedBy', user?.UserId);
    formData.append('modifiedBy', user?.UserId);
    formData.append('description', payload.description);
    formData.append('PrefTimeToCall', payload.PrefTimeToCall);
    formData.append('priority', payload.priority);
    formData.append('remarks', payload.remarks);
    formData.append('status', payload.status);
    return this.http.put(url, formData);
  }

  getHelpDeskRequests(payload?: any): Observable<any> {
    let url = `${environment.helpdeskUrl}/ListServiceRequest_1_0`;
    var user = this.storage_service.getData('user');

    let params = new HttpParams();
    // if (user && !this.storage_service.isSuperAdmin()) {
    //   params = params.set('userId', user?.UserId);
    // }
    if (payload?.siteId) {
      params = params.set('siteId', payload?.siteId);
    }
    if (payload?.serviceCategory) {
      params = params.set('serviceCategory', payload?.serviceCategory);
    }
    if (payload?.serviceSubCategory) {
      params = params.set('serviceSubCategory', payload?.serviceSubCategory);
    }
    if (payload?.status) {
      params = params.set('status', payload?.status);
    }
    if (payload?.userId) {
      params = params.set('userId', payload?.userId);
    }
    if (payload?.page) {
      params = params.set('page', payload?.page);
    }
    if (payload?.fromDate) {
      params = params.set('fromDate', payload?.fromDate);
    }
    if (payload?.toDate) {
      params = params.set('toDate', payload?.toDate);
    }

    return this.http.get(url, { params: params });
  }

  deleteHelpDeskRequests(payload: any): Observable<any> {
    // var payload = {
    //   userName: a.UserName,
    //   accessToken: 'abc',
    //   calling_System_Detail: "portal",
    //   siteId: b.siteId,
    //   serviceId: serviceid
    // }
    let url = `${environment.helpdeskUrl}/deleteServiceRequest_1_0/${payload?.serviceReqId}`;
    return this.http.put(url, null);
  }

  assignServiceRequest(payload: any): Observable<any> {
    let url = `${environment.helpdeskUrl}/assignServiceRequest_1_0`;
    var user = this.storage_service.getData('user');
    payload.assignedBy = user?.UserId;
    // let obj = {
    //   serviceReqId: payload?.serviceReqId,
    //   assignedTo: payload?.assignedTo,
    //   assignedType: '',
    //   status: payload?.status,
    //   comments: payload?.comments,
    //   modifiedBy: user?.UserId
    // }
    return this.http.put(url, payload);
  }
}
