import { Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  warn(message: any) {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure!',
      text: message,
      showCloseButton: true
    })
  }

  error(message: any) {
    Swal.fire({
      icon: 'error',
      title: 'Failed!',
      text: message,
      showCloseButton: true
    })
  }

  success(message: any) {
    Swal.fire({
      icon: 'success',
      title: `Done!`,
      text: `${message}`,
      showCloseButton: true,
      timer: 3000
    })
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
      allowOutsideClick: false
    });
  }

  wait() {
    Swal.fire({
      text: "Please wait",
      imageUrl: "gif/ajax-loading-gif.gif",
      showConfirmButton: false,
      allowOutsideClick: false
    })
  }

}


