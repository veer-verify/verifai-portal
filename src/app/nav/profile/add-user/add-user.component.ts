import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { AlertService } from '../../../../utilities/services/alert.service';

@Component({
  selector: 'app-add-user',
  imports: [ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css',
})
export class AddUserComponent {

  constructor(
    private fb: FormBuilder,
    private auth_service: AuthService,
    private alert_service: AlertService
  ) { }

  @Output() closeModal: any = new EventEmitter<void>();

  @Input() roleList: any;

  addUserForm!: FormGroup

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.addUserForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      userName: [''],
      emailId: [''],
      roleList: [],
      remarks: ['']
    });
  }

  addUser() {
    if (this.addUserForm.valid) {
      this.auth_service.createUserWithShortDetails(this.addUserForm.value).subscribe({
        next: (res: any) => {
          if (res.statusCode === 200) {
            this.alert_service.success(res.message);
          }
          else {
            this.alert_service.error(res.message);
          }
        },
        error: (err) => this.alert_service.error(err)
      })
    }
  }

  close() {
    this.closeModal.emit()
  }
}
