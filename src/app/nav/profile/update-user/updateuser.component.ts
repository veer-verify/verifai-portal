import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { AlertService } from '../../../../utilities/services/alert.service';

@Component({
  selector: 'app-updateuser',
  imports: [ReactiveFormsModule],
  templateUrl: './updateuser.component.html',
  styleUrl: './updateuser.component.css'
})
export class UpdateuserComponent {

  @Output() closeModal: any = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private auth_service: AuthService,
    private alert_service: AlertService
  ) { }

  userData: any;

  ngOnInit() {
    this.initForm();
    this.auth_service.getUserInfoForId().subscribe((res: any) => {
      this.userData = res;
      this.userForm.patchValue({
        firstName: this.userData?.firstName,
        lastName: this.userData.lastName,
        contactNo1: this.userData?.contactNo1,
        address_line1: this.userData?.address_line1,
        address_line2: this.userData?.address_line2,
        city: this.userData?.city,
        district: this.userData?.district,
        state: this.userData?.state,
        country: this.userData?.country,
        pin: this.userData?.pin
      })
    })
  }

  userForm!: FormGroup


  initForm() {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      contactNo1: ['', Validators.required],
      contactNo2: [''],
      address_line1: ['', Validators.required],
      address_line2: [''],
      city: ['', Validators.required],
      district: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pin: ['']
    });
  }

  close() {
    this.closeModal.emit(false);
  }

  updateUser() {
    if (this.userForm.invalid) return this.alert_service.error('Please fill valid details!');

    const obj = {
      ...this.userData,
      ...this.userForm.value
    }
    this.auth_service.updateUser(obj).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.alert_service.success('User Details Updated Successfully');
        this.close();
        this.auth_service.getUserInfoForId().subscribe((res: any) => {
          this.userData = res
        })
      }
      else {
        this.alert_service.error(res.message)
      }
    })
  }

}
