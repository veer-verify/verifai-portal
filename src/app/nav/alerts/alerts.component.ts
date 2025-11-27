import { Component } from '@angular/core';
import { CommonModule,  } from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import { TableComponent } from '../../../utilities/components/table/table.component';
@Component({
    selector: 'app-alerts',
    imports: [
        TableComponent,
        CommonModule,
        MatSelectModule
    ],
    templateUrl: './alerts.component.html',
    styleUrl: './alerts.component.css',
    standalone: true
})
export class AlertsComponent {


}
