import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import { RequestService } from '../../../../utilities/services/request.service';
import { StorageService } from '../../../../utilities/services/storage.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { filter } from 'rxjs';

@Component({
  selector: 'app-new-request',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-request.component.html',
  styleUrl: './new-request.component.css',
})
export class NewRequestComponent {
  constructor(
    private request_service: RequestService,
    private storage_service: StorageService,
    private fb: FormBuilder
  ) {}

  ticketForm!: FormGroup;
  @Output() closeModal = new EventEmitter<void>();

  isClose = false;
  categories: any = [];
  subCategories:any =[];
  siteData: any = [];

  
  ngOnInit() {
    this.initForm();
    this.loadCategories();
    
    this.ticketForm.get('category')?.valueChanges.subscribe((catId) => {
      const selectedCategory: any = this.categories.find((c:any) => c.catId === catId);
      
      this.ticketForm.patchValue({ subCategory: '' });
    });
    
    this.storage_service.currentSite$
    .pipe(filter((res) => res !== null))
    .subscribe((res: any) => {
      const siteId = typeof res === 'object' ? res.siteId : res;
      
      this.ticketForm.patchValue({
        siteId: siteId,
      });
    });

    this.siteData = this.storage_service.siteData$.getValue();
    this.siteData = this.siteData.sites;
    console.log('Site Data:', this.siteData);
  }

  initForm() {
    this.ticketForm = this.fb.group({
      siteId: ['', Validators.required],
      category: ['', Validators.required],
      subCategory: ['', Validators.required],
      priority: ['', Validators.required],
      description: ['', [Validators.required, Validators.required]],
      remarks: [''],
    });
  }

  loadCategories() {
    this.request_service.getHelpDeskCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categoryList;
        console.log('Loaded categories:', this.categories);
      },
      error: (err) => {
        console.error('Error loading categories', err);
      },
    });
  }

  filterSubs() {
    const selectedCatId = Number(this.ticketForm.get('category')?.value);
    console.log('Selected Category ID:', selectedCatId);
    const selectedCategory: any = this.categories.find((c:any) => c.catId === selectedCatId);
    this.subCategories = selectedCategory?.subCategoryList || [];
    console.log('Filtered subcategories:', this.subCategories);
    this.ticketForm.patchValue({ subCategory: '' });
  }

  createTicket() {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const formData = this.ticketForm.value;
    formData.site_id = this.storage_service.currentSite$;
    this.ticketForm.reset();

    this.request_service.addHelpDeskRequest({
      siteId: formData.siteId,
      service_cat_id: formData.category,
      service_subcat_id: formData.subCategory,
      priority: formData.priority,
      description: formData.description,
      remarks: formData.remarks
    }).subscribe({
      next: (res) => {
        console.log('Request submitted successfully', res);
        this.close();
      },
      error: (err) => {
        console.error('Error submitting request', err);
      },
    });
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
      subCategory: data.value.subCategory,
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
