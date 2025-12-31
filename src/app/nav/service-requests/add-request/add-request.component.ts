import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  input,
  Input,
} from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { RequestService } from '../../../../utilities/services/request.service';
import { StorageService } from '../../../../utilities/services/storage.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { filter, Observable } from 'rxjs';
import { AlertService } from '../../../../utilities/services/alert.service';

@Component({
  selector: 'app-new-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './add-request.component.html',
  styleUrl: './add-request.component.css',
})
export class AddRequestComponent {
  constructor(
    private request_service: RequestService,
    public storage_service: StorageService,
    private fb: FormBuilder,
    private alert_service: AlertService
  ) { }

  ticketForm!: FormGroup;
  @Input() currentRequestData: any;
  @Output() closeModal: any = new EventEmitter<void>();

  categories: any = [];
  subCategories: any = [];
  sitesList!: Observable<any>;

  ngOnInit() {
    this.initForm();
    this.getHelpDeskCategories();
    this.sitesList = this.storage_service.siteData$;

    this.storage_service.currentSite$
      .pipe(filter((res) => res !== null))
      .subscribe((res: any) => {
        const siteId = typeof res === 'object' ? res.siteId : res;

        this.ticketForm.patchValue({
          siteId: siteId,
        });
      });

    if (this.currentRequestData) {
      this.ticketForm.patchValue(this.currentRequestData);
    } else {
      this.ticketForm.patchValue({});
    }
  }

  initForm() {
    this.ticketForm = this.fb.group({
      siteId: ['', Validators.required],
      service_cat_id: ['', Validators.required],
      service_subcat_id: ['', Validators.required],
      priority: ['low', Validators.required],
      description: ['', [Validators.required, Validators.required]],
      remarks: [''],
    });
  }

  getHelpDeskCategories() {
    this.request_service.getHelpDeskCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categoryList;
        if (this.currentRequestData) {
          this.filterSubs();
        }
      },
      error: (err) => {
        console.error('Error loading categories', err);
      },
    });
  }

  filterSubs() {
    const selectedCatId = Number(this.ticketForm.get('service_cat_id')?.value);
    const selectedCategory: any = this.categories.find(
      (c: any) => c.catId === selectedCatId
    );
    this.subCategories = selectedCategory?.subCategoryList || [];
    this.ticketForm.patchValue({ service_subcat_id: '' });
    if (this.currentRequestData) {
      this.ticketForm.patchValue({
        service_subcat_id: this.currentRequestData.service_subcat_id,
      });
    }
  }

  createTicket() {
    if (this.currentRequestData) {
      if (this.ticketForm.invalid) return this.alert_service.error('Please fill all the fields!');
      // this.ticketForm.markAllAsTouched();
      // const formData = this.ticketForm.value;
      // formData.site_id = this.storage_service.currentSite$;
      this.request_service
        .updateHelpDeskRequest({ ...this.ticketForm.value, ...{ status: this.currentRequestData.status, serviceReqId: this.currentRequestData.serviceReqId } })
        .subscribe({
          next: (res) => {
            this.close();
          },
          error: (err) => {
            console.error('Error updating request', err);
          },
        });
      // this.ticketForm.reset();
    } else {
      if (this.ticketForm.invalid) return this.alert_service.error('Please fill all the fields!');
      // this.ticketForm.markAllAsTouched();

      // }

      // const formData = this.ticketForm.value;
      // formData.site_id = this.storage_service.currentSite$;
      // this.ticketForm.reset();

      this.request_service
        .addHelpDeskRequest(this.ticketForm.value)
        .subscribe({
          next: (res) => {
            this.close();
          },
          error: (err) => {
            console.error('Error submitting request', err);
          },
        });
    }
  }

  close() {
    this.currentRequestData = null;
    this.closeModal.emit(false);
  }

  getServiceDet(data: NgForm) {
    const formData = {
      site_id: this.storage_service.currentSite$,
      site: data.value.site,
      category: data.value.category,
      service_subcat_id: data.value.service_subcat_id,
      priority: data.value.priority,
      description: data.value.description,
      remarks: data.value.remarks,
    };

    this.request_service.addHelpDeskRequest(formData).subscribe({
      next: (res) => {
        console.log('Request submitted successfully', res);
        this.close();
      },
      error: (err) => {
        console.error('Error submitting request', err);
      },
    });
  }
}
