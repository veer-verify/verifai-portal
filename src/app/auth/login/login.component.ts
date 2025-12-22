import { Component, OnInit, signal, forwardRef, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AlertService } from '../../../utilities/services/alert.service';
import { MetadataService } from '../../../utilities/services/metadata.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgOtpInputConfig } from 'ng-otp-input';
import { MatExpansionModule } from '@angular/material/expansion';

export interface User {
  userName: string;
  password: string;
  callingSystemDetail: string;
}

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    forwardRef(() => ForgotPasswordComponent),
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
})
export class LoginComponent implements OnInit {
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private auth: AuthService,
    private storageSrvc: StorageService,
    private metaSrvc: MetadataService,
    private alertSrvc: AlertService
  ) {}

  loginForm!: FormGroup;
  showPassword: boolean = false;
  isLogin = signal(true);

  ngOnInit() {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      callingSystemDetail: [''],
    });
  }

  visiblePaswword() {
    this.showPassword = !this.showPassword;
  }

  saveMetaData() {
    this.metaSrvc.getMetadata().subscribe({
      next: (res) => this.storageSrvc.saveData('metaData', res),
    });
  }

  login() {
    if (!this.loginForm.valid) return;
    this.auth.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (res.Status === 'Success') {
          this.storageSrvc.saveData('user', res);
          this.saveMetaData();
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.alertSrvc.error(err.statusText);
      },
    });
  }
}

@Component({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgOtpInputModule,
    MatExpansionModule,
  ],
  selector: 'app-forgot-password',
  template: `
    <div *ngIf="!mailSent; else forPass" class="forgot-password">
      <p>Forgot Password?</p>

      <form [formGroup]="forgotEmailForm" (ngSubmit)="submitEmail()">
        <div class="form-group">
          <label>Email Address</label>
          <input
            type="email"
            formControlName="email"
            placeholder="Enter your email"
          />
        </div>

        <button
          type="button"
          class="btn-secondary"
          (click)="closeForgot.emit()"
        >
          Cancel
        </button>

        <button type="submit" [disabled]="forgotEmailForm.invalid">
          Submit
        </button>
      </form>
    </div>

    <ng-template #forPass>
      <div *ngIf="!otpPass; else newPass" class="success-message">
        <h2>Check your email</h2>
        <p>We have sent an OTP to your email.</p>

        <div class="inputContainer">
          <ng-otp-input
            [config]="otpConfig"
            (onInputChange)="onOtpChange($event)"
          >
          </ng-otp-input>
        </div>

        <button
          class="login-btn"
          (click)="verifyOtp()"
          style="margin-top: 20px;"
        >
          Verify OTP
        </button>
      </div>
    </ng-template>
    <ng-template #newPass>
      <div class="createNewPassword">
        <p>Create new password</p>

        <form [formGroup]="newPasswordForm">
          <div class="form-group password-group">
            <label>New Password</label>
            <div class="password-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="New Password"
              />
              <img
                [src]="
                  showPassword ? 'icons/eyedisabled.svg' : 'icons/view.svg'
                "
                class="toggle-password"
                (click)="showPassword = !showPassword"
                alt="Toggle password"
              />
            </div>
          </div>

          <div class="form-group password-group">
            <label>Confirm New Password</label>
            <div class="password-wrapper">
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                formControlName="confirm_password"
                placeholder="Confirm New Password"
              />
              <img
                [src]="
                  showConfirmPassword
                    ? 'icons/eyedisabled.svg'
                    : 'icons/view.svg'
                "
                class="toggle-password"
                (click)="showConfirmPassword = !showConfirmPassword"
                alt="Toggle password"
              />
            </div>
          </div>

          <div class="password-rules">
            <p>Password must contain:</p>

            <ul>
              <li [class.valid]="passwordRules.minLength">
                <span class="icon">✔</span> At least 8 characters
              </li>

              <li [class.valid]="passwordRules.upper">
                <span class="icon">✔</span> At least one uppercase letter
              </li>

              <li [class.valid]="passwordRules.lower">
                <span class="icon">✔</span> At least one lowercase letter
              </li>

              <li [class.valid]="passwordRules.digit">
                <span class="icon">✔</span> At least one digit
              </li>

              <li [class.valid]="passwordRules.special">
                <span class="icon">✔</span> At least one special character
              </li>
            </ul>
          </div>
          <button
            type="submit"
            class="btn-primary"
            [disabled]="!isPasswordValid()"
          >
            Update Password
          </button>
        </form>
      </div>
    </ng-template>`,
  styleUrl: './login.component.css',
  standalone: true,
})
export class ForgotPasswordComponent implements OnInit {
  forgotEmailForm!: FormGroup;
  newPasswordForm!: FormGroup;
  mailSent = false;
  otp = '';
  otpPass = false;
  showPassword = false;
  showConfirmPassword = false;

  @Output() closeForgot = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private alertSrvc: AlertService
  ) {}

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

  togglePath = 'icons/view.svg';

  ngOnInit() {
    this.forgotEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.newPasswordForm = this.fb.group({
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
    });

    this.newPasswordForm
      .get('password')!
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

    console.log('Email:', this.forgotEmailForm.value.email);
    this.mailSent = true;

    // call send OTP API here
  }

  onOtpChange(otp: string) {
    this.otp = otp;
  }

  verifyOtp() {
    if (this.otp.length !== 4) {
      this.alertSrvc.error('Please enter valid OTP');
      return;
    }

    if (this.otp === '1234') {
      this.otpPass = true;
    }

    console.log('OTP:', this.otp);
    // verify OTP API call
  }
}
