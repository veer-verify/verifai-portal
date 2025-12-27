import { Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  siteAddData: any;
  constructor(
    private snackBar: MatSnackBar,
    private configSrvc: ConfigService
  ) {
    this.configSrvc.site_add_sub.subscribe({
      next: (res: any) => {
        this.siteAddData = res
      }
    })
  }





  /* sweet alert */
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

  wait() {
    Swal.fire({
      text: "Please wait",
      imageUrl: "gif/ajax-loading-gif.gif",
      showConfirmButton: false,
      allowOutsideClick: false
    })
  }


  updateCam() {
    return Swal.fire({
      // title: "Are you sure?",
      text: "Do you want to Update Camera?",
      // icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    })
  }

  confirmDelete() {
    return Swal.fire({
      // title: "Are you sure?",
      text: "To activate this object-based rule, you need to add a camera for the device. Would you like to add a camera?",
      // icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    })
  }

  confirmDel() {
    return Swal.fire({
      // title: "Are you sure?",
      text: "Do you Want to Deactivate This User?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    })
  }

}


