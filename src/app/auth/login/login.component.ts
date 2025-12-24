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
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

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
    ForgotPasswordComponent
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
  ) { }

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