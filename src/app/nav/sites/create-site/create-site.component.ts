import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigService } from '../../../../utilities/services/config.service';
import { StorageService } from '../../../../utilities/services/storage.service';
import { AlertService } from '../../../../utilities/services/alert.service';
import { City, Country, LocationDataService, State } from './location-data.service';

@Component({
  selector: 'app-create-site',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-site.component.html',
  styleUrl: './create-site.component.css'
})
export class CreateSiteComponent implements OnInit {
  @Output() closePanel = new EventEmitter<void>();
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private configService: ConfigService,
    private storageService: StorageService,
    private alertService: AlertService,
    private locationDataService: LocationDataService,
  ) { }

  createSiteTab: 'general' | 'services' | 'contact' = 'general';
  submitting = false;

  createSiteForm = new FormGroup({
    siteName: new FormControl('', Validators.required),
    phoneNo: new FormControl('(844) GET-IVIS', Validators.required),
    email: new FormControl('support@ivisecurity.com', Validators.required),
    website: new FormControl(''),
    busVerticalId: new FormControl<number | null>(null, Validators.required),
    customerId: new FormControl<number | null>(null),
    latitude: new FormControl(''),
    longitude: new FormControl(''),
    createdBy: new FormControl(),
    siteShortName: new FormControl('', Validators.required),
    remarks: new FormControl(''),
    timezone: new FormControl('America/Los_Angeles', Validators.required),
    live: new FormControl('T'),
    alerts: new FormControl('T'),
    timeLapse: new FormControl('F'),
    insights: new FormControl('F'),
    advertisements: new FormControl('F'),
    safetyEscort: new FormControl('F'),
    sensors: new FormControl('F'),
    name: new FormControl(''),
    contactNo: new FormControl(''),
    emailId: new FormControl(''),
    localLEcontactNo: new FormControl(''),
    whatsapp: new FormControl(''),
    dotComWorking: new FormControl(''),
    line_1: new FormControl(''),
    line_2: new FormControl(''),
    area: new FormControl(''),
    pin: new FormControl(''),
    country: new FormControl(''),
    state: new FormControl(''),
    district: new FormControl(''),
    accountId: new FormControl<number[]>([], Validators.required),
    contactCheck: new FormControl(false),
    whatsappCheck: new FormControl(false),
    acceptClientAddress: new FormControl(false),
  });

  verticals = [
    { id: 1, name: 'Retail' },
    { id: 2, name: 'Shopping Center' },
    { id: 3, name: 'Restaurant' },
    { id: 4, name: 'Warehouse' },
  ];
  clients = [
    { id: 1, name: 'Reliance' },
    { id: 2, name: 'Samsung' },
    { id: 3, name: 'Paradise' },
    { id: 4, name: 'Future Group' },
  ];
  accounts = [
    { id: 1, name: 'Default Account' },
    { id: 2, name: 'Operations' },
    { id: 3, name: 'Support' },
  ];
  timezones = [
    { value: 'Europe/Andorra' },
    { value: 'Asia/Dubai' },
    { value: 'Asia/Kabul' },
    { value: 'Europe/Tirane' },
    { value: 'Asia/Yerevan' },
    { value: 'Antarctica/Casey' },
    { value: 'Antarctica/Davis' },
    { value: 'Antarctica/DumontDUrville' },
    { value: 'Antarctica/Mawson' },
    { value: 'Antarctica/Palmer' },
    { value: 'Antarctica/Rothera' },
    { value: 'Antarctica/Syowa' },
    { value: 'Antarctica/Troll' },
    { value: 'Antarctica/Vostok' },
    { value: 'America/Argentina/Buenos_Aires' },
    { value: 'America/Argentina/Cordoba' },
    { value: 'America/Argentina/Salta' },
    { value: 'America/Argentina/Jujuy' },
    { value: 'America/Argentina/Tucuman' },
    { value: 'America/Argentina/Catamarca' },
    { value: 'America/Argentina/La_Rioja' },
    { value: 'America/Argentina/San_Juan' },
    { value: 'America/Argentina/Mendoza' },
    { value: 'America/Argentina/San_Luis' },
    { value: 'America/Argentina/Rio_Gallegos' },
    { value: 'America/Argentina/Ushuaia' },
    { value: 'Pacific/Pago_Pago' },
    { value: 'Europe/Vienna' },
    { value: 'Australia/Lord_Howe' },
    { value: 'Antarctica/Macquarie' },
    { value: 'Australia/Hobart' },
    { value: 'Australia/Currie' },
    { value: 'Australia/Melbourne' },
    { value: 'Australia/Sydney' },
    { value: 'Australia/Broken_Hill' },
    { value: 'Australia/Brisbane' },
    { value: 'Australia/Lindeman' },
    { value: 'Australia/Adelaide' },
    { value: 'Australia/Darwin' },
    { value: 'Australia/Perth' },
    { value: 'Australia/Eucla' },
    { value: 'Asia/Baku' },
    { value: 'America/Barbados' },
    { value: 'America/Chicago' },
    { value: 'Asia/Dhaka' },
    { value: 'Europe/Brussels' },
    { value: 'Europe/Sofia' },
    { value: 'Atlantic/Bermuda' },
    { value: 'Asia/Brunei' },
    { value: 'America/La_Paz' },
    { value: 'America/Los_Angeles' },
    { value: 'America/Noronha' },
    { value: 'America/Belem' },
    { value: 'America/Fortaleza' },
    { value: 'America/Recife' },
    { value: 'America/Araguaina' },
    { value: 'America/Maceio' },
    { value: 'America/Bahia' },
    { value: 'America/Sao_Paulo' },
    { value: 'America/Campo_Grande' },
    { value: 'America/Cuiaba' },
    { value: 'America/Santarem' },
    { value: 'America/Porto_Velho' },
    { value: 'America/Boa_Vista' },
    { value: 'America/Manaus' },
    { value: 'America/Eirunepe' },
    { value: 'America/Rio_Branco' },
    { value: 'America/Nassau' },
    { value: 'Asia/Thimphu' },
    { value: 'Europe/Minsk' },
    { value: 'America/Belize' },
    { value: 'America/St_Johns' },
    { value: 'America/Halifax' },
    { value: 'America/Glace_Bay' },
    { value: 'America/Moncton' },
    { value: 'America/Goose_Bay' },
    { value: 'America/Blanc-Sablon' },
    { value: 'America/Toronto' },
    { value: 'America/Nipigon' },
    { value: 'America/Thunder_Bay' },
    { value: 'America/Iqaluit' },
    { value: 'America/Pangnirtung' },
    { value: 'America/Atikokan' },
    { value: 'America/Winnipeg' },
    { value: 'America/Rainy_River' },
    { value: 'America/Resolute' },
    { value: 'America/Rankin_Inlet' },
    { value: 'America/Regina' },
    { value: 'America/Swift_Current' },
    { value: 'America/Edmonton' },
    { value: 'America/Cambridge_Bay' },
    { value: 'America/Yellowknife' },
    { value: 'America/Inuvik' },
    { value: 'America/Creston' },
    { value: 'America/Dawson_Creek' },
    { value: 'America/Fort_Nelson' },
    { value: 'America/Vancouver' },
    { value: 'America/Whitehorse' },
    { value: 'America/Dawson' },
    { value: 'Indian/Cocos' },
    { value: 'Europe/Zurich' },
    { value: 'Africa/Abidjan' },
    { value: 'Pacific/Rarotonga' },
    { value: 'America/Santiago' },
    { value: 'America/Punta_Arenas' },
    { value: 'Pacific/Easter' },
    { value: 'Asia/Shanghai' },
    { value: 'Asia/Urumqi' },
    { value: 'America/Bogota' },
    { value: 'America/Costa_Rica' },
    { value: 'America/Havana' },
    { value: 'Atlantic/Cape_Verde' },
    { value: 'America/Curacao' },
    { value: 'Indian/Christmas' },
    { value: 'Asia/Nicosia' },
    { value: 'Asia/Famagusta' },
    { value: 'Europe/Prague' },
    { value: 'Europe/Berlin' },
    { value: 'Europe/Copenhagen' },
    { value: 'America/Santo_Domingo' },
    { value: 'Africa/Algiers' },
    { value: 'America/Guayaquil' },
    { value: 'Pacific/Galapagos' },
    { value: 'Europe/Tallinn' },
    { value: 'Africa/Cairo' },
    { value: 'Africa/El_Aaiun' },
    { value: 'Europe/Madrid' },
    { value: 'Africa/Ceuta' },
    { value: 'Atlantic/Canary' },
    { value: 'Europe/Helsinki' },
    { value: 'Pacific/Fiji' },
    { value: 'Atlantic/Stanley' },
    { value: 'Pacific/Chuuk' },
    { value: 'Pacific/Pohnpei' },
    { value: 'Pacific/Kosrae' },
    { value: 'Atlantic/Faroe' },
    { value: 'Europe/Paris' },
    { value: 'Europe/London' },
    { value: 'Asia/Tbilisi' },
    { value: 'America/Cayenne' },
    { value: 'Africa/Accra' },
    { value: 'Europe/Gibraltar' },
    { value: 'America/Godthab' },
    { value: 'America/Danmarkshavn' },
    { value: 'America/Scoresbysund' },
    { value: 'America/Thule' },
    { value: 'Europe/Athens' },
    { value: 'Atlantic/South_Georgia' },
    { value: 'America/Guatemala' },
    { value: 'Pacific/Guam' },
    { value: 'Africa/Bissau' },
    { value: 'America/Guyana' },
    { value: 'Asia/Hong_Kong' },
    { value: 'America/Tegucigalpa' },
    { value: 'America/Port-au-Prince' },
    { value: 'Europe/Budapest' },
    { value: 'Asia/Jakarta' },
    { value: 'Asia/Pontianak' },
    { value: 'Asia/Makassar' },
    { value: 'Asia/Jayapura' },
    { value: 'Europe/Dublin' },
    { value: 'Asia/Jerusalem' },
    { value: 'Asia/Kolkata' },
    { value: 'Indian/Chagos' },
    { value: 'Asia/Baghdad' },
    { value: 'Asia/Tehran' },
    { value: 'Atlantic/Reykjavik' },
    { value: 'Europe/Rome' },
    { value: 'America/Jamaica' },
    { value: 'Asia/Amman' },
    { value: 'Asia/Tokyo' },
    { value: 'Africa/Nairobi' },
    { value: 'Asia/Bishkek' },
    { value: 'Pacific/Tarawa' },
    { value: 'Pacific/Enderbury' },
    { value: 'Pacific/Kiritimati' },
  ];
  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];
  documentTypes = ['Agreement', 'Floor Map', 'Monitoring Protocol'];
  uploadedFiles = [
    { name: 'Equipment Form.pdf', progress: 100 },
    { name: 'Floor Map.pdf', progress: 70 },
    { name: 'Monitoring Protocol Form.pdf', progress: 20 },
  ];

  close(): void {
    this.closePanel.emit();
  }

  ngOnInit(): void {
    this.locationDataService
      .getAllCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((countries) => {
        this.countries = countries;
      });
  }

  onCountryChange(): void {
    const countryCode = this.createSiteForm.controls.country.value || '';
    this.cities = [];
    this.createSiteForm.patchValue({
      state: '',
      district: '',
    });

    if (!countryCode) {
      this.states = [];
      return;
    }

    this.locationDataService
      .getStatesOfCountry(countryCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((states) => {
        this.states = states;
      });
  }

  onStateChange(): void {
    const countryCode = this.createSiteForm.controls.country.value || '';
    const stateCode = this.createSiteForm.controls.state.value || '';
    this.createSiteForm.patchValue({
      district: '',
    });

    if (!countryCode || !stateCode) {
      this.cities = [];
      return;
    }

    this.locationDataService
      .getCitiesOfState(countryCode, stateCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cities) => {
        this.cities = cities;
      });
  }

  submit(): void {
    if (this.createSiteForm.invalid) {
      this.createSiteForm.markAllAsTouched();
      this.alertService.error('Please fill all required fields');
      return;
    }

    const user = this.storageService.getData('user');
    const createdBy = user?.UserId || user?.userId || user?.UserName || user?.userName;
    const formValue = this.createSiteForm.getRawValue();
    const payload = {
      ...formValue,
      createdBy,
      live: this.toFlag(formValue.live),
      alerts: this.toFlag(formValue.alerts),
      timeLapse: this.toFlag(formValue.timeLapse),
      insights: this.toFlag(formValue.insights),
      advertisements: this.toFlag(formValue.advertisements),
      safetyEscort: this.toFlag(formValue.safetyEscort),
      sensors: this.toFlag(formValue.sensors),
    };

    this.submitting = true;

    this.configService.createSite(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;

        if (res?.statusCode === 200 || res?.status === 'Success' || res?.status === 'success') {
          this.alertService.success(res?.message || 'Site created successfully');
          this.close();
        } else {
          this.alertService.error(res?.message || 'Create site failed');
        }
      },
      error: (err) => {
        this.submitting = false;
        this.alertService.error(err?.error?.message || 'Create site failed');
      },
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.createSiteForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private toFlag(value: any): 'T' | 'F' {
    return value === true || value === 'T' ? 'T' : 'F';
  }

}
