import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { delay, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) { }

  warn(message: any) {
    this.openSnack(message, 'warning');
  }

  error(message: any) {
    this.openSnack(message, 'error');
  }

  success(message: any) {
    this.openSnack(message, 'success');
  }

  private openSnack(
    message: any,
    type: 'success' | 'error' | 'warning',
  ): void {
    this.snackBar.open(String(message ?? ''), 'x', {
      duration: type === 'error' ? 5000 : 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['app-snackbar', `app-snackbar-${type}`],
    });
  }

  confirm(message: string) {
    return Swal.fire({
      icon: 'warning',
      text: `${message}`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: '#ed3237',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      allowOutsideClick: false,
    });
  }

  wait() {
    Swal.fire({
      text: 'Please wait',
      imageUrl: 'gif/ajax-loading-gif.gif',
      showConfirmButton: false,
      allowOutsideClick: false,
    });
  }

  downloadExcelReport(payload: any, token: string) {
    const url = `${environment.eventDataUrl}/downloadAlertReport_1_0`;

    let params = new HttpParams()
      .set('fromDate', payload.fromDate)
      .set('toDate', payload.toDate)
      .set('siteId', String(payload.siteId));

    if (payload.cameraId) {
      params = params.set('cameraId', payload.cameraId);
    }

    if (
      payload.actionTag !== undefined &&
      payload.actionTag !== null &&
      payload.actionTag !== ''
    ) {
      params = params.set('actionTag', String(payload.actionTag));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(url, {
      headers,
      params,
      responseType: 'blob',
    });
  }

  checkLiveDummy(payload: any) {
    return of({
      statusCode: 200,
      message: 'Dummy live check API called successfully',
      data: payload,
    }).pipe(delay(400));
  }
}
