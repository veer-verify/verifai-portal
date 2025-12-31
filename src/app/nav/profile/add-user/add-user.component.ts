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

 @Output() siteActions = new EventEmitter<any>();

triggerSiteAction(data: any) {
  this.siteActions.emit(data);
}

  roleList: any;

  addUserForm!: FormGroup

  ngOnInit() {
    this.initForm();
    this.auth_service.listRoles().subscribe((res:any)=>{
      if(res.statusCode===200) {
        this.roleList = res.roleList;
      }
    })
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
            this.alert_service.confirm('Do you want to map sites to the user ?').then((result: any)=>{
              if(result.isConfirmed) this.triggerSiteAction(res)
            })
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
