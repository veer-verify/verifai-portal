import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../utilities/services/alert.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-camera-insights',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './camera-insights.component.html',
  styleUrl: './camera-insights.component.css'
})
export class CameraInsightsComponent {
  constructor(
    private fb: FormBuilder,
    private auth_service: AuthService,
    private alert_service: AlertService
  ) { }

  @Output() closeModal: any = new EventEmitter<void>();
  @Output() siteActions = new EventEmitter<any>();

  // triggerSiteAction(data: any) {
  //   console.log(data)

  // }

  roleList: any;

  addUserForm!: FormGroup

  ngOnInit() {

  }

  close() {
    this.closeModal.emit()
  }

}
