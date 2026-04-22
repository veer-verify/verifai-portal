import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { AlertService } from '../../../../utilities/services/alert.service';
import { RouterLink, RouterModule } from "@angular/router";

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  constructor(
    private fb: FormBuilder,
    private auth_service: AuthService,
    private alert_service: AlertService
  ) { }

  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  changePasswordForm!: FormGroup;

  //  Password rules (same as forgot password)
  passwordRules = {
    minLength: false,
    upper: false,
    lower: false,
    digit: false,
    special: false,
  };

  showPasswordRules = false;

  ngOnInit() {
    this.inItForm();
    this.listenPasswordChanges();
  }

  inItForm() {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  listenPasswordChanges() {
    this.changePasswordForm
      .get('newPassword')!
      .valueChanges.subscribe((password: string) => {
        this.checkPasswordRules(password || '');
      });
  }

  checkPasswordRules(password: string) {
    this.passwordRules.minLength = password.length >= 8;
    this.passwordRules.upper = /[A-Z]/.test(password);
    this.passwordRules.lower = /[a-z]/.test(password);
    this.passwordRules.digit = /\d/.test(password);
    this.passwordRules.special = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  isPasswordValid(): boolean {
    return Object.values(this.passwordRules).every(Boolean);
  }

  passwordsMatch(): boolean {
    const { newPassword, confirmPassword } = this.changePasswordForm.value;
    return newPassword === confirmPassword;
  }

  changePassword() {
    const { newPassword, confirmPassword } = this.changePasswordForm.value;

    if (this.changePasswordForm.invalid) {
      this.alert_service.error('Please fill all required fields');
      return;
    }

    if (!this.isPasswordValid()) {
      this.alert_service.error('Password does not meet requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.alert_service.error('Passwords do not match');
      return;
    }

    this.auth_service.updatePassword(this.changePasswordForm.value).subscribe({
      next: (res: any) => {
        if (res.status_code === '200') {
          this.alert_service.success(res.message);
          this.auth_service.logout();
        } else {
          this.alert_service.error(res.message);
        }
      },
      error: (err) => this.alert_service.error(err),
    });
  }
}
