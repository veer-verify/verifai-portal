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
    private fb: FormBuilder
  ) {}

  ticketForm!: FormGroup;
  @Output() closeModal = new EventEmitter<void>();
  @Input() currentRequestData: any;

  isClose = false;
  categories: any = [];
  subCategories: any = [];
  sitesList!: Observable<any>;

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    this.sitesList = this.storage_service.siteData$;

    this.storage_service.currentSite$
      .pipe(filter((res) => res !== null))
      .subscribe((res: any) => {
        const siteId = typeof res === 'object' ? res.siteId : res;

        this.ticketForm.patchValue({
          siteId: siteId,
        });
      });

    this.ticketForm.patchValue(this.currentRequestData || {});

    // this.sitesList = this.storage_service.sitesList$.getValue();
    // this.sitesList = this.sitesList.sites;
    // console.log('Site Data:', this.sitesList);
    console.log('Current Request Data:', this.currentRequestData);
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

  loadCategories() {
    this.request_service.getHelpDeskCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categoryList;
        if (this.currentRequestData) {
          this.filterSubs();
        }
        this.ticketForm
          .get('service_cat_id')
          ?.valueChanges.subscribe((catId) => {
            const selectedCategory: any = this.categories.find(
              (c: any) => c.catId === catId
            );
            this.ticketForm.patchValue({ service_subcat_id: '' });
          });
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
      this.ticketForm.markAllAsTouched();
      const formData = this.ticketForm.value;
      formData.site_id = this.storage_service.currentSite$;
      this.request_service
        .updateHelpDeskRequest({
          serviceReqId: Number(this.currentRequestData.serviceReqId),
          siteId: Number(formData.siteId),
          service_cat_id: Number(formData.service_cat_id),
          service_subcat_id: Number(formData.service_subcat_id),
          description: formData.description,
          remarks: formData.remarks,
          status: this.currentRequestData.status,
          priority: formData.priority,
        })
        .subscribe({
          next: (res) => {
            this.close();
          },
          error: (err) => {
            console.error('Error updating request', err);
          },
        });
      this.ticketForm.reset();
    } else {
      if (this.ticketForm.invalid) {
        this.ticketForm.markAllAsTouched();
        return;
      }

      const formData = this.ticketForm.value;
      formData.site_id = this.storage_service.currentSite$;
      this.ticketForm.reset();

      this.request_service
        .addHelpDeskRequest({
          siteId: formData.siteId,
          service_cat_id: formData.category,
          service_subcat_id: formData.service_subcat_id,
          priority: formData.priority,
          description: formData.description,
          remarks: formData.remarks,
        })
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
    this.isClose = true;
    setTimeout(() => {
      this.closeModal.emit();
    }, 300);
  }

  getServiceDet(data: NgForm) {
    console.log('Received Data:', data);

    const formData = {
      site_id: this.storage_service.currentSite$,
      site: data.value.site,
      category: data.value.category,
      service_subcat_id: data.value.service_subcat_id,
      priority: data.value.priority,
      description: data.value.description,
      remarks: data.value.remarks,
    };
    console.log('Form Data:', formData);

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
