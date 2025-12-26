
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgOtpInputConfig } from 'ng-otp-input';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AlertService } from '../../../utilities/services/alert.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgOtpInputModule,
    MatExpansionModule,
  ]
})
export class ForgotPasswordComponent {

  @Output() closeForgot = new EventEmitter<void>();

  currentPage = 'validate_email';
  forgotEmailForm!: FormGroup;
  newPasswordForm!: FormGroup;
  // mailSent = false;
  otp: any;
  otpPass = false;
  showPassword = false;
  showConfirmPassword = false;


  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private alertSrvc: AlertService
  ) { }

  otpConfig: NgOtpInputConfig = {
    length: 4,
    allowNumbersOnly: true,
    inputStyles: {
      width: '40px',
      height: '40px',
      fontSize: '18px',
      border: '2px solid #ccc',
      borderRadius: '6px',
    },
  };
  passwordRules = {
    minLength: false,
    upper: false,
    lower: false,
    digit: false,
    special: false,
  };

  ngOnInit() {
    this.forgotEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.newPasswordForm = this.fb.group({
      newPassword: ['', Validators.required],
      confirmNewPassword: ['', Validators.required],
    });


  }

  checkPassword() {
    this.newPasswordForm
      .get('newPassword')!
      .valueChanges.subscribe((password: string) => {
        this.checkPasswordRules(password || '');
      });
  }

  isPasswordValid(): boolean {
    return Object.values(this.passwordRules).every(Boolean);
  }

  checkPasswordRules(password: string) {
    this.passwordRules.minLength = password.length >= 8;
    this.passwordRules.upper = /[A-Z]/.test(password);
    this.passwordRules.lower = /[a-z]/.test(password);
    this.passwordRules.digit = /\d/.test(password);
    this.passwordRules.special = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  submitEmail() {
    if (this.forgotEmailForm.invalid) return;
    this.auth.generateOTP(this.forgotEmailForm.value).subscribe({
      next: (res) => {
        this.currentPage = 'validate_otp';
      },
      error: (err) => {
        console.log(err)
        this.alertSrvc.error(err.error.detail)
      }
    });
  }

  onOtpChange(otp: string) {
    this.otp = otp;
  }

  verifyOtp() {
    if (this.otp.length !== 4) return this.alertSrvc.error('Please enter valid OTP');
    this.auth.validateOTP({ ...this.forgotEmailForm.value, ...{ otp: this.otp } }).subscribe({
      next: (res) => {
        this.currentPage = 'validate_password';
      }
    });
  };

  updatePassword() {
    this.auth.updateForgotPassword({ ...this.forgotEmailForm.value, ...this.newPasswordForm.value }).subscribe({
      next: (res) => {
        this.currentPage = 'complete';
      }
    })
  }

  backToSignIn() {
    this.closeForgot.emit()
  }

}
