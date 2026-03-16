import { Component, Input } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-err-info',
  templateUrl: './err-info.component.html',
  styleUrls: ['./err-info.component.css'],
  imports: [AsyncPipe]
})
export class ErrInfoComponent {

  constructor(
    public storage_service: StorageService
  ) { }

  // @Input({ required: true }) text!: string;

}
