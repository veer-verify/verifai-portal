import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';

@Component({
    selector: 'app-dialog',
    imports: [],
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.css',
    standalone: true,
    animations: [
        trigger('fadeSlide', [
            // Transition for entering the view (opening)
            transition(':enter', [
                style({ opacity: 0 }),
                animate('500ms ease-out', style({ opacity: 1 }))
            ]),
            // Transition for leaving the view (closing)
            transition(':leave', [
                animate('500ms ease-in', style({ opacity: 0 }))
            ])
        ]),
    ],
})
export class DialogComponent {

}
