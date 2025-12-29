import { Component, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { StorageService } from '../../../utilities/services/storage.service';
import { MediaPipe } from '../../../utilities/pipes/media.pipe';
import { AsyncPipe, NgClass, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { AlertService } from '../../../utilities/services/alert.service';
import { ConfigService } from '../../../utilities/services/config.service';
import { FormsModule } from '@angular/forms';
import { UpdateuserComponent } from './update-user/updateuser.component';
import { AddUserComponent } from './add-user/add-user.component';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { SearchPipe } from '../../../utilities/pipes/search.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [MediaPipe, AsyncPipe, UpperCasePipe, TitleCasePipe, NgClass, FormsModule, SearchPipe, UpdateuserComponent, AddUserComponent, MatDialogContent, MatDialogClose],
  providers: [SearchPipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  constructor(
    private auth_service: AuthService,
    private storage_service: StorageService,
    private alert_service: AlertService,
    private router: Router,
    private dialog: MatDialog,
    private searchPipe: SearchPipe
  ) {}

  profileImg: any;
  userData: any;
  showLoader = false;
  address: any = [];
  raw_address: any;
  sitesList: any = [];
  subUsers: any = [];
  isEdit = false;
  userRoles: any;
  // editBtns: any;
  addBtn = false;
  assignSites = false;
  allSites: any;
  filSubId: any;

  filters = [
    {
      id: 1,
      value: null,
      label: 'All',
    },
    {
      id: 2,
      value: true,
      label: 'Assigned',
    },
    {
      id: 3,
      value: false,
      label: 'Not Assigned',
    },
  ];

  @ViewChild('sitesAssign') sitesAssign!: TemplateRef<any>;

  ngOnInit(): void {
    this.auth_service.getUserInfoForId().subscribe((res: any) => {
      this.userData = res;
      this.raw_address = [this.userData?.address_line1, this.userData?.address_line2, this.userData?.city, this.userData?.district, this.userData?.state, this.userData?.country]
      this.address = this.raw_address.filter(Boolean)
      this.profileImg = this.userData?.profileImage;
    });

    this.storage_service.siteData$.subscribe((res: any) => {
      this.sitesList = res;
    });

    this.auth_service.listRoles().subscribe((res: any) => {
      this.userRoles = res.roleList;
    });

    this.auth_service.getUserNamesByUserName().subscribe((res: any) => {
      this.subUsers = res.data;
      // this.editBtns = new Array(this.subUsers.length).fill(false);
    })
  }

  @ViewChild('profileInput') profileinput!: ElementRef;

  update() {
    this.profileinput.nativeElement.click();
  }

  editDetails() {
    this.isEdit = true;
  }

  closeUpdateUserModal(val: boolean) {
    this.isEdit = val;
  }

  closeAddUserModal(val: boolean) {
    this.addBtn = val;
  }

  onFileChange(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (file.size < 2048000) {
          this.profileImg = file;
          this.updateProfilePic();
        } else {
          this.alert_service.error('Image size should not be more than 2mb');
        }
      };
    }
  }

  updateProfilePic() {
    var userUpdate = this.storage_service.getData('user');

    let obj = {
      file: this.profileImg,
      userId: userUpdate.UserId,
    };

    this.auth_service.updateProfilePicture(obj).subscribe(
      (res: any) => {
        if (res?.status_code === 200) {
          this.alert_service.success(
            `Profile image updated successfully for ${userUpdate.FirstName} ${userUpdate.LastName}`
          );
          this.getUser();
        } else {
          this.alert_service.error(res?.message);
        }
      },
      (err) => {
        this.alert_service.error('Request Entity Too Large');
      }
    );
  }

  userinfo: any = null;
  user: any = null;
  getUser() {
    this.auth_service.getUserInfoForId().subscribe({
      next: (res: any) => {
        if (res?.Status !== 'Failed') {
          this.userinfo = res;
          this.user = { ...this.userinfo };
          this.getSitesListForUserName();
        }
      },
      error: (err) => {},
    });
  }

  siteData: any = [];
  getSitesListForUserName() {
    this.siteData = this.storage_service.siteData$.getValue();
  }

  // showEditBtns(idx: number) {
  //   this.editBtns[idx] = true;
  // }

  // hideEditBtns(idx: number) {
  //   this.editBtns[idx] = false;
  // }

  userAdd() {
    this.addBtn = true;
  }

  filterSites(data: any) {
    // this.currentFilter = data;
    // console.log({1:this.filSubId, 2:this.userData})
    this.getSitesForGlobal({
      userId: this.filSubId,
      loginId: this.userData?.userId,
      assigned: data.value,
    });
  }

  selectAllSites: boolean = false;
  userSites: any = [];
  currentUser: any;
  filter=1;
  userIndex: any;

  showSiteMapping: boolean = false;
  openSiteMapping(data: any) {
    this.showSiteMapping = true;
    // this.toggleAllIndividual();
    this.currentUser = data;
    this.filter = 1;
    if (!data) {
      this.filter = -1;
    }

    // this.userIndex = this.usersList.indexOf(data);
    // this.userSites = [];
    this.auth_service
      .getSitesListForGlobalAccountId({
        userId: this.filSubId,
        loginId: this.userData?.UserId,
        assigned: null,
      })
      .subscribe({
        next: (res: any) => {},
      });
  }

  closeSiteMapping() {
    this.showSiteMapping = false;
  }

  toggleSites() {
    const visibleSites = this.filteredSites;

    visibleSites.forEach((site: any) => {
      site.assigned = this.selectAllSites;
    });

    this.toggleAllIndividual();
  }

  get filteredSites() {
    return this.searchPipe.transform(this.userSites, this.siteSearch);
  }

  toggleAllIndividual() {
    this.selectAllSites = this.userSites.every(
      (item: any) => item.assigned == true
    );
  }

  applyMapping() {
    let isChecked = this.userSites.some((item: any) => item.assigned);
    if (this.filter == 2) {
      if (!isChecked) {
        this.alert_service.error('Please select atleast one site!');
        return;
      }

      this.showLoader = true;
      this.auth_service
        .unassignSiteForUser({
          userId: this.filSubId,
          loginId: this.userData?.UserId,
          siteId: Array.from(
            this.userSites.filter((el: any) => el['assigned']),
            (item: any) => item.siteId
          ),
        })
        .subscribe({
          next: (res: any) => {
            this.showLoader = false;
            if (res.statusCode === 200) {
              this.closeSiteMapping();
              this.alert_service.success(res.message);
              // this.getSitesForGlobal({
              //   userId: this.currentUser?.userId,
              //   assigned: false,
              // });
            } else {
              this.alert_service.error(res.message);
            }
          },
          error: (err: any) => {
            this.showLoader = false;
            this.alert_service.error('Failed');
          },
        });
    } else if (this.filter == 3 || this.filter == -1) {
      if (!isChecked) {
        this.alert_service.error('Please select atleast one site!');
        return;
      }

      this.showLoader = true;
      this.auth_service
        .applySitesMapping({
          userId: this.filSubId,
          loginId: this.userData?.UserId,
          siteList: Array.from(
            this.userSites.filter((el: any) => el['assigned']),
            (item: any) => item.siteId
          ),
        })
        .subscribe({
          next: (res: any) => {
            this.showLoader = false;
            if (res.status === 'Success') {
              this.closeSiteMapping();
              this.alert_service.success(res.message);
              // this.getSitesForGlobal({
              //   userId: this.currentUser?.userId,
              //   assigned: true,
              // });
            } else {
              this.alert_service.error(res.message);
            }
          },
          error: (err: any) => {
            this.showLoader = false;
            this.alert_service.error('Failed');
          },
        });
    }
  }

  getSitesForGlobal(data: any) {
    this.showLoader = true;
    // console.log(data)
    this.auth_service.getSitesListForGlobalAccountId(data).subscribe({
      next: (res: any) => {
        this.showLoader = false;
        if (res.Status == 'Success') {
          this.userSites = res.sitesList;
          this.toggleAllIndividual();
        }
      },
      error: (err) => {
        this.showLoader = false;
      },
    });
  }

  siteSearch: any;

  siteActions(subUserId: any) {
    this.filter = 1;
    this.dialog.open(this.sitesAssign);
    this.filSubId = subUserId;
    let obj = {
      userId: subUserId,
      loginId: this.userData?.UserId,
      assigned: 0,
    };
    this.auth_service.getSitesListForGlobalAccountId(obj).subscribe({
      next: (res: any) => {
        this.filterSites({userId: res.userId, value: 0})
        // console.log(res.userId);
      },
    });
  }

  deleteUser(data: any) {
    this.alert_service.confirmDel().then((result: any) => {
      if (result.isConfirmed) {
        this.auth_service.deactivateUser(data?.userId).subscribe({
          next: (res: any) => {
            if (res.statusCode === 200) this.alert_service.success(res.message);
            else this.alert_service.error(res.message);
          },
          error: (err: any) => {
            this.alert_service.error(err);
          },
        });
      }
    });
  }

  logout() {
    this.router.navigate(['/login']);
    this.storage_service.clearData();
  }
}
