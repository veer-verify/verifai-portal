import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SbHdrComponent } from '../sb-hdr/sb-hdr.component';
import { StorageService } from '../../utilities/services/storage.service';
import { ConfigService } from '../../utilities/services/config.service';
import { SubHeaderComponent } from '../sub-header/sub-header.component';

@Component({
    selector: 'app-dashboard',
    imports: [RouterOutlet, HeaderComponent, SbHdrComponent, SubHeaderComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    standalone: true,
})
export class DashboardComponent implements OnInit {

    storage_service = inject(StorageService);
    config_service = inject(ConfigService);

    ngOnInit(): void {
        this.getSitesListForUserName();
    }

    getSitesListForUserName() {
        this.config_service.getSitesListForUserName()
        .subscribe({
            next: (res) => {
                this.storage_service.saveSites(res);
            }
        })
    }


}
