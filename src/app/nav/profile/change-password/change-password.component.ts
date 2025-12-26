import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { AlertService } from '../../../../utilities/services/alert.service';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  constructor(
    private fb: FormBuilder,
    private auth_service: AuthService,
    private alert_service: AlertService
  ){}

  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  changePasswordForm!: FormGroup

  ngOnInit(){
    this.inItForm();
  }

  inItForm(){
    this.changePasswordForm=this.fb.group({
      oldPassword: ['',Validators.required],
      newPassword: ['',Validators.required],
      confirmPassword: ['',Validators.required]
    })
  }

  changePassword(){
    const { newPassword, confirmPassword } = this.changePasswordForm.value;
    if(this.changePasswordForm.valid && newPassword === confirmPassword){
      this.auth_service.updatePassword(this.changePasswordForm.value).subscribe({
        next: (res: any)=>{
          if(res.status_code==="200"){
            this.alert_service.success(res.message);
            this.auth_service.logout();
          }
          else this.alert_service.error(res.message);
        },
        error: (err)=> this.alert_service.error(err)
      });
    }
    else{
      this.alert_service.error('Please Enter Valid Details')
    }
  }
}
