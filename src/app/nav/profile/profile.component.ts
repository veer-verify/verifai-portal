import { Component, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { MediaPipe } from '../../../utilities/pipes/media.pipe';
import { AsyncPipe, NgClass } from '@angular/common';
import { AlertService } from '../../../utilities/services/alert.service';
import { ConfigService } from '../../../utilities/services/config.service';
import { FormsModule } from '@angular/forms';
import { UpdateuserComponent } from './updateuser/updateuser.component';
import { AddUserComponent } from './add-user/add-user.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [MediaPipe, AsyncPipe, NgClass, FormsModule, UpdateuserComponent, AddUserComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  constructor(
    private auth_service: AuthService,
    private storage_service: StorageService,
    private alert_service: AlertService,
    private router: Router
  ){}

  profileImg: any;
  userData: any;
  showLoader = false;
  address: any=[];
  raw_address: any;
  sitesList :any;
  subUsers : any;
  isEdit = false;
  userRoles:any;
  editBtns : any;
  addBtn = false;

  ngOnInit(){

    // const key = this.storage_service.getData('user')
    this.auth_service.getUserInfoForId().subscribe((res: any)=>{
      this.userData = res;
      this.raw_address = [this.userData?.address_line1, this.userData?.address_line2, this.userData?.city,this.userData?.district, this.userData?.state,this.userData?.country]
      this.address = this.raw_address.filter(Boolean)
      console.log(this.userData)
      this.profileImg = this.userData?.profileImage;
    });
    this.storage_service.siteData$.subscribe((res:any)=>{
      this.sitesList = res;
    })
    this.auth_service.listRoles().subscribe((res:any)=>{
      this.userRoles = res?.roleList;
    })
    this.auth_service.getUserNamesByUserName().subscribe((res:any)=>{
      this.subUsers = res.data;
      // console.log(this.subUsers);
      this.editBtns = new Array(this.subUsers.length).fill(false);
    })
  }

  @ViewChild('profileInput') profileinput!: ElementRef;

  update(){
    this.profileinput.nativeElement.click();
  }

  editDetails(){
    this.isEdit = true;
  }

  closeUpdateUserModal(val: boolean) {
    this.isEdit = val;
  }

  closeAddUserModal(val: boolean){
    this.addBtn = val;
  }

  onFileChange(event: any){
    const reader = new FileReader();
    if(event.target.files && event.target.files.length){
      const [file] = event.target.files
      reader.readAsDataURL(file);
      reader.onload = ()=>{
        if(file.size < 2048000){
          this.profileImg = file;
          this.updateProfilePic();
        }
        else{
          this.alert_service.error('Image size should not be more than 2mb');
        }
      }
    }
  }

  updateProfilePic(){
    var userUpdate = this.storage_service.getData('user');

    let obj = {
      file: this.profileImg,
      userId: userUpdate.UserId
    };

    this.auth_service.updateProfilePicture(obj).subscribe((res: any)=>{
      if(res?.status_code === 200){
        this.alert_service.success(`Profile image updated successfully for ${userUpdate.FirstName} ${userUpdate.LastName}`)
        this.getUser();
      }
      else{
        this.alert_service.error(res?.message)
      }
    },(err)=>{
      this.alert_service.error('Request Entity Too Large');
    })
  }

  userinfo: any = null;
  user: any = null;
  getUser(){
    this.auth_service.getUserInfoForId().subscribe({
      next: (res: any) =>{
        if(res?.Status !== 'Failed'){
          this.userinfo = res;
          this.user = {...this.userinfo};
          this.getSitesListForUserName();
        }
      },
      error: (err)=>{

      }
    })
  }

  siteData: any = [];
  getSitesListForUserName(){
    this.siteData = this.storage_service.siteData$.getValue();
  }

  showEditBtns(idx: number){
    this.editBtns[idx]=true;
  }

  hideEditBtns(idx: number){
    this.editBtns[idx]=false;
  }

  userAdd(){
    this.addBtn = true;
  }

  deleteUser(data: any){
    // data = Number(data);
    console.log(data);
    this.alert_service.confirmDel().then((result: any) =>{
      if(result.isConfirmed){
        this.auth_service.deactivateUser(data?.userId).subscribe({
          next: (res: any) => {
            if(res.statusCode === 200) this.alert_service.success(res.message);
            else this.alert_service.error(res.message);
          },
          error: (err: any) =>{
            this.alert_service.error(err)
          }
        })
      }
    })
  }

  logout() {
    this.router.navigate(['/login']);
    this.storage_service.clearData();
  }

}
